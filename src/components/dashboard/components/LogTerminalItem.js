import React from 'react';

export default function LogTerminalItem({ time, action, target, rule }) {
  // Determine dynamic colors for [VETO] vs [GOVERN] logic
  let actionColor = "text-blue-600 bg-blue-50 border-blue-100";
  if (action === "[VETO]") actionColor = "text-rose-600 bg-rose-50 border-rose-100";
  if (action === "[GOVERN]") actionColor = "text-emerald-600 bg-emerald-50 border-emerald-100";
  if (action === "[SHUTDOWN]") actionColor = "text-amber-600 bg-amber-50 border-amber-100";
  if (action === "[ROTATED]") actionColor = "text-indigo-600 bg-indigo-50 border-indigo-100";
  if (action === "[NOTIFIED]") actionColor = "text-blue-600 bg-blue-50 border-blue-100";

  return (
    <div className="flex flex-col gap-2 py-3 px-4 rounded-[12px] transition-all border border-slate-100 bg-white hover:bg-slate-50 hover:shadow-sm shadow-[0_2px_5px_rgba(0,0,0,0.02)]">
       <div className="flex items-center justify-between w-full">
         <div className={`font-bold tracking-widest text-[10px] uppercase font-mono px-2 py-1 rounded border ${actionColor}`}>{action}</div>
         <div className="text-slate-400 font-mono font-bold text-[9px]">{time}</div>
       </div>
       <div className="text-slate-700 font-semibold leading-relaxed mt-1 text-[11.5px] pr-2">{target}</div>
       <div className="text-slate-400 text-[9px] font-bold uppercase mt-1 tracking-wider">Rule: {rule}</div>
    </div>
  );
}
