import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor, ClipboardList, ArrowRight } from 'lucide-react';
import { cn } from '../../utils/cn';

const RecruitmentJobPage = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.3em]">STEP 03 / 08</span>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Your Referred Position</h1>
        <p className="text-slate-500 font-medium">You have been referred for the following role</p>
      </div>

      {/* Main Job Card */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
        
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center relative z-10">
          <div className="w-20 h-20 rounded-[1.5rem] bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-inner">
            <Monitor size={36} />
          </div>
          <div className="flex-1 space-y-3">
            <h2 className="text-3xl font-bold text-slate-900">Software Engineer Intern</h2>
            <p className="text-slate-500 font-bold text-lg">Hexaware Technologies</p>
            <div className="flex flex-wrap gap-2 pt-2">
              {[
                { label: 'Full Stack', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
                { label: 'Paid • ₹25K/mo', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
                { label: '6 months', color: 'bg-slate-50 text-slate-500 border-slate-100' },
                { label: 'Chennai', color: 'bg-slate-50 text-slate-500 border-slate-100' }
              ].map((tag, i) => (
                <span key={i} className={cn("px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border", tag.color)}>
                  {tag.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Role Overview */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-12 space-y-10 shadow-xl shadow-slate-200/50">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <ClipboardList className="text-indigo-600" size={20} />
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Role Overview</h3>
          </div>
          <p className="text-slate-600 leading-relaxed font-medium text-lg">
            Work alongside our engineering team on live projects using <span className="text-slate-900 font-bold">React, Node.js, and PostgreSQL</span>. You'll contribute to feature development, code reviews, and sprint planning from day one.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-50">
          <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Start Date</p>
            <p className="text-xl font-bold text-slate-900">15 June 2025</p>
          </div>
          <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Deadline</p>
            <p className="text-xl font-bold text-amber-600">10 May 2025</p>
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="flex flex-col items-center pt-8">
        <button 
          onClick={() => navigate('/recruitment/application')}
          className="w-full py-6 bg-indigo-600 text-white rounded-[1.5rem] font-bold text-lg shadow-2xl shadow-indigo-100 hover:scale-[1.01] active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 group"
        >
          Apply for this Position
          <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default RecruitmentJobPage;
