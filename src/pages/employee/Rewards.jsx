import React, { useState } from 'react';
import { 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  History, 
  ArrowUpRight,
  Wallet,
  Clock,
  Sparkles
} from 'lucide-react';
import StatsCard from '../../components/StatsCard';
import { cn } from '../../utils/cn';

const historyData = [
  { id: 1, title: 'Referral Onboarding Reward', intern: 'Rahul Verma', amount: '₹2,500', date: 'May 10, 2024', status: 'Redeemed' },
  { id: 2, title: 'Referral Onboarding Reward', intern: 'Ananya Iyer', amount: '₹2,500', date: 'Processing', status: 'Pending' },
  { id: 3, title: 'Quarterly Bonus', intern: 'Performance', amount: '₹5,000', date: 'Apr 30, 2024', status: 'Redeemed' },
];

const Rewards = () => {
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredHistory = historyData.filter(item => 
    filterStatus === 'All' || item.status === filterStatus
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Rewards</h1>
        <p className="text-slate-500 mt-1 font-medium">Manage and redeem your referral bonuses.</p>
      </div>

      {/* Main Earning Card */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full -mr-32 -mt-32 blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full -ml-32 -mb-32 blur-[60px]" />
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-xl border border-white/10">
                <Sparkles size={20} className="text-amber-400" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">Total Earned this cycle</span>
            </div>
            <div className="space-y-2">
              <h2 className="text-6xl font-black tracking-tighter">₹5,000</h2>
              <p className="text-indigo-200 font-medium">You've successfully referred 2 interns who joined our team!</p>
            </div>
            <div className="flex gap-4 pt-4">
              <button className="px-8 py-3 bg-white text-indigo-950 rounded-xl text-sm font-black shadow-lg hover:bg-indigo-50 transition-all uppercase tracking-wider">
                Redeem to Wallet
              </button>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="p-8 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm space-y-6">
              <h4 className="font-bold text-sm text-indigo-200 uppercase tracking-widest">Earning Summary</h4>
              <div className="space-y-4">
                {[
                  { label: 'Onboarding Rewards', value: '₹5,000', color: 'text-emerald-400' },
                  { label: 'Screening Bonus', value: '₹1,500', color: 'text-white' },
                  { label: 'Potential Earnings', value: '₹7,500', color: 'text-indigo-300' },
                ].map((stat, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                    <span className="text-xs font-medium text-white/60">{stat.label}</span>
                    <span className={cn("text-sm font-bold", stat.color)}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="Total Earned" value="₹12,500" trend="+15%" subtext="All time earnings" icon={Award} color="bg-emerald-100 text-emerald-600" />
        <StatsCard title="Potential" value="₹7,500" trend="" subtext="Awaiting onboarding" icon={Clock} color="bg-amber-100 text-amber-600" />
        <StatsCard title="Redeemed" value="₹5,000" trend="" subtext="Withdrawn to bank" icon={Wallet} color="bg-purple-100 text-purple-600" />
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
              {['All', 'Redeemed', 'Pending'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={cn(
                    "px-3 py-1 text-[10px] font-bold rounded-md transition-all",
                    filterStatus === status ? "bg-white text-purple-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
            <button className="px-4 py-2 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-wider">
              Download Report
            </button>
          </div>
        </div>
        <div className="divide-y divide-slate-50">
          {filteredHistory.length > 0 ? filteredHistory.map((item) => (
            <div key={item.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", item.status === 'Redeemed' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}>
                  <Award size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Intern: {item.intern}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">{item.amount}</p>
                <div className="flex items-center gap-1.5 justify-end mt-1">
                  <span className={cn("w-1.5 h-1.5 rounded-full", item.status === 'Redeemed' ? "bg-emerald-500" : "bg-amber-500")} />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.date}</p>
                </div>
              </div>
            </div>
          )) : (
            <div className="p-12 text-center">
              <p className="text-sm text-slate-400 font-medium">No rewards found for the selected filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Rewards;
