import React, { useState, useEffect, useCallback } from 'react';
import {
  UserCheck, KeyRound, Users, CheckCircle2, Circle,
  Clock, RefreshCw, Search, ChevronDown, ChevronUp,
  Mail, Briefcase, GraduationCap, Award
} from 'lucide-react';
import { cn } from '../utils/cn';
import api from '../services/api';
import toast from 'react-hot-toast';

const APP_STATUS = {
  offer_pending: { label: 'Offer Extended', cls: 'bg-purple-100 text-purple-700' },
  onboarded:     { label: 'Onboarded',      cls: 'bg-emerald-100 text-emerald-700' },
  completed:     { label: 'Completed',      cls: 'bg-teal-100 text-teal-700' },
};

const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

const AVATAR_COLORS = [
  'from-purple-600 to-violet-500',
  'from-blue-600 to-cyan-500',
  'from-emerald-600 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
];
const avatarColor = (name = '') =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const StatCard = ({ title, value, sub, icon: Icon, accent }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-col gap-3">
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

const CheckStep = ({ done, label }) => (
  <div className="flex items-center gap-2">
    {done
      ? <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
      : <Circle      size={15} className="text-slate-200 shrink-0" />}
    <span className={cn('text-xs font-medium', done ? 'text-slate-800' : 'text-slate-400')}>{label}</span>
  </div>
);

const InternRow = ({ intern }) => {
  const [open, setOpen] = useState(false);

  const steps = [
    { done: true,                       label: 'Offer Accepted' },
    { done: intern.app_status !== 'offer_pending', label: 'Onboarded' },
    { done: !!intern.credentials_issued, label: 'Credentials Issued' },
    { done: !!intern.nda_signed,         label: 'NDA Signed' },
  ];
  const doneCount = steps.filter(s => s.done).length;
  const progress  = Math.round((doneCount / steps.length) * 100);

  const statusCfg = APP_STATUS[intern.app_status] || APP_STATUS.offer_pending;

  return (
    <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm">
      {/* Row header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors text-left"
      >
        <div className={cn(
          'w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-xs font-black shrink-0',
          avatarColor(intern.name)
        )}>
          {getInitials(intern.name)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-slate-900 truncate">{intern.name}</p>
            <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0', statusCfg.cls)}>
              {statusCfg.label}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 truncate">{intern.role}{intern.department ? ` · ${intern.department}` : ''}</p>
        </div>

        {/* Progress — compact on mobile, bar on sm+ */}
        <div className="flex flex-col items-end gap-1 shrink-0 w-14 sm:w-28">
          <span className="text-xs font-bold text-slate-600">{progress}%</span>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-700',
                progress === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-purple-500 to-violet-500'
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="text-slate-300 shrink-0">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Expanded detail */}
      {open && (
        <div className="border-t border-slate-100 px-5 py-4 bg-slate-50/50 space-y-4">
          {/* Checklist */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {steps.map((s, i) => <CheckStep key={i} done={s.done} label={s.label} />)}
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="bg-white rounded-xl border border-slate-100 p-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email</p>
              <p className="text-xs font-semibold text-slate-700 truncate">{intern.email}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Work Email</p>
              <p className="text-xs font-semibold text-slate-700 truncate">
                {intern.work_email || <span className="text-slate-300">Not issued</span>}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Intern ID</p>
              <p className="text-xs font-semibold text-slate-700 truncate">
                {intern.intern_code || <span className="text-slate-300">Not issued</span>}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mentor</p>
              <p className="text-xs font-semibold text-slate-700 truncate">
                {intern.mentor_name || <span className="text-slate-300">Not assigned</span>}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Onboarded At</p>
              <p className="text-xs font-semibold text-slate-700">
                {intern.onboarded_at
                  ? new Date(intern.onboarded_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                  : <span className="text-slate-300">Pending</span>}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Credentials</p>
              <p className="text-xs font-semibold text-slate-700">
                {intern.credentials_issued_at
                  ? new Date(intern.credentials_issued_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                  : <span className="text-slate-300">Not issued</span>}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Onboarding = () => {
  const [interns, setInterns]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const { data } = await api.get('/api/onboarding');
      setInterns(data);
    } catch {
      toast.error('Failed to load onboarding data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onboardedInterns  = interns.filter(i => i.app_status === 'onboarded');
  const completedInterns  = interns.filter(i => i.app_status === 'completed');
  const offerPending      = interns.filter(i => i.app_status === 'offer_pending');
  const credIssued        = interns.filter(i => i.credentials_issued);
  const ndaSigned         = interns.filter(i => i.nda_signed);

  const credPct = interns.length > 0
    ? Math.round((credIssued.length / interns.length) * 100)
    : 0;

  const filtered = interns.filter(i => {
    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'offer_pending' && i.app_status === 'offer_pending') ||
      (filterStatus === 'onboarded'     && i.app_status === 'onboarded') ||
      (filterStatus === 'completed'     && i.app_status === 'completed');
    const q = search.toLowerCase();
    const matchSearch = !q ||
      i.name?.toLowerCase().includes(q) ||
      i.role?.toLowerCase().includes(q) ||
      i.department?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-slate-100 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-slate-100 rounded-2xl" />)}
        </div>
        <div className="h-96 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Onboarding</h1>
          <p className="text-slate-400 text-sm mt-0.5 font-medium">
            {interns.length} intern{interns.length !== 1 ? 's' : ''} in pipeline &nbsp;·&nbsp; {credIssued.length} credentials issued
          </p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-60 self-start sm:self-auto"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Onboarding"
          value={String(onboardedInterns.length).padStart(2, '0')}
          sub="Currently onboarded"
          icon={Users}
          accent="bg-purple-100 text-purple-600"
        />
        <StatCard
          title="Offer Extended"
          value={String(offerPending.length).padStart(2, '0')}
          sub="Pending acceptance"
          icon={Clock}
          accent="bg-amber-100 text-amber-600"
        />
        <StatCard
          title="Credentials Issued"
          value={String(credIssued.length).padStart(2, '0')}
          sub={`${credPct}% of total`}
          icon={KeyRound}
          accent="bg-indigo-100 text-indigo-600"
        />
        <StatCard
          title="Completed"
          value={String(completedInterns.length).padStart(2, '0')}
          sub="Internship finished"
          icon={Award}
          accent="bg-teal-100 text-teal-600"
        />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Intern list */}
        <div className="lg:col-span-2 space-y-4">

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, role or department…"
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white text-sm"
              />
            </div>
            <div className="flex bg-white border border-slate-200 rounded-xl p-1 gap-1">
              {[
                { key: 'all',          label: 'All' },
                { key: 'offer_pending', label: 'Offer' },
                { key: 'onboarded',    label: 'Onboarded' },
                { key: 'completed',    label: 'Completed' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilterStatus(key)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                    filterStatus === key
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Intern cards */}
          <div className="space-y-3">
            {filtered.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
                <UserCheck size={32} className="text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-400 font-medium">No interns match your filter.</p>
              </div>
            )}
            {filtered.map(intern => (
              <InternRow key={intern.id} intern={intern} />
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">

          {/* Checklist completion */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Completion Overview</p>
            <div className="space-y-4">
              {[
                {
                  label: 'Credentials Issued',
                  count: credIssued.length,
                  icon: KeyRound,
                  cls: 'bg-indigo-50 text-indigo-600',
                  bar: 'bg-indigo-500',
                },
                {
                  label: 'NDA Signed',
                  count: ndaSigned.length,
                  icon: CheckCircle2,
                  cls: 'bg-emerald-50 text-emerald-600',
                  bar: 'bg-emerald-500',
                },
                {
                  label: 'Onboarded',
                  count: onboardedInterns.length,
                  icon: UserCheck,
                  cls: 'bg-purple-50 text-purple-600',
                  bar: 'bg-purple-500',
                },
                {
                  label: 'Completed',
                  count: completedInterns.length,
                  icon: Award,
                  cls: 'bg-teal-50 text-teal-600',
                  bar: 'bg-teal-500',
                },
              ].map(({ label, count, icon: Icon, cls, bar }) => {
                const pct = interns.length > 0 ? Math.round((count / interns.length) * 100) : 0;
                return (
                  <div key={label} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0', cls)}>
                          <Icon size={13} />
                        </div>
                        <span className="text-xs font-semibold text-slate-700">{label}</span>
                      </div>
                      <span className="text-xs font-black text-slate-600">{count} / {interns.length}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all duration-700', bar)}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status breakdown */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Status Breakdown</p>
            <div className="space-y-2.5">
              {[
                { label: 'Offer Extended', count: offerPending.length,       cls: 'bg-purple-100 text-purple-700' },
                { label: 'Onboarded',      count: onboardedInterns.length,   cls: 'bg-emerald-100 text-emerald-700' },
                { label: 'Completed',      count: completedInterns.length,   cls: 'bg-teal-100 text-teal-700' },
              ].map(({ label, count, cls }) => (
                <div key={label} className="flex items-center justify-between px-3 py-2.5 bg-slate-50 rounded-xl">
                  <span className={cn('px-2.5 py-1 rounded-full text-[11px] font-bold', cls)}>{label}</span>
                  <span className="text-sm font-black text-slate-800">{String(count).padStart(2, '0')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Access provisioning */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Access Provisioning</p>
            <div className="space-y-3">
              {[
                { label: 'Work Email',    pct: credPct, icon: Mail,        cls: 'bg-blue-50 text-blue-600' },
                { label: 'Intern ID',     pct: credPct, icon: Briefcase,   cls: 'bg-purple-50 text-purple-600' },
                { label: 'NDA Complete',  pct: interns.length > 0 ? Math.round((ndaSigned.length / interns.length) * 100) : 0, icon: GraduationCap, cls: 'bg-emerald-50 text-emerald-600' },
              ].map(({ label, pct, icon: Icon, cls }) => (
                <div key={label} className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', cls)}>
                        <Icon size={13} />
                      </div>
                      <span className="text-xs font-semibold text-slate-700">{label}</span>
                    </div>
                    <span className="text-xs font-black text-slate-600">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-white rounded-full overflow-hidden border border-slate-100">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
