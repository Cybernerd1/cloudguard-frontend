import React, { useMemo, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ShieldAlert } from 'lucide-react';
import NegotiationLog from '../components/NegotiationLog';
import { useSovereignStream } from '../../../lib/useSovereignStream';
import { useFastPassTimer } from '../../../lib/useFastPassTimer';
import { fetchCostWaste } from '../../../lib/api';

function statusColor(chunkType) {
  if (chunkType === 'threat') return 'bg-amber-50 text-amber-700 border-amber-300 shadow-sm';
  if (chunkType === 'argument') return 'bg-blue-50 text-blue-700 border-blue-300 shadow-sm';
  if (chunkType === 'synthesis') return 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm';
  if (chunkType === 'veto') return 'bg-rose-50 text-rose-700 border-rose-300 shadow-sm';
  if (chunkType === 'amber_alert') return 'bg-amber-50 text-amber-700 border-amber-300 shadow-sm';
  if (chunkType === 'advisory') return 'bg-blue-50 text-blue-700 border-blue-300 shadow-sm';
  if (chunkType === 'dissipated') return 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm';
  return 'bg-slate-50 text-slate-700 border-slate-300 shadow-sm';
}

export default function FrictionHudView() {
  const { events, negotiations } = useSovereignStream();
  const { isArmed, secondsRemaining, threatInfo, triggerVeto } = useFastPassTimer(events);

  const [dissipatedSignals, setDissipatedSignals] = useState([]);
  const seenDissipatedRef = useRef(new Set());

  // ── Real EC2 cost-waste data from /api/findings/cost-waste ───────────────
  const [costData, setCostData] = useState(null);

  useEffect(() => {
    fetchCostWaste().then((res) => {
      if (res && !res.error) setCostData(res);
    });
  }, []);

  // EC2 idle items → negotiation trace entries (real backend data)
  const costNegotiationEntries = useMemo(() => {
    if (!costData?.items?.length) return [];
    return costData.items.slice(0, 6).map((item) => ({
      event_id: `cost-${item.resource_id}`,
      event_type: 'CostWaste',
      tick_timestamp: new Date().toISOString(),
      message_body: {
        chunk_type: 'argument',
        type: 'COST_WASTE',
        heading: `[EC2-001] ${item.resource_id} — ${item.cpu_avg}% CPU avg`,
        body: `Monthly cost: $${item.monthly_cost} · Estimated waste: $${item.estimated_waste} · ${item.running_hours}h running`,
        probability: item.estimated_waste / Math.max(item.monthly_cost, 1),
        target: item.resource_id,
        predicted_drift: `$${item.estimated_waste}/mo waste`,
      },
    }));
  }, [costData]);

  const traceEvents = useMemo(
    () => {
      const narrative = negotiations.filter((event) => event.event_type === 'NarrativeChunk');
      const forecast = events.filter((event) => event.event_type === 'ForecastSignal');

      const combined = [...narrative, ...forecast]
        .sort((a, b) => {
          const ta = Date.parse(a.tick_timestamp || '') || 0;
          const tb = Date.parse(b.tick_timestamp || '') || 0;
          return tb - ta;
        })
        .slice(0, 4);

      // Fill remaining slots with real EC2 cost data
      const remaining = 8 - combined.length;
      return [...combined, ...costNegotiationEntries.slice(0, remaining)];
    },
    [events, negotiations, costNegotiationEntries],
  );

  useEffect(() => {
    const freshDissipated = events.filter((event) => {
      if (event.event_type !== 'ForecastSignal') return false;
      return event.message_body?.type === 'Dissipated';
    });

    freshDissipated.forEach((signal) => {
      if (!signal.event_id || seenDissipatedRef.current.has(signal.event_id)) return;
      seenDissipatedRef.current.add(signal.event_id);

      setDissipatedSignals((prev) => [...prev, signal]);
      setTimeout(() => {
        setDissipatedSignals((prev) => prev.filter((item) => item.event_id !== signal.event_id));
      }, 1200);
    });
  }, [events]);

  const countdownValue = isArmed ? String(secondsRemaining).padStart(2, '0') : '--';

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }} className="flex-1 h-full flex flex-col bg-transparent overflow-hidden px-1 py-1 absolute inset-0 w-full">
      <header className="flex justify-between items-center h-[40px] shrink-0 mb-3">
        <h1 className="text-[20px] font-bold tracking-tight text-slate-800 flex items-center gap-2">
          The Friction HUD
        </h1>
        <div className="px-4 py-1.5 bg-rose-50 text-rose-600 font-bold text-[11px] rounded-lg border border-rose-200 flex items-center gap-2 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></div> Live Monitoring
        </div>
      </header>

      <div className="flex-1 flex gap-4 pb-2">
        <div className="flex-[2] bg-white/70 backdrop-blur-2xl rounded-[20px] shadow-sm border border-white p-6 flex flex-col relative overflow-hidden">
          <h2 className="text-[15px] font-bold text-slate-800 flex items-center gap-2 mb-6 pb-4 border-b border-slate-200">
            <MessageSquare size={16} className="text-blue-500" /> The Negotiation Trace
          </h2>

          <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide flex flex-col gap-6">
            {traceEvents.length === 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-[12px] text-slate-500 font-jetbrains">
                Waiting for NarrativeChunk or ForecastSignal events.
              </div>
            )}

            {traceEvents.map((event) => {
              const body = event.message_body || {};
              const timestamp = String(event.tick_timestamp || '').split('T')[1]?.replace('Z', '') || '--:--:--';

              const isNarrative = event.event_type === 'NarrativeChunk';
              const controllerText = isNarrative
                ? (body.heading || 'Sovereign narrative chunk received.')
                : `Forecast ${body.type || 'Advisory'} on ${body.target || 'unknown target'}`;

              const cisoText = isNarrative
                ? (body.body || body.citation || 'No explanatory body provided.')
                : `P=${typeof body.probability === 'number' ? `${(body.probability * 100).toFixed(1)}%` : 'n/a'} · Predicted=${body.predicted_drift || 'unknown'}${body.recon_chain ? ` · Recon=${body.recon_chain}` : ''}`;

              const statusLabel = isNarrative
                ? String(body.chunk_type || 'narrative').toUpperCase()
                : String(body.type || 'forecast').toUpperCase();

              const statusKey = isNarrative
                ? body.chunk_type
                : String(body.type || 'forecast').toLowerCase();

              return (
                <NegotiationLog
                  key={event.event_id}
                  timestamp={timestamp.slice(0, 12)}
                  controller={controllerText}
                  ciso={cisoText}
                  status={statusLabel}
                  statusColor={statusColor(statusKey)}
                />
              );
            })}
          </div>
        </div>

        <div className="flex-[1] bg-gradient-to-b from-white/90 to-rose-50/50 rounded-[20px] shadow-sm border border-rose-100 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.2]" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, #fecdd3 10px, #fecdd3 20px)" }}></div>

          <div className="relative z-10 w-full">
            <h3 className="text-rose-600 font-bold text-[12px] uppercase tracking-widest mb-6 drop-shadow-sm">Predictive Fast-Pass Trigger</h3>

            <div className="bg-white border-[4px] border-rose-200 rounded-full w-44 h-44 mx-auto flex items-center justify-center shadow-[0_10px_30px_rgba(244,63,94,0.15)] relative flex-col">
              <span className="text-[64px] font-bold text-slate-800 leading-none font-mono tracking-tighter">
                {countdownValue}
              </span>
              <span className="text-[10px] text-rose-500 font-bold mt-2 uppercase tracking-wider">SEC TO AUTO-KILL</span>
            </div>

            <div className="mt-8 bg-white/90 backdrop-blur-sm p-5 rounded-[16px] border border-rose-200 shadow-sm">
              <div className="text-[14px] font-bold text-slate-800 mb-1 flex justify-center items-center gap-1.5"><ShieldAlert size={14} className="text-rose-500" /> {isArmed ? 'Fast-Pass Armed' : 'Awaiting Trigger'}</div>
              <div className="text-[11px] text-slate-500 font-jetbrains font-medium">Target: {threatInfo?.resource_id || threatInfo?.target || 'n/a'}</div>
              <div className="text-[11px] text-slate-500 font-jetbrains font-medium mt-1">Window: {isArmed ? `${secondsRemaining}s` : '60s default'}</div>
              <div className="text-[13px] text-emerald-600 font-bold mt-3 border-t border-slate-100 pt-3">
                {costData?.total_waste != null
                  ? `Recoverable: $${costData.total_waste?.toFixed(2)}/mo · ${costData.idle_count} idle EC2`
                  : 'Estimated Savings: $250 per fast-pass'}
              </div>

              <button
                onClick={() => triggerVeto('Manual veto from Friction HUD')}
                disabled={!isArmed}
                className={`mt-4 w-full py-2 rounded-lg text-[11px] font-bold border transition-colors ${isArmed ? 'bg-rose-500 text-white border-rose-500 hover:bg-rose-600' : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'}`}
              >
                Trigger Veto
              </button>
            </div>

            <div className="mt-4 min-h-[56px]">
              <AnimatePresence>
                {dissipatedSignals.map((signal) => (
                  <motion.div
                    key={signal.event_id}
                    initial={{ opacity: 0, scale: 0.9, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.6, filter: 'blur(8px)' }}
                    className="mb-2 px-3 py-2 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    Dissipated: {signal.message_body?.target || 'unknown target'}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
