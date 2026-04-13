import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import HoneycombCell from '../components/HoneycombCell';
import { useSovereignStream } from '../../../lib/useSovereignStream';
import { fetchTopFindings, fetchFindingsSummary, fetchFindingsByType } from '../../../lib/api';

function inferResourceType(resourceId) {
  if (!resourceId) return 'Resource';
  if (resourceId.includes('iam')) return 'IAM';
  if (resourceId.includes('s3')) return 'S3';
  if (resourceId.includes('rds')) return 'RDS';
  if (resourceId.includes('eks')) return 'EKS';
  if (resourceId.includes('ec2') || resourceId.includes('i-')) return 'EC2';
  return 'Node';
}

function severityToStatus(severity) {
  const s = String(severity || '').toUpperCase();
  if (s === 'CRITICAL') return 'RED';
  if (s === 'HIGH') return 'AMBER';
  if (s === 'MEDIUM') return 'YELLOW';
  return 'GREEN';
}

function makePlaceholderTopology() {
  return Array.from({ length: 24 }).map((_, index) => ({
    resource_id: `placeholder-${index + 1}`,
    status: index % 8 === 0 ? 'RED' : index % 3 === 0 ? 'YELLOW' : 'GREEN',
  }));
}

function chunkBy(items, size) {
  const rows = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

export default function IronDomeView() {
  const [is3D, setIs3D] = useState(true);
  const [displayTopology, setDisplayTopology] = useState([]);
  const [findingsSummary, setFindingsSummary] = useState(null);
  const [byType, setByType] = useState(null);
  const [loadingFindings, setLoadingFindings] = useState(true);

  const { topology } = useSovereignStream();

  // ── rAF-buffered topology from WS ─────────────────────────────────────────
  const pendingTopologyRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    pendingTopologyRef.current = topology;
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      setDisplayTopology(Array.isArray(pendingTopologyRef.current) ? pendingTopologyRef.current : []);
      rafRef.current = null;
    });
  }, [topology]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ── Fetch real findings from /api/findings/* ───────────────────────────────
  const loadFindings = useCallback(async () => {
    setLoadingFindings(true);
    const [topRes, summaryRes, typeRes] = await Promise.all([
      fetchTopFindings(60),
      fetchFindingsSummary(),
      fetchFindingsByType(),
    ]);

    if (summaryRes && !summaryRes.error) setFindingsSummary(summaryRes);
    if (typeRes && !typeRes.error) setByType(typeRes);

    // Map top findings → topology nodes for hex grid (when WS topology is empty)
    if (topRes && !topRes.error && Array.isArray(topRes)) {
      const mapped = topRes.map((f) => ({
        resource_id: f.resource_id || f.id || 'unknown',
        status: severityToStatus(f.severity),
        is_locked: f.severity === 'CRITICAL',
        finding_id: f.id,
        rule_id: f.rule_id,
        description: f.description,
      }));
      // Only use findings as fallback when WS hasn't sent any topology yet
      setDisplayTopology((prev) => (prev.length === 0 ? mapped : prev));
    }

    setLoadingFindings(false);
  }, []);

  useEffect(() => {
    loadFindings();
    const id = setInterval(loadFindings, 30000);
    return () => clearInterval(id);
  }, [loadFindings]);

  const resources = useMemo(() => {
    const source = displayTopology.length ? displayTopology : makePlaceholderTopology();

    return source.slice(0, 60).map((item, index) => {
      const resourceId = item.resource_id || item.id || `resource-${index}`;
      const status = String(item.status || item.severity || 'YELLOW').toUpperCase();

      const isLocked = Boolean(item.is_locked) || status === 'RESOURCE_LOCKED' || status === 'LOCKED';
      const isReflex = ['RED', 'CRITICAL', 'AMBER'].includes(status);
      const isCollision = status === 'YELLOW' || status === 'AMBER';
      const isDissipating = status === 'DISSIPATED';

      return {
        id: resourceId,
        name: resourceId,
        type: inferResourceType(resourceId),
        status,
        isLocked,
        isReflex,
        isCollision,
        isDissipating,
      };
    });
  }, [displayTopology]);

  const rows = useMemo(() => chunkBy(resources, 6), [resources]);
  const reflexCount = resources.filter((r) => r.isReflex).length;
  const lockCount = resources.filter((r) => r.isLocked).length;
  const reflexBurst = reflexCount >= 50;

  // Summary badge counts
  const criticalCount = findingsSummary?.critical ?? 0;
  const highCount = findingsSummary?.high ?? 0;
  const mediumCount = findingsSummary?.medium ?? 0;
  const totalCount = findingsSummary?.total ?? 0;

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }} className="flex-1 h-full flex flex-col bg-transparent overflow-hidden px-1 py-1 absolute inset-0 w-full">
      <header className="flex justify-between items-center h-[40px] shrink-0 mb-3">
        <h1 className="text-[20px] font-bold tracking-tight text-slate-800 flex items-center gap-3">
          The Iron Dome
        </h1>
        <div className="flex items-center gap-2">
          {/* Severity summary pills from real API */}
          {findingsSummary && (
            <div className="flex items-center gap-1.5 text-[10px] font-bold font-jetbrains">
              <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">{criticalCount} CRITICAL</span>
              <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200">{highCount} HIGH</span>
              <span className="px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-600 border border-yellow-200">{mediumCount} MEDIUM</span>
              <span className="px-2.5 py-1 rounded-full bg-slate-50 text-slate-500 border border-slate-200">{totalCount} TOTAL</span>
            </div>
          )}
          <button
            onClick={loadFindings}
            className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-full shadow-sm text-[11px] font-bold border border-slate-200 text-blue-600 hover:bg-blue-50 transition-colors"
          >
            {loadingFindings ? 'Loading…' : 'Active Cluster View'}
          </button>
        </div>
      </header>

      <div className="flex-1 bg-white/70 backdrop-blur-2xl rounded-[20px] shadow-sm border border-white p-6 overflow-hidden relative flex flex-col" style={{ perspective: "1500px" }}>
        <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px] opacity-20"></div>

        <div className="relative z-10 flex flex-col h-full w-full">
          <div className="mb-8 p-3 bg-white border border-slate-200 rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.03)] w-max text-[11px] font-bold text-slate-600 flex gap-6">
            <span className="flex items-center gap-2"><div className="w-3 h-3 bg-slate-50 border border-slate-300 rounded"></div> Standard Node</span>
            <span className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-100 border border-blue-400 rounded animate-pulse"></div> Parallel Reflex (Remediating)</span>
            <span className="flex items-center gap-2"><div className="w-3 h-3 bg-amber-100 border border-amber-400 rounded"></div> CISO Override</span>
            <span className="flex items-center gap-2"><div className="w-3 h-3 bg-sky-100 border border-sky-400 rounded stasis-pulse"></div> Stasis Field (Locked)</span>
          </div>

          <div className="mb-4 text-[11px] text-slate-600 font-jetbrains flex gap-4">
            <span>Total Nodes: {resources.length}</span>
            <span>Reflex Nodes: {reflexCount}</span>
            <span>Locked Nodes: {lockCount}</span>
            {byType && Object.keys(byType).length > 0 && (
              <span className="text-blue-600">
                By Type: {Object.entries(byType).slice(0, 4).map(([k, v]) => `${k}(${v})`).join(' · ')}
              </span>
            )}
          </div>

          <motion.div
            animate={is3D ? { rotateX: 45, rotateZ: -10, rotateY: -10, scale: 0.85 } : { rotateX: 0, rotateZ: 0, rotateY: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className={`flex-1 w-full flex flex-col gap-2 items-center justify-center overflow-visible py-10 origin-center ${reflexBurst ? 'reflex-burst' : ''}`}
            style={{ transformStyle: "preserve-3d" }}
            onClick={() => setIs3D(!is3D)}
          >
            {rows.map((rowResources, rowIndex) => (
              <div key={`row-${rowIndex}`} className={`flex gap-3 ${rowIndex % 2 === 1 ? 'ml-16' : ''}`}>
                {rowResources.map((resource) => (
                  <HoneycombCell key={resource.id} data={resource} is3D={is3D} />
                ))}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
