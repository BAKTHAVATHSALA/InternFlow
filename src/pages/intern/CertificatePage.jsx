import React from 'react';
import { Award, Lock, ShieldCheck, Download, CheckCircle2, Star, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '../../utils/cn';

const CertificatePage = () => {
  const isUnlocked = true; // Changed to true to allow testing the download button
  const navigate = require('react-router-dom').useNavigate();

  return (
    <div className="space-y-8 pb-10 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Certificate</h1>
        <p className="text-slate-500 mt-1 font-medium">Auto-generated once mentor approves your project</p>
      </div>

      <div className="relative group">
        {/* Backdrop Glow */}
        <div className="absolute inset-0 bg-purple-600 blur-[100px] opacity-10 rounded-full" />
        
        {/* Certificate Card */}
        <div className={cn(
          "bg-white rounded-3xl border-4 p-2 transition-all duration-500",
          isUnlocked ? "border-emerald-500 shadow-2xl" : "border-slate-100 shadow-xl opacity-80"
        )}>
          <div className="border border-slate-100 rounded-2xl p-12 space-y-12 relative overflow-hidden text-center">
            {/* Overlay for Locked State */}
            {!isUnlocked && (
              <div className="absolute inset-0 z-20 bg-white/40 backdrop-blur-sm flex flex-col items-center justify-center space-y-6">
                <div className="w-20 h-20 bg-slate-900 text-white rounded-3xl flex items-center justify-center shadow-2xl">
                  <Lock size={40} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900">Certificate Locked</h3>
                  <p className="text-slate-500 font-medium max-w-xs mx-auto">Successfully complete your internship and project review to unlock this credential.</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-200">
                    Project Review Pending
                  </div>
                </div>
              </div>
            )}

            {/* Certificate Header */}
            <div className="space-y-4">
              <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-lg text-purple-600">
                <Award size={40} />
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Certificate of Completion</h2>
              <div className="h-1 w-24 bg-gradient-to-r from-purple-600 to-violet-500 mx-auto rounded-full" />
            </div>

            {/* Certificate Body */}
            <div className="space-y-8">
              <div className="space-y-2">
                <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">This is to certify that</p>
                <h3 className="text-3xl font-black text-slate-900">Priya Das</h3>
              </div>
              
              <div className="max-w-xl mx-auto">
                <p className="text-slate-600 font-medium leading-loose">
                  Has successfully completed the 90-day <span className="font-black text-slate-900">Software Engineering Internship</span> program at <span className="font-black text-slate-900">Hexaware Technologies</span> through the InternFlow Platform.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-12 max-w-lg mx-auto pt-8 border-t border-slate-50">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</p>
                  <p className="text-sm font-black text-slate-900">March 01 - June 01, 2024</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Credential ID</p>
                  <p className="text-sm font-black text-slate-900">IF-HEXA-9821-2024</p>
                </div>
              </div>
            </div>

            {/* Signature Area */}
            <div className="pt-12 flex justify-center">
              <div className="text-center space-y-2">
                <div className="w-48 h-0.5 bg-slate-100 mx-auto" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Signature Authorized</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Area */}
      <div className="flex flex-col items-center gap-6 pt-8">
        <button 
          disabled={!isUnlocked}
          onClick={() => isUnlocked && alert('Certificate download started...')}
          className={cn(
            "px-16 py-6 rounded-2xl font-black text-xl shadow-2xl transition-all flex items-center gap-4 group",
            isUnlocked 
              ? "bg-gradient-to-r from-purple-600 to-violet-500 text-white shadow-purple-200 hover:scale-[1.02]" 
              : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
          )}
        >
          {isUnlocked ? (
            <>
              Generate Certificate <Download size={28} className="group-hover:translate-y-1 transition-transform" />
            </>
          ) : (
            <>
              Certificate Locked <Lock size={28} />
            </>
          )}
        </button>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
          {isUnlocked ? <Sparkles size={14} className="text-amber-400" /> : <ShieldCheck size={14} />}
          Verified Digital Credential • Blockchain Secured
        </p>
      </div>

      {!isUnlocked && (
        <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden mt-12">
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full -mr-24 -mt-24 blur-3xl" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="space-y-2 text-center md:text-left">
              <h4 className="text-xl font-bold">How to unlock?</h4>
              <p className="text-slate-400 text-sm font-medium">Complete your project and get it approved by Rahul Krishnan.</p>
            </div>
            <button 
              onClick={() => navigate('/project')}
              className="px-8 py-3 bg-white text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              Go to Project <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificatePage;
