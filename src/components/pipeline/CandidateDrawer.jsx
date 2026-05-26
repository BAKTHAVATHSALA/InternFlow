import React, { useState, useEffect } from 'react';
import {
  X, Mail, Phone, User, Award, BookOpen, Zap, CheckCircle2,
  XCircle, Loader2, ExternalLink, GraduationCap, Briefcase,
  UserCheck, AlertTriangle, FileText, KeyRound
} from 'lucide-react';
import { cn } from '../../utils/cn';
import api from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  applied:       { label: 'Applied',       cls: 'bg-slate-100 text-slate-700' },
  screened:      { label: 'AI Screened',   cls: 'bg-blue-100 text-blue-700' },
  offer_pending: { label: 'Offer Sent',    cls: 'bg-emerald-100 text-emerald-700' },
  onboarded:     { label: 'Onboarded',     cls: 'bg-purple-100 text-purple-700' },
  rejected:      { label: 'Rejected',      cls: 'bg-rose-100 text-rose-700' },
};

const REC_CONFIG = {
  strong_pass: { label: 'Strong Pass',    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  pass:        { label: 'Recommended',    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  borderline:  { label: 'Borderline',     cls: 'bg-amber-50  text-amber-700  border-amber-200'  },
  reject:      { label: 'Not Recommended',cls: 'bg-rose-50   text-rose-700   border-rose-200'   },
};

const ScoreBar = ({ label, value, color }) => (
  <div className="mb-3">
    <div className="flex justify-between items-center mb-1.5">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <span className="text-xs font-bold text-slate-700">{value ?? '—'}%</span>
    </div>
    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div className={cn('h-full rounded-full transition-all duration-700', color)}
           style={{ width: `${value ?? 0}%` }} />
    </div>
  </div>
);

const Section = ({ title, children, className }) => (
  <div className={cn('bg-white rounded-2xl border border-slate-100 p-5 shadow-sm', className)}>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{title}</p>
    {children}
  </div>
);

const CandidateDrawer = ({ applicationId, onClose, onStatusChange }) => {
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null); // 'offer' | 'reject' | 'credentials'
  const [showReject, setShowReject] = useState(false);
  const [hrNote, setHrNote] = useState('');

  useEffect(() => {
    if (!applicationId) return;
    setLoading(true);
    setCandidate(null);
    api.get(`/api/pipeline/${applicationId}`)
      .then(({ data }) => setCandidate(data))
      .catch(() => toast.error('Failed to load candidate profile'))
      .finally(() => setLoading(false));
  }, [applicationId]);

  const handleOffer = async () => {
    setActing('offer');
    try {
      await api.patch(`/api/pipeline/${applicationId}/offer`);
      toast.success('Offer extended — email sent to candidate');
      setCandidate(prev => ({ ...prev, status: 'offer_pending' }));
      onStatusChange?.();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to extend offer');
    } finally {
      setActing(null);
    }
  };

  const handleReject = async () => {
    setActing('reject');
    try {
      await api.patch(`/api/pipeline/${applicationId}/reject`, { hr_note: hrNote || null });
      toast.success('Application rejected — email sent to candidate');
      setCandidate(prev => ({ ...prev, status: 'rejected' }));
      setShowReject(false);
      onStatusChange?.();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reject application');
    } finally {
      setActing(null);
    }
  };

  const handleIssueCredentials = async () => {
    setActing('credentials');
    try {
      const { data } = await api.post(`/api/pipeline/${applicationId}/issue-credentials`);
      toast.success(`Credentials issued — email sent to intern`);
      setCandidate(prev => ({ ...prev, credentials_issued: true }));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to issue credentials');
    } finally {
      setActing(null);
    }
  };

  const getInitials = (name = '') =>
    name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const parseSkills = (skills) => {
    if (!skills) return [];
    if (Array.isArray(skills)) return skills;
    return String(skills).replace(/[{}"]/g, '').split(',').map(s => s.trim()).filter(Boolean);
  };

  const canAct = candidate && !['offer_pending', 'onboarded', 'rejected'].includes(candidate.status);
  const statusCfg = STATUS_CONFIG[candidate?.status] || STATUS_CONFIG.applied;
  const recCfg   = REC_CONFIG[candidate?.ai_recommendation] || REC_CONFIG.borderline;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-[500px] bg-slate-50 z-50 flex flex-col shadow-2xl animate-slide-in-right">

        {/* Sticky Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100 shrink-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Candidate Profile</span>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">

          {loading && (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={28} className="text-purple-500 animate-spin" />
            </div>
          )}

          {!loading && !candidate && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <AlertTriangle size={32} className="text-slate-300 mb-3" />
              <p className="text-sm text-slate-400">Failed to load candidate profile.</p>
            </div>
          )}

          {!loading && candidate && (
            <>
              {/* Identity Card */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-violet-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-purple-200 shrink-0">
                    {getInitials(candidate.intern_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-black text-slate-900 leading-tight truncate">{candidate.intern_name}</h2>
                    <p className="text-sm text-slate-500 font-medium mt-0.5">{candidate.role}</p>
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <span className={cn('px-2.5 py-1 rounded-full text-[11px] font-bold', statusCfg.cls)}>
                        ● {statusCfg.label}
                      </span>
                      {candidate.department && (
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full text-[11px] font-medium">
                          {candidate.department}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Score + Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">AI Score</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900">{candidate.ai_score ?? '—'}</span>
                    <span className="text-sm text-slate-400 font-medium">/100</span>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Applied</p>
                  <p className="text-sm font-bold text-slate-800">
                    {candidate.applied_at ? new Date(candidate.applied_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </p>
                </div>
              </div>

              {/* Contact */}
              <Section title="Contact">
                <div className="space-y-2">
                  {candidate.intern_email && (
                    <div className="flex items-center gap-2.5">
                      <Mail size={14} className="text-purple-500 shrink-0" />
                      <a href={`mailto:${candidate.intern_email}`} className="text-sm text-purple-600 font-medium hover:underline truncate">
                        {candidate.intern_email}
                      </a>
                    </div>
                  )}
                  {candidate.phone && (
                    <div className="flex items-center gap-2.5">
                      <Phone size={14} className="text-slate-400 shrink-0" />
                      <span className="text-sm text-slate-600">{candidate.phone}</span>
                    </div>
                  )}
                </div>
              </Section>

              {/* Referred By */}
              {candidate.referred_by && (
                <Section title="Referred By">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                      <UserCheck size={13} className="text-purple-600" />
                    </div>
                    <span className="text-sm font-semibold text-slate-800">{candidate.referred_by}</span>
                  </div>
                </Section>
              )}

              {/* Education */}
              {(candidate.college || candidate.degree) && (
                <Section title="Education">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <GraduationCap size={13} className="text-blue-600" />
                    </div>
                    <div>
                      {candidate.degree && <p className="text-sm font-bold text-slate-800">{candidate.degree}</p>}
                      {candidate.college && <p className="text-xs text-slate-500 mt-0.5">{candidate.college}</p>}
                      <div className="flex gap-3 mt-1.5">
                        {candidate.cgpa && <span className="text-xs text-slate-400">CGPA: <strong className="text-slate-600">{candidate.cgpa}</strong></span>}
                        {candidate.grad_year && <span className="text-xs text-slate-400">Grad: <strong className="text-slate-600">{candidate.grad_year}</strong></span>}
                      </div>
                    </div>
                  </div>
                </Section>
              )}

              {/* Skills */}
              {parseSkills(candidate.skills).length > 0 && (
                <Section title="Skills">
                  <div className="flex flex-wrap gap-2">
                    {parseSkills(candidate.skills).map((skill, i) => (
                      <span key={i} className="px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-bold rounded-full border border-purple-100">
                        {skill}
                      </span>
                    ))}
                  </div>
                </Section>
              )}

              {/* Resume */}
              {candidate.resume_url && (
                <Section title="Resume / CV">
                  <a
                    href={candidate.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    <FileText size={15} />
                    View Resume
                    <ExternalLink size={12} />
                  </a>
                </Section>
              )}

              {/* AI Insights */}
              {candidate.ai_score != null && (
                <Section title="AI Insights">
                  <ScoreBar label="Overall Match"    value={candidate.ai_score}      color="bg-gradient-to-r from-purple-500 to-violet-500" />
                  <ScoreBar label="Skills Alignment" value={candidate.skills_match}  color="bg-gradient-to-r from-emerald-400 to-emerald-500" />
                  <ScoreBar label="Experience Fit"   value={candidate.experience_fit} color="bg-gradient-to-r from-amber-400 to-orange-400" />

                  <div className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold mt-2 mb-3', recCfg.cls)}>
                    <CheckCircle2 size={11} /> {recCfg.label}
                  </div>

                  {Array.isArray(candidate.strengths) && candidate.strengths.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Strengths</p>
                      <div className="flex flex-wrap gap-1.5">
                        {candidate.strengths.map((s, i) => (
                          <span key={i} className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-medium rounded-full border border-emerald-100">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {Array.isArray(candidate.gaps) && candidate.gaps.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Skill Gaps</p>
                      <div className="flex flex-wrap gap-1.5">
                        {candidate.gaps.map((g, i) => (
                          <span key={i} className="px-2 py-1 bg-amber-50 text-amber-700 text-[11px] font-medium rounded-full border border-amber-100">{g}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </Section>
              )}

              {/* Reject Confirmation inline panel */}
              {showReject && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5">
                  <p className="text-sm font-bold text-rose-800 mb-3">Confirm Rejection</p>
                  <textarea
                    value={hrNote}
                    onChange={e => setHrNote(e.target.value)}
                    placeholder="Optional feedback for the candidate (will be included in rejection email)..."
                    rows={3}
                    className="w-full px-3 py-2.5 text-sm border border-rose-200 rounded-xl bg-white resize-none focus:outline-none focus:ring-2 focus:ring-rose-300 placeholder:text-slate-400 mb-3"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleReject}
                      disabled={acting === 'reject'}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-60"
                    >
                      {acting === 'reject' ? <Loader2 size={15} className="animate-spin" /> : <XCircle size={15} />}
                      {acting === 'reject' ? 'Rejecting…' : 'Confirm Reject'}
                    </button>
                    <button
                      onClick={() => { setShowReject(false); setHrNote(''); }}
                      className="px-4 py-2.5 border border-rose-200 text-rose-600 text-sm font-bold rounded-xl hover:bg-rose-100 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sticky Footer — Action Buttons */}
        {!loading && candidate && (
          <div className="px-5 py-4 bg-white border-t border-slate-100 shrink-0">
            {candidate.status === 'onboarded' ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-700">Intern Onboarded</span>
                </div>
                <button
                  onClick={handleIssueCredentials}
                  disabled={acting === 'credentials' || candidate.credentials_issued}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {acting === 'credentials'
                    ? <><Loader2 size={16} className="animate-spin" /> Issuing…</>
                    : candidate.credentials_issued
                    ? <><CheckCircle2 size={16} /> Credentials Issued</>
                    : <><KeyRound size={16} /> Issue Credentials</>}
                </button>
              </div>
            ) : candidate.status === 'offer_pending' ? (
              <div className="flex items-center justify-center gap-2 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span className="text-sm font-bold text-emerald-700">Offer Already Sent</span>
              </div>
            ) : candidate.status === 'rejected' ? (
              <div className="flex items-center justify-center gap-2 py-3 bg-rose-50 border border-rose-200 rounded-xl">
                <XCircle size={16} className="text-rose-500" />
                <span className="text-sm font-bold text-rose-600">Application Rejected</span>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleOffer}
                  disabled={acting !== null}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-600 to-violet-500 hover:from-purple-700 hover:to-violet-600 text-white font-bold rounded-xl shadow-lg shadow-purple-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {acting === 'offer' ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  {acting === 'offer' ? 'Sending Offer…' : 'Offer'}
                </button>
                <button
                  onClick={() => setShowReject(v => !v)}
                  disabled={acting !== null}
                  className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-rose-200 text-rose-600 hover:bg-rose-50 font-bold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <XCircle size={16} />
                  Reject
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default CandidateDrawer;
