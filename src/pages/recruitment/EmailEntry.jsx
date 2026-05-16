import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, ShieldCheck } from 'lucide-react';

import api from '../../services/api';
import toast from 'react-hot-toast';

const EmailEntry = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email) {
      setIsSubmitting(true);
      try {
        await api.post('/auth/otp/send', { email });
        toast.success('OTP sent to your email');
        navigate('/recruitment/otp', { state: { email } });
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to send OTP');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white mx-auto shadow-2xl shadow-indigo-200">
            <ShieldCheck size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">InternFlow</h1>
            <p className="text-slate-500 font-medium">Recruitment & Onboarding Portal</p>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100 space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Sign In</h2>
            <p className="text-sm text-slate-400 font-medium">Enter your email to receive a verification code</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              Send OTP <ArrowRight size={20} />
            </button>
          </form>
        </div>

        <p className="text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
          Secured by InternFlow Enterprise
        </p>
      </div>
    </div>
  );
};

export default EmailEntry;
