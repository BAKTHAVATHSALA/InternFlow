import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor, ClipboardList, ArrowRight } from 'lucide-react';
import { cn } from '../../utils/cn';

const OnboardJobPage = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.3em]">STEP 03 / 08</span>
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight">Your Referred Position</h1>
        <p className="text-slate-400 font-medium">You have been referred for the following role</p>
      </div>

      {/* Main Job Card */}
      <div className="bg-[#121420] rounded-3xl border border-white/5 p-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-[80px]" />
        
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-inner">
            <Monitor size={32} />
          </div>
          <div className="flex-1 space-y-3">
            <h2 className="text-2xl font-bold text-white">Software Engineer Intern</h2>
            <p className="text-slate-400 font-medium">Hexaware Technologies</p>
            <div className="flex flex-wrap gap-2 pt-2">
              {[
                { label: 'Full Stack', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
                { label: 'Paid • ₹25K/mo', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
                { label: '6 months', color: 'bg-white/5 text-slate-400 border-white/10' },
                { label: 'Chennai', color: 'bg-white/5 text-slate-400 border-white/10' }
              ].map((tag, i) => (
                <span key={i} className={cn("px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border", tag.color)}>
                  {tag.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Role Overview */}
      <div className="bg-[#121420] rounded-3xl border border-white/5 p-10 space-y-10 shadow-xl">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <ClipboardList className="text-indigo-400" size={20} />
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Role Overview</h3>
          </div>
          <p className="text-slate-400 leading-relaxed font-medium">
            Work alongside our engineering team on live projects using <span className="text-white font-bold">React, Node.js, and PostgreSQL</span>. You'll contribute to feature development, code reviews, and sprint planning from day one.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 bg-[#0a0c14] rounded-2xl border border-white/5 space-y-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Start Date</p>
            <p className="text-lg font-bold text-white">15 June 2025</p>
          </div>
          <div className="p-6 bg-[#0a0c14] rounded-2xl border border-white/5 space-y-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Deadline</p>
            <p className="text-lg font-bold text-amber-500">10 May 2025</p>
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="flex flex-col items-center pt-8">
        <button 
          onClick={() => navigate('/intern-onboard/application')}
          className="w-full py-5 bg-white/5 border border-white/5 rounded-2xl text-slate-400 font-bold text-sm uppercase tracking-[0.2em] hover:bg-white hover:text-[#0a0c14] transition-all duration-500 flex items-center justify-center gap-3 group"
        >
          Apply Now
          <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default OnboardJobPage;
