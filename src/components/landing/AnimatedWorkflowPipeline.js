import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Cloud, Database, Lock, Shield, Zap } from 'lucide-react';

export default function AnimatedWorkflowPipeline() {
  return (
    <motion.div 
      animate={{ y: [-6, 6, -6] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      className="relative w-full max-w-[1000px] h-[580px] md:h-[480px] bg-white border border-slate-200 rounded-[32px] shadow-sm flex flex-col md:flex-row items-center justify-between px-6 md:px-10 py-10 overflow-hidden mb-12"
    >
       {/* Ambient Animated Gradients */}
       <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="absolute -top-[100px] -left-[100px] w-[300px] h-[300px] bg-sky-400/10 rounded-full blur-[60px] pointer-events-none" />
       <motion.div animate={{ rotate: -360 }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }} className="absolute -bottom-[100px] -right-[100px] w-[400px] h-[400px] bg-sky-400/10 rounded-full blur-[80px] pointer-events-none" />
       
       <div className="absolute inset-0 opacity-[0.25]" style={{ backgroundImage: 'radial-gradient(#94a3b8 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}></div>

       {/* Enhanced SVG Data Lines */}
       <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 hidden md:block">
          
          {/* Incoming Paths */}
          <path d="M 230 160 C 350 160, 350 240, 450 240" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 6" fill="none" />
          <motion.circle r="4" fill="#0ea5e9" initial={{ offsetDistance: "0%" }} animate={{ offsetDistance: "100%" }} transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }} style={{ offsetPath: `path('M 230 160 C 350 160, 350 240, 450 240')` }} />
          
          <path d="M 230 240 L 450 240" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 6" fill="none" />
          <motion.circle r="4" fill="#0ea5e9" initial={{ offsetDistance: "0%" }} animate={{ offsetDistance: "100%" }} transition={{ duration: 2.5, repeat: Infinity, ease: "linear", delay: 0.8 }} style={{ offsetPath: `path('M 230 240 L 450 240')` }} />
          
          <path d="M 230 320 C 350 320, 350 240, 450 240" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 6" fill="none" />
          <motion.circle r="4" fill="#0ea5e9" initial={{ offsetDistance: "0%" }} animate={{ offsetDistance: "100%" }} transition={{ duration: 2.5, repeat: Infinity, ease: "linear", delay: 1.6 }} style={{ offsetPath: `path('M 230 320 C 350 320, 350 240, 450 240')` }} />

          {/* Outgoing Paths */}
          <path d="M 550 240 C 620 240, 650 140, 750 140" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 6" fill="none" />
          <motion.circle r="4" fill="#10b981" initial={{ offsetDistance: "0%" }} animate={{ offsetDistance: "100%" }} transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 0.5 }} style={{ offsetPath: `path('M 550 240 C 620 240, 650 140, 750 140')` }} />
          
          <path d="M 550 240 L 750 240" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 6" fill="none" />
          <motion.circle r="4" fill="#6366f1" initial={{ offsetDistance: "0%" }} animate={{ offsetDistance: "100%" }} transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 1.1 }} style={{ offsetPath: `path('M 550 240 L 750 240')` }} />

          <path d="M 550 240 C 620 240, 650 340, 750 340" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 6" fill="none" />
          <motion.circle r="4" fill="#ef4444" initial={{ offsetDistance: "0%" }} animate={{ offsetDistance: "100%" }} transition={{ duration: 2.2, repeat: Infinity, ease: "linear", delay: 1.8 }} style={{ offsetPath: `path('M 550 240 C 620 240, 650 340, 750 340')` }} />
       </svg>

       {/* Step 1: Telemetry Inputs Expanded */}
       <div className="relative z-10 flex flex-row md:flex-col gap-4">
         <motion.div whileTap={{ scale: 0.95 }} title="Click to view details" className="w-[140px] md:w-[190px] bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-3 rounded-2xl flex flex-col items-center justify-center cursor-pointer">
            <div className="w-8 h-8 bg-sky-50 border border-sky-100 rounded-full flex items-center justify-center mb-2">
              <Cloud size={16} className="text-sky-500"/>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-0.5">Ingest</span>
            <span className="text-[12px] font-bold text-slate-800 text-center leading-tight">CloudTrail & OIDC Logs</span>
         </motion.div>
         
         <motion.div whileTap={{ scale: 0.95 }} className="w-[140px] md:w-[190px] bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-3 rounded-2xl flex flex-col items-center justify-center cursor-pointer">
            <div className="w-8 h-8 bg-sky-50 border border-sky-100 rounded-full flex items-center justify-center mb-2">
               <Database size={16} className="text-sky-500"/>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-0.5">Monitor</span>
            <span className="text-[12px] font-bold text-slate-800 text-center leading-tight">Shadow AI (GPU) Nodes</span>
         </motion.div>

         <motion.div whileTap={{ scale: 0.95 }} className="w-[140px] md:w-[190px] bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-3 rounded-2xl flex flex-col items-center justify-center cursor-pointer hidden md:flex">
            <div className="w-8 h-8 bg-sky-50 border border-sky-100 rounded-full flex items-center justify-center mb-2">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-500"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-0.5">Scan</span>
            <span className="text-[12px] font-bold text-slate-800 text-center leading-tight">IAM & Identity Traces</span>
         </motion.div>
       </div>

       {/* Step 2: The Logic Engine */}
       <div className="relative z-10 w-[160px] h-[160px] flex items-center justify-center my-8 md:my-0 cursor-pointer">
         <motion.div 
           animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
           className="absolute inset-0 rounded-full border-t-2 border-r-2 border-sky-500/60"
         />
         <motion.div 
           animate={{ rotate: -360 }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
           className="absolute inset-[10px] rounded-full border-b-[3px] border-l-2 border-blue-400/40"
         />
         <motion.div whileTap={{ scale: 0.95 }} className="w-[124px] h-[124px] bg-white border border-white backdrop-blur shadow-2xl rounded-full flex flex-col items-center justify-center relative">
           <Zap size={26} className="text-[#00a3ff] mb-1" />
           <span className="text-[11px] font-bold text-slate-800 leading-tight text-center px-1">Sovereign<br/>Temporal Kernel</span>
         </motion.div>
       </div>

       {/* Step 3: Automated Outcomes Expanded */}
       <div className="relative z-10 flex flex-row md:flex-col gap-4">
         <motion.div whileTap={{ scale: 0.95 }} className="w-[150px] md:w-[240px] bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-3 rounded-2xl flex items-center gap-3 cursor-pointer">
            <div className="bg-emerald-50 border border-emerald-100 p-2 rounded-lg shrink-0">
              <CheckCircle2 size={16} className="text-emerald-500"/>
            </div>
            <div className="flex flex-col">
               <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Action</span>
               <span className="text-[12px] font-bold text-slate-800 leading-tight">Predictive Fast-Pass</span>
            </div>
         </motion.div>

         <motion.div whileTap={{ scale: 0.95 }} className="w-[150px] md:w-[240px] bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-3 rounded-2xl flex items-center gap-3 cursor-pointer hidden md:flex">
            <div className="bg-indigo-50 border border-indigo-100 p-2 rounded-lg shrink-0">
              <Shield size={16} className="text-indigo-500"/>
            </div>
            <div className="flex flex-col">
               <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Policy</span>
               <span className="text-[12px] font-bold text-slate-800 leading-tight">Stochastic <em className="not-italic font-bold">J</em>-Negotiation</span>
            </div>
         </motion.div>
         
         <motion.div whileTap={{ scale: 0.95 }} className="w-[150px] md:w-[240px] bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-3 rounded-2xl flex items-center gap-3 cursor-pointer">
            <div className="bg-rose-50 border border-rose-100 p-2 rounded-lg shrink-0">
              <Lock size={16} className="text-rose-500"/>
            </div>
            <div className="flex flex-col">
               <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Reflex</span>
               <span className="text-[12px] font-bold text-slate-800 leading-tight">Parallel Iron Dome Reflex</span>
            </div>
         </motion.div>
       </div>
    </motion.div>
  )
}
