import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  Award, 
  UserPlus, 
  Briefcase, 
  ArrowUpRight,
  Bell,
  MapPin,
  Code,
  Filter,
  Search
} from 'lucide-react';
import StatsCard from '../../components/StatsCard';
import { cn } from '../../utils/cn';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [quota, setQuota] = useState({ remaining: 0, total_slots: 5, used_slots: 0 });
  const [rewards, setRewards] = useState({ total_earned: 0 });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [refsRes, jobsRes, notesRes, quotaRes, rewRes] = await Promise.all([
        api.get('/api/referrals/mine'),
        api.get('/api/jobs'),
        api.get('/api/notifications'),
        api.get('/api/referrals/quota'),
        api.get('/api/rewards/mine')
      ]);
      
      setReferrals(refsRes.data);
      setJobs(jobsRes.data);
      setNotifications(notesRes.data.slice(0, 5)); // top 5
      setQuota(quotaRes.data);
      setRewards(rewRes.data);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
  };

  const filteredReferrals = referrals.filter(ref => {
    let uiStatus = 'Pending';
    if (ref.status === 'applied') uiStatus = 'Applied';
    else if (['screened'].includes(ref.status)) uiStatus = 'Screened';
    else if (['offered', 'offer_pending'].includes(ref.status)) uiStatus = 'HR Review';
    else if (ref.status === 'onboarded') uiStatus = 'Onboarded';
    
    const matchesStatus = filterStatus === 'All' || uiStatus === filterStatus;
    const matchesSearch = ref.intern_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ref.role?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const onboardedCount = referrals.filter(r => r.status === 'onboarded').length;
  const inReviewCount = referrals.filter(r => ['offered', 'offer_pending'].includes(r.status)).length;

  if (loading) {
    return <div className="animate-pulse">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back, {user?.name?.split(' ')[0] || 'Employee'} 👋</h1>
          <p className="text-slate-500 mt-1 font-medium text-sm flex items-center gap-2">
            Operations Specialist <span className="w-1 h-1 bg-slate-300 rounded-full" /> InternFlow <span className="w-1 h-1 bg-slate-300 rounded-full" /> Bangalore, IN
          </p>
        </div>
        <button 
          onClick={() => navigate('/refer')}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-200 hover:scale-[1.02] transition-transform flex items-center gap-2"
        >
          <UserPlus size={18} />
          Refer Now
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Referred" value={referrals.length} trend="" subtext="All time referrals" icon={Users} color="bg-purple-100 text-purple-600" />
        <StatsCard title="Onboarded" value={onboardedCount.toString().padStart(2, '0')} trend="" subtext="Successfully joined" icon={CheckCircle2} color="bg-emerald-100 text-emerald-600" />
        <StatsCard title="In Review" value={inReviewCount.toString().padStart(2, '0')} trend="" subtext="Awaiting HR review" icon={Clock} color="bg-amber-100 text-amber-600" />
        <StatsCard title="Reward Earned" value={`₹${rewards.total_earned.toLocaleString()}`} trend="" subtext="Total paid out" icon={Award} color="bg-blue-100 text-blue-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Refer New Intern Card */}
          <div className="bg-gradient-to-br from-purple-600 to-violet-500 rounded-2xl p-8 text-white shadow-xl shadow-purple-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 text-center md:text-left">
                <h3 className="text-2xl font-bold">Help us grow the team!</h3>
                <p className="text-purple-100 font-medium max-w-sm">
                  You have <span className="text-white font-bold">{quota.remaining} referral slots</span> remaining this month. Refer top talent and earn rewards.
                </p>
                <button 
                  onClick={() => navigate('/refer')}
                  className="px-8 py-3 bg-white text-purple-600 rounded-xl text-sm font-bold shadow-lg hover:bg-purple-50 transition-colors"
                >
                  Refer an Intern
                </button>
              </div>
              <div className="hidden md:flex w-32 h-32 bg-white/10 border border-white/20 rounded-full items-center justify-center">
                <UserPlus size={48} className="text-white/80" />
              </div>
            </div>
          </div>

          {/* Recent Referrals */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs">Recent Referrals</h3>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  {['All', 'Onboarded', 'HR Review'].map((status) => (
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
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                <input 
                  type="text" 
                  placeholder="Search referrals..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 w-full md:w-64"
                />
              </div>
            </div>
            <div className="divide-y divide-slate-50">
              {filteredReferrals.length > 0 ? filteredReferrals.slice(0, 5).map((ref) => {
                let uiStatus = 'Pending';
                let colorClass = 'bg-slate-50 text-slate-600';
                if (ref.status === 'applied') { uiStatus = 'Applied'; colorClass = 'bg-slate-50 text-slate-600'; }
                else if (['screened'].includes(ref.status)) { uiStatus = 'Screened'; colorClass = 'bg-blue-50 text-blue-600'; }
                else if (['offered', 'offer_pending'].includes(ref.status)) { uiStatus = 'HR Review'; colorClass = 'bg-amber-50 text-amber-600'; }
                else if (ref.status === 'onboarded') { uiStatus = 'Onboarded'; colorClass = 'bg-emerald-50 text-emerald-600'; }
                else if (ref.status === 'rejected') { uiStatus = 'Rejected'; colorClass = 'bg-rose-50 text-rose-600'; }

                return (
                <div key={ref.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 font-bold">
                      {getInitials(ref.intern_name)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{ref.intern_name}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{ref.role}</p>
                    </div>
                  </div>
                  <span className={cn("px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider", colorClass)}>
                    {uiStatus}
                  </span>
                </div>
              )}) : (
                <div className="p-12 text-center">
                  <p className="text-sm text-slate-400 font-medium">No referrals found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Notifications Feed */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs mb-6">Recent Activity</h3>
            <div className="space-y-6">
              {notifications.length > 0 ? notifications.map((note) => {
                let Icon = Bell;
                let colorClass = 'text-blue-500 bg-blue-50';
                if (note.type === 'referral_submitted') { Icon = UserPlus; colorClass = 'text-purple-500 bg-purple-50'; }
                if (note.type.includes('onboard')) { Icon = CheckCircle2; colorClass = 'text-emerald-500 bg-emerald-50'; }

                return (
                <div key={note.id} className="flex gap-4 group">
                  <div className={cn("w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center shrink-0 shadow-sm group-hover:border-purple-200 transition-colors", colorClass)}>
                    <Icon size={18} className={colorClass.split(' ')[0]} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{note.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{note.message}</p>
                    <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider">{new Date(note.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              )}) : (
                <p className="text-sm text-slate-400 text-center py-4">No recent activity</p>
              )}
            </div>
          </div>

          {/* Open Roles */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs mb-6">Open Roles</h3>
            <div className="space-y-4">
              {jobs.slice(0, 3).map((role) => (
                <div key={role.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-purple-200 transition-colors group">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors">{role.title}</h4>
                    <ArrowUpRight size={16} className="text-slate-400" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-3">
                    <MapPin size={12} />
                    {role.location || 'Remote'}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {role.tech_stack && role.tech_stack.slice(0, 3).map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white border border-slate-100 rounded-md text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button 
                    onClick={() => navigate('/refer')}
                    className="w-full mt-4 py-2 bg-white border border-slate-200 text-slate-600 text-[10px] font-bold rounded-lg uppercase tracking-wider hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all"
                  >
                    Refer Someone
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
