import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Target, ArrowRight } from 'lucide-react';
import { cn } from '../../utils/cn';

const OnboardOfferPage = () => {
  const navigate = useNavigate();

  const offerDetails = [
    { label: 'Role', value: 'Software Engineer Intern' },
    { label: 'Stipend', value: '₹25,000 / month' },
    { label: 'Start Date', value: '15 June 2025' },
    { label: 'Duration', value: '6 months' },
    { label: 'Mode', value: 'Hybrid - Chennai' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.3em]">STEP 06 / 08</span>
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight">You've Received an Offer!</h1>
        <p className="text-slate-400 font-medium">HR has reviewed your application and extended an offer</p>
      </div>

      {/* Progress Stepper (Local) */}
      <div className="flex items-center justify-center gap-12 py-4">
        {[
          { label: 'Applied', status: 'completed' },
          { label: 'Screened', status: 'completed' },
          { label: 'Offered', status: 'active' },
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
                 step.status === 'active' ? <Target size={20} /> : <div className="w-4 h-4 bg-white/5 rounded-sm" />}
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

      {/* Offer Card */}
      <div className="bg-[#121420] rounded-3xl border border-emerald-500/20 p-10 space-y-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/30" />
        
        <div className="text-center space-y-4">
          <div className="text-2xl">🎉</div>
          <h2 className="text-2xl font-bold text-emerald-400">Offer Extended!</h2>
          <p className="text-sm text-slate-400 font-medium max-w-lg mx-auto">
            Congratulations Priya — Hexaware is excited to have you join as a Software Engineer Intern.
          </p>
        </div>

        <div className="space-y-1">
          {offerDetails.map((detail, i) => (
            <div key={i} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0 px-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{detail.label}</span>
              <span className="text-sm font-bold text-white">{detail.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-8">
        <button 
          onClick={() => navigate('/intern-onboard/success')}
          className="w-full py-5 bg-[#f1f1e6]/10 border border-white/5 text-slate-400 rounded-xl font-bold text-lg hover:bg-[#f1f1e6] hover:text-[#0a0c14] transition-all duration-500 flex items-center justify-center gap-3 group"
        >
          Accept & Continue to Joining Form <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default OnboardOfferPage;
