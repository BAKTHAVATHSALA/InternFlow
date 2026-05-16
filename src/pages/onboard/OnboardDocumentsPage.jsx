import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ShieldCheck, CheckCircle2, ArrowRight, Download, PenTool, Upload, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

const OnboardDocumentsPage = () => {
  const navigate = useNavigate();
  const [docs, setDocs] = useState([
    { id: 1, title: 'Internship Joining Form', desc: 'Basic information and emergency contacts', signed: true, date: 'May 12, 2024' },
    { id: 2, title: 'Non-Disclosure Agreement (NDA)', desc: 'Confidentiality and IP protection agreement', signed: true, date: 'May 12, 2024' },
    { id: 3, title: 'Government ID (Aadhar/PAN)', desc: 'Verify your identity for payroll and compliance', signed: false, date: null },
  ]);

  const allSigned = docs.every(d => d.signed);

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Complete Your Documents</h1>
        <p className="text-slate-500 font-medium max-w-xl mx-auto">We need a few documents signed and uploaded to finalize your onboarding process.</p>
      </div>

      <div className="space-y-6">
        {docs.map((doc) => (
          <div key={doc.id} className={cn(
            "bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 transition-all",
            doc.signed ? "bg-slate-50/50" : "hover:border-purple-200 hover:shadow-md"
          )}>
            <div className="flex items-center gap-6">
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center border transition-colors",
                doc.signed ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-purple-50 text-purple-600 border-purple-100"
              )}>
                {doc.signed ? <CheckCircle2 size={28} /> : <FileText size={28} />}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-slate-900">{doc.title}</h3>
                  {doc.signed && (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 text-[8px] font-black uppercase tracking-widest rounded-full">Signed</span>
                  )}
                </div>
                <p className="text-sm text-slate-500 font-medium">{doc.desc}</p>
                {doc.signed && (
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Completed on {doc.date}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {doc.signed ? (
                <button className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all flex items-center gap-2">
                  <Download size={16} /> Download
                </button>
              ) : (
                <div className="flex gap-2">
                  <button className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all flex items-center gap-2">
                    <PenTool size={16} /> E-Sign
                  </button>
                  <button className="px-6 py-3 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition-all flex items-center gap-2 shadow-lg shadow-purple-200">
                    <Upload size={16} /> Upload
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-3xl p-8 flex items-start gap-6">
        <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-amber-200">
          <AlertCircle size={24} />
        </div>
        <div className="space-y-1">
          <h4 className="text-lg font-bold text-amber-900">One document remaining</h4>
          <p className="text-sm text-amber-700 font-medium leading-relaxed">Please upload a valid Government ID to complete the document verification step. This is required for payroll processing.</p>
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <button 
          onClick={() => navigate('/intern-onboard/success')}
          className="px-16 py-6 bg-gradient-to-r from-purple-600 to-violet-500 text-white rounded-2xl font-black text-xl shadow-2xl shadow-purple-200 hover:scale-[1.02] transition-all flex items-center gap-4 group"
        >
          Complete Onboarding
          <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default OnboardDocumentsPage;
