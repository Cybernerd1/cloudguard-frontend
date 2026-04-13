import React from 'react';
import { Shield } from 'lucide-react';

export default function PricingRow({ label, value, highlight, icon, color }) {
  return (
    <div className="flex justify-between items-center text-[12px]">
      <span className="text-slate-500 font-medium">{label}</span>
      <span className={`font-extrabold flex items-center gap-1.5 ${highlight ? (color || 'text-blue-500') : 'text-slate-800'}`}>
         {icon && <Shield size={12} />}
         {value}
      </span>
    </div>
  )
}
