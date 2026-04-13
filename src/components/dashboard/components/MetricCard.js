import React from 'react';

export default function MetricCard({ title, value, suffix, badge, badgeColor, progress, progressColor, hideBar, subtext }) {
  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-[20px] p-5 shadow-sm border border-white flex flex-col justify-center relative overflow-hidden transition-transform hover:-translate-y-0.5">
      <h3 className="text-[10.5px] font-bold text-slate-500 mb-2 uppercase tracking-wider">{title}</h3>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-[32px] font-bold text-slate-800 leading-none tracking-tight">{value}</span>
        {suffix && <span className="text-[12.5px] font-bold text-slate-400">{suffix}</span>}
      </div>
      <div className="mt-1 mb-4 relative z-10">
        <span className={`px-2.5 py-1 font-bold text-[9px] rounded-md ${badgeColor} inline-block`}>{badge}</span>
      </div>
      {!hideBar && (
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-auto relative z-10">
          <div className={`h-full bg-gradient-to-r ${progressColor} rounded-full`} style={{ width: `${progress}%` }}></div>
        </div>
      )}
      {subtext && <div className="text-[10px] font-bold text-slate-500 mt-3">{subtext}</div>}
    </div>
  );
}
