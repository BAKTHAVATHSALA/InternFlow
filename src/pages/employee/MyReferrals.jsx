import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Calendar,
  Award
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

// Maps DB status values to a unified UI status string
const getUiStatus = (ref) => {
  const s = ref.application_status || ref.status;
  if (!s || s === 'pending') return 'Pending';
  if (s === 'applied') return 'Applied';
  if (s === 'screened') return 'Applied';
  if (['offer_pending', 'offer_accepted', 'documents_pending'].includes(s)) return 'HR Review';
  if (s === 'onboarded') return 'Onboarded';
  if (s === 'completed') return 'Completed';
  if (s === 'rejected') return 'Rejected';
  return 'Pending';
};

const MyReferrals = () => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      const response = await api.get('/api/referrals/mine');
      setReferrals(response.data);
    } catch (err) {
      toast.error('Failed to fetch referrals');
    } finally {
      setLoading(false);
    }
  };

  const filteredReferrals = referrals.filter(ref => {
    const uiStatus = getUiStatus(ref);
    const matchesStatus = filterStatus === 'All' || uiStatus === filterStatus;
    const matchesSearch =
      ref.intern_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ref.role?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (loading) {
    return <div className="animate-pulse p-8">Loading referrals...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="page-title">My Referrals</h1>
          <p className="text-slate-500 mt-1 font-medium">Track the status of your referred candidates.</p>
        </div>
        <button
          onClick={() => navigate('/refer')}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-200 hover:scale-[1.02] transition-transform flex items-center gap-2"
        >
          <Plus size={18} />
          New Referral
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {['All', 'Onboarded', 'Completed', 'HR Review', 'Rejected'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={cn(
                'px-4 py-2 text-xs font-bold rounded-xl transition-all border',
                tab === filterStatus
                  ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-100'
                  : 'text-slate-500 bg-white border-slate-200 hover:text-slate-700'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-purple-500 transition-colors" />
          <input
            type="text"
            placeholder="Search referrals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 w-full md:w-72"
          />
        </div>
      </div>

      <div className="space-y-6">
        {filteredReferrals.length > 0 ? filteredReferrals.map((ref) => {
          const uiStatus = getUiStatus(ref);

          const progressWidth = {
            Completed: 'calc(100% - 32px)',
            Onboarded: '75%',
            'HR Review': '50%',
            Applied:    '25%',
          }[uiStatus] || '0%';

          const steps = [
            { label: 'Applied',   done: !['Pending'].includes(uiStatus) },
            { label: 'HR Review', done: ['HR Review', 'Onboarded', 'Completed'].includes(uiStatus) },
            { label: 'Onboarded', done: ['Onboarded', 'Completed'].includes(uiStatus) },
            { label: 'Completed', done: uiStatus === 'Completed' },
          ];

          const rewardText = ref.reward_amount
            ? `₹${Number(ref.reward_amount).toLocaleString()}`
            : uiStatus === 'Onboarded' ? '₹5,000' : 'Pending';

          return (
            <div key={ref.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-8 hover:border-purple-200 transition-colors">
              <div className="flex flex-col gap-6">
                {/* Top: Profile + Status badge */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-lg md:text-2xl shadow-inner shrink-0">
                    {getInitials(ref.intern_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base md:text-xl font-bold text-slate-900 truncate">{ref.intern_name}</h3>
                    <p className="text-sm text-slate-500 font-medium mt-0.5 truncate">{ref.role}</p>
                    {uiStatus === 'Rejected' && (
                      <span className="inline-block mt-2 px-2 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                        Rejected
                      </span>
                    )}
                  </div>
                  {/* Mini stats visible on mobile */}
                  <div className="shrink-0 text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Reward</p>
                    <p className={cn('text-sm font-bold', rewardText.includes('₹') ? 'text-emerald-600' : 'text-amber-600')}>
                      {rewardText}
                    </p>
                  </div>
                </div>

                {/* Progress Timeline */}
                {uiStatus === 'Rejected' ? (
                  <p className="text-sm text-rose-500 font-medium text-center">Application was not successful.</p>
                ) : (
                  <div className="overflow-x-auto -mx-1 px-1">
                    <div className="relative flex justify-between items-center min-w-[260px] px-4 pb-7">
                      <div className="absolute left-4 right-4 h-0.5 bg-slate-100 top-[10px]" />
                      <div
                        className="absolute left-4 h-0.5 bg-emerald-500 top-[10px] transition-all duration-500"
                        style={{ width: progressWidth }}
                      />
                      {steps.map((step, i) => (
                        <div key={i} className="relative z-10 flex flex-col items-center">
                          <div className={cn(
                            'w-5 h-5 rounded-full border-4 border-white shadow-sm transition-colors duration-300',
                            step.done ? 'bg-emerald-500' : 'bg-slate-200'
                          )} />
                          <span className={cn(
                            'text-[10px] font-bold uppercase tracking-widest absolute top-6 whitespace-nowrap',
                            step.done ? 'text-emerald-600' : 'text-slate-400'
                          )}>{step.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats row */}
                <div className="flex items-center gap-6 pt-1 border-t border-slate-50 flex-wrap">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Referral Date</p>
                    <p className="text-sm font-bold text-slate-700">{new Date(ref.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">AI Score</p>
                    <p className="text-sm font-black text-slate-900">{ref.ai_score ? `${ref.ai_score}/100` : '—'}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-20 text-center">
            <p className="text-slate-400 font-medium">No referrals found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReferrals;
