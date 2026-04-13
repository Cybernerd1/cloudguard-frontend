import { useState, useEffect, useRef, useCallback } from 'react';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/war-room";
const MAX_EVENTS = 200;
const MAX_AMBER_ALERTS = 50;
const MAX_NEGOTIATIONS = 120;

export function useSovereignStream() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastError, setLastError] = useState(null);
  
  const [jScore, setJScore] = useState(1.0);
  const [wR, setWr] = useState(0.5);
  const [wC, setWc] = useState(0.5);
  
  const [events, setEvents] = useState([]);
  const [topology, setTopology] = useState([]);
  const [amberAlerts, setAmberAlerts] = useState([]);
  const [negotiations, setNegotiations] = useState([]);
  const [backoffStatus, setBackoffStatus] = useState({ active: false, reason: '', retryAfterS: 0 });
  
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const pingIntervalRef = useRef(null);
  const backoffResetTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const manualCloseRef = useRef(false);
  
  const stateQueueRef = useRef({
    events: [],
    amberAlerts: [],
    negotiations: [],
    topology: null,
    jScore: null,
    wR: null,
    wC: null,
    backoff: null,
  });
  const rafRef = useRef(null);

  const processQueue = useCallback(() => {
    const queue = stateQueueRef.current;
    
    if (queue.events.length > 0) {
      setEvents(prev => [...prev, ...queue.events].slice(-MAX_EVENTS));
      queue.events = [];
    }

    if (queue.amberAlerts.length > 0) {
      setAmberAlerts(prev => [...prev, ...queue.amberAlerts].slice(-MAX_AMBER_ALERTS));
      queue.amberAlerts = [];
    }

    if (queue.negotiations.length > 0) {
      setNegotiations(prev => [...prev, ...queue.negotiations].slice(-MAX_NEGOTIATIONS));
      queue.negotiations = [];
    }

    if (queue.topology) {
      setTopology(queue.topology);
      queue.topology = null;
    }

    if (typeof queue.jScore === 'number') {
      setJScore(queue.jScore);
      queue.jScore = null;
    }

    if (typeof queue.wR === 'number') {
      setWr(queue.wR);
      queue.wR = null;
    }

    if (typeof queue.wC === 'number') {
      setWc(queue.wC);
      queue.wC = null;
    }

    if (queue.backoff) {
      setBackoffStatus(queue.backoff);

      clearTimeout(backoffResetTimeoutRef.current);
      const resetInMs = Math.max((queue.backoff.retryAfterS || 5) * 1000, 1000);
      backoffResetTimeoutRef.current = setTimeout(() => {
        setBackoffStatus({ active: false, reason: '', retryAfterS: 0 });
      }, resetInMs);

      queue.backoff = null;
    }
    
    rafRef.current = null;
  }, []);

  const queueUpdate = useCallback((mutator) => {
    mutator(stateQueueRef.current);
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(processQueue);
    }
  }, [processQueue]);

  const ingestEvent = useCallback((data, includeInFeed = true) => {
    if (!data || typeof data !== 'object') return;

    const type = data.event_type;
    if (!type || type === 'Heartbeat') return;

    const body = data.message_body || {};

    queueUpdate((queue) => {
      if (includeInFeed) {
        queue.events.push(data);
      }

      if (typeof data.j_score === 'number') queue.jScore = data.j_score;
      if (typeof data.w_R === 'number') queue.wR = data.w_R;
      if (typeof data.w_C === 'number') queue.wC = data.w_C;

      if (type === 'Negotiation' || type === 'NarrativeChunk' || type === 'TickerUpdate') {
        queue.negotiations.push(data);
      }

      if (type === 'ForecastSignal' && body.type === 'Amber_Alert') {
        queue.amberAlerts.push(data);
      }

      if (type === 'TopologySync' && Array.isArray(body.resources)) {
        queue.topology = body.resources;
      }

      if (type === 'SwarmCoolingDown') {
        queue.backoff = {
          active: true,
          reason: body.reason || 'Swarm cooling down',
          retryAfterS: Number(body.retry_after_s || 5),
        };
      }
    });
  }, [queueUpdate]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }
    
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setLastError(null);
        reconnectAttemptsRef.current = 0;
        
        // Keepalive ping expected by backend is a raw string "ping".
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send('ping');
          }
        }, 20000);
      };

      ws.onmessage = (message) => {
        try {
          const data = JSON.parse(message.data);

          if (data.event_type === 'BufferReplay') {
            const replayEvents = data.message_body?.events;
            if (Array.isArray(replayEvents)) {
              replayEvents.forEach((event) => ingestEvent(event, true));
            }
            return;
          }

          ingestEvent(data, true);
        } catch (e) {
          setLastError(e);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        wsRef.current = null;
        clearInterval(pingIntervalRef.current);

        if (manualCloseRef.current) {
          return;
        }
        
        // Exponential backoff
        const backoffMs = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
        reconnectAttemptsRef.current++;
        
        reconnectTimeoutRef.current = setTimeout(connect, backoffMs);
      };

      ws.onerror = (err) => {
        setLastError(err);
      };
      
    } catch (err) {
      setLastError(err);
    }
  }, [ingestEvent]);

  useEffect(() => {
    manualCloseRef.current = false;
    connect();
    
    return () => {
      manualCloseRef.current = true;
      if (wsRef.current) {
        wsRef.current.close();
      }
      clearTimeout(reconnectTimeoutRef.current);
      clearInterval(pingIntervalRef.current);
      clearTimeout(backoffResetTimeoutRef.current);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [connect]);

  return { isConnected, events, jScore, wR, wC, topology, amberAlerts, negotiations, backoffStatus, lastError };
}
