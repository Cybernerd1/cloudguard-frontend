import { useState, useEffect, useRef } from 'react';
import { triggerAuditVeto } from './api';

function _isFastPassArmEvent(event) {
  if (!event) return false;

  const body = event.message_body || {};

  if (event.event_type === 'NarrativeChunk') {
    const secondsRemaining = Number(body.seconds_remaining || 0);
    if (!body.countdown_active || secondsRemaining <= 0) return false;

    if (body.chunk_type === 'synthesis' && secondsRemaining === 10) return true;
    if (body.chunk_type === 'fast_pass') return true;
    if (body.is_fast_pass === true) return true;
    if (body.fast_pass_meta?.accelerated_window_s === 10) return true;
    return false;
  }

  // Proactive path emits FORECAST_SIGNAL/ForecastSignal, not NarrativeChunk.
  if (event.event_type === 'ForecastSignal') {
    return body.type === 'Amber_Alert';
  }

  return false;
}

export function useFastPassTimer(events = []) {
  const [isArmed, setIsArmed] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [threatInfo, setThreatInfo] = useState(null);
  
  const timerRef = useRef(null);
  const armedMarkerRef = useRef('');
  const endTimestampRef = useRef(0);

  useEffect(() => {
    if (!events.length) return;

    const latestEvents = [...events].slice(-40).reverse();
    const latestDecisionEvent = latestEvents.find((event) => {
      const body = event.message_body || {};

      const isNarrativeStop =
        event?.event_type === 'NarrativeChunk' &&
        body.countdown_active === false &&
        ['veto', 'exec'].includes(body.chunk_type);

      const isForecastStop =
        event?.event_type === 'ForecastSignal' &&
        body.type === 'Dissipated';

      const isStop = isNarrativeStop || isForecastStop;
      return _isFastPassArmEvent(event) || isStop;
    });

    if (!latestDecisionEvent) return;

    const latestBody = latestDecisionEvent.message_body || {};
    const isStopSignal =
      (latestDecisionEvent.event_type === 'NarrativeChunk' &&
        latestBody.countdown_active === false &&
        ['veto', 'exec'].includes(latestBody.chunk_type)) ||
      (latestDecisionEvent.event_type === 'ForecastSignal' && latestBody.type === 'Dissipated');

    if (isStopSignal) {
      clearInterval(timerRef.current);
      setIsArmed(false);
      setSecondsRemaining(0);
      return;
    }

    const trigger = latestDecisionEvent;

    const body = trigger.message_body || {};
    let seconds = Number(body.seconds_remaining || 0);

    if (seconds <= 0 && trigger.event_type === 'ForecastSignal' && body.type === 'Amber_Alert') {
      // ForecastSignal payloads don't include countdown fields in current schema.
      seconds = Number(body.fast_pass_meta?.accelerated_window_s || 10);
    }

    if (seconds <= 0) return;

    const marker = `${trigger.trace_id || 'na'}:${trigger.event_id || 'na'}:${seconds}`;
    if (marker === armedMarkerRef.current) return;
    armedMarkerRef.current = marker;

    const eventMs = Date.parse(trigger.tick_timestamp || '') || Date.now();
    endTimestampRef.current = eventMs + seconds * 1000;

    setThreatInfo({
      ...body,
      trace_id: trigger.trace_id,
      event_id: trigger.event_id,
      tick_timestamp: trigger.tick_timestamp,
    });

    setIsArmed(true);

    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endTimestampRef.current - Date.now()) / 1000));
      setSecondsRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(timerRef.current);
        setIsArmed(false);
      }
    }, 250);

    const initialRemaining = Math.max(0, Math.ceil((endTimestampRef.current - Date.now()) / 1000));
    setSecondsRemaining(initialRemaining);

    return () => {
      clearInterval(timerRef.current);
    };
  }, [events]);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
    };
  }, []);

  const triggerVeto = async (reason) => {
    try {
      const resourceId =
        threatInfo?.resource_id ||
        threatInfo?.target_resource_id ||
        threatInfo?.target ||
        'unknown';

      await triggerAuditVeto(resourceId, reason || 'Manual veto from dashboard');
      clearInterval(timerRef.current);
      setIsArmed(false);
      setSecondsRemaining(0);
    } catch (err) {
      console.error("Veto failed", err);
    }
  };

  return { isArmed, secondsRemaining, threatInfo, triggerVeto };
}
