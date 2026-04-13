import React from 'react';
import Link from 'next/link';

export default function SidebarItem({ icon, active, href, isAi }) {
  return (
    <Link href={href || '#'} className="w-full flex justify-center">
       <button className={`w-[42px] h-[42px] rounded-[14px] flex items-center justify-center transition-all duration-300 relative ${
        active ? 'bg-white text-blue-600 shadow-md border border-slate-100 ring-4 ring-white/50' : 'text-slate-400 hover:bg-white/90 hover:text-slate-700 border border-transparent'
      }`}>
        {icon}
        {isAi && !active && <div className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full animate-pulse border-2 border-white"></div>}
      </button>
    </Link>
  );
}
