import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Clock, Banknote, Calendar, Code2, ArrowRight, ChevronRight, User } from 'lucide-react';
import api from '../../services/api';
import { useOnboardingAuth } from '../../contexts/OnboardingAuthContext';

const OnboardJobPage = () => {
  const navigate = useNavigate();
  const { onboardUser } = useOnboardingAuth();
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const token = localStorage.getItem('onboard_token');
        const res = await api.get('/api/referrals/my-offer', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOffer(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load job details');
      } finally {
        setLoading(false);
      }
    };
    fetchOffer();
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl space-y-6">
        <div className="flex items-center gap-2 text-xs font-medium">
          <span className="text-purple-600 font-bold">Step 1 of 6</span>
          <ChevronRight size={12} className="text-slate-300" />
          <span className="text-slate-400">Review Your Position</span>
        </div>
        <div className="space-y-4 animate-pulse">
          <div className="h-8 bg-slate-200 rounded-xl w-64" />
          <div className="bg-white rounded-2xl border border-slate-200 h-96" />
        </div>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="max-w-3xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-medium">
          <span className="text-purple-600 font-bold">Step 1 of 6</span>
          <ChevronRight size={12} className="text-slate-300" />
          <span className="text-slate-400">Review Your Position</span>
        </div>
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-8 text-center">
          <p className="text-rose-600 font-bold text-sm mb-1">Unable to load job details</p>
          <p className="text-rose-400 text-xs">{error}</p>
        </div>
      </div>
    );
  }

  const highlights = [
    {
      icon: Banknote,
      label: 'Stipend',
      value: offer.stipend == null ? 'Not specified' : offer.stipend === 0 ? 'Unpaid' : `₹${Number(offer.stipend).toLocaleString()} / month`,
      bg: 'bg-emerald-50', color: 'text-emerald-600',
    },
    {
      icon: Clock,
      label: 'Duration',
      value: offer.duration_months ? `${offer.duration_months} Months` : 'N/A',
      bg: 'bg-blue-50', color: 'text-blue-600',
    },
    {
      icon: MapPin,
      label: 'Location',
      value: [offer.location, offer.mode].filter(Boolean).join(', ') || 'N/A',
      bg: 'bg-purple-50', color: 'text-purple-600',
    },
    {
      icon: User,
      label: 'Referred By',
      value: offer.referrer_name || 'N/A',
      bg: 'bg-amber-50', color: 'text-amber-600',
    },
  ];

  const techStack = Array.isArray(offer.tech_stack)
    ? offer.tech_stack
    : typeof offer.tech_stack === 'string'
      ? offer.tech_stack.replace(/[{}"]/g, '').split(',').map(s => s.trim()).filter(Boolean)
      : [];

  return (
    <div className="max-w-3xl space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium">
        <span className="text-purple-600 font-bold">Step 1 of 6</span>
        <ChevronRight size={12} className="text-slate-300" />
        <span className="text-slate-400">Review Your Position</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Your Internship Opportunity</h1>
        <p className="text-sm text-slate-500 mt-1">
          Hi <span className="font-semibold text-slate-700">{offer.intern_name || onboardUser?.name}</span>! Review the position details and proceed to apply.
        </p>
      </div>

      {/* Role Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-100 shrink-0">
            <Building2 size={24} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{offer.title}</h2>
                <p className="text-sm text-slate-500 font-medium mt-0.5">
                  Hexaware Technologies · {offer.department}
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100 shrink-0">
                Open
              </span>
            </div>
          </div>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {highlights.map(({ icon: Icon, label, value, bg, color }) => (
            <div key={label} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-2.5`}>
                <Icon size={15} className={color} />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
              <p className="text-sm font-bold text-slate-800 truncate">{value}</p>
            </div>
          ))}
        </div>

        {/* Description */}
        {offer.description && (
          <div className="mb-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Role Overview</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{offer.description}</p>
          </div>
        )}

        {/* Tech Stack */}
        {techStack.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Code2 size={12} /> Tech Stack
            </h3>
            <div className="flex flex-wrap gap-2">
              {techStack.map(tech => (
                <span key={tech} className="px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-bold rounded-full border border-purple-100">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Referral date */}
        <div className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-100 rounded-xl">
          <Calendar size={15} className="text-purple-600 shrink-0" />
          <p className="text-sm text-purple-700 font-medium">
            Referred on{' '}
            <span className="font-bold">
              {new Date(offer.referred_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </p>
        </div>
      </div>

      <button
        onClick={() => navigate('/intern-onboard/application')}
        className="w-full py-4 bg-gradient-to-r from-purple-600 to-violet-500 text-white rounded-xl font-bold shadow-lg shadow-purple-200 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
      >
        Apply Now <ArrowRight size={18} />
      </button>
    </div>
  );
};

export default OnboardJobPage;
