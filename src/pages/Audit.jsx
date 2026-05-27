import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Download, Activity, Users, Shield, Zap,
  RefreshCw, ChevronLeft, ChevronRight, AlertTriangle
} from 'lucide-react';
import { cn } from '../utils/cn';
import api from '../services/api';
import toast from 'react-hot-toast';

const ACTION_CFG = {
  OFFER_EXTENDED:        { cls: 'bg-emerald-100 text-emerald-700' },
  CREDENTIALS_ISSUED:    { cls: 'bg-indigo-100 text-indigo-700'  },
  PPO_OFFERED:           { cls: 'bg-teal-100   text-teal-700'    },
  STAGE_CHANGED:         { cls: 'bg-blue-100   text-blue-700'    },
  APPLICATION_REJECTED:  { cls: 'bg-rose-100   text-rose-700'    },
  REFERRAL_SUBMITTED:    { cls: 'bg-purple-100 text-purple-700'  },
  APPLICATION_SUBMITTED: { cls: 'bg-slate-100  text-slate-600'   },
};

const getActionCls = (action = '') => {
  for (const [key, cfg] of Object.entries(ACTION_CFG)) {
    if (action.toUpperCase().includes(key.split('_')[0])) return cfg.cls;
  }
  return 'bg-slate-100 text-slate-600';
};

const MODULE_COLORS = {
  Pipeline:   'bg-purple-50  text-purple-600',
  Onboarding: 'bg-emerald-50 text-emerald-600',
  Referrals:  'bg-amber-50   text-amber-600',
  Closure:    'bg-rose-50    text-rose-600',
  Settings:   'bg-slate-100  text-slate-600',
};

const getModuleCls = (module = '') =>
  MODULE_COLORS[module] || 'bg-slate-100 text-slate-500';

const StatCard = ({ title, value, sub, icon: Icon, accent }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</span>
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', accent)}>
        <Icon size={16} />
      </div>
    </div>
    <div>
      <p className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">{value ?? '—'}</p>
      {sub && <p className="text-xs text-slate-400 mt-1.5 font-medium">{sub}</p>}
    </div>
  </div>
);

const MODULES = ['Pipeline', 'Onboarding', 'Referrals', 'Closure', 'Settings'];
const PAGE_SIZE = 25;

