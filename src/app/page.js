"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Shield, Server, Database, Lock, AlertTriangle, ArrowRight,
  Eye, FileCheck, Target, CheckCircle2, Zap, Cloud, Cpu, Activity,
  Settings, Search, Mic, ArrowUp
} from 'lucide-react';
import NavBar from '../components/landing/NavBar';
import PricingRow from '../components/landing/PricingRow';
import FeatureCard from '../components/landing/FeatureCard';
import AnimatedWorkflowPipeline from '../components/landing/AnimatedWorkflowPipeline';

export default function LandingPage() {
  const router = useRouter();

  const slideUpVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="w-full min-h-screen bg-[#fafafc] text-slate-900 font-sans selection:bg-blue-200">
      <NavBar onGetStarted={() => router.push('/dashboard')} />
      
      {/* 1. Hero Section */}
      <section 
        id="platform"
        className="relative pt-[140px] pb-16 px-6 w-full flex flex-col items-center justify-start min-h-[90vh]"
        style={{
          backgroundImage: "url('/landing-image.png')",
          backgroundSize: "cover",
          backgroundPosition: "top center",
          backgroundRepeat: "no-repeat"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-[#fafafc] z-0 pointer-events-none"></div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center text-center max-w-[800px]"
        >
          <div className="flex items-center gap-2 bg-white/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/80 text-slate-600 text-[10px] font-bold mb-6 shadow-sm uppercase tracking-widest">
             <Shield size={12} className="text-blue-500" />
             Cloud Native Security Platform
          </div>
          
          <h1 className="text-[48px] md:text-[60px] font-extrabold tracking-tight leading-[1.1] text-slate-800 drop-shadow-sm w-full max-w-[700px]">
            Automate Security. <br/>
            <span className="text-slate-500">Reduce Exposure Risk.</span>
          </h1>

          <p className="mt-6 text-[15px] md:text-[16px] text-slate-600 font-medium max-w-[600px] leading-relaxed">
            CloudGuard AI agents automatically detect vulnerabilities, map exposure vectors, and generate auto-remediation policies – letting your team innovate without worrying about unmanaged risk.
          </p>

          <div className="mt-8 flex items-center gap-4 mb-16">
             <button onClick={() => router.push('/dashboard')} className="bg-[#0f172a] hover:bg-slate-800 text-white px-6 py-3 rounded-full text-[14px] font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
               Start free
             </button>
             <button className="bg-white/90 hover:bg-white backdrop-blur-xl border border-slate-200 text-slate-800 px-6 py-3 rounded-full text-[14px] font-bold transition-all shadow-sm hover:shadow-md">
               Book A Demo
             </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-[1000px] flex justify-center pb-10"
        >
           {/* Ambient floating elements behind the image */}
           <motion.div 
             animate={{ y: [0, -30, 0], scale: [1, 1.05, 1] }} 
             transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} 
             className="absolute top-10 -left-10 w-32 h-32 bg-sky-400/20 rounded-full blur-3xl z-[-1]"
           />
           <motion.div 
             animate={{ y: [0, 40, 0], scale: [1, 1.1, 1] }} 
             transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }} 
             className="absolute bottom-10 -right-10 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl z-[-1]"
           />
           
           <motion.div 
             animate={{ y: [-8, 8, -8] }}
             transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
             className="relative w-[90%]"
           >
             <img src="/landing screenshot.png" className="w-full object-contain rounded-[16px] shadow-[0_15px_60px_-15px_rgba(0,0,0,0.12)] bg-white/50 border border-white/50 p-1.5 backdrop-blur transition-transform duration-700" alt="Dashboard Panel Overview" />
             
             {/* Floating Chat Interface over the Hero Image */}
             <motion.div 
               whileHover={{ y: -5 }}
               className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[85%] max-w-[700px] bg-white rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100 p-2 flex items-center gap-3 backdrop-blur-md z-20"
             >
               <div className="flex items-center gap-2 pl-2">
                 <button className="w-8 h-8 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors">
                   <Cloud size={14} />
                 </button>
                 <button className="w-8 h-8 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors">
                   <Settings size={14} />
                 </button>
                 <button className="h-8 px-3 rounded-lg border border-slate-100 flex items-center gap-1.5 text-slate-400 font-medium text-[12px] hover:bg-slate-50 transition-colors">
                   <Search size={12} /> Search
                 </button>
               </div>
               
               <input 
                 type="text" 
                 placeholder="Ask any things..." 
                 className="flex-1 min-w-0 bg-transparent text-[14px] text-slate-700 placeholder:text-slate-300 outline-none px-2"
                 readOnly
               />
               
               <div className="flex items-center gap-2 pr-2">
                 <button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                   <Mic size={16} />
                 </button>
                 <button className="w-8 h-8 rounded-full bg-slate-200 text-white flex items-center justify-center transition-colors">
                   <ArrowUp size={16} strokeWidth={3} />
                 </button>
               </div>
             </motion.div>
           </motion.div>
        </motion.div>
      </section>

      {/* 2. The Intelligence Engine (Redesigned as meaningful UI feature blocks) */}
      <section id="solutions" className="pt-20 pb-24 px-6 w-full flex flex-col items-center justify-center bg-[#fafafc]">
         <motion.div 
           variants={slideUpVariants}
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true, margin: "-50px" }}
           className="w-full flex flex-col items-center max-w-[1100px]"
         >
           <div className="flex flex-col items-center text-center max-w-[800px] mb-16">
              <h2 className="text-[36px] md:text-[44px] font-extrabold tracking-tight leading-tight text-slate-800">
                The intelligence engine for <br/> <strong className="font-extrabold text-blue-600">continuous cloud security</strong>
              </h2>
              <p className="mt-5 text-[15px] text-slate-500 font-medium max-w-[650px] mx-auto leading-relaxed">
                Move past static alert fatigue. CloudGuard analyzes real-time configuration drift, network exposure, and API telemetry to automatically synthesize actionable remediation rules.
              </p>
           </div>

           <AnimatedWorkflowPipeline />
           
         </motion.div>
      </section>

      {/* 3. Pricing - Completely Overhauled to CloudGuard Extensively Detailed Light Theme */}
      <section id="pricing" className="py-24 px-6 w-full flex flex-col items-center justify-center bg-[#ffffff] border-t border-slate-100">
         <motion.div 
           variants={slideUpVariants}
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true, margin: "-50px" }}
           className="w-full max-w-[1100px]"
         >
           <div className="text-center mb-16">
             <h2 className="text-[36px] md:text-[44px] font-extrabold tracking-tight leading-tight text-slate-900 mb-4">
               Clear Pricing. <strong className="text-[#1c75ff] font-medium">True Autonomy.</strong>
             </h2>
             <p className="text-[15px] text-slate-500 font-medium max-w-[600px] mx-auto">
               Experience the "Read-Only Time Machine" to build immutable trust in our infrastructure scanner before scaling up to full zero-day remediation.
             </p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              
              {/* SCOUT */}
              <motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} whileTap={{ scale: 0.98 }} className="bg-white rounded-[24px] p-8 border border-slate-200 shadow-sm flex flex-col gap-2 relative overflow-hidden transition-all hover:shadow-md cursor-pointer">
                <div className="absolute top-0 right-0 py-1.5 px-5 bg-slate-100 text-slate-600 text-[10px] font-extrabold uppercase tracking-widest rounded-bl-[16px] border-b border-l border-slate-200">Free Trial</div>
                
                <h3 className="text-[12px] font-extrabold uppercase tracking-widest text-slate-500 mb-1">SCOUT</h3>
                <div className="text-[44px] font-extrabold text-slate-900 leading-none mb-2">$0</div>
                <p className="text-[13px] font-medium text-slate-500 leading-relaxed mb-4">Perfect for security teams who want to test the autonomous engine against their staging workloads.</p>
                
                <div className="flex flex-col gap-4 mt-2 border-t border-slate-100 pt-6 flex-1">
                  <PricingRow label="Duration" value="14 Days" />
                  <PricingRow label="Cloud Resources" value="Up to 50 Instances" />
                  <PricingRow label="Foresight Mode" value="Read-Only Scanning" highlight color="text-slate-700" />
                  <PricingRow label="Reflex Action" value="Manual Patching" />
                  <PricingRow label="Compliance Checks" value="Basic CIS Scanning" />
                  <PricingRow label="Support Queue" value="Standard SLA" />
                </div>
                <button className="mt-8 w-full bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-700 font-bold py-3 rounded-xl transition-colors text-[13px] shadow-sm pointer-events-none">Start Scout Trial</button>
              </motion.div>

              {/* PROACTIVE */}
              <motion.div animate={{ y: [5, -5, 5] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} whileTap={{ scale: 0.98 }} className="bg-white rounded-[24px] p-8 border-[3px] border-slate-800 shadow-2xl shadow-slate-900/10 flex flex-col gap-2 relative overflow-hidden cursor-pointer">
                <div className="absolute top-0 right-0 py-2 px-6 bg-slate-800 text-white text-[10px] font-extrabold uppercase tracking-widest rounded-bl-[16px]">Growth Teams</div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-slate-100/50 rounded-full blur-[40px] pointer-events-none"></div>

                <h3 className="text-[12px] font-extrabold uppercase tracking-widest text-slate-800 mb-1 relative z-10">Proactive</h3>
                <div className="text-[44px] font-extrabold text-slate-900 leading-none mb-2 relative z-10">$1,200<span className="text-[15px] text-slate-400 font-medium">/mo</span></div>
                <p className="text-[13px] font-medium text-slate-600 leading-relaxed mb-4 relative z-10">For scaling organizations looking to establish rigorous baseline defenses with guided agent workflows.</p>
                
                <div className="flex flex-col gap-4 mt-2 border-t border-slate-100 pt-6 flex-1 relative z-10">
                  <PricingRow label="Duration" value="Unlimited" />
                  <PricingRow label="Cloud Resources" value="Up to 500 Instances" />
                  <PricingRow label="Foresight Mode" value="Real-time Alerting" highlight color="text-slate-800" />
                  <PricingRow label="Reflex Action" value="1-Click PR Generation" />
                  <PricingRow label="Compliance Checks" value="SOC2 + ISO27001" />
                  <PricingRow label="Support Queue" value="Priority Email & Chat" />
                </div>
                <button className="mt-8 w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl transition-colors shadow-md text-[13px] relative z-10 pointer-events-none">Upgrade Now</button>
              </motion.div>

              {/* SOVEREIGN */}
              <motion.div animate={{ y: [-4, 4, -4] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} whileTap={{ scale: 0.98 }} className="bg-white rounded-[24px] p-8 border border-slate-200 shadow-sm flex flex-col gap-2 relative overflow-hidden transition-all hover:border-slate-300 hover:shadow-md cursor-pointer">
                <div className="absolute top-0 right-0 py-1.5 px-5 bg-sky-50 text-sky-600 text-[10px] font-extrabold uppercase tracking-widest rounded-bl-[16px] border-b border-l border-sky-100">Enterprise Scale</div>
                
                <h3 className="text-[12px] font-extrabold uppercase tracking-widest text-slate-500 mb-1">Sovereign</h3>
                <div className="text-[44px] font-extrabold text-slate-900 leading-none mb-2">$4,500<span className="text-[15px] text-slate-400 font-medium">/mo</span></div>
                <p className="text-[13px] font-medium text-slate-500 leading-relaxed mb-4">Complete Iron Dome architecture. Autonomous agents fully resolve and patch architecture continuously.</p>
                
                <div className="flex flex-col gap-4 mt-2 border-t border-slate-100 pt-6 flex-1">
                  <PricingRow label="Duration" value="Unlimited" />
                  <PricingRow label="Cloud Resources" value="Unlimited Nodes" />
                  <PricingRow label="Foresight Mode" value="Autonomous Engine" highlight color="text-sky-600" />
                  <PricingRow label="Reflex Action" value="Parallel Iron Dome" highlight color="text-sky-600" icon />
                  <PricingRow label="Compliance Checks" value="Full Suite Frameworks" />
                  <PricingRow label="Support Queue" value="24/7 Dedicated War Room" />
                </div>
                <button className="mt-8 w-full bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-700 font-bold py-3 rounded-xl transition-colors shadow-sm text-[13px] pointer-events-none">Contact Sales</button>
              </motion.div>
           </div>
         </motion.div>
      </section>

      {/* 4. Glassmorphic Footer Overlay */}
      <section 
        id="resources"
        className="w-full relative flex flex-col items-center justify-end min-h-[550px] overflow-hidden"
      >
         {/* Using landing-end.png directly with strict cover configuration to clear out the solid black margins from the browser edge */}
         <div 
           className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat w-full h-full" 
           style={{ backgroundImage: "url('/landing-end.png')" }}
         ></div>
         
         <div className="absolute top-0 left-0 w-full h-[150px] bg-gradient-to-b from-[#ffffff] to-transparent z-10 pointer-events-none"></div>

         <motion.div 
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-20 flex flex-col items-center text-center px-6 mt-16 mb-16 w-full"
         >
            <h2 className="text-[32px] md:text-[36px] font-extrabold tracking-tight leading-[1.05] text-slate-900 drop-shadow-md">
              Go From Sifted Through To <br/> Fully <span className="text-slate-500">Secured Today</span>
            </h2>
            
            <div className="mt-6 flex items-center justify-center gap-3">
              <button onClick={() => router.push('/dashboard')} className="bg-[#1f2937] hover:bg-black text-white px-5 py-2.5 rounded-full font-bold transition-all shadow-md text-[13px] flex items-center gap-2">
                Start Free <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center"><ArrowRight size={10} /></div>
              </button>
              <button className="bg-white/90 hover:bg-white backdrop-blur-lg text-slate-800 px-5 py-2.5 rounded-full font-bold transition-all shadow-sm border border-slate-200 text-[13px]">
                Book A Demo
              </button>
            </div>
         </motion.div>

         {/* The Rounded Glassmorphic Overlay EXACTLY like CAST AI Reference */}
         <div className="relative z-20 w-[94%] max-w-[1240px] bg-white/40 backdrop-blur-[40px] border border-white/40 rounded-t-[32px] px-8 md:px-16 py-12 flex flex-col gap-10 shadow-[0_-10px_40px_rgba(0,0,0,0.06)] text-slate-800">
            
            <div className="flex flex-col md:flex-row justify-between gap-12">
              <div className="flex-1 max-w-[280px]">
                 <div className="flex items-center gap-2 mb-4">
                   <img src="/logo.png" className="w-[20px] h-[20px] drop-shadow-sm" />
                   <span className="font-extrabold text-[15px] tracking-tight text-slate-900">CloudGuard</span>
                 </div>
                 <p className="text-[12px] font-medium leading-relaxed text-slate-600 mb-6">
                   CloudGuard is the leading Autonomous Security platform, enabling enterprises to instantly secure cloud infrastructure without human intervention.
                 </p>
                 <div className="flex items-center gap-2.5">
                   {['X', 'M', 'in'].map((social) => (
                     <div key={social} className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center hover:bg-white cursor-pointer transition-colors shadow-sm text-slate-600 font-bold border border-white/50 text-[11px] backdrop-blur-md">
                       {social}
                     </div>
                   ))}
                 </div>
              </div>

              <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-8 text-[12px]">
                 <div className="flex flex-col gap-3">
                   <h4 className="font-extrabold uppercase tracking-widest text-slate-900 mb-1 text-[11px]">Solutions</h4>
                   {['Cluster optimization', 'Cost monitoring', 'Workload optimization', 'LLM optimization', 'Database optimization'].map(link => (
                     <a key={link} href="#" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">{link}</a>
                   ))}
                 </div>
                 <div className="flex flex-col gap-3">
                   <h4 className="font-extrabold uppercase tracking-widest text-slate-900 mb-1 text-[11px]">Resources</h4>
                   {['Blog', 'Events', 'Webinars', 'Reports', 'Customer stories', 'Documentation', 'Pricing'].map(link => (
                     <a key={link} href="#" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">{link}</a>
                   ))}
                 </div>
                 <div className="flex flex-col gap-3">
                   <h4 className="font-extrabold uppercase tracking-widest text-slate-900 mb-1 text-[11px]">Company</h4>
                   {['About us', 'Careers', 'Contact us', 'Slack community', 'Newsroom', 'Brand assets', 'Partner program'].map(link => (
                     <a key={link} href="#" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">{link}</a>
                   ))}
                 </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-[11px] font-medium text-slate-500 border-t border-slate-300/30 pt-6 mt-4">
              <span>© 2026 CloudGuard AI. All Rights Reserved.</span>
              <div className="flex gap-5">
                <a href="#" className="hover:text-slate-800 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-slate-800 transition-colors">Terms Of Conditions</a>
              </div>
            </div>
         </div>
      </section>

    </div>
  );
}

