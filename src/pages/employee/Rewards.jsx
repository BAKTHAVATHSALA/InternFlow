import React, { useState, useEffect } from 'react';
import {
  Award,
  History,
  Wallet,
  Clock,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import StatsCard from '../../components/StatsCard';
import { cn } from '../../utils/cn';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Rewards = () => {
  const [filterStatus, setFilterStatus] = useState('All');
  const [history, setHistory] = useState([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalRedeemed, setTotalRedeemed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const { data } = await api.get('/api/rewards/mine');
      setHistory(data.history || []);
      setTotalEarned(data.total_earned || 0);
      setTotalRedeemed(data.total_redeemed || 0);
    } catch (err) {
      toast.error('Failed to load rewards');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemAll = async () => {
    const pendingCount = history.filter(r => r.status === 'pending').length;
    if (!pendingCount) {
      toast.error('No pending rewards to redeem');
      return;
    }
    setRedeeming(true);
    try {
      await api.post('/api/rewards/redeem-all');
      // Optimistically mark all pending as paid in local state
      setHistory(prev => prev.map(r => r.status === 'pending' ? { ...r, status: 'paid' } : r));
      toast.success('Rewards redeemed successfully!');
      setTimeout(() => fetchRewards(), 2000);
    } catch (err) {
      toast.error('Failed to submit redemption request');
    } finally {
      setRedeeming(false);
    }
  };

  const handleRedeemOne = async (rewardId) => {
    try {
      await api.patch(`/api/rewards/${rewardId}/redeem`);
      // Optimistically mark this reward as paid in local state
      setHistory(prev => prev.map(r => r.id === rewardId ? { ...r, status: 'paid' } : r));
      toast.success('Reward redeemed successfully!');
      setTimeout(() => fetchRewards(), 2000);
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to redeem reward');
    }
  };

  const pendingAmount = history
    .filter(r => r.status === 'pending')
    .reduce((acc, r) => acc + parseFloat(r.amount || 0), 0);

  const filteredHistory = history.filter(item => {
    if (filterStatus === 'All') return true;
    if (filterStatus === 'Pending') return item.status === 'pending';
    if (filterStatus === 'Requested') return item.status === 'payable';
    if (filterStatus === 'Paid') return item.status === 'paid';
    return true;
  });

  const statusLabel = (status) => {
    if (status === 'pending') return 'Pending';
    if (status === 'payable') return 'Requested';
    if (status === 'paid') return 'Paid';
    return status;
  };

  const statusColor = (status) => {
    if (status === 'paid') return 'bg-emerald-50 text-emerald-600';
    if (status === 'payable') return 'bg-blue-50 text-blue-600';
    return 'bg-amber-50 text-amber-600';
  };

  const dotColor = (status) => {
    if (status === 'paid') return 'bg-emerald-500';
    if (status === 'payable') return 'bg-blue-500';
    return 'bg-amber-500';
  };

  if (loading) {
    return <div className="animate-pulse p-8">Loading rewards...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">My Rewards</h1>
        <p className="text-slate-500 mt-1 font-medium">Manage and redeem your referral bonuses.</p>
      </div>

      {/* Main Earning Card */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl md:rounded-3xl p-6 md:p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full -mr-32 -mt-32 blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full -ml-32 -mb-32 blur-[60px]" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center">
          <div className="space-y-5 md:space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-xl border border-white/10">
                <Sparkles size={18} className="text-amber-400" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">Total Earned</span>
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter">₹{totalEarned.toLocaleString()}</h2>
              {history.length > 0 ? (
                <p className="text-indigo-200 font-medium text-sm md:text-base">
                  You've successfully referred {history.length} intern{history.length !== 1 ? 's' : ''} who joined our team!
                </p>
              ) : (
                <p className="text-indigo-200 font-medium text-sm md:text-base">Refer interns to start earning rewards.</p>
              )}
            </div>
            {/* Earning summary — visible on mobile */}
            <div className="md:hidden p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
              {[
                { label: 'Total Earned', value: `₹${totalEarned.toLocaleString()}`, color: 'text-emerald-400' },
                { label: 'Redeemed', value: `₹${totalRedeemed.toLocaleString()}`, color: 'text-white' },
                { label: 'Available', value: `₹${pendingAmount.toLocaleString()}`, color: 'text-indigo-300' },
              ].map((stat, i) => (
                <div key={i} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
                  <span className="text-xs font-medium text-white/60">{stat.label}</span>
                  <span className={cn('text-sm font-bold', stat.color)}>{stat.value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4 pt-2">
              <button
                onClick={handleRedeemAll}
                disabled={redeeming || pendingAmount === 0}
                className="px-6 md:px-8 py-3 bg-white text-indigo-950 rounded-xl text-sm font-black shadow-lg hover:bg-indigo-50 transition-all uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {redeeming && <RefreshCw size={14} className="animate-spin" />}
                {pendingAmount > 0 ? `Redeem ₹${pendingAmount.toLocaleString()}` : 'Nothing to Redeem'}
              </button>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="p-5 sm:p-8 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm space-y-6">
              <h4 className="font-bold text-sm text-indigo-200 uppercase tracking-widest">Earning Summary</h4>
              <div className="space-y-4">
                {[
                  { label: 'Total Earned', value: `₹${totalEarned.toLocaleString()}`, color: 'text-emerald-400' },
                  { label: 'Redeemed / In Process', value: `₹${totalRedeemed.toLocaleString()}`, color: 'text-white' },
                  { label: 'Available to Redeem', value: `₹${pendingAmount.toLocaleString()}`, color: 'text-indigo-300' },
                ].map((stat, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                    <span className="text-xs font-medium text-white/60">{stat.label}</span>
                    <span className={cn('text-sm font-bold', stat.color)}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="Total Earned" value={`₹${totalEarned.toLocaleString()}`} trend="" subtext="All time earnings" icon={Award} color="bg-emerald-100 text-emerald-600" />
        <StatsCard title="Available" value={`₹${pendingAmount.toLocaleString()}`} trend="" subtext="Ready to redeem" icon={Clock} color="bg-amber-100 text-amber-600" />
        <StatsCard title="Redeemed" value={`₹${totalRedeemed.toLocaleString()}`} trend="" subtext="Paid / In process" icon={Wallet} color="bg-purple-100 text-purple-600" />
      </div>

      {/* History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <History className="text-slate-400" size={18} />
            <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs">Reward History</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-lg">
              {['All', 'Pending', 'Requested', 'Paid'].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={cn(
                    'px-3 py-1 text-[10px] font-bold rounded-md transition-all',
                    filterStatus === s ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="divide-y divide-slate-50">
          {filteredHistory.length > 0 ? filteredHistory.map((item) => (
            <div key={item.id} className="p-4 md:p-6 flex items-center gap-3 md:gap-4 hover:bg-slate-50 transition-colors">
              <div className={cn('w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0', statusColor(item.status))}>
                <Award size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-900">Referral Onboarding Reward</h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
                  {item.intern_name || 'Unknown'}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">₹{Number(item.amount).toLocaleString()}</p>
                  <div className="flex items-center gap-1.5 justify-end mt-0.5">
                    <span className={cn('w-1.5 h-1.5 rounded-full', dotColor(item.status))} />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {statusLabel(item.status)}
                    </p>
                  </div>
                </div>
                {item.status === 'pending' && (
                  <button
                    onClick={() => handleRedeemOne(item.id)}
                    className="px-3 py-1.5 bg-purple-600 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider hover:bg-purple-700 transition-colors"
                  >
                    Redeem
                  </button>
                )}
                {item.status === 'payable' && (
                  <span className="px-3 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                    Processing
                  </span>
                )}
                {item.status === 'paid' && (
                  <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                    Paid
                  </span>
                )}
              </div>
            </div>
          )) : (
            <div className="p-12 text-center">
              <p className="text-sm text-slate-400 font-medium">
                {history.length === 0
                  ? 'No rewards yet. Refer interns to earn rewards when they onboard!'
                  : 'No rewards found for the selected filter.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Rewards;
