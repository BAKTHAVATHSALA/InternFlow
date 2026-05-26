import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight, Zap, Clock, ArrowRight, CheckCircle2, Cpu, Circle, XCircle, RefreshCw } from 'lucide-react';
import { cn } from '../../utils/cn';
import api from '../../services/api';

const RECOMMENDATION_LABELS = {
  strong_pass: 'Strong Pass — Excellent Fit',
  pass: 'Pass — Recommended',
  borderline: 'Borderline — Needs Review',
  reject: 'Not Recommended',
};

const RECOMMENDATION_COLORS = {
  strong_pass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  pass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  borderline: 'text-amber-700 bg-amber-50 border-amber-200',
  reject: 'text-rose-700 bg-rose-50 border-rose-200',
};

const OnboardAIScreeningPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [animated, setAnimated] = useState(false);
  const [appStatus, setAppStatus] = useState('screened');
  const [offer, setOffer] = useState(null);
  const intervalRef = useRef(null);

  const ai = location.state?.ai || {
    overall_score: 0,
    skills_match: 0,
    experience_fit: 0,
    strengths: [],
    gaps: [],
    improvement_tips: [],
    recommendation: 'borderline',
    processed_seconds: 0,
  };

  const fetchStatus = async () => {
    try {
      const token = localStorage.getItem('onboard_token');
      const { data } = await api.get('/api/applications/mine', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppStatus(data.status);
      if (data.status === 'offer_pending') {
        setOffer(data);
        clearInterval(intervalRef.current);
      }
      if (data.status === 'rejected') {
        clearInterval(intervalRef.current);
      }
    } catch {
      // silent — don't break the UI on poll failure
    }
  };

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300);
    fetchStatus();
    intervalRef.current = setInterval(fetchStatus, 8000);
    return () => {
      clearTimeout(t);
      clearInterval(intervalRef.current);
    };
  }, []);

  const scores = [
    { label: 'Overall Match',    value: ai.overall_score,  color: 'from-purple-500 to-violet-500', textColor: 'text-purple-600' },
    { label: 'Skills Alignment', value: ai.skills_match,   color: 'from-emerald-400 to-emerald-500', textColor: 'text-emerald-600' },
    { label: 'Experience Fit',   value: ai.experience_fit, color: 'from-amber-400 to-orange-400',   textColor: 'text-amber-600' },
  ];

  const recommendLabel = RECOMMENDATION_LABELS[ai.recommendation] || 'Under Review';
  const recommendClass = RECOMMENDATION_COLORS[ai.recommendation] || RECOMMENDATION_COLORS.borderline;

  const hrDecided   = appStatus === 'offer_pending';
  const hrRejected  = appStatus === 'rejected';
  const waiting     = !hrDecided && !hrRejected;

  const statusSteps = [
    { label: 'Applied',    status: 'done' },
    { label: 'AI Screened', status: 'done' },
    { label: 'HR Review',  status: hrDecided ? 'done' : hrRejected ? 'rejected' : 'active' },
    { label: 'Offer',      status: hrDecided ? 'active' : 'pending' },
  ];

  // Rejected state — full page
  if (hrRejected) {
    return (
      <div className="max-w-3xl space-y-6">
        <div className="flex items-center gap-2 text-xs font-medium">
          <span className="text-rose-500 font-bold">Application Closed</span>
        </div>
        <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-10 text-center">
          <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <XCircle size={32} className="text-rose-500" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-3">Application Not Progressed</h1>
          <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto mb-6">
            After reviewing your application, the HR team has decided not to move forward at this time.
            Thank you for your interest in Hexaware Technologies.
          </p>
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-400 font-medium">
            You may be considered for future openings. Keep an eye on your referred email.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium">
        <span className="text-purple-600 font-bold">Step 3 of 6</span>
        <ChevronRight size={12} className="text-slate-300" />
        <span className="text-slate-400">AI Resume Screening</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">AI Screening Results</h1>
        <p className="text-sm text-slate-500 mt-1">Your profile has been analyzed against the role requirements.</p>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-3 gap-4">
        {scores.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 text-center">
            <div className={cn('text-3xl font-black mb-1', s.textColor)}>{s.value}%</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-tight">{s.label}</div>
            <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={cn('h-full bg-gradient-to-r rounded-full transition-all duration-1000 ease-out', s.color)}
                style={{ width: animated ? `${s.value}%` : '0%' }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* AI Insight */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
            <Zap size={16} className="text-purple-600" />
          </div>
          <h3 className="font-bold text-slate-900">AI Insight</h3>
          {ai.processed_seconds > 0 && (
            <span className="text-[10px] text-slate-400 font-medium ml-auto">
              Processed in {ai.processed_seconds}s
            </span>
          )}
        </div>

        <div className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold mb-4', recommendClass)}>
          <CheckCircle2 size={12} />
          {recommendLabel}
        </div>

        {ai.strengths?.length > 0 && (
          <div className="mb-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Strengths</p>
            <div className="flex flex-wrap gap-2">
              {ai.strengths.map((s, i) => (
                <span key={i} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-100">{s}</span>
              ))}
            </div>
          </div>
        )}

        {ai.gaps?.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Skill Gaps</p>
            <div className="flex flex-wrap gap-2">
              {ai.gaps.map((g, i) => (
                <span key={i} className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-100">{g}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* HR Decision Banner */}
      {hrDecided ? (
        <div className="flex items-start gap-4 p-5 bg-emerald-50 border border-emerald-200 rounded-2xl">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-800">HR has accepted your application!</p>
            <p className="text-xs text-emerald-600 mt-0.5">Your offer letter is ready to review. Click below to proceed.</p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-4 p-5 bg-amber-50 border border-amber-100 rounded-2xl">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
            <RefreshCw size={18} className="text-amber-600 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-800">Waiting for HR Review</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Your application is under review. This page will update automatically — no need to refresh.
            </p>
          </div>
        </div>
      )}

      {/* Application Status Stepper */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
            <Clock size={16} className="text-blue-600" />
          </div>
          <h3 className="font-bold text-slate-900">Application Status</h3>
        </div>

        <div className="flex items-center justify-between relative mb-5">
          <div className="absolute left-0 right-0 top-4 h-0.5 bg-slate-100 z-0" />
          <div
            className="absolute left-0 top-4 h-0.5 bg-purple-400 z-0 transition-all duration-700"
            style={{ width: hrDecided ? '100%' : '50%' }}
          />
          {statusSteps.map(step => (
            <div key={step.label} className="flex flex-col items-center gap-2 z-10">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center border-2 bg-white transition-all',
                step.status === 'done'     ? 'border-purple-500 bg-purple-500' :
                step.status === 'active'   ? 'border-purple-500 ring-4 ring-purple-100' :
                step.status === 'rejected' ? 'border-rose-400 bg-rose-400' :
                'border-slate-200'
              )}>
                {step.status === 'done'
                  ? <CheckCircle2 size={14} className="text-white" />
                  : step.status === 'rejected'
                    ? <XCircle size={14} className="text-white" />
                    : step.status === 'active'
                      ? <Cpu size={13} className="text-purple-600" />
                      : <Circle size={10} className="text-slate-300" />
                }
              </div>
              <span className={cn(
                'text-[10px] font-bold uppercase tracking-wider whitespace-nowrap',
                step.status === 'done'     ? 'text-purple-600' :
                step.status === 'active'   ? 'text-purple-700' :
                step.status === 'rejected' ? 'text-rose-500' :
                'text-slate-300'
              )}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-400 font-medium text-center">
          {waiting
            ? 'HR will review your application and respond within 2–3 business days'
            : 'Your offer letter is ready — proceed to accept your internship'}
        </p>
      </div>

      <button
        onClick={() => navigate('/intern-onboard/offer', { state: { offer } })}
        disabled={!hrDecided}
        className={cn(
          'w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2',
          hrDecided
            ? 'bg-gradient-to-r from-purple-600 to-violet-500 text-white shadow-lg shadow-purple-200 hover:scale-[1.01] active:scale-[0.99]'
            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
        )}
      >
        {waiting ? (
          <><Clock size={18} /> Waiting for HR Decision…</>
        ) : (
          <>View Offer Letter <ArrowRight size={18} /></>
        )}
      </button>
    </div>
  );
};

export default OnboardAIScreeningPage;
