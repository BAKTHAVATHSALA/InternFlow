import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paperclip, Check, Plus, ArrowRight } from 'lucide-react';
import { cn } from '../../utils/cn';

const RecruitmentApplicationPage = () => {
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
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="space-y-4 text-center md:text-left">
        <div className="flex items-center gap-2 justify-center md:justify-start">
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.3em]">STEP 04 / 08</span>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Full Application</h1>
        <p className="text-slate-500 font-medium text-lg">Complete all sections to submit your application</p>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/50 flex flex-col max-h-[850px]">
        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto p-12 space-y-16 custom-scrollbar">
          
          {/* Skills Section */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Required Skills</h3>
            <div className="flex flex-wrap gap-3">
              {['React', 'Node.js', 'Python', 'PostgreSQL'].map(skill => (
                <span key={skill} className="px-6 py-3 bg-indigo-50 border border-indigo-100 rounded-2xl text-xs font-bold text-indigo-600 uppercase tracking-widest">
                  {skill}
                </span>
              ))}
              <button className="px-6 py-3 border border-dashed border-slate-200 rounded-2xl text-xs font-bold text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center gap-2">
                <Plus size={16} /> Add Skill
              </button>
            </div>
          </div>

          {/* Company Checklist */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Company Checklist</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {checklist.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => toggleCheck(item.id)}
                  className={cn(
                    "p-6 rounded-2xl border flex items-center gap-4 cursor-pointer transition-all",
                    item.checked ? "bg-indigo-50 border-indigo-100" : "bg-slate-50 border-slate-100 hover:border-slate-200"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0",
                    item.checked ? "bg-indigo-600 shadow-lg shadow-indigo-100" : "bg-white border border-slate-200"
                  )}>
                    {item.checked && <Check size={16} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className={cn("text-sm font-bold", item.checked ? "text-slate-900" : "text-slate-500")}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Resume Section */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Resume / CV</h3>
            <div className="border-4 border-dashed border-slate-50 rounded-3xl p-12 bg-slate-50/50 flex flex-col items-center justify-center gap-4 group hover:border-indigo-100 hover:bg-indigo-50/30 transition-all cursor-pointer">
              <div className="w-16 h-16 bg-white rounded-[1.25rem] shadow-xl shadow-slate-200/50 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:scale-110 transition-all duration-500">
                <Paperclip size={28} />
              </div>
              <div className="text-center space-y-1">
                <p className="text-lg font-bold text-slate-900">Priya_Sharma_Resume.pdf</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-emerald-500 text-xs font-bold flex items-center gap-1">
                    <Check size={14} strokeWidth={3} /> Uploaded Successfully
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Details Section */}
          <div className="space-y-10">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-4">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { label: 'First Name', value: 'Priya' },
                { label: 'Last Name', value: 'Sharma' },
                { label: 'Phone', value: '+91 98765 43210' },
                { label: 'City', value: 'Chennai' }
              ].map((field, i) => (
                <div key={i} className="space-y-2 text-left">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                  <input 
                    type="text" 
                    defaultValue={field.value} 
                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all" 
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Education Section */}
          <div className="space-y-10">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-4">Education Background</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { label: 'College', value: 'Anna University' },
                { label: 'Degree', value: 'B.Tech CSE' },
                { label: 'Graduation Year', value: '2026' },
                { label: 'CGPA', value: '8.4 / 10' }
              ].map((field, i) => (
                <div key={i} className="space-y-2 text-left">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                  <input 
                    type="text" 
                    defaultValue={field.value} 
                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all" 
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="p-8 bg-slate-50 border-t border-slate-100">
          <button 
            onClick={() => navigate('/recruitment/screening')}
            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold text-xl shadow-xl shadow-indigo-100 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-4"
          >
            Submit Application <ArrowRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecruitmentApplicationPage;
