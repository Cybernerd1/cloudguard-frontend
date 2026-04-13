import React from 'react';

export default function RiskItem({ icon, title, resource, tagVal, tagColor }) {
  return (
    <div className="flex items-center gap-3 relative cursor-pointer bg-white/60 hover:bg-white border border-white p-3 rounded-[16px] transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
      <div className="shrink-0 flex items-center justify-center p-2 rounded-[10px] bg-slate-50 border border-slate-100">
         {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-bold text-slate-800 truncate mb-1">{title}</div>
        <div className="text-[10px] font-bold text-slate-500 truncate flex items-center gap-1.5">
           {resource}
        </div>
      </div>
      <div className="shrink-0 flex items-center">
        <span className={`text-[9.5px] px-2.5 py-1 rounded-[8px] ${tagColor}`}>{tagVal}</span>
      </div>
    </div>
  );
}
