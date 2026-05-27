import React from 'react';
import { MoreHorizontal, ShieldCheck } from 'lucide-react';

const RecruitmentNavbar = () => {
  return (
    <nav className="h-16 md:h-20 bg-white border-b border-slate-100 px-4 md:px-8 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3 md:gap-4">
        <div className="w-9 h-9 md:w-10 md:h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 shrink-0">
          <ShieldCheck size={20} />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 leading-none text-base md:text-lg">InternFlow</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">RECRUITMENT PORTAL</span>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <div className="hidden sm:block text-right">
          <span className="text-xs font-medium text-slate-400">Application ID: </span>
          <span className="text-xs font-bold text-slate-900">IF-2026-8842</span>
        </div>
        <button className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 transition-all">
          <MoreHorizontal size={20} />
        </button>
      </div>
    </nav>
  );
};

export default RecruitmentNavbar;
