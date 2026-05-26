import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Building2, Banknote, Calendar, Clock, MapPin, ArrowRight, ChevronRight, CheckCircle2, Gift, Loader2 } from 'lucide-react';
import api from '../../services/api';

const OnboardOfferPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [appData, setAppData] = useState(location.state?.offer || null);
  const [loading, setLoading] = useState(!appData);

  useEffect(() => {
    if (appData) return;
    const fetchApp = async () => {
      try {
        const token = localStorage.getItem('onboard_token');
        const { data } = await api.get('/api/applications/mine', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.status !== 'offer_pending' && data.status !== 'onboarded') {
          navigate('/intern-onboard/screening', { replace: true });
          return;
        }
        setAppData(data);
      } catch {
        navigate('/intern-onboard/screening', { replace: true });
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl flex items-center justify-center py-32">
        <Loader2 size={28} className="text-purple-500 animate-spin" />
      </div>
    );
  }

  const stipendVal = appData?.stipend == null
    ? 'Not specified'
    : appData.stipend === 0
      ? 'Unpaid'
      : `₹${Number(appData.stipend).toLocaleString()} / month`;

  const offerDetails = [
    { label: 'Role',     value: appData?.role || appData?.title || 'Intern',          icon: Building2 },
    { label: 'Stipend',  value: stipendVal,                                            icon: Banknote },
    { label: 'Duration', value: appData?.duration_months ? `${appData.duration_months} months` : 'N/A', icon: Clock },
    { label: 'Mode',     value: [appData?.mode, appData?.location].filter(Boolean).join(' · ') || 'N/A', icon: MapPin },
  ];

  return (
    <div className="max-w-3xl space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium">
        <span className="text-purple-600 font-bold">Step 4 of 6</span>
        <ChevronRight size={12} className="text-slate-300" />
        <span className="text-slate-400">Offer Letter</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Your Offer Letter</h1>
        <p className="text-sm text-slate-500 mt-1">Review and accept your internship offer.</p>
      </div>

      {/* Congratulations Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-violet-500 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full pointer-events-none" />
        <div className="absolute right-4 bottom-0 w-28 h-28 bg-white/5 rounded-full pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Gift size={20} />
            </div>
            <span className="text-white/70 font-bold text-xs uppercase tracking-widest">Offer Extended</span>
          </div>
          <h2 className="text-2xl font-black mb-2">Congratulations!</h2>
          <p className="text-purple-100 text-sm leading-relaxed">
            You've been selected for the <strong>{appData?.role || appData?.title || 'Intern'}</strong> role at
            Hexaware Technologies. We're excited to have you on board!
          </p>
        </div>
      </div>

      {/* Offer Details */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Offer Details</h3>
        <div className="divide-y divide-slate-50">
          {offerDetails.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Icon size={13} className="text-purple-600" />
                </div>
                <span className="text-sm text-slate-500 font-medium">{label}</span>
              </div>
              <span className="text-sm font-bold text-slate-800">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Acceptance Notice */}
      <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
        <CheckCircle2 size={17} className="text-emerald-600 shrink-0 mt-0.5" />
        <p className="text-sm text-emerald-700 font-medium leading-relaxed">
          By clicking Accept, you confirm your intent to join Hexaware Technologies as
          a <strong>{appData?.role || appData?.title || 'Intern'}</strong>.
        </p>
      </div>

      <button
        onClick={() => navigate('/intern-onboard/documents')}
        className="w-full py-4 bg-gradient-to-r from-purple-600 to-violet-500 text-white rounded-xl font-bold shadow-lg shadow-purple-200 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
      >
        Accept &amp; Proceed to Documents <ArrowRight size={18} />
      </button>
    </div>
  );
};

export default OnboardOfferPage;
