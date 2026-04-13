import React from 'react';

export default function NavBar({ onGetStarted }) {
  const scrollToNode = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 w-[92%] max-w-[850px] z-50 flex justify-center">
      <nav className="w-full bg-white/95 backdrop-blur-xl border border-slate-200 shadow-md rounded-full px-4 py-1.5 flex items-center justify-between">
        
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToNode('platform')}>
          <img src="/logo.png" alt="CloudGuard" className="w-[18px] h-[18px] drop-shadow-sm" />
          <span className="font-extrabold text-[14px] text-slate-800 tracking-tight">CloudGuard</span>
        </div>
        
        <div className="hidden lg:flex items-center gap-5 text-[12px] font-bold text-slate-500 ml-4">
          <a onClick={(e)=>{e.preventDefault(); scrollToNode('platform')}} href="#platform" className="hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-0.5">Platform <span className="text-[9px] opacity-60">+</span></a>
          <a onClick={(e)=>{e.preventDefault(); scrollToNode('solutions')}} href="#solutions" className="hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-0.5">Solutions <span className="text-[9px] opacity-60">+</span></a>
          <a onClick={(e)=>{e.preventDefault(); scrollToNode('pricing')}} href="#pricing" className="hover:text-slate-900 transition-colors cursor-pointer">Pricing</a>
          <a onClick={(e)=>{e.preventDefault(); scrollToNode('resources')}} href="#resources" className="hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-0.5">Resources <span className="text-[9px] opacity-60">+</span></a>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="text-[12px] font-bold text-slate-600 hover:text-slate-900 transition-colors hidden md:block px-2">Book a demo</button>
          <button onClick={onGetStarted} className="bg-[#0f172a] hover:bg-slate-800 text-white px-4 py-1.5 rounded-full text-[12px] font-bold shadow-sm transition-all border border-slate-700">
            Get started
          </button>
        </div>

      </nav>
    </div>
  );
}
