import React from 'react';
import { motion } from 'framer-motion';

export default function SettingsView() {
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}  className="flex-1 h-full flex flex-col bg-transparent overflow-hidden px-1 py-1 absolute inset-0 w-full">
      <header className="flex justify-between items-center h-[40px] shrink-0 mb-3">
        <h1 className="text-[20px] font-bold tracking-tight text-slate-800 flex items-center gap-2">
           Application Settings
        </h1>
      </header>
      
      <div className="flex-1 bg-white/90 backdrop-blur-md rounded-[20px] shadow-sm border border-slate-200 p-8 flex flex-col gap-8 overflow-y-auto">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-4">
               <h3 className="text-[14px] font-bold text-slate-800 border-b border-slate-200 pb-2">Agent Autonomy</h3>
               <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                 <div className="flex flex-col gap-1">
                   <strong className="text-slate-700 text-[12px]">Auto-Remediation</strong>
                   <span className="text-slate-500 text-[11px]">Allow the system to deploy code-level fixes autonomously.</span>
                 </div>
                 <div className="w-10 h-5 bg-emerald-500 rounded-full flex items-center px-0.5 shadow-inner cursor-pointer"><div className="w-4 h-4 bg-white rounded-full translate-x-5 shadow-sm"></div></div>
               </div>
               <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                 <div className="flex flex-col gap-1">
                   <strong className="text-slate-700 text-[12px]">Sovereign Mode Hard-Lock</strong>
                   <span className="text-slate-500 text-[11px]">Disable the Veto override across all dashboards.</span>
                 </div>
                 <div className="w-10 h-5 bg-slate-300 rounded-full flex items-center px-0.5 shadow-inner cursor-pointer"><div className="w-4 h-4 bg-white rounded-full shadow-sm"></div></div>
               </div>
            </div>

            <div className="flex flex-col gap-4">
               <h3 className="text-[14px] font-bold text-slate-800 border-b border-slate-200 pb-2">Profile & Identity</h3>
               <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Felix`} alt="Avatar" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[15px] font-bold text-slate-800">Felix CISO</span>
                    <span className="text-[11px] text-slate-500 font-mono">felix@cloudguard.io</span>
                    <button className="text-blue-600 text-[11px] font-bold mt-2 text-left hover:underline">Edit Profile</button>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </motion.div>
  );
}
