import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  MapPin,
  Calendar,
  Award
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

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
    // Map db status to UI status
    let uiStatus = 'Pending';
    if (ref.status === 'applied') uiStatus = 'Applied';
    else if (['screened'].includes(ref.status)) uiStatus = 'Screened';
    else if (['offered', 'offer_pending'].includes(ref.status)) uiStatus = 'In Review';
    else if (ref.status === 'onboarded') uiStatus = 'Onboarded';
    else if (ref.status === 'rejected') uiStatus = 'Rejected';

    const matchesStatus = filterStatus === 'All' || uiStatus === filterStatus || (filterStatus === 'In Review' && uiStatus === 'Pending'); // simplified mapping for demo
    const matchesSearch = ref.intern_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ref.role?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
  };

  if (loading) {
    return <div className="animate-pulse">Loading referrals...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Referrals</h1>
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex p-1 bg-white border border-slate-200 rounded-xl w-fit">
          {['All', 'Onboarded', 'In Review', 'Screened'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setFilterStatus(tab)}
              className={cn(
                "px-6 py-2 text-xs font-bold rounded-lg transition-all",
                tab === filterStatus ? "bg-purple-600 text-white shadow-md shadow-purple-100" : "text-slate-500 hover:text-slate-700"
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
            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 w-64" 
          />
        </div>
      </div>

      <div className="space-y-6">
        {filteredReferrals.length > 0 ? filteredReferrals.map((ref) => {
          let uiStatus = 'Pending';
          if (ref.status === 'applied') uiStatus = 'Applied';
          else if (['screened'].includes(ref.status)) uiStatus = 'Screened';
          else if (['offered', 'offer_pending'].includes(ref.status)) uiStatus = 'In Review';
          else if (ref.status === 'onboarded') uiStatus = 'Onboarded';

          const reward = ref.status === 'onboarded' ? '₹5,000' : 'Pending';

          return (
          <div key={ref.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 hover:border-purple-200 transition-colors">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-center">
              {/* Profile */}
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-2xl shadow-inner shrink-0">
                  {getInitials(ref.intern_name)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{ref.intern_name}</h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">{ref.role}</p>
                </div>
              </div>

              {/* Progress Timeline */}
              <div className="lg:col-span-2">
                <div className="relative flex justify-between items-center w-full px-4">
                  <div className="absolute left-4 right-4 h-0.5 bg-slate-50 top-1/2 -translate-y-1/2" />
                  <div 
                    className="absolute left-4 h-0.5 bg-emerald-500 top-1/2 -translate-y-1/2 transition-all duration-500" 
                    style={{ width: uiStatus === 'Onboarded' ? 'calc(100% - 32px)' : uiStatus === 'In Review' ? '66%' : uiStatus === 'Screened' ? '33%' : '0%' }}
                  />
                  
                  {[
                    { label: 'Applied', done: true },
                    { label: 'Screened', done: uiStatus !== 'Applied' && uiStatus !== 'Pending' },
                    { label: 'HR Review', done: uiStatus === 'Onboarded' || uiStatus === 'In Review' },
                    { label: 'Onboarded', done: uiStatus === 'Onboarded' },
                  ].map((step, i) => (
                    <div key={i} className="relative z-10 flex flex-col items-center gap-3">
                      <div className={cn(
                        "w-5 h-5 rounded-full border-4 border-white shadow-sm transition-colors duration-300",
                        step.done ? "bg-emerald-500" : "bg-slate-200"
                      )} />
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest absolute -bottom-6 whitespace-nowrap",
                        step.done ? "text-emerald-600" : "text-slate-400"
                      )}>{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info Stats */}
              <div className="flex items-center justify-between lg:justify-end gap-12 pt-6 lg:pt-0">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Referral Date</p>
                  <p className="text-sm font-bold text-slate-700">{new Date(ref.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Reward</p>
                  <p className={cn("text-sm font-bold", reward.includes('₹') ? "text-emerald-600" : "text-amber-600")}>{reward}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">AI Score</p>
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-sm font-black text-slate-900">{ref.ai_score || '-'}</span>
                    <div className="w-8 h-8 rounded-full border-2 border-purple-100 flex items-center justify-center text-[10px] font-bold text-purple-600">
                      %
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}) : (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-20 text-center">
            <p className="text-slate-400 font-medium">No referrals found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReferrals;
