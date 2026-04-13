import React from 'react';

export default function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="w-10 h-10 rounded-xl border border-slate-100 flex items-center justify-center bg-slate-50 shadow-sm">
        {icon}
      </div>
      <h3 className="text-[15px] font-bold text-slate-800 tracking-tight">{title}</h3>
      <p className="text-[13px] text-slate-500 font-medium leading-relaxed">{desc}</p>
    </div>
  )
}