const Audit = () => {
  const [stats, setStats]         = useState(null);
  const [logs, setLogs]           = useState([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [search, setSearch]       = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterModule, setFilterModule] = useState('');
  const [exporting, setExporting] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [debouncedSearch, filterModule]);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/api/audit-trail/stats');
      setStats(data);
    } catch {
      // non-fatal
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchLogs = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: PAGE_SIZE });
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (filterModule)    params.set('module', filterModule);
      const { data } = await api.get(`/api/audit-trail?${params}`);
      setLogs(data.rows ?? []);
      setTotal(data.total ?? 0);
    } catch {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, debouncedSearch, filterModule]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await api.get('/api/audit-trail/export', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a   = document.createElement('a');
      a.href    = url;
      a.download = `audit_trail_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleRefresh = () => {
    fetchStats();
    fetchLogs(true);
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Audit Trail</h1>
          <p className="text-slate-400 text-sm mt-0.5 font-medium">
            Immutable record of all system and user actions
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-60"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-100 hover:scale-[1.02] transition-transform disabled:opacity-60"
          >
            <Download size={14} />
            {exporting ? 'Exporting…' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Events"
          value={statsLoading ? '…' : Number(stats?.total_events ?? 0).toLocaleString()}
          sub="All time"
          icon={Activity}
          accent="bg-slate-100 text-slate-600"
        />
        <StatCard
          title="Today's Events"
          value={statsLoading ? '…' : Number(stats?.today_events ?? 0).toLocaleString()}
          sub={new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          icon={Zap}
          accent="bg-purple-100 text-purple-600"
        />
        <StatCard
          title="Human Actions"
          value={statsLoading ? '…' : Number(stats?.human_actions ?? 0).toLocaleString()}
          sub="HR / Admin"
          icon={Shield}
          accent="bg-emerald-100 text-emerald-600"
        />
        <StatCard
          title="Unique Users"
          value={statsLoading ? '…' : Number(stats?.unique_users ?? 0).toLocaleString()}
          sub="Distinct actors"
          icon={Users}
          accent="bg-blue-100 text-blue-600"
        />
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by user, action, module…"
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 bg-slate-50 text-sm"
            />
          </div>
          <select
            value={filterModule}
            onChange={e => setFilterModule(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 min-w-[150px]"
          >
            <option value="">All Modules</option>
            {MODULES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-0 divide-y divide-slate-50">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
                <div className="h-3 w-32 bg-slate-100 rounded" />
                <div className="h-3 w-24 bg-slate-100 rounded" />
                <div className="h-5 w-28 bg-slate-100 rounded-full" />
                <div className="h-3 w-20 bg-slate-100 rounded ml-auto" />
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertTriangle size={32} className="text-slate-200 mb-3" />
            <p className="text-sm text-slate-400 font-medium">No audit events found.</p>
            {(search || filterModule) && (
              <button
                onClick={() => { setSearch(''); setFilterModule(''); }}
                className="mt-3 text-xs text-purple-600 font-bold hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    {['Timestamp', 'User', 'Role', 'Action', 'Module', 'Entity'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="px-5 py-3.5 text-xs text-slate-400 font-mono whitespace-nowrap">
                        {new Date(log.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        <span className="text-slate-300 mx-1">·</span>
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-600 to-violet-500 flex items-center justify-center text-[9px] font-black text-white shrink-0">
                            {(log.user_email || 'S')[0].toUpperCase()}
                          </div>
                          <span className="text-xs font-semibold text-slate-800 truncate max-w-[140px]">
                            {log.user_email || 'System'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-medium text-slate-500 capitalize">
                          {log.user_role || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn(
                          'px-2.5 py-1 rounded-full text-[10px] font-bold tracking-tight whitespace-nowrap',
                          getActionCls(log.action)
                        )}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {log.module ? (
                          <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-bold', getModuleCls(log.module))}>
                            {log.module}
                          </span>
                        ) : <span className="text-slate-300 text-xs">—</span>}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500 font-mono">
                        {log.entity_id || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="md:hidden divide-y divide-slate-50">
              {logs.map(log => (
                <div key={log.id} className="px-4 py-3.5 space-y-2 hover:bg-slate-50/60">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-600 to-violet-500 flex items-center justify-center text-[9px] font-black text-white shrink-0">
                        {(log.user_email || 'S')[0].toUpperCase()}
                      </div>
                      <span className="text-xs font-semibold text-slate-800 truncate">{log.user_email || 'System'}</span>
                    </div>
                    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap shrink-0', getActionCls(log.action))}>
                      {log.action}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(log.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                      {' '}
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {log.module && (
                      <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold', getModuleCls(log.module))}>
                        {log.module}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 capitalize">{log.user_role || ''}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        <div className="px-4 md:px-5 py-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-400 font-medium">
            {total === 0 ? 'No events' : `${((page - 1) * PAGE_SIZE) + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total.toLocaleString()}`}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                let p;
                if (totalPages <= 3) p = i + 1;
                else if (page <= 2) p = i + 1;
                else if (page >= totalPages - 1) p = totalPages - 2 + i;
                else p = page - 1 + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn(
                      'w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors',
                      page === p
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'border border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                    )}
                  >
                    {p}
                  </button>
                );
              })}
              {totalPages > 3 && page < totalPages - 1 && (
                <span className="w-8 h-8 flex items-center justify-center text-slate-400 text-xs">…</span>
              )}
              {totalPages > 3 && page < totalPages - 1 && (
                <button
                  onClick={() => setPage(totalPages)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  {totalPages}
                </button>
              )}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Audit;
