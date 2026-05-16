import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  User, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  Users, 
  Briefcase, 
  GraduationCap 
} from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.token, response.data.user);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to login. Please try again.');
      toast.error('Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickLogin = (role) => {
    // These are predefined in the seeded database (init-db.js)
    const predefinedEmails = {
      'hr': 'hr@internflow.com',
      'mentor': 'mentor_eng1@internflow.com',
      'employee': 'employee@internflow.com',
      'intern': 'intern@internflow.com', // Actually interns use OTP, but we can set it
    };
    setEmail(predefinedEmails[role] || '');
    setPassword('Hexa@2024'); // Default seeded password
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand Area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white mb-4 shadow-lg shadow-indigo-200">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">InternFlow</h1>
          <p className="text-slate-500 mt-2">Enterprise Internship Management Platform</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="p-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-6">Sign In (Staff)</h2>
            <p className="text-xs text-slate-500 mb-4">Interns should use the <a href="/recruitment/login" className="text-indigo-600 hover:underline">Recruitment Portal</a> or their Magic Link.</p>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <User size={18} />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="name@company.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock size={18} />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'} <ArrowRight size={18} />
              </button>
            </form>
          </div>

          {/* Quick Login Section */}
          <div className="bg-slate-50 p-8 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Quick Access (Seeded)</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { role: 'hr', label: 'HR Admin', icon: ShieldCheck, color: 'text-rose-600 bg-rose-50' },
                { role: 'mentor', label: 'Mentor', icon: Users, color: 'text-blue-600 bg-blue-50' },
                { role: 'employee', label: 'Employee', icon: Briefcase, color: 'text-emerald-600 bg-emerald-50' },
              ].map((item) => (
                <button
                  key={item.role}
                  onClick={() => quickLogin(item.role)}
                  type="button"
                  className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all text-left"
                >
                  <span className={`p-1.5 rounded-lg ${item.color}`}>
                    <item.icon size={14} />
                  </span>
                  <span className="text-xs font-medium text-slate-600">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <p className="text-center text-slate-400 text-xs mt-8">
          &copy; 2026 InternFlow Inc. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
