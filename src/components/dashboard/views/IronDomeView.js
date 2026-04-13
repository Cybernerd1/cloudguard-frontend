import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import HoneycombCell from '../components/HoneycombCell';
import { useSovereignStream } from '../../../lib/useSovereignStream';

function inferResourceType(resourceId) {
  if (!resourceId) return 'Resource';
  if (resourceId.includes('iam')) return 'IAM';
  if (resourceId.includes('s3')) return 'S3';
  if (resourceId.includes('rds')) return 'RDS';
  if (resourceId.includes('eks')) return 'EKS';
  if (resourceId.includes('ec2') || resourceId.includes('i-')) return 'EC2';
  return 'Node';
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

  const { topology } = useSovereignStream();

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
  const reflexCount = resources.filter((resource) => resource.isReflex).length;
  const lockCount = resources.filter((resource) => resource.isLocked).length;
  const reflexBurst = reflexCount >= 50;

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }} className="flex-1 h-full flex flex-col bg-transparent overflow-hidden px-1 py-1 absolute inset-0 w-full">
      <header className="flex justify-between items-center h-[40px] shrink-0 mb-3">
        <h1 className="text-[20px] font-bold tracking-tight text-slate-800 flex items-center gap-3">
          The Iron Dome
        </h1>
        <div className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-full shadow-sm text-[11px] font-bold border border-slate-200 text-blue-600">
           Active Cluster View
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
