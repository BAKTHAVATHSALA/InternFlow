import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Info, ArrowRight, ShieldCheck, Sparkles, Clock, AlertCircle, FileText, Loader2, RotateCcw, LogOut } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const InternPortal = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState(null);
  const [job, setJob] = useState(null);
  const [showExplain, setShowExplain] = useState(false);
  const [showNDAModal, setShowNDAModal] = useState(false);
  const [eSignature, setESignature] = useState('');
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);

  const fetchApplicationData = async () => {
    try {
      const token = localStorage.getItem('token');
      // 1. Get the intern's applications
      const appRes = await axios.get('http://localhost:8000/applications/', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      if (appRes.data.length > 0) {
        // Sort by ID descending to get the most recent one
        const sorted = appRes.data.sort((a, b) => b.id - a.id);
        const latestApp = sorted[0];
        
        setApplication(latestApp);
        setSigned(latestApp.status === 'onboarded');

        // 2. Get Job details for requirements
        const jobRes = await axios.get(`http://localhost:8000/jobs/${latestApp.job_id}`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        setJob(jobRes.data);
      }
    } catch (err) {
      console.error('Error fetching intern data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationData();
  }, []);

  const handleSignNDA = async () => {
    if (!application || !eSignature) return;
    setSigning(true);
    try {
      const token = localStorage.getItem('token');
      await axios.get(`http://localhost:8000/emergency-onboard/${application.id}`);
      
      setSigned(true);
      setShowNDAModal(false);
      fetchApplicationData(); // Refresh to see updated status
    } catch (err) {
      console.error('Error signing NDA:', err);
    } finally {
      setSigning(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const getStatusIndex = (status) => {
    const map = { 'applied': 1, 'reviewed': 2, 'selected': 3, 'onboarded': 4, 'rejected': 5 };
    return map[status] || 1;
  };

  const steps = [
    { id: 1, label: 'Waiting' },
    { id: 2, label: 'AI Evaluated' },
    { id: 3, label: 'Chosen' },
    { id: 4, label: 'Success' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <Loader2 className="w-10 h-10 animate-spin text-[#6D28D9]" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] p-8 text-center">
        <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-gray-100 max-w-md">
          <div className="w-16 h-16 bg-indigo-50 text-[#6D28D9] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-[#1A1A1A] mb-4">No Active Applications</h2>
          <p className="text-gray-500 mb-8 font-medium">Explore and apply for open internship positions to start your journey with InternFlow.</p>
          <button 
            onClick={() => navigate('/jobs')}
            className="bg-[#6D28D9] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg hover:bg-[#5B21B6] transition-all"
          >
            Browse Jobs
          </button>
        </div>
      </div>
    );
  }

  const currentStatusIdx = getStatusIndex(application.status);

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 lg:p-12">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="bg-[#6D28D9] rounded-2xl p-4 flex items-center justify-between text-white shadow-lg">
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchApplicationData}
              className="p-2 hover:bg-white/20 rounded-xl transition-all"
              title="Refresh Portal"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <span className="font-black text-lg uppercase tracking-tight">InternFlow Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{job?.title}</div>
            <button 
              onClick={handleLogout}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all group"
              title="Logout"
            >
              <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </header>

        {/* Top Status Banner */}
        <motion.div whileHover={{ y: -4 }} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-[#6D28D9]">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h2 className="font-black text-2xl text-[#1A1A1A]">
                {application.overall_score > 70 ? "You're among the top candidates!" : "Application under review"}
              </h2>
              <p className="text-gray-400 font-medium">Your score is currently {application.overall_score}% — keep checking for updates.</p>
            </div>
          </div>
          <div className={cn("px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2", application.status === 'rejected' ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700")}>
            <div className={cn("w-2 h-2 rounded-full", application.status === 'rejected' ? "bg-red-500" : "bg-green-500")} />
            {application.status === 'rejected' ? 'Status: Not Selected' : `Confidence: ${application.confidence_score || 'High'}`}
          </div>
        </motion.div>

        {/* Journey Progress */}
        <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-50">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mb-10 text-center">Your Application Journey</p>
          <div className="flex items-center justify-between relative max-w-4xl mx-auto">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-50 -translate-y-1/2 z-0 rounded-full" />
            <div className="absolute top-1/2 left-0 h-1 bg-[#6D28D9] -translate-y-1/2 z-0 rounded-full transition-all duration-1000" style={{ width: `${((currentStatusIdx - 1) / 3) * 100}%` }} />
            
            {steps.map((step) => {
              const isDone = currentStatusIdx > step.id;
              const isActive = currentStatusIdx === step.id;
              return (
                <div key={step.id} className="relative z-10 flex flex-col items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm",
                    isDone || (step.id === 4 && application.status === 'onboarded') ? "bg-[#6D28D9] text-white" : 
                    isActive ? "bg-white border-4 border-[#6D28D9] text-[#6D28D9] scale-110" : 
                    "bg-white border-2 border-gray-100 text-gray-200"
                  )}>
                    {isDone || (step.id === 4 && application.status === 'onboarded') ? <Check className="w-6 h-6" /> : <span className="font-black">{step.id}</span>}
                  </div>
                  <span className={cn("text-[10px] font-black uppercase tracking-widest", isActive ? "text-[#6D28D9]" : "text-gray-300")}>{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Analysis Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div whileHover={{ y: -4 }} className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-50 flex flex-col items-center">
            <div className="flex justify-between w-full items-center mb-10">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">AI Scoring Engine</span>
              <span className="bg-indigo-50 text-[#6D28D9] px-3 py-1 rounded-lg text-xs font-black">{application.overall_score}% / 100</span>
            </div>
            
            <div className="relative w-48 h-48 flex items-center justify-center mb-10">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="85" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-50" />
                <circle cx="96" cy="96" r="85" stroke="currentColor" strokeWidth="12" fill="transparent" 
                  strokeDasharray={534} strokeDashoffset={534 - (534 * (application.overall_score || 0)) / 100}
                  strokeLinecap="round" className="text-[#6D28D9] transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black text-[#1A1A1A]">{application.overall_score || 0}</span>
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-1">Match Index</span>
              </div>
            </div>

            <button onClick={() => setShowExplain(!showExplain)} className="w-full py-4 bg-gray-50 hover:bg-gray-100 rounded-2xl font-black uppercase tracking-widest text-xs text-[#1A1A1A] transition-all">
              {showExplain ? "Hide Detailed Reasoning" : "Why this score?"}
            </button>

            <AnimatePresence>
              {showExplain && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="w-full mt-8 space-y-6 overflow-hidden">
                       {(() => {
                          try {
                            const exp = typeof application.explanation === 'string' ? JSON.parse(application.explanation) : application.explanation;
                            if (!exp) return <p className="text-xs text-gray-400">Loading AI insights...</p>;
                            
                            return (
                              <div className="space-y-6">
                                {/* Strengths */}
                                <div className="p-6 bg-green-50/50 rounded-2xl border border-green-100">
                                   <div className="flex items-center gap-3 mb-4">
                                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                                      <span className="text-[10px] font-black text-green-700 uppercase tracking-widest text-left">✅ What you did well</span>
                                   </div>
                                   <ul className="space-y-2 text-left">
                                      {exp.strengths?.map((s, i) => (
                                        <li key={i} className="text-xs text-green-700 font-medium leading-relaxed flex items-start gap-2">
                                          <span>•</span> {s}
                                        </li>
                                      ))}
                                   </ul>
                                </div>

                                {/* Gaps */}
                                <div className="p-6 bg-amber-50/50 rounded-2xl border border-amber-100">
                                   <div className="flex items-center gap-3 mb-4">
                                      <div className="w-2 h-2 bg-amber-500 rounded-full" />
                                      <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest text-left">⚠️ Where you can improve</span>
                                   </div>
                                   <ul className="space-y-2 text-left">
                                      {exp.gaps?.map((g, i) => (
                                        <li key={i} className="text-xs text-amber-700 font-medium leading-relaxed flex items-start gap-2">
                                          <span>•</span> {g}
                                        </li>
                                      ))}
                                   </ul>
                                </div>

                                {/* Improvements */}
                                <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                                   <div className="flex items-center gap-3 mb-4">
                                      <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                                      <span className="text-[10px] font-black text-[#6D28D9] uppercase tracking-widest text-left">🚀 How to level up</span>
                                   </div>
                                   <ul className="space-y-2 text-left">
                                      {exp.improvement_suggestions?.map((s, i) => (
                                        <li key={i} className="text-xs text-[#6D28D9] font-medium leading-relaxed flex items-start gap-2">
                                          <span className="opacity-50">🚀</span> {s}
                                        </li>
                                      ))}
                                   </ul>
                                </div>
                              </div>
                            );
                          } catch(e) {
                            return <p className="text-xs text-gray-400 italic">Evaluation complete.</p>;
                          }
                       })()}
                    </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <div className="space-y-6">
             <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-50">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-8">Metric Breakdown</p>
                <div className="space-y-8">
                  {[
                    { label: 'Semantic Alignment', score: application.semantic_score || 0, color: 'bg-[#6D28D9]' },
                    { label: 'Skill Match', score: application.skill_score || 0, color: 'bg-[#10B981]' },
                    { label: 'Experience Depth', score: application.experience_score || 0, color: 'bg-orange-400' },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-gray-500">
                        <span>{item.label}</span>
                        <span className="text-[#1A1A1A]">{item.score}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${item.score}%` }} transition={{ duration: 1.5 }} className={cn("h-full", item.color)} />
                      </div>
                    </div>
                  ))}
                </div>
             </div>

             <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-50">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-6">Target Gaps</p>
                <div className="flex flex-wrap gap-2">
                   {job?.requirements?.required_skills?.map((s, i) => (
                     <div key={i} className="px-4 py-2 bg-gray-50 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-100">{s}</div>
                   ))}
                </div>
             </div>
          </div>
        </div>

        {/* Onboarding Banner */}
        <motion.div className={cn("rounded-[2.5rem] p-8 flex items-center justify-between border-2 transition-all duration-500 shadow-xl shadow-indigo-100/20", signed ? "bg-green-50 border-green-200" : "bg-white border-indigo-50")}>
           <div className="flex items-center gap-6">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner", signed ? "bg-green-500 text-white" : "bg-indigo-50 text-[#6D28D9]")}>
                 {signed ? <ShieldCheck className="w-7 h-7" /> : <FileText className="w-7 h-7" />}
              </div>
              <div>
                 <h3 className={cn("text-xl font-black", signed ? "text-green-900" : "text-[#1A1A1A]")}>{signed ? "Onboarding in Progress" : "NDA Signing Required"}</h3>
                 <p className={cn("text-sm font-medium", signed ? "text-green-600" : "text-gray-400")}>{signed ? "Your legal documents have been verified. Welcome aboard!" : "Your profile was selected! Please sign the NDA to unlock the intern tools."}</p>
              </div>
           </div>
           
           <AnimatePresence mode='wait'>
             {application.status === 'selected' && !signed ? (
               <motion.button key="sign" onClick={() => setShowNDAModal(true)} className="bg-[#6D28D9] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-[#5B21B6] flex items-center gap-2">
                 <ShieldCheck className="w-4 h-4" />
                 Sign Now
               </motion.button>
             ) : signed && (
               <div className="flex items-center gap-3 text-green-600 font-black uppercase text-xs">
                  <Check className="w-5 h-5" /> Verified
               </div>
             )}
           </AnimatePresence>
        </motion.div>

        {/* NDA Signature Modal */}
        <AnimatePresence>
          {showNDAModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowNDAModal(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
              <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-xl rounded-[3rem] p-10 shadow-2xl overflow-hidden">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-indigo-50 text-[#6D28D9] rounded-2xl flex items-center justify-center mb-6">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-black text-[#1A1A1A] mb-2">Non-Disclosure Agreement</h2>
                  <p className="text-gray-400 font-medium mb-8">By signing this, you agree to keep all internal project data confidential during your internship.</p>
                  
                  <div className="w-full bg-gray-50 p-6 rounded-2xl mb-8 text-left border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-4">Agreement Terms</p>
                    <div className="text-[11px] text-gray-500 leading-relaxed max-h-32 overflow-y-auto pr-2 space-y-2">
                      <p>1. **Confidentiality**: I will not disclose any proprietary information, code, or internal discussions to third parties.</p>
                      <p>2. **Ownership**: All code and designs created during the internship belong to InternFlow.</p>
                      <p>3. **Security**: I will follow all security protocols and not share credentials.</p>
                    </div>
                  </div>

                  <div className="w-full space-y-2 text-left mb-10">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Type Full Name to Sign</label>
                    <input 
                      type="text" 
                      value={eSignature}
                      onChange={(e) => setESignature(e.target.value)}
                      placeholder="e.g. Jane Doe"
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#6D28D9] focus:outline-none font-medium transition-all"
                    />
                  </div>

                  <div className="flex w-full gap-4">
                    <button onClick={() => setShowNDAModal(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all hover:bg-gray-200">Cancel</button>
                    <button 
                      onClick={handleSignNDA} 
                      disabled={!eSignature || signing}
                      className="flex-[2] py-4 bg-[#6D28D9] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all hover:bg-[#5B21B6] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {signing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                      {signing ? "Processing..." : "Confirm & Sign"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default InternPortal;
