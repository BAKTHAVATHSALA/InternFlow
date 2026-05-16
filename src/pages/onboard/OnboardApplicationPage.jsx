import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paperclip, Check, Plus, ArrowRight } from 'lucide-react';
import { cn } from '../../utils/cn';

const OnboardApplicationPage = () => {
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState([
    { id: 1, label: 'I confirm I am available for a 6-month internship', checked: true },
    { id: 2, label: 'I have no conflicting academic schedule', checked: true },
    { id: 3, label: 'I agree to the referral programme terms', checked: false },
    { id: 4, label: 'My portfolio / GitHub link is up to date', checked: false },
  ]);

  const toggleCheck = (id) => {
    setChecklist(checklist.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.3em]">STEP 04 / 08</span>
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight">Full Application</h1>
        <p className="text-slate-400 font-medium">Complete all sections to submit your application</p>
      </div>

      <div className="bg-[#121420] rounded-3xl border border-white/5 overflow-hidden shadow-2xl flex flex-col max-h-[800px]">
        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
          
          {/* Skills Section */}
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {['React', 'Node.js', 'Python', 'PostgreSQL'].map(skill => (
                <span key={skill} className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs font-bold text-indigo-400 uppercase tracking-widest">
                  {skill}
                </span>
              ))}
              <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-500 hover:text-white transition-all flex items-center gap-2">
                <Plus size={14} /> Add
              </button>
            </div>
          </div>

          {/* Company Checklist */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-4">Company Checklist</h3>
            <div className="space-y-3">
              {checklist.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => toggleCheck(item.id)}
                  className={cn(
                    "p-4 rounded-xl border flex items-center gap-4 cursor-pointer transition-all",
                    item.checked ? "bg-indigo-500/5 border-indigo-500/20" : "bg-white/5 border-white/5 hover:border-white/10"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 rounded flex items-center justify-center transition-all",
                    item.checked ? "bg-indigo-500" : "bg-white/10 border border-white/10"
                  )}>
                    {item.checked && <Check size={14} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className={cn("text-sm font-medium", item.checked ? "text-slate-200" : "text-slate-500")}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Resume Section */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-4">Resume</h3>
            <div className="border-2 border-dashed border-white/5 rounded-2xl p-10 bg-[#0a0c14] flex flex-col items-center justify-center gap-3 group hover:border-indigo-500/30 transition-all">
              <Paperclip className="text-slate-600 group-hover:text-indigo-400 transition-colors" size={24} />
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-slate-400">Priya_Sharma_Resume.pdf</p>
                <span className="text-emerald-500 text-[10px] font-bold flex items-center gap-1">
                  <Check size={12} strokeWidth={3} /> Uploaded
                </span>
              </div>
            </div>
          </div>

          {/* Personal Details Section */}
          <div className="space-y-8">
            <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] border-b border-white/5 pb-4">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">First Name</label>
                <input type="text" defaultValue="Priya" className="w-full p-4 bg-[#0a0c14] border border-white/5 rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Last Name</label>
                <input type="text" defaultValue="Sharma" className="w-full p-4 bg-[#0a0c14] border border-white/5 rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Phone</label>
                <input type="tel" defaultValue="+91 98765 43210" className="w-full p-4 bg-[#0a0c14] border border-white/5 rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">City</label>
                <input type="text" defaultValue="Chennai" className="w-full p-4 bg-[#0a0c14] border border-white/5 rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
              </div>
            </div>
          </div>

          {/* Education Section */}
          <div className="space-y-8">
            <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] border-b border-white/5 pb-4">Education</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">College</label>
                <input type="text" defaultValue="Anna University" className="w-full p-4 bg-[#0a0c14] border border-white/5 rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Degree</label>
                <input type="text" defaultValue="B.Tech CSE" className="w-full p-4 bg-[#0a0c14] border border-white/5 rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Graduation Year</label>
                <input type="text" defaultValue="2026" className="w-full p-4 bg-[#0a0c14] border border-white/5 rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">CGPA</label>
                <input type="text" defaultValue="8.4 / 10" className="w-full p-4 bg-[#0a0c14] border border-white/5 rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="p-6 bg-[#0a0c14] border-t border-white/5">
          <button 
            onClick={() => navigate('/intern-onboard/screening')}
            className="w-full py-4 bg-[#f1f1e6] text-[#0a0c14] rounded-xl font-bold text-lg hover:scale-[1.01] transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            Submit Application <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardApplicationPage;
