import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const InternPortalLogin = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.toLowerCase().endsWith('@hexaware.intern.io')) {
      setError('Only company-issued work emails (@hexaware.intern.io) are accepted.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/intern/portal-login', { email });
      login(data.token, data.user);
      navigate('/', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-100 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <div className="max-w-md w-full relative z-10 space-y-8">
        {/* Branding */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-violet-500 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-200">
            <ShieldCheck size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Intern Portal</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Hexaware Technologies</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl shadow-slate-200/60 border border-slate-100">
          <div className="mb-7">
            <h2 className="text-xl font-bold text-slate-900">Welcome back</h2>
            <p className="text-sm text-slate-400 mt-1 leading-relaxed">
              Sign in with your company-issued work email to access your intern dashboard.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Work Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="yourname@hexaware.intern.io"
                  required
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl">
                <AlertCircle size={15} className="text-rose-500 shrink-0 mt-0.5" />
                <p className="text-xs text-rose-700 font-medium leading-relaxed">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100"
            >
              {loading ? 'Signing in…' : <><span>Enter Portal</span><ArrowRight size={16} /></>}
            </button>
          </form>
        </div>

        {/* Hint */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 leading-relaxed">
            <strong>New intern?</strong> Your work email was sent to your personal inbox after HR issued your credentials. Only the <strong>@hexaware.intern.io</strong> email works here.
          </p>
        </div>

        <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Access restricted to credentialed interns only
        </p>
      </div>
    </div>
  );
};

export default InternPortalLogin;
