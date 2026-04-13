"use client";

import React from 'react';
import { 
  LayoutGrid, Shield, DollarSign, Activity, FileText, Settings
} from 'lucide-react';
import SidebarItem from '../../components/dashboard/components/SidebarItem';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  
  // Helper to determine active state based on pathname
  const isActive = (route) => {
    if (route === 'dashboard') return pathname === '/dashboard';
    return pathname === `/dashboard/${route}`;
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-[#d4e4fd] via-[#e5f0ff] to-[#f4f8ff] text-slate-800 font-sans overflow-hidden flex selection:bg-blue-200">
      
      {/* Background Soft Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10vh] right-[-5vw] w-[60vh] h-[60vh] bg-blue-300/15 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10vh] left-[-5vw] w-[50vh] h-[50vh] bg-blue-200/15 blur-[100px] rounded-full" />
      </div>

      <div className="flex w-full h-full p-4 gap-4 relative z-10 box-border text-[11px]">
        
        {/* --- LEFT SIDEBAR --- */}
        <aside className="w-[64px] flex flex-col items-center justify-between bg-white/50 backdrop-blur-3xl rounded-[20px] py-6 shadow-sm border border-white h-full shrink-0 relative z-20">
          <div className="flex flex-col items-center gap-6 w-full">
             <Link href="/" className="w-[36px] h-[36px] bg-white rounded-[10px] shadow-[0_2px_10px_rgb(0,0,0,0.06)] border border-slate-100 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform overflow-hidden p-1">
              <img src="/logo.png" alt="CloudGuard" className="w-full h-full object-contain" />
            </Link>

            <nav className="flex flex-col items-center gap-1.5 w-full px-2 mt-2">
              <SidebarItem icon={<LayoutGrid size={16} />} active={isActive('dashboard')} href="/dashboard" />
              <SidebarItem icon={<Shield size={16} />} active={isActive('findings')} href="/dashboard/findings" />
              <SidebarItem icon={<DollarSign size={16} />} active={isActive('cost')} href="/dashboard/cost" />
              <div className="w-6 h-[1px] bg-slate-200/60 my-1"></div>
              <SidebarItem icon={<Activity size={16} />} active={isActive('copilot')} href="/dashboard/copilot" isAi />
              <SidebarItem icon={<FileText size={16} />} active={isActive('logs')} href="/dashboard/logs" />
            </nav>
          </div>

          <div className="flex flex-col items-center gap-3 w-full px-2">
            <SidebarItem icon={<Settings size={16} />} active={isActive('settings')} href="/dashboard/settings" />
            <div className="w-[32px] h-[32px] rounded-full bg-slate-200 overflow-hidden border-2 border-white mt-1 cursor-pointer shadow-sm hover:scale-105 transition-transform">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Felix`} alt="Avatar" width={32} height={32} />
            </div>
          </div>
        </aside>

         {/* --- MAIN CONTENT --- */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
          {children}
        </div>
        
      </div>
    </div>
  );
}
