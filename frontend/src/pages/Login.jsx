import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Briefcase, User, Sparkles, CheckCircle, Zap, Search, MessageSquare, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('hr');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:8000/auth/login', {
        email,
        password
      });
      
      const { access_token, user } = response.data;
      
      // Strict Role Validation
      // Mapping 'hr' to also allow 'manager' for flexibility, but preventing 'intern'
      const normalizedSelectedRole = role.toLowerCase();
      const userRole = user.role.toLowerCase();
      
      if (normalizedSelectedRole === 'hr' && userRole === 'intern') {
        setError('Invalid credentials for the selected role.');
        setLoading(false);
        return;
      }
      
      if (normalizedSelectedRole === 'intern' && userRole !== 'intern') {
        setError('Invalid credentials for the selected role.');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', access_token);
      localStorage.setItem('role', user.role);
      
      if (user.role === 'hr' || user.role === 'manager') {
        navigate('/hr');
      } else {
        navigate('/intern');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Sparkles, text: "Hybrid AI scoring — semantic + skill + experience" },
    { icon: CheckCircle, text: "Skill levels — Beginner / Intermediate / Advanced" },
    { icon: Zap, text: "Why-not-selected with improvement suggestions" },
    { icon: Search, text: "Side-by-side comparison with confidence score" },
    { icon: MessageSquare, text: "RAG compliance chatbot — policy Q&A" },
  ];

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[700px]">
        
        {/* Left Side - Branding & Features */}
        <div className="w-full md:w-[45%] bg-premium-purple p-8 md:p-12 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">InternFlow</h1>
            </div>
            <p className="text-white/80 text-lg leading-relaxed mb-12">
              From Resume → Decision → Improvement<br />
              <span className="font-semibold text-white">Powered by Explainable AI</span>
            </p>

            {/* AI Decision Pipeline Graphic */}
            <div className="bg-white/10 rounded-2xl p-6 border border-white/10 mb-12">
              <span className="text-[10px] uppercase tracking-widest text-white/50 font-bold mb-4 block">AI DECISION PIPELINE</span>
              <div className="flex flex-wrap items-center gap-2">
                <div className="px-3 py-1.5 bg-[#6D28D9] rounded-lg text-sm font-medium border border-white/20">Resume</div>
                <div className="text-white/30">→</div>
                <div className="px-3 py-1.5 bg-white/5 rounded-lg text-sm font-medium border border-white/10">Parse</div>
                <div className="text-white/30">→</div>
                <div className="px-3 py-1.5 bg-white/5 rounded-lg text-sm font-medium border border-white/10">Score</div>
                <div className="text-white/30">→</div>
                <div className="px-3 py-1.5 bg-[#10B981] rounded-lg text-sm font-medium border border-white/20 mt-2">Explain</div>
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-6">
              {features.map((feature, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={idx} 
                  className="flex items-center gap-4 group"
                >
                  <div className="feature-icon-wrapper group-hover:scale-110 transition-transform">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <span className="text-white/80 text-sm font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 text-xs text-white/40">
            Hexaware GenAI Designathon 2024
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-[55%] p-8 md:p-16 flex flex-col justify-center bg-[#FAFAFA]">
          <div className="max-w-sm mx-auto w-full">
            <h2 className="text-3xl font-bold text-[#1A1A1A] mb-2">Welcome back</h2>
            <p className="text-[#6B7280] mb-8">Sign in to continue to InternFlow</p>

            {/* Role Selector */}
            <div className="flex p-1.5 bg-[#F3F4F6] rounded-2xl mb-8">
              <button 
                onClick={() => setRole('hr')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
                  role === 'hr' ? "bg-white text-[#1A1A1A] shadow-sm" : "text-[#6B7280] hover:text-[#1A1A1A]"
                )}
              >
                <Briefcase className="w-4 h-4" />
                HR Manager
              </button>
              <button 
                onClick={() => setRole('intern')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
                  role === 'intern' ? "bg-white text-[#1A1A1A] shadow-sm" : "text-[#6B7280] hover:text-[#1A1A1A]"
                )}
              >
                <User className="w-4 h-4" />
                Intern
              </button>
            </div>

            <form className="space-y-6" onSubmit={handleLogin}>
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-2">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                  <input 
                    type="email" 
                    placeholder="hr@internflow.com" 
                    className="input-field pl-12"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    className="input-field pl-12 pr-12"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6D28D9] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary w-full py-4 mt-2 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign in"}
              </button>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
