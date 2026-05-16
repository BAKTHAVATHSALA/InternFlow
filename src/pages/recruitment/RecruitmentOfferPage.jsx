import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Target, ArrowRight, Download, ShieldCheck } from 'lucide-react';
import { cn } from '../../utils/cn';

const RecruitmentOfferPage = () => {
  const navigate = useNavigate();

  const offerDetails = [
    { label: 'Position', value: 'Software Engineer Intern' },
    { label: 'Compensation', value: '₹25,000 / month' },
    { label: 'Joining Date', value: '15 June 2025' },
    { label: 'Engagement', value: '6 months' },
    { label: 'Work Mode', value: 'Hybrid - Chennai' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-4 text-center">
        <div className="flex items-center gap-2 justify-center">
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.3em]">STEP 06 / 08</span>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">You've Received an Offer!</h1>
        <p className="text-slate-500 font-medium text-lg">Your application has been approved by the hiring committee</p>
      </div>

      {/* Offer Card */}
      <div className="bg-white rounded-[2.5rem] border border-emerald-500/20 p-12 space-y-12 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-[100px] -mr-32 -mt-32 opacity-60" />
        
        <div className="text-center space-y-6 relative z-10">
          <div className="w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto border border-emerald-100 shadow-inner">
             <span className="text-4xl animate-pulse">📄</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-900">Offer Extended!</h2>
            <p className="text-slate-500 font-medium max-w-lg mx-auto text-lg">
              Congratulations <span className="text-slate-900 font-bold underline decoration-emerald-500 decoration-4">Priya Sharma</span> — Hexaware Technologies is excited to welcome you to the team.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 relative z-10">
          <div className="grid grid-cols-1 divide-y divide-slate-100">
            {offerDetails.map((detail, i) => (
              <div key={i} className="flex items-center justify-between p-6 hover:bg-white transition-colors group">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">{detail.label}</span>
                <span className="text-sm font-bold text-slate-900">{detail.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 relative z-10">
          <button className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-3">
            <Download size={20} /> Download PDF Offer
          </button>
          <button 
            onClick={() => navigate('/')}
            className="flex-[1.5] py-5 bg-emerald-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-emerald-100 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            Accept & Proceed to Onboarding <ArrowRight size={20} />
          </button>
        </div>
      </div>

      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <ShieldCheck size={16} className="text-emerald-500" /> Secure Digital Signature required
        </div>
      </div>
    </div>
  );
};

export default RecruitmentOfferPage;
