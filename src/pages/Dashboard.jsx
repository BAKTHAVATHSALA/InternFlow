import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, CheckCircle2, Clock, Zap, TrendingUp, GitBranch,
  Bell, UserPlus, Code, XCircle, Award, ArrowRight, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PipelineLineChart, DeptDonutChart, MonthlyBarChart } from '../components/Charts';
import api from '../services/api';
import toast from 'react-hot-toast';
import { cn } from '../utils/cn';
import { useAuth } from '../contexts/AuthContext';

const StatCard = ({ title, value, sub, icon: Icon, accent, onClick }) => (
  <div
    onClick={onClick}
    className={cn(
      'bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-col gap-3',
      onClick && 'cursor-pointer hover:shadow-md hover:border-slate-200 transition-all'
    )}
  >
    <div className="flex items-center justify-between">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</span>
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', accent)}>
        <Icon size={16} />
      </div>
    </div>
    <div>
      <p className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1.5 font-medium">{sub}</p>}
    </div>
  </div>
);

const ACTIVITY_CONFIG = {
  referral_submitted:  { Icon: UserPlus,     cls: 'bg-purple-50 text-purple-600' },
  offer_extended:      { Icon: CheckCircle2, cls: 'bg-emerald-50 text-emerald-600' },
  stage_changed:       { Icon: GitBranch,    cls: 'bg-blue-50 text-blue-600' },
  reward_credited:     { Icon: Award,        cls: 'bg-amber-50 text-amber-600' },
  application_rejected:{ Icon: XCircle,      cls: 'bg-rose-50 text-rose-600' },
};

const getActivityCfg = (type = '') => {
  for (const [key, cfg] of Object.entries(ACTIVITY_CONFIG)) {
    if (type.includes(key.split('_')[0])) return cfg;
  }
  return { Icon: Bell, cls: 'bg-slate-100 text-slate-500' };
};

const STATUS_LABEL = {
  applied:       { label: 'Applied',        cls: 'bg-slate-100 text-slate-600' },
  screened:      { label: 'AI Screened',    cls: 'bg-blue-100 text-blue-700' },
  offer_pending: { label: 'Offer Extended', cls: 'bg-purple-100 text-purple-700' },
  onboarded:     { label: 'Onboarded',      cls: 'bg-emerald-100 text-emerald-700' },
  completed:     { label: 'Completed',      cls: 'bg-teal-100 text-teal-700' },
  rejected:      { label: 'Rejected',       cls: 'bg-rose-100 text-rose-700' },
};

