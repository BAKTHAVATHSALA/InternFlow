import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, Briefcase, RefreshCcw } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useOnboardingAuth } from '../../contexts/OnboardingAuthContext';

const OnboardingLogin = () => {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const { onboardLogin } = useOnboardingAuth();
  const navigate = useNavigate();

  const startTimer = () => {
    setTimer(60);
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/otp/send', { email });
      toast.success('OTP sent to your email');
      setStep('otp');
      startTimer();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) {
      document.getElementById(`ob-otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`ob-otp-${index - 1}`)?.focus();
    }
  };

  const statusToRoute = (status) => {
    switch (status) {
      case 'onboarded':     return '/intern-onboard/success';
      case 'offer_pending': return '/intern-onboard/documents';
      case 'screened':      return '/intern-onboard/offer';
      case 'applied':       return '/intern-onboard/screening';
      default:              return '/intern-onboard/job';
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) { toast.error('Enter all 6 digits'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/otp/verify', { email, otp: code });
      onboardLogin(res.data.token, res.data.user);

      // Fetch application status and navigate to the correct step
      const token = res.data.token;
      const statusRes = await api.get('/auth/intern/onboard-status', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const route = statusToRoute(statusRes.data.status);
      toast.success(route === '/intern-onboard/success' ? 'Welcome back! Your onboarding is complete.' : 'Welcome to your Onboarding Portal!');
      navigate(route);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    try {
      await api.post('/auth/otp/send', { email });
      startTimer();
      toast.success('OTP resent');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to resend');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-100 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <div className="max-w-md w-full relative z-10 space-y-8">
        {/* Branding */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-violet-500 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-purple-200">
            <Briefcase size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">InternFlow</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Onboarding Portal · By Hexaware</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/60 border border-slate-100">
          {step === 'email' ? (
            <>
              <div className="mb-7">
                <h2 className="text-xl font-bold text-slate-900">Welcome, Intern!</h2>
                <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                  Enter the email address you were referred with to access your onboarding portal.
                </p>
              </div>
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="yourname@college.edu"
                      required
                      className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-violet-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-purple-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : <><span>Send OTP</span> <ArrowRight size={16} /></>}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-7">
                <h2 className="text-xl font-bold text-slate-900">Check your email</h2>
                <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                  We sent a 6-digit code to{' '}
                  <span className="text-purple-600 font-semibold">{email}</span>
                  <button
                    type="button"
                    onClick={() => { setStep('email'); setOtp(['','','','','','']); }}
                    className="ml-2 text-xs text-slate-400 underline hover:text-slate-600 transition-colors"
                  >
                    Change
                  </button>
                </p>
              </div>
              <form onSubmit={handleVerify} className="space-y-6">
                <div className="flex justify-between gap-2">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`ob-otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      maxLength={1}
                      className="w-12 h-14 text-center text-xl font-black bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all"
                    />
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-violet-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-purple-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : <><span>Enter Portal</span> <ArrowRight size={16} /></>}
                </button>
                <div className="text-center">
                  {timer > 0 ? (
                    <p className="text-xs text-slate-400">Resend code in <span className="text-purple-600 font-bold">{timer}s</span></p>
                  ) : (
                    <button type="button" onClick={handleResend} className="text-xs text-purple-600 font-bold flex items-center gap-1.5 mx-auto hover:text-purple-700 transition-colors">
                      <RefreshCcw size={12} /> Resend OTP
                    </button>
                  )}
                </div>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Access restricted to referred interns only
        </p>
      </div>
    </div>
  );
};

export default OnboardingLogin;
