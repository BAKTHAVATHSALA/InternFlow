import React from 'react';
import { ShieldCheck, Mail, Lock, User, Copy, CheckCircle2, AlertTriangle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { cn } from '../../utils/cn';

const CredentialCard = ({ label, value, icon: Icon, isPassword = false }) => {
  const [show, setShow] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
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
          className={cn(
            "p-2 rounded-xl border transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest",
            copied ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          )}
        >
          {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
          <div className="flex items-center justify-between bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
            <p className="text-lg font-black text-slate-900 truncate pr-4">
              {isPassword && !show ? '••••••••••••' : value}
            </p>
            {isPassword && (
              <button onClick={() => setShow(!show)} className="text-slate-400 hover:text-purple-600 transition-colors">
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CredentialsPage = () => {
  return (
    <div className="space-y-8 pb-10 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Credentials</h1>
        <p className="text-slate-500 mt-1 font-medium">Your InternFlow work email and portal access</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CredentialCard label="Work Email" value="priya.das@internyx.com" icon={Mail} />
        <CredentialCard label="Temporary Password" value="Hexa@2024!Intern" icon={Lock} isPassword={true} />
        <CredentialCard label="Intern ID" value="INT-HEXA-9021" icon={User} />
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-3xl p-8 flex items-start gap-6 shadow-sm">
        <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-amber-200">
          <AlertTriangle size={24} />
        </div>
        <div className="space-y-2">
          <h4 className="text-lg font-bold text-amber-900">Security Requirement</h4>
          <p className="text-sm text-amber-700 font-medium leading-relaxed">Please change your temporary password immediately upon your first login to the Hexaware workspace. Use at least 12 characters with symbols and numbers.</p>
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
            { label: 'VPN Access', status: 'Active', color: 'bg-emerald-500' },
            { label: 'JIRA / Confluence', status: 'Active', color: 'bg-emerald-500' },
            { label: 'GitHub Organization', status: 'Pending', color: 'bg-amber-500' },
            { label: 'AWS Console', status: 'Active', color: 'bg-emerald-500' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
              <span className="text-sm font-bold text-slate-700">{item.label}</span>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.status}</span>
                <div className={cn("w-2 h-2 rounded-full", item.color)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CredentialsPage;
