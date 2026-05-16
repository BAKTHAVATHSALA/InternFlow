import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Cpu, ArrowRight, BrainCircuit } from 'lucide-react';
import { cn } from '../../utils/cn';

const RecruitmentAIScreeningPage = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => (prev >= 100 ? 100 : prev + 2));
    }, 40);
    return () => clearInterval(timer);
  }, []);

  const scores = [
    { label: 'Overall Match', value: 87, color: 'bg-emerald-500', icon: BrainCircuit },
    { label: 'Skills Alignment', value: 91, color: 'bg-indigo-600', icon: Cpu },
    { label: 'Experience Fit', value: 74, color: 'bg-amber-500', icon: Check },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-4 text-center">
        <div className="flex items-center gap-2 justify-center">
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.3em]">STEP 05 / 08</span>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Application Submitted</h1>
        <p className="text-slate-500 font-medium text-lg">AI is reviewing your profile in real-time</p>
      </div>

      {/* Main Results Card */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-12 space-y-12 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-50 rounded-full blur-[100px] -mt-40 opacity-60" />
        
        <div className="text-center space-y-4 relative z-10">
          <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-indigo-100 shadow-inner">
             <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center animate-bounce shadow-lg shadow-indigo-200">
                <Cpu size={24} className="text-white" />
             </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">AI Screening Results</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Processed in 1.8 seconds • Enterprise Grade Analysis</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {scores.map((score, i) => (
            <div key={i} className="p-8 bg-slate-50 border border-slate-100 rounded-3xl space-y-6 flex flex-col items-center text-center group hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all duration-500">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg", score.color)}>
                <score.icon size={24} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{score.label}</p>
                <p className="text-3xl font-black text-slate-900">{progress >= 100 ? score.value : 0}%</p>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full transition-all duration-[2000ms]", score.color)} 
                  style={{ width: `${progress >= 100 ? score.value : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* AI Insight Box */}
        <div className="bg-slate-900 rounded-[2rem] p-10 space-y-4 shadow-2xl relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" /> AI Evaluation Insight
          </p>
          <p className="text-slate-300 leading-relaxed font-medium text-lg">
            "Strong <span className="text-white font-black">React + Node.js</span> ecosystem experience detected. Academic performance is exceptional. Recommend immediate transition to final HR review phase."
          </p>
        </div>
      </div>

      <div className="text-center space-y-10">
        <p className="text-sm text-slate-400 font-medium">HR department will contact you within 24–48 hours</p>
        <button 
          onClick={() => navigate('/recruitment/offer')}
          className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] hover:text-indigo-600 transition-all flex items-center gap-3 mx-auto group"
        >
          Skip to Offer Phase <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default RecruitmentAIScreeningPage;
