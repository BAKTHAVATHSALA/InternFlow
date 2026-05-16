import React from 'react';
import { LogOut, MoreHorizontal } from 'lucide-react';

const OnboardNavbar = () => {
  return (
    <nav className="h-20 bg-[#0a0c14] border-b border-white/5 px-8 flex items-center justify-between z-50">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-xl">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-white leading-none text-xl tracking-tight">InternFlow</span>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">INTERN PORTAL</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <span className="text-xs font-medium text-slate-400">Logged in as </span>
          <span className="text-xs font-bold text-white">priya.sharma@gmail.com</span>
        </div>
        <button className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
          <MoreHorizontal size={18} />
        </button>
      </div>
    </nav>
  );
};


export default OnboardNavbar;
