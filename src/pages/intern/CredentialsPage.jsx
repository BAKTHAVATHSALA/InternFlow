import React, { useState, useEffect } from 'react';
import { ShieldCheck, Mail, Lock, User, Copy, CheckCircle2, AlertTriangle, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import api from '../../services/api';

const CredentialCard = ({ label, value, icon: Icon, isPassword = false, loading = false }) => {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:border-purple-200 transition-all group">
      <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 border border-purple-100 group-hover:scale-110 transition-transform">
          <Icon size={24} />
        </div>
        <button
          onClick={handleCopy}
          disabled={loading || !value}
          className={cn(
            'p-2 rounded-xl border transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest',
            copied
              ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
              : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40'
          )}
        >
          {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <div className="space-y-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <div className="flex items-center justify-between bg-slate-50/50 p-4 rounded-2xl border border-slate-100 min-h-[60px]">
          {loading ? (
            <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
          ) : (
            <p className="text-lg font-black text-slate-900 truncate pr-4">
              {isPassword && !show ? '••••••••••••' : (value || '—')}
            </p>
          )}
          {isPassword && !loading && (
            <button onClick={() => setShow(!show)} className="text-slate-400 hover:text-purple-600 transition-colors shrink-0">
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const CredentialsPage = () => {
  const [creds, setCreds] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/auth/intern/credentials')
      .then(({ data }) => setCreds(data))
      .catch(err => setError(err.response?.data?.error || 'Failed to load credentials'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 pb-10 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Credentials</h1>
        <p className="text-slate-500 mt-1 font-medium">Your InternFlow work email and portal access</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-700 font-medium">
          <AlertTriangle size={16} className="shrink-0" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CredentialCard label="Work Email"         value={creds?.workEmail}    icon={Mail}  loading={loading} />
        <CredentialCard label="Temporary Password" value={creds?.tempPassword} icon={Lock}  loading={loading} isPassword />
        <CredentialCard label="Intern ID"          value={creds?.internCode}   icon={User}  loading={loading} />
      </div>

      {/* Mentor + Role info */}
      {(loading || creds?.mentorName) && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Assignment Details</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Assigned Mentor</p>
              {loading ? (
                <div className="h-4 w-32 bg-slate-200 rounded animate-pulse mt-2" />
              ) : (
                <p className="text-sm font-bold text-slate-800">
                  {creds?.mentorName || '—'}
                  {creds?.mentorTitle && <span className="text-slate-400 font-medium"> · {creds.mentorTitle}</span>}
                </p>
              )}
            </div>
            <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Role</p>
              {loading ? (
                <div className="h-4 w-32 bg-slate-200 rounded animate-pulse mt-2" />
              ) : (
                <p className="text-sm font-bold text-slate-800">{creds?.role || '—'}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-100 rounded-3xl p-8 flex items-start gap-6 shadow-sm">
        <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-amber-200">
          <AlertTriangle size={24} />
        </div>
        <div className="space-y-2">
          <h4 className="text-lg font-bold text-amber-900">Security Requirement</h4>
          <p className="text-sm text-amber-700 font-medium leading-relaxed">
            Please change your temporary password immediately upon your first login to the Hexaware workspace.
            Use at least 12 characters with symbols and numbers.
          </p>
          <button
            onClick={() => alert('Opening Hexaware Security Policy...')}
            className="mt-2 text-[10px] font-black text-amber-700 uppercase tracking-widest flex items-center gap-2 hover:underline"
          >
            Security Policy <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-6">
        <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px] flex items-center gap-2">
          <ShieldCheck size={16} className="text-purple-600" /> System Access
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'VPN Access',         status: 'Active',  color: 'bg-emerald-500' },
            { label: 'JIRA / Confluence',  status: 'Active',  color: 'bg-emerald-500' },
            { label: 'GitHub Organization',status: 'Pending', color: 'bg-amber-500'   },
            { label: 'AWS Console',        status: 'Active',  color: 'bg-emerald-500' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
              <span className="text-sm font-bold text-slate-700">{item.label}</span>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.status}</span>
                <div className={cn('w-2 h-2 rounded-full', item.color)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CredentialsPage;
