import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, AlertTriangle, ChevronRight, Database, BookOpen, Activity, RefreshCw } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import RiskItem from '../components/RiskItem';
import LogTerminalItem from '../components/LogTerminalItem';
import { useSovereignStream } from '../../../lib/useSovereignStream';
import { useMetricData } from '../../../lib/useMetricData';
import { fetchSecurityScore, triggerScan } from '../../../lib/api';

function formatCurrency(value) {
  const amount = Number(value || 0);
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}k`;
  }
  return `$${Math.round(amount)}`;
}

function toPercent(value) {
  const n = Number(value || 0);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function eventToLog(entry) {
  const body = entry.message_body || {};
  const eventType = entry.event_type || 'Event';

  let action = '[NOTIFIED]';
  if (eventType === 'Remediation') action = '[SHUTDOWN]';
  if (eventType === 'ForecastSignal' && body.type === 'Amber_Alert') action = '[GOVERN]';
  if (eventType === 'NarrativeChunk' && body.chunk_type === 'veto') action = '[VETO]';
  if (eventType === 'NarrativeChunk' && body.chunk_type === 'exec') action = '[ROTATED]';

  const timestamp = String(entry.tick_timestamp || '').split('T')[1]?.replace('Z', '') || '--:--:--';
  const target =
    body.heading ||
    body.resource_id ||
    body.target ||
    body.action ||
    eventType;

  const rule =
    typeof body.j_delta === 'number'
      ? `J-Delta: ${body.j_delta.toFixed(4)}`
      : `Trace: ${(entry.trace_id || 'n/a').slice(0, 12)}`;

  return { action, time: timestamp.slice(0, 8), target, rule };
}

export default function TemporalCommandCenter({ onCopilotClick }) {
  const [activeTab, setActiveTab] = useState('Tick');
  const [scanLoading, setScanLoading] = useState(false);
  const [scanStatus, setScanStatus] = useState(null); // null | 'success' | 'error'
  const [scoreData, setScoreData] = useState(null);

  const { isConnected, events, amberAlerts, topology, backoffStatus, jScore } = useSovereignStream();
  const { metrics } = useMetricData();

  // ── Fetch real security score from /api/score/ every 30s ────────────────
  const loadScore = useCallback(async () => {
    const data = await fetchSecurityScore();
    if (data && !data.error) setScoreData(data);
  }, []);

  useEffect(() => {
    loadScore();
    const id = setInterval(loadScore, 30000);
    return () => clearInterval(id);
  }, [loadScore]);

  // ── T-Minus Sync: trigger full backend scan ──────────────────────────────
  const handleScan = async () => {
    if (scanLoading) return;
    setScanLoading(true);
    setScanStatus(null);
    const result = await triggerScan();
    setScanLoading(false);
    if (result && !result.error) {
      setScanStatus('success');
      loadScore(); // refresh score immediately after scan
    } else {
      setScanStatus('error');
    }
    setTimeout(() => setScanStatus(null), 4000);
  };

  const forecastSignals = useMemo(
    () => events.filter((event) => event.event_type === 'ForecastSignal').slice(-5),
    [events],
  );

  const remediations = useMemo(
    () => events.filter((event) => event.event_type === 'Remediation').slice(-6).reverse(),
    [events],
  );

  const logItems = useMemo(
    () => events.slice(-10).reverse().map(eventToLog),
    [events],
  );

  const postureScore = useMemo(() => {
    // Prefer real security score from /api/score/
    if (scoreData?.security_score != null) return toPercent(scoreData.security_score);
    const fromCompliance = metrics?.compliance?.compliance_percentage;
    if (typeof fromCompliance === 'number') return toPercent(fromCompliance);
    return toPercent((1 - Number(jScore || 0)) * 100);
  }, [jScore, metrics, scoreData]);

  const totalResources = useMemo(() => {
    // Prefer real compliance counts from score API
    if (scoreData?.total_findings != null) {
      const compliant = Number(metrics?.compliance?.compliant_resources || 0);
      const nonCompliant = Number(metrics?.compliance?.non_compliant_resources || 0);
      const total = compliant + nonCompliant;
      if (total > 0) return total;
    }
    const compliant = Number(metrics?.compliance?.compliant_resources || 0);
    const nonCompliant = Number(metrics?.compliance?.non_compliant_resources || 0);
    const total = compliant + nonCompliant;
    if (total > 0) return total;
    return topology.length;
  }, [metrics, topology.length, scoreData]);

  const activePerturbations = useMemo(() => {
    // Use real critical + high count from score API if available
    if (scoreData?.critical_count != null) {
      return (scoreData.critical_count || 0) + (scoreData.high_count || 0);
    }
    const redCount = topology.filter((item) => {
      const status = String(item.status || '').toUpperCase();
      return ['RED', 'CRITICAL', 'AMBER'].includes(status);
    }).length;
    return Math.max(redCount, amberAlerts.length);
  }, [amberAlerts.length, topology, scoreData]);

  const fastPassSavings = amberAlerts.length * 250;

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }} className="flex-1 h-full flex gap-4 overflow-hidden w-full absolute inset-0">
      <main className="flex-1 h-full flex flex-col gap-3 overflow-hidden">

        <header className="flex justify-between items-center px-1 h-[36px] shrink-0 mb-1">
          <div className="flex items-center gap-3">
            <h1 className="text-[19px] font-bold tracking-tight text-slate-800 flex items-center">
              Overview
            </h1>
          </div>
          <div className="flex items-center gap-3 bg-white/60 backdrop-blur-md rounded-full p-1 shadow-sm border border-white">
            <button
              onClick={handleScan}
              disabled={scanLoading}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-semibold transition-colors shadow-sm ml-0.5 ${scanLoading
                  ? 'bg-blue-400 text-white cursor-wait'
                  : scanStatus === 'success'
                    ? 'bg-emerald-600 text-white'
                    : scanStatus === 'error'
                      ? 'bg-rose-500 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
            >
              {scanLoading
                ? <RefreshCw size={12} className="animate-spin" />
                : <Zap size={12} className="text-white" />}
              {scanLoading ? 'Scanning…' : scanStatus === 'success' ? 'Synced!' : scanStatus === 'error' ? 'Scan Failed' : 'T-Minus Sync'}
            </button>
            <span className={`px-3 py-1 text-[10px] font-bold rounded-full border ${isConnected ? 'text-emerald-700 border-emerald-200 bg-emerald-50' : 'text-slate-500 border-slate-200 bg-slate-50'}`}>
              {isConnected ? 'WS Connected' : 'WS Reconnecting'}
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 shrink-0">
          <MetricCard
            title="Posture Score" value={String(postureScore)} suffix="/100"
            badge={scoreData ? `Last scan: ${String(scoreData.last_scan || '').slice(0, 10)}` : `J-Score: ${Number(jScore || 0).toFixed(4)}`}
            badgeColor="text-blue-600 bg-blue-50 font-bold border border-blue-200 tracking-tight"
            progress={postureScore} progressColor="from-blue-400 to-blue-500"
          />
          <MetricCard
            title="Active Perturbations" value={String(activePerturbations)} suffix=" Vectors"
            badge={activePerturbations > 0 ? 'Action Needed' : 'Stable'} badgeColor="text-blue-600 bg-blue-50 border border-blue-200"
            progress={toPercent((activePerturbations / Math.max(totalResources || 1, 1)) * 100)} progressColor="from-blue-400 to-blue-500"
          />
          <MetricCard
            title="Resources Indexed" value={String(totalResources || 0)} suffix=""
            badge={scoreData?.total_findings != null ? `${scoreData.total_findings} Findings` : 'Sovereign Active'}
            badgeColor="text-blue-600 bg-blue-50 border border-blue-200"
            hideBar={true}
          />
          <MetricCard
            title="Cost Waste / Month" value={scoreData?.monthly_waste_usd != null ? `$${Number(scoreData.monthly_waste_usd).toFixed(0)}` : formatCurrency(fastPassSavings)} suffix={scoreData?.monthly_waste_usd != null ? '' : '/run'}
            badge={scoreData?.monthly_waste_usd != null ? 'Idle EC2 Waste' : '$250 per Fast-Pass'} badgeColor="text-blue-600 bg-blue-50 border border-blue-200 font-bold"
            progress={scoreData?.monthly_waste_usd != null ? toPercent((scoreData.monthly_waste_usd / 5000) * 100) : toPercent((fastPassSavings / 5000) * 100)} progressColor="from-blue-400 to-blue-500"
          />
        </div>

        {/* Middle Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1 min-h-0">

          <div className="md:col-span-2 bg-white/70 backdrop-blur-xl rounded-[20px] p-4 shadow-sm border border-white flex flex-col h-full overflow-hidden">
            <div className="flex justify-between items-start mb-3 shrink-0">
              <div>
                <h3 className="text-[13px] font-bold text-slate-800">Temporal Risk Horizon</h3>
              </div>
              <div className="flex p-0.5 bg-slate-100/80 rounded-full border border-slate-200">
                {['Tick', 'Epoch', 'Cycle'].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1 rounded-full text-[10px] font-bold transition-all ${activeTab === tab ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 w-full min-h-0 relative mt-2 bg-blue-50/50 rounded-[16px] overflow-hidden flex border border-blue-100/50 shadow-inner">
              <div className="w-[30%] h-full border-r border-blue-200 border-dashed flex flex-col justify-center items-end pr-6 gap-6 relative">
                <div className="absolute top-4 right-4 text-[10px] font-bold text-blue-500 uppercase tracking-widest bg-white py-1 px-3 rounded shadow-sm border border-blue-100">Past Events</div>
                <div className="flex items-center gap-2 opacity-60"><div className="w-4 h-4 rounded-full bg-blue-300"></div><div className="h-0.5 w-16 bg-blue-200"></div></div>
                <div className="flex items-center gap-2 opacity-40"><div className="w-4 h-4 rounded-full bg-blue-300"></div><div className="h-0.5 w-24 bg-blue-200"></div></div>
              </div>

              <div className="w-[40%] h-full flex flex-col justify-center items-center relative z-10">
                <div className="absolute top-4 text-[10px] uppercase font-bold text-blue-600 bg-white border border-blue-100 shadow-sm py-1 px-4 rounded-full">Present Status</div>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-1 bg-gradient-to-r from-blue-200 to-blue-400 rounded"></div>
                  <motion.div
                    animate={{ scale: [1, 1.15, 1], boxShadow: ["0px 0px 0px rgba(59,130,246,0)", "0px 0px 20px rgba(59,130,246,0.4)", "0px 0px 0px rgba(59,130,246,0)"] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="w-16 h-16 bg-white border-[5px] border-blue-400 rounded-full flex items-center justify-center relative z-20 shadow-md"
                  >
                    <Shield className="text-blue-500" size={24} />
                  </motion.div>
                  <div className="w-16 h-1 bg-gradient-to-l from-blue-300/50 to-blue-400 rounded"></div>
                </div>
                <div className="mt-4 px-3 py-1 rounded-full text-[10px] font-bold border border-blue-100 bg-white text-blue-600">
                  {isConnected ? 'Signal Stable' : 'Awaiting Stream'}
                </div>
              </div>

              <div className="w-[30%] h-full bg-gradient-to-r from-blue-50 to-blue-100 flex flex-col justify-center items-start pl-6 gap-4 relative overflow-hidden border-l border-blue-200">
                <div className="absolute top-4 left-4 text-[10px] uppercase font-bold text-blue-600 flex items-center gap-1.5"><AlertTriangle size={12} /> Forecast Horizon</div>

                {forecastSignals.length === 0 && (
                  <div className="bg-white/80 text-blue-600 text-[10px] font-bold px-3 py-1.5 rounded-full border border-blue-100">
                    Waiting for forecast signals
                  </div>
                )}

                {forecastSignals.map((signal) => {
                  const body = signal.message_body || {};
                  const isAmber = body.type === 'Amber_Alert';
                  return (
                    <motion.div
                      key={signal.event_id || `${body.target}-${body.type}`}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm border flex items-center gap-2 ${isAmber ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-blue-500 text-white border-blue-500'}`}
                    >
                      <div className={`w-2 h-2 rounded-full ${isAmber ? 'bg-amber-400 animate-pulse' : 'bg-blue-200'}`}></div>
                      {body.type || 'Forecast'} {typeof body.probability === 'number' ? `P=${(body.probability * 100).toFixed(0)}%` : ''}
                    </motion.div>
                  );
                })}

                {amberAlerts.slice(-2).map((signal, index) => (
                  <div
                    key={`ghost-${signal.event_id}`}
                    className="absolute right-2 text-[9px] px-2 py-1 rounded-full bg-amber-200/70 border border-amber-300 text-amber-800"
                    style={{ bottom: `${20 + index * 24}%` }}
                  >
                    Ghost Node
                  </div>
                ))}
              </div>
            </div>
          </div>

          <motion.div
            whileHover={{ y: -4 }}
            className="relative overflow-hidden bg-gradient-to-b from-[#7dbbff] to-[#dcedff] rounded-[20px] flex flex-col h-full border border-blue-200 shadow-sm cursor-pointer md:col-span-1 min-h-[300px]"
            onClick={onCopilotClick}
          >
            <div className="p-4 flex flex-col relative z-20 h-full w-full">
              <h3 className="text-[17px] font-bold text-white mb-0.5 leading-tight drop-shadow-sm">
                Liaison Console
              </h3>
              <p className="text-[11px] text-blue-900/80 leading-snug font-bold mb-3">
                Automated remediation online.
              </p>

              <div className="flex flex-col gap-2 relative z-20 w-max max-w-full">
                <div className="bg-white/50 backdrop-blur-md rounded-md px-3 py-2 text-[11px] font-bold text-blue-900 shadow-sm border border-white/50 whitespace-nowrap overflow-hidden text-ellipsis">
                  Real-time Narrative feed connected.
                </div>
                <div className="bg-white/50 backdrop-blur-md rounded-md px-3 py-2 text-[11px] font-bold text-blue-900 shadow-sm border border-white/50 whitespace-nowrap overflow-hidden text-ellipsis">
                  {backoffStatus.active ? `Sovereign Backoff: ${backoffStatus.reason}` : 'Sentry and Controller stream active.'}
                </div>
              </div>

              {/* Large Copilot image overlapping bottom right, adjusted upward slightly to clear button */}
              <div className="absolute bottom-16 -right-2 flex items-end justify-end pointer-events-none z-10 overflow-visible mt-auto">
                <img src="/copilot.png" className="w-[85%] max-w-[240px] object-contain drop-shadow-xl opacity-95" alt="Copilot Background" />
              </div>

              {/* Button below image, pinned to bottom */}
              <div className="mt-auto relative z-20 w-full pt-4">
                <button onClick={onCopilotClick} className="w-full py-3 bg-white/70 hover:bg-white backdrop-blur-xl rounded-[14px] text-blue-800 text-[12px] font-bold transition-all border border-white shadow-sm flex justify-center items-center gap-1.5 focus:outline-none">
                  Enter War Room <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-[20px] p-4 shadow-sm border border-white flex flex-col shrink-0 min-h-[180px]">
          <div className="mb-3 flex justify-between items-center shrink-0">
            <div>
              <h3 className="text-[13px] font-bold text-slate-800">Sovereign Remediations</h3>
            </div>
            <button className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors">Historical Logs</button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-2 flex-1 overflow-auto scrollbar-hide content-start pr-1">
            {remediations.length === 0 && (
              <RiskItem icon={<BookOpen size={14} className="text-blue-400" />} title="Awaiting Remediations" resource="No remediation events yet" tagVal="STANDBY" tagColor="bg-blue-50 text-blue-600 border border-blue-200 font-bold" />
            )}
            {remediations.map((event) => {
              const body = event.message_body || {};
              return (
                <RiskItem
                  key={event.event_id}
                  icon={<Database size={14} className="text-blue-400" />}
                  title={body.action || 'Sovereign Remediation'}
                  resource={body.resource_id || 'unknown'}
                  tagVal={body.success ? 'SOVEREIGN FIXED' : 'NEEDS REVIEW'}
                  tagColor={body.success ? 'bg-blue-50 text-blue-600 border border-blue-200 font-bold' : 'bg-amber-50 text-amber-700 border border-amber-200 font-bold'}
                />
              );
            })}
          </div>
        </div>
      </main>

      <aside className="w-[320px] hidden 2xl:flex flex-col gap-3 h-full shrink-0 overflow-hidden pb-1 pt-1 border-l border-slate-200/50 pl-4 relative">
        <div className="bg-white/80 backdrop-blur-2xl rounded-[20px] p-5 flex flex-col shadow-sm border border-white flex-1 min-h-0 relative">
          <h3 className="text-[15px] font-bold text-blue-700 mb-1 flex items-center gap-2">
            <Activity size={18} /> The Sovereign Log
          </h3>
          <p className="text-[10px] text-blue-400 mb-5 font-mono uppercase tracking-widest border-b border-blue-100 pb-3">Stream: active_nodes_us_1</p>

          <div className="flex flex-col gap-4 flex-1 overflow-y-auto scrollbar-hide pr-1">
            {logItems.length === 0 && (
              <LogTerminalItem time="--:--:--" action="[NOTIFIED]" target="Waiting for live sovereign events." rule="WS stream" />
            )}
            {logItems.map((item, idx) => (
              <LogTerminalItem
                key={`${item.action}-${item.time}-${idx}`}
                time={item.time}
                action={item.action}
                target={item.target}
                rule={item.rule}
              />
            ))}
          </div>
        </div>
      </aside>
    </motion.div>
  );
}
