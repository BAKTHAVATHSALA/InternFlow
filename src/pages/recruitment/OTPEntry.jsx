import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, ArrowRight, RefreshCcw } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const OTPEntry = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const { login } = useAuth();

  useEffect(() => {
    if (!email) {
      navigate('/recruitment/login');
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [email, navigate]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length === 6) {
      setIsVerifying(true);
      try {
        const response = await api.post('/auth/otp/verify', { email, otp: otpValue });
        login(response.data.token, response.data.user);
        navigate('/');
      } catch (err) {
        toast.error(err.response?.data?.error || 'Invalid OTP');
      } finally {
        setIsVerifying(false);
      }
    } else {
      toast.error('Please enter all 6 digits');
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    try {
      await api.post('/auth/otp/send', { email });
      setTimer(60);
      toast.success('OTP resent successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to resend OTP');
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
            <p className="text-slate-500 font-medium">Verification Required</p>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100 space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Enter OTP</h2>
            <p className="text-sm text-slate-400 font-medium leading-relaxed">
              We've sent a 6-digit code to <span className="text-indigo-600 font-bold">{email}</span>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-8">
            <div className="flex justify-between gap-2">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  className="w-12 h-14 text-center text-xl font-black bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all"
                  maxLength={1}
                />
              ))}
            </div>

            <div className="space-y-6">
              <button
                type="submit"
                disabled={isVerifying}
                className={`w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 ${isVerifying ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isVerifying ? 'Verifying...' : 'Verify Code'} <ArrowRight size={20} />
              </button>

              <div className="text-center">
                {timer > 0 ? (
                  <p className="text-xs text-slate-400 font-medium">Resend code in <span className="text-indigo-600 font-bold">{timer}s</span></p>
                ) : (
                  <button type="button" onClick={handleResend} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-2 mx-auto uppercase tracking-widest">
                    <RefreshCcw size={14} /> Resend OTP
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OTPEntry;
