import React from 'react';

export default function AuditRow({ time, action, color, desc }) {
  return (
    <div className="flex items-start md:items-center flex-col md:flex-row gap-4 p-4 border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
       <span className="text-slate-400 w-[120px] shrink-0 font-mono font-bold text-[11px] uppercase">{time}</span>
       <span className={`font-extrabold w-[100px] shrink-0 px-3 py-1.5 rounded-md text-[10.5px] uppercase font-mono tracking-wider border ${color} flex justify-center`}>{action}</span>
       <span className="text-slate-700 font-semibold leading-relaxed flex-1">{desc}</span>
    </div>
  );
}
