import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, CheckCircle2, ArrowRight, PenTool, Upload, AlertCircle, ChevronRight, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useOnboardingAuth } from '../../contexts/OnboardingAuthContext';

const OnboardDocumentsPage = () => {
  const navigate = useNavigate();
  const { onboardUser } = useOnboardingAuth();
  const [completing, setCompleting] = useState(false);

  const [docs, setDocs] = useState([
    { id: 1, title: 'Internship Joining Form', desc: 'Basic information and emergency contacts', signed: false, date: null, type: 'sign' },
    { id: 2, title: 'Non-Disclosure Agreement (NDA)', desc: 'Confidentiality and IP protection agreement', signed: false, date: null, type: 'sign' },
    { id: 3, title: 'Government ID (Aadhar / PAN)', desc: 'Verify your identity for payroll and compliance', signed: false, date: null, type: 'both' },
  ]);

  const [signModal, setSignModal] = useState(null); // { docId, name }

  const unsignedCount = docs.filter(d => !d.signed).length;

  const openSignModal = (docId) => setSignModal({ docId, name: '' });

  const handleSign = () => {
    if (!signModal?.name.trim()) return;
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    setDocs(prev => prev.map(d => d.id === signModal.docId ? { ...d, signed: true, date: today } : d));
    setSignModal(null);
  };

  const handleUpload = (docId, file) => {
    if (!file) return;
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    setDocs(prev => prev.map(d => d.id === docId ? { ...d, signed: true, date: today } : d));
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      const token = localStorage.getItem('onboard_token');
      const { data } = await api.post(
        '/auth/onboard-complete',
        { batch: 'June 2025 Batch', startDate: '15 June 2025' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('[onboard-complete]', data);
      toast.success('Onboarding complete! Confirmation email sent.');
      navigate('/intern-onboard/success');
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to complete onboarding';
      console.error('[onboard-complete error]', err.response?.data || err);
      toast.error(msg);
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">

      {/* Sign Modal */}
      {signModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-slate-900">Sign Document</h3>
              <button onClick={() => setSignModal(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">Type your full legal name to sign this document electronically.</p>
            <input
              type="text"
              placeholder="Enter your full name"
              value={signModal.name}
              onChange={e => setSignModal(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition-all"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleSign()}
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setSignModal(null)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSign}
                disabled={!signModal.name.trim()}
                className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Confirm & Sign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium">
        <span className="text-purple-600 font-bold">Step 5 of 6</span>
        <ChevronRight size={12} className="text-slate-300" />
        <span className="text-slate-400">Joining Documents</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Joining Documents</h1>
        <p className="text-sm text-slate-500 mt-1">Sign and upload the required documents to finalize onboarding.</p>
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        {docs.map(doc => (
          <div
            key={doc.id}
            className={cn(
              'bg-white rounded-2xl border shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 transition-all',
              doc.signed ? 'border-slate-200' : 'border-amber-200 hover:border-purple-200'
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center border shrink-0',
                doc.signed ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-amber-50 border-amber-100 text-amber-600'
              )}>
                {doc.signed ? <CheckCircle2 size={22} /> : <FileText size={22} />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-slate-900">{doc.title}</h3>
                  {doc.signed && (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest rounded-full">
                      Signed
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-medium mt-0.5">{doc.desc}</p>
                {doc.signed && (
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Completed on {doc.date}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {doc.signed ? (
                <span className="px-4 py-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-bold text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 size={14} /> Completed
                </span>
              ) : doc.type === 'sign' ? (
                <button
                  onClick={() => openSignModal(doc.id)}
                  className="px-4 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition-all flex items-center gap-2 shadow-md shadow-purple-200"
                >
                  <PenTool size={14} /> Sign
                </button>
              ) : (
                <>
                  <button
                    onClick={() => openSignModal(doc.id)}
                    className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2"
                  >
                    <PenTool size={14} /> E-Sign
                  </button>
                  <label
                    htmlFor={`upload-${doc.id}`}
                    className="px-4 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition-all flex items-center gap-2 shadow-md shadow-purple-200 cursor-pointer"
                  >
                    <Upload size={14} /> Upload
                  </label>
                  <input
                    id={`upload-${doc.id}`}
                    type="file"
                    accept=".pdf,image/*"
                    className="hidden"
                    onChange={e => handleUpload(doc.id, e.target.files?.[0])}
                  />
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Warning if documents pending */}
      {unsignedCount > 0 && (
        <div className="flex items-start gap-4 p-5 bg-amber-50 border border-amber-100 rounded-2xl">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
            <AlertCircle size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-900">
              {unsignedCount === 1 ? 'One document remaining' : `${unsignedCount} documents remaining`}
            </h4>
            <p className="text-xs text-amber-700 font-medium mt-0.5 leading-relaxed">
              Please sign or upload all required documents to complete verification. This is required for payroll processing.
            </p>
          </div>
        </div>
      )}

      <button
        onClick={handleComplete}
        disabled={completing}
        className="w-full py-4 bg-gradient-to-r from-purple-600 to-violet-500 text-white rounded-xl font-bold shadow-lg shadow-purple-200 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100"
      >
        {completing ? 'Sending confirmation...' : <><span>Complete Onboarding</span> <ArrowRight size={18} /></>}
      </button>
    </div>
  );
};

export default OnboardDocumentsPage;
