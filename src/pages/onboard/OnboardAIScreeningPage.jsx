import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Cpu, ArrowRight } from 'lucide-react';
import { cn } from '../../utils/cn';

const OnboardAIScreeningPage = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => (prev >= 100 ? 100 : prev + 2));
    }, 30);
    return () => clearInterval(timer);
  }, []);

  const scores = [
    { label: 'Overall Match', value: 87, color: 'bg-emerald-500' },
    { label: 'Skills Alignment', value: 91, color: 'bg-indigo-500' },
    { label: 'Experience Fit', value: 74, color: 'bg-amber-500' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.3em]">STEP 05 / 08</span>
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight">Application Submitted</h1>
        <p className="text-slate-400 font-medium">AI is reviewing your resume right now</p>
      </div>

      {/* Progress Stepper (Local) */}
      <div className="flex items-center justify-center gap-12 py-4">
        {[
          { label: 'Applied', status: 'completed' },
          { label: 'Screened', status: 'active' },
          { label: 'Offered', status: 'pending' },
          { label: 'Joining', status: 'pending' },
          { label: 'Onboard', status: 'pending' },
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-12 last:gap-0">
            <div className="flex flex-col items-center gap-3">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                step.status === 'completed' ? "bg-emerald-500 border-emerald-500 text-white" :
                step.status === 'active' ? "bg-indigo-600 border-indigo-400 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]" :
                "bg-[#1a1c26] border-white/5 text-slate-600"
              )}>
                {step.status === 'completed' ? <Check size={20} strokeWidth={3} /> : 
                 step.status === 'active' ? <Cpu size={20} /> : <div className="w-4 h-4 bg-white/5 rounded-sm" />}
              </div>
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-wider",
                step.status === 'completed' ? "text-emerald-500" :
                step.status === 'active' ? "text-indigo-400" :
                "text-slate-600"
              )}>{step.label}</span>
            </div>
            {i < 4 && <div className="w-12 h-[2px] bg-white/5" />}
          </div>
        ))}
      </div>

      {/* AI Results Card */}
      <div className="bg-[#121420] rounded-3xl border border-white/5 p-10 space-y-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] -mt-32" />
        
        <div className="text-center space-y-2 relative z-10">
          <div className="w-14 h-14 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-500/20">
             <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center animate-pulse">
                <div className="w-4 h-4 bg-white rounded-full opacity-50" />
             </div>
          </div>
          <h2 className="text-xl font-bold text-white">AI Resume Review Complete</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Processed in 2.3 seconds • Powered by Advanced AI</p>
        </div>

        <div className="space-y-8 relative z-10">
          {scores.map((score, i) => (
            <div key={i} className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{score.label}</span>
                <span className={cn("text-sm font-bold", score.color.replace('bg-', 'text-'))}>{score.value}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full transition-all duration-[1500ms]", score.color)} 
                  style={{ width: `${progress >= 100 ? score.value : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* AI Insight Box */}
        <div className="bg-[#0a0c14] rounded-2xl p-6 border border-white/5 space-y-3">
          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">AI Insight</p>
          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            Strong <span className="text-white">React + Node.js</span> profile. CGPA above threshold. 2 skill gaps: Docker, CI/CD. Recommend for HR review.
          </p>
        </div>
      </div>

      <div className="text-center space-y-8">
        <p className="text-xs text-slate-500 font-medium">HR will review and respond within 2–3 business days</p>
        <button 
          onClick={() => navigate('/intern-onboard/offer')}
          className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] hover:text-white transition-all flex items-center gap-2 mx-auto"
        >
          → Skip to HR Decision (demo)
        </button>
      </div>
    </div>
  );
};

export default OnboardAIScreeningPage;
