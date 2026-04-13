import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, ShieldAlert } from 'lucide-react';
import AuditRow from '../components/AuditRow';
import { fetchAuditReport, fetchCriticalFindings, fetchTopFindings } from '../../../lib/api';
import { useSovereignStream } from '../../../lib/useSovereignStream';

function formatTime(value) {
  const stamp = String(value || '');
  if (!stamp) return '--:--:--';
  if (stamp.includes('T')) {
    return stamp.split('T')[1].replace('Z', '').slice(0, 12);
  }
  return stamp.slice(0, 12);
}

function findingToRow(finding, index) {
  const severity = String(finding.severity || 'LOW').toUpperCase();

  const colorMap = {
    CRITICAL: 'text-red-600 bg-red-50 border-red-200',
    HIGH: 'text-amber-600 bg-amber-50 border-amber-200',
    MEDIUM: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    LOW: 'text-slate-600 bg-slate-50 border-slate-200',
  };

  return {
    id: finding.id || `finding-${index}`,
    time: String(finding.detected_at || finding.timestamp || '').slice(11, 23) || '--:--:--',
    action: `[${severity}]`,
    color: colorMap[severity] || 'text-slate-600 bg-slate-50 border-slate-200',
    desc: `${finding.resource_id || 'unknown'} — Rule ${finding.rule_id || '?'}: ${finding.description?.slice(0, 80) || 'No description'}`,
    raw: finding,
  };
}

function streamEventToRow(event) {
  const body = event.message_body || {};
  const eventType = event.event_type || 'Event';

  let action = '[EVENT]';
  let color = 'text-slate-600 bg-slate-50 border-slate-200';

  if (eventType === 'Remediation') {
    action = '[SHUTDOWN]';
    color = 'text-amber-600 bg-amber-50 border-amber-200';
  } else if (eventType === 'NarrativeChunk' && body.chunk_type === 'veto') {
    action = '[VETO]';
    color = 'text-rose-600 bg-rose-50 border-rose-200';
  } else if (eventType === 'ForecastSignal') {
    action = '[FORECAST]';
    color = 'text-blue-600 bg-blue-50 border-blue-200';
  } else if (eventType === 'SwarmCoolingDown') {
    action = '[GOVERN]';
    color = 'text-emerald-600 bg-emerald-50 border-emerald-200';
  }

  const desc =
    body.heading ||
    body.body ||
    body.resource_id ||
    body.target ||
    eventType;

  return {
    id: event.event_id || `stream-${Date.now()}`,
    time: formatTime(event.tick_timestamp),
    action,
    color,
    desc,
    raw: event,
  };
}

export default function SovereignAuditLogs() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const { events } = useSovereignStream();
  const processedIdsRef = useRef(new Set());

  useEffect(() => {
    let cancelled = false;

    const loadReport = async () => {
      // Primary: fetch real findings from /api/findings/critical + /api/findings/top
      const [criticalRes, topRes] = await Promise.all([
        fetchCriticalFindings(),
        fetchTopFindings(50),
      ]);

      let initialRows = [];

      if (criticalRes && !criticalRes.error && Array.isArray(criticalRes)) {
        const critRows = criticalRes.map(findingToRow);
        initialRows = critRows;
      }

      if (topRes && !topRes.error && Array.isArray(topRes)) {
        // Merge top findings not already in critical list
        const existingIds = new Set(initialRows.map((r) => r.id));
        const topRows = topRes.map(findingToRow).filter((r) => !existingIds.has(r.id));
        initialRows = [...initialRows, ...topRows];
      }

      // Fallback: try sovereign SIEM endpoint
      if (initialRows.length === 0) {
        const siemRes = await fetchAuditReport();
        if (siemRes && !siemRes.error) {
          const siemRows = (siemRes.siem_logs || []).map((entry, i) => ({
            id: `siem-${i}-${entry.timestamp_tick || ''}`,
            time: formatTime(entry.timestamp_utc || entry.timestamp_tick),
            action: `[${String(entry.log_type || 'SIEM').toUpperCase()}]`,
            color: 'text-slate-600 bg-slate-50 border-slate-200',
            desc: `${entry.resource_id || 'unknown'} — ${entry.action || entry.event_name || 'log event'}`,
            raw: entry,
          }));
          initialRows = siemRows;
        }
      }

      if (cancelled) return;
      initialRows.forEach((row) => processedIdsRef.current.add(row.id));
      setRows(initialRows.slice(0, 150).reverse());
      setLoading(false);
    };

    loadReport();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!events.length) return;

    const latest = events.slice(-20);
    const appendable = latest
      .filter((event) => ['Remediation', 'ForecastSignal', 'NarrativeChunk', 'SwarmCoolingDown'].includes(event.event_type))
      .map(streamEventToRow)
      .filter((row) => {
        if (processedIdsRef.current.has(row.id)) return false;
        processedIdsRef.current.add(row.id);
        return true;
      });

    if (appendable.length > 0) {
      setRows((prev) => [...appendable.reverse(), ...prev].slice(0, 150));
    }
  }, [events]);

  const exportRows = useMemo(
    () => rows.map((row) => ({ time: row.time, action: row.action, description: row.desc, raw: row.raw })),
    [rows],
  );

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(exportRows, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `sovereign-audit-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }} className="flex-1 h-full flex flex-col bg-transparent overflow-hidden px-1 py-1 absolute inset-0 w-full">
      <header className="flex justify-between items-center h-[40px] shrink-0 mb-3">
        <h1 className="text-[20px] font-bold tracking-tight text-slate-800 flex items-center gap-2">
          The NIST Sovereign Audit
        </h1>
        <button onClick={handleDownload} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-[12px] text-[12px] font-bold transition-all shadow-md">
          <Download size={14} /> Download Sovereign Safety Report
        </button>
      </header>

      {/* Light Clean Data List */}
      <div className="flex-1 bg-white/90 rounded-[20px] shadow-sm overflow-hidden flex flex-col p-6 mb-2 border border-slate-200 relative backdrop-blur-xl">

        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl text-slate-800 font-bold text-[12px] uppercase tracking-widest font-mono">
            <ShieldAlert className="text-blue-600" size={16} />
            Forensic Black-Box Recorder [Active]
          </div>
          <div className="flex gap-2 opacity-50">
            <div className="w-3 h-3 rounded-full bg-slate-300"></div><div className="w-3 h-3 rounded-full bg-slate-300"></div><div className="w-3 h-3 rounded-full bg-slate-300"></div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto w-full flex flex-col text-[12.5px] font-sans font-medium text-slate-700">
          {loading && (
            <AuditRow time="--:--:--" action="[LOAD]" color="text-blue-600 bg-blue-50 border-blue-200" desc="Loading SIEM audit report..." />
          )}

          {!loading && rows.length === 0 && (
            <AuditRow time="--:--:--" action="[EMPTY]" color="text-slate-600 bg-slate-50 border-slate-200" desc="No audit rows available yet." />
          )}

          {rows.map((row) => (
            <AuditRow key={row.id} time={row.time} action={row.action} color={row.color} desc={row.desc} />
          ))}

          <div className="mt-8 flex items-center gap-2 pl-4 text-slate-400 font-mono font-bold max-w-max border border-slate-100 bg-slate-50 px-4 py-2 rounded-lg">
            sovereign@core:~$
            <div className="w-2.5 h-4 bg-blue-500 animate-pulse rounded-sm relative top-[1px]"></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
