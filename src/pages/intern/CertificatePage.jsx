import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Lock, Download, Sparkles, ShieldCheck, Loader2, ArrowRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CertificatePage = () => {
  const navigate = useNavigate();
  const [certData, setCertData] = useState(null);
  const [appData, setAppData] = useState(null);
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appRes, projRes, certRes] = await Promise.all([
        api.get('/api/applications/mine').catch(() => ({ data: null })),
        api.get('/api/projects/mine').catch(() => ({ data: null })),
        api.get('/api/projects/certificate').catch(() => ({ data: null })),
      ]);
      setAppData(appRes.data);
      setProjectData(projRes.data);
      if (certRes.data && certRes.data.cert_id) setCertData(certRes.data);
      console.log('[Certificate] appStatus:', appRes.data?.status, '| projectStatus:', projRes.data?.status, '| cert:', certRes.data?.cert_id);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data } = await api.post('/api/projects/certificate/generate');
      setCertData(data);
      toast.success('Certificate generated! Check your email.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate certificate');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!certData) return;
    const html = buildPrintHtml(certData);
    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
  };

  const buildPrintHtml = (cert) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Certificate – ${cert.cert_id}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', -apple-system, sans-serif; background: #fff; }
    .page { width: 900px; margin: 40px auto; padding: 60px 80px; border: 4px solid #10b981; border-radius: 24px; text-align: center; }
    .logo { font-size: 11px; font-weight: 800; color: #64748b; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 32px; }
    .trophy { font-size: 56px; margin-bottom: 16px; }
    .title { font-size: 36px; font-weight: 900; color: #1e293b; letter-spacing: -1px; margin-bottom: 10px; }
    .divider { width: 80px; height: 3px; background: linear-gradient(90deg,#7c3aed,#4f46e5); margin: 0 auto 32px; border-radius: 99px; }
    .certify { font-size: 13px; font-weight: 600; color: #94a3b8; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 12px; }
    .name { font-size: 38px; font-weight: 900; color: #4f46e5; margin-bottom: 20px; }
    .body-text { font-size: 15px; color: #475569; line-height: 1.9; max-width: 560px; margin: 0 auto 40px; }
    .body-text strong { color: #1e293b; font-weight: 800; }
    .meta { display: flex; justify-content: center; gap: 80px; padding-top: 32px; border-top: 1px solid #f1f5f9; margin-bottom: 40px; }
    .meta-item { text-align: center; }
    .meta-label { font-size: 10px; font-weight: 800; color: #94a3b8; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px; }
    .meta-value { font-size: 14px; font-weight: 800; color: #1e293b; }
    .sig-line { width: 200px; height: 1px; background: #e2e8f0; margin: 0 auto 8px; }
    .sig-label { font-size: 10px; font-weight: 700; color: #94a3b8; letter-spacing: 2px; text-transform: uppercase; }
    .cert-id { margin-top: 32px; font-size: 11px; color: #94a3b8; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="page">
    <div class="logo">Hexaware Technologies · InternFlow</div>
    <div class="trophy">🏆</div>
    <div class="title">Certificate of Completion</div>
    <div class="divider"></div>
    <div class="certify">This is to certify that</div>
    <div class="name">${cert.intern_name}</div>
    <div class="body-text">
      Has successfully completed the <strong>${cert.role}</strong> Internship programme
      at <strong>Hexaware Technologies</strong> through the InternFlow Platform.
    </div>
    <div class="meta">
      <div class="meta-item">
        <div class="meta-label">Duration</div>
        <div class="meta-value">${cert.start_date} – ${cert.end_date}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Credential ID</div>
        <div class="meta-value">${cert.cert_id}</div>
      </div>
      ${cert.mentor_name ? `<div class="meta-item">
        <div class="meta-label">Mentor</div>
        <div class="meta-value">${cert.mentor_name}</div>
      </div>` : ''}
    </div>
    <div class="sig-line"></div>
    <div class="sig-label">Digital Signature Authorized</div>
    <div class="cert-id">Certificate is digitally signed and verifiable using cert ID: ${cert.cert_id}</div>
  </div>
  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`;

  if (loading) return <div className="p-8 animate-pulse">Loading certificate...</div>;

  const isEligible = appData?.status === 'completed' || projectData?.status === 'approved';

  return (
    <div className="space-y-8 pb-10 max-w-4xl mx-auto">
      <div>
        <h1 className="page-title">Certificate</h1>
        <p className="text-slate-500 mt-1 font-medium">Auto-generated once your project is approved</p>
      </div>

      {/* Locked state */}
      {!isEligible && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 md:p-16 flex flex-col items-center gap-5 text-center">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-900 text-white rounded-3xl flex items-center justify-center shadow-2xl">
            <Lock size={32} className="md:hidden" />
            <Lock size={40} className="hidden md:block" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl md:text-2xl font-black text-slate-900">Certificate Locked</h3>
            <p className="text-slate-500 font-medium max-w-sm text-sm md:text-base">
              Complete your learning modules, submit your project, and get it approved to unlock this credential.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-200">
            Project Review Pending
          </div>
          <button
            onClick={() => navigate('/project')}
            className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-700 transition-all flex items-center gap-2"
          >
            Go to Project <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Eligible but not yet generated */}
      {isEligible && !certData && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl border border-emerald-100 p-8 md:p-16 flex flex-col items-center gap-5 text-center">
          <div className="text-5xl md:text-6xl">🏆</div>
          <div className="space-y-2">
            <h3 className="text-xl md:text-2xl font-black text-slate-900">Your certificate is ready!</h3>
            <p className="text-slate-500 font-medium max-w-sm text-sm md:text-base">
              Your project has been approved. Click below to generate your certificate and receive it by email.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-7 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-100 hover:scale-[1.02] transition-all flex items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {generating ? <Loader2 size={18} className="animate-spin" /> : <Award size={18} />}
            {generating ? 'Generating…' : 'Generate Certificate'}
          </button>
        </div>
      )}

      {/* Certificate displayed */}
      {certData && (
        <>
          <div className="relative group overflow-x-auto">
            <div className="absolute inset-0 bg-purple-600 blur-[100px] opacity-10 rounded-full" />
            <div className="bg-white rounded-3xl border-4 border-emerald-500 shadow-2xl p-2 min-w-[320px]">
              <div className="border border-slate-100 rounded-2xl p-6 md:p-12 space-y-6 md:space-y-10 relative text-center">

                {/* Header */}
                <div className="space-y-3 md:space-y-4">
                  <div className="text-4xl md:text-5xl">🏆</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Hexaware Technologies</div>
                  <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">Certificate of Completion</h2>
                  <div className="h-1 w-24 bg-gradient-to-r from-purple-600 to-violet-500 mx-auto rounded-full" />
                </div>

                {/* Body */}
                <div className="space-y-4 md:space-y-6">
                  <div className="space-y-1">
                    <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">This is to certify that</p>
                    <h3 className="text-xl md:text-3xl font-black text-indigo-600">{certData.intern_name}</h3>
                  </div>
                  <p className="text-slate-600 font-medium leading-loose max-w-xl mx-auto text-sm md:text-base">
                    Has successfully completed the{' '}
                    <span className="font-black text-slate-900">{certData.role} Internship</span> programme at{' '}
                    <span className="font-black text-slate-900">Hexaware Technologies</span> through the InternFlow Platform.
                  </p>

                  <div className="grid grid-cols-2 gap-6 md:gap-12 max-w-lg mx-auto pt-6 md:pt-8 border-t border-slate-50">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</p>
                      <p className="text-xs md:text-sm font-black text-slate-900">{certData.start_date} – {certData.end_date}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Credential ID</p>
                      <p className="text-xs md:text-sm font-black text-slate-900 break-all">{certData.cert_id}</p>
                    </div>
                  </div>
                </div>

                {/* Signature */}
                <div className="pt-4 flex justify-center">
                  <div className="text-center space-y-2">
                    <div className="w-48 h-0.5 bg-slate-100 mx-auto" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Signature Authorized</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col items-center gap-4 pt-4">
            <button
              onClick={handleDownload}
              className="w-full sm:w-auto px-8 md:px-16 py-4 md:py-5 rounded-2xl font-black text-base md:text-lg shadow-2xl shadow-purple-100 transition-all flex items-center justify-center gap-3 md:gap-4 group bg-gradient-to-r from-purple-600 to-violet-500 text-white hover:scale-[1.02]"
            >
              Download Certificate (PDF) <Download size={20} className="group-hover:translate-y-0.5 transition-transform" />
            </button>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2 text-center">
              <ShieldCheck size={14} />
              Verified Digital Credential · {certData.cert_id}
            </p>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Sparkles size={12} className="text-amber-400" />
              Certificate email has been sent to your registered email address
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default CertificatePage;
