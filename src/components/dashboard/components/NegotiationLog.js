import React from 'react';
import { Activity, Shield } from 'lucide-react';

export default function NegotiationLog({ timestamp, controller, ciso, status, statusColor }) {
  return (
    <div className="flex flex-col gap-2 relative pl-4 border-l-2 border-slate-300">
       <div className="text-[10px] font-mono font-bold text-slate-400">{timestamp}</div>
       
       <div className="flex gap-4">
         <div className="flex-1 bg-white border border-slate-200 p-4 rounded-[16px] shadow-sm text-[12px] transition-transform hover:-translate-y-0.5">
           <div className="text-[10px] font-bold text-blue-600 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider"><Activity size={12}/> Controller Agent</div>
           <div className="text-slate-700 font-bold leading-relaxed">{controller}</div>
         </div>
         <div className="flex-1 bg-blue-50/50 border border-blue-100 p-4 rounded-[16px] shadow-sm text-[12px] transition-transform hover:-translate-y-0.5">
           <div className="text-[10px] font-bold text-blue-600 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider"><Shield size={12}/> CISO Agent</div>
           <div className="text-slate-700 font-bold leading-relaxed">{ciso}</div>
         </div>
       </div>

       <div className="mt-2 text-right">
         <span className={`text-[9px] font-bold px-3 py-1.5 rounded-md ${statusColor} uppercase tracking-wider inline-block`}>{status}</span>
       </div>
    </div>
  );
}