const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stats, setStats]               = useState(null);
  const [pipeline, setPipeline]         = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [statsRes, pipeRes, notifRes] = await Promise.all([
        api.get('/api/dashboard/hr'),
        api.get('/api/pipeline'),
        api.get('/api/notifications'),
      ]);
      setStats(statsRes.data);
      setPipeline(pipeRes.data);
      setNotifications(notifRes.data.slice(0, 6));
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-slate-100 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-slate-100 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-slate-100 rounded-2xl" />
          <div className="h-72 bg-slate-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  const onboardedTotal   = Number(stats?.onboarded_count  ?? 0);
  const pendingReview    = Number(stats?.pending_review    ?? 0);
  const offerPending     = Number(stats?.offer_pending     ?? 0);
  const avgScore         = Number(stats?.avg_ai_score      ?? 0);
  const totalApps        = Number(stats?.total_applications ?? 0);
  const rejectedCount    = Number(stats?.rejected_count    ?? 0);
  const completedCount   = Number(stats?.completed_count   ?? 0);
  const activeInterns    = Number(stats?.active_interns    ?? 0);

  const conversionRate = totalApps > 0
    ? ((onboardedTotal / totalApps) * 100).toFixed(1)
    : '0.0';

  const recentPipeline = [...pipeline]
    .sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at))
    .slice(0, 5);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            HR Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-0.5 font-medium">
            Welcome back, {user?.name?.split(' ')[0] || 'HR'} &nbsp;·&nbsp;{' '}
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-60"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={() => navigate('/pipeline')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-100 hover:scale-[1.02] transition-transform"
          >
            <GitBranch size={14} />
            View Pipeline
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Onboarded"
          value={String(onboardedTotal).padStart(2, '0')}
          sub={`${activeInterns} active · ${completedCount} completed`}
          icon={CheckCircle2}
          accent="bg-emerald-100 text-emerald-600"
          onClick={() => navigate('/pipeline')}
        />
        <StatCard
          title="Pending Review"
          value={String(pendingReview).padStart(2, '0')}
          sub="Applied + AI screened"
          icon={Clock}
          accent="bg-amber-100 text-amber-600"
          onClick={() => navigate('/pipeline')}
        />
        <StatCard
          title="Offer Extended"
          value={String(offerPending).padStart(2, '0')}
          sub="Awaiting acceptance"
          icon={Users}
          accent="bg-purple-100 text-purple-600"
          onClick={() => navigate('/pipeline')}
        />
        <StatCard
          title="Avg AI Score"
          value={avgScore ? `${avgScore}` : '—'}
          sub={`${conversionRate}% conversion rate`}
          icon={Zap}
          accent="bg-blue-100 text-blue-600"
        />
      </div>

      {/* Secondary row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center shrink-0">
            <TrendingUp size={20} className="text-teal-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Completed</p>
            <p className="text-2xl font-black text-slate-900">{String(completedCount).padStart(2, '0')}</p>
            <p className="text-xs text-slate-400 mt-0.5">Internships finished</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0">
            <XCircle size={20} className="text-rose-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rejected</p>
            <p className="text-2xl font-black text-slate-900">{String(rejectedCount).padStart(2, '0')}</p>
            <p className="text-xs text-slate-400 mt-0.5">Not moving forward</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
            <Users size={20} className="text-slate-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Applications</p>
            <p className="text-2xl font-black text-slate-900">{totalApps}</p>
            <p className="text-xs text-slate-400 mt-0.5">All time</p>
          </div>
        </div>
      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Pipeline Funnel</p>
            <PipelineLineChart data={pipeline} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Department Distribution</p>
              <DeptDonutChart data={pipeline} />
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Onboarding vs Closures</p>
              <MonthlyBarChart data={pipeline} />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">

          {/* Recent Candidates */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent Candidates</p>
              <button
                onClick={() => navigate('/pipeline')}
                className="flex items-center gap-1 text-xs text-purple-600 font-bold hover:underline"
              >
                View all <ArrowRight size={12} />
              </button>
            </div>
            <div className="divide-y divide-slate-50">
              {recentPipeline.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-8">No candidates yet</p>
              )}
              {recentPipeline.map(c => {
                const cfg = STATUS_LABEL[c.status] || { label: c.status, cls: 'bg-slate-100 text-slate-600' };
                return (
                  <div
                    key={c.application_id}
                    onClick={() => navigate('/pipeline')}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-violet-500 flex items-center justify-center text-white text-[10px] font-black shrink-0">
                      {getInitials(c.intern_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{c.intern_name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{c.role}</p>
                    </div>
                    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0', cfg.cls)}>
                      {cfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent Activity</p>
              <button
                onClick={() => navigate('/audit')}
                className="flex items-center gap-1 text-xs text-purple-600 font-bold hover:underline"
              >
                Audit log <ArrowRight size={12} />
              </button>
            </div>
            <div className="space-y-4">
              {notifications.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">No recent activity</p>
              )}
              {notifications.map(item => {
                const { Icon, cls } = getActivityCfg(item.type);
                return (
                  <div key={item.id} className="flex gap-3">
                    <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0', cls)}>
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 leading-tight">{item.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed line-clamp-2">{item.message}</p>
                      <p className="text-[10px] text-slate-300 mt-1 font-medium">
                        {new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                        {' · '}
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
