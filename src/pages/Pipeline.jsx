import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, LayoutGrid, List, ExternalLink, Eye } from 'lucide-react';
import { cn } from '../utils/cn';
import Table from '../components/Table';
import api from '../services/api';
import toast from 'react-hot-toast';
import CandidateDrawer from '../components/pipeline/CandidateDrawer';

const stages        = ['applied', 'screened', 'offer_pending', 'onboarded', 'completed', 'rejected'];
const displayStages = ['Applied', 'Screened', 'Offer Extended', 'Onboarded', 'Completed', 'Rejected'];

const getStageColor = (stage) => {
  switch (stage?.toLowerCase()) {
    case 'applied':       return 'bg-slate-100 text-slate-700';
    case 'screened':      return 'bg-blue-100 text-blue-700';
    case 'offer_pending': return 'bg-purple-100 text-purple-700';
    case 'onboarded':     return 'bg-emerald-100 text-emerald-700';
    case 'completed':     return 'bg-teal-100 text-teal-700';
    case 'rejected':      return 'bg-rose-100 text-rose-700';
    default:              return 'bg-slate-100 text-slate-700';
  }
};

const getScoreColor = (score) => {
  if (!score) return 'bg-slate-100 text-slate-700';
  if (score >= 85) return 'bg-emerald-100 text-emerald-700';
  if (score >= 70) return 'bg-blue-100 text-blue-700';
  if (score >= 55) return 'bg-amber-100 text-amber-700';
  return 'bg-rose-100 text-rose-700';
};

const getDisplayStage = (status) => {
  const map = { applied: 'Applied', screened: 'Screened', offer_pending: 'Offer Extended', onboarded: 'Onboarded', completed: 'Completed', rejected: 'Rejected' };
  return map[status] || status;
};

const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

const Pipeline = () => {
  const [view, setView]               = useState('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStage, setFilterStage] = useState('');
  const [candidates, setCandidates]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeId, setActiveId]       = useState(null);

  const fetchCandidates = useCallback(async () => {
    try {
      const { data } = await api.get('/api/pipeline');
      setCandidates(data);
    } catch {
      toast.error('Failed to load pipeline data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCandidates(); }, [fetchCandidates]);

  const filtered = candidates.filter(c => {
    const matchStage = !filterStage || c.status === filterStage;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q ||
      c.intern_name?.toLowerCase().includes(q) ||
      c.role?.toLowerCase().includes(q) ||
      c.intern_email?.toLowerCase().includes(q);
    return matchStage && matchSearch;
  });

  // Kanban column
  const KanbanColumn = ({ stageValue, stageDisplay }) => {
    const items = filtered.filter(c => c.status === stageValue);
    return (
      <div className="flex flex-col gap-3 min-w-[220px] sm:min-w-[260px] snap-start bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-700 text-sm">{stageDisplay}</h3>
          <span className="bg-white px-2 py-0.5 rounded-md text-xs font-bold text-slate-400 border border-slate-200">{items.length}</span>
        </div>
        <div className="space-y-2.5">
          {items.map(c => (
            <div
              key={c.application_id}
              onClick={() => setActiveId(c.application_id)}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-violet-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {getInitials(c.intern_name)}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm leading-tight truncate">{c.intern_name}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 truncate">{c.role}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold', getScoreColor(c.ai_score))}>
                  {c.ai_score ? `${c.ai_score}/100` : 'No score'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {c.applied_at ? new Date(c.applied_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'}
                </span>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
              <p className="text-xs text-slate-400">No candidates</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Candidate Pipeline</h1>
          <p className="text-slate-400 text-sm mt-0.5 font-medium">
            {candidates.length} candidates &nbsp;·&nbsp; {candidates.filter(c => c.status === 'screened').length} pending review
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-white border border-slate-200 rounded-xl p-1">
            <button
              onClick={() => setView('table')}
              className={cn('flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm font-medium', view === 'table' ? 'bg-slate-100 text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700')}
            >
              <List size={16} /> <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => setView('kanban')}
              className={cn('flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm font-medium', view === 'kanban' ? 'bg-slate-100 text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700')}
            >
              <LayoutGrid size={16} /> <span className="hidden sm:inline">Kanban</span>
            </button>
          </div>
          <button
            onClick={() => alert('Pipeline exported to CSV')}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <ExternalLink size={16} /> <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, role or email…"
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white text-sm"
          />
        </div>
        <select
          value={filterStage}
          onChange={e => setFilterStage(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 min-w-[150px]"
        >
          <option value="">All Stages</option>
          {stages.map((s, i) => <option key={s} value={s}>{displayStages[i]}</option>)}
        </select>
      </div>

      {/* Table View */}
      {view === 'table' && (
        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">Loading candidates…</div>
          ) : (
            <>
              {/* Desktop table — hidden on mobile */}
              <div className="hidden md:block">
                <Table headers={['Candidate', 'Department', 'Referred By', 'AI Score', 'Stage', 'Applied', 'View']}>
                  {filtered.map(c => (
                    <tr key={c.application_id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-violet-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {getInitials(c.intern_name)}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block text-sm">{c.intern_name}</span>
                            <span className="text-[11px] text-slate-400">{c.role}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{c.department || '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{c.referred_by || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={cn('px-2.5 py-1 rounded-full text-xs font-bold', getScoreColor(c.ai_score))}>
                          {c.ai_score ?? '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', getStageColor(c.status))}>
                          {getDisplayStage(c.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {c.applied_at ? new Date(c.applied_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setActiveId(c.application_id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-purple-600 bg-purple-50 border border-purple-100 rounded-lg hover:bg-purple-100 transition-colors"
                        >
                          <Eye size={13} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-400">
                        No candidates found.
                      </td>
                    </tr>
                  )}
                </Table>
              </div>

              {/* Mobile card list — shown only on small screens */}
              <div className="md:hidden divide-y divide-slate-50">
                {filtered.length === 0 ? (
                  <p className="px-4 py-10 text-center text-sm text-slate-400">No candidates found.</p>
                ) : filtered.map(c => (
                  <div key={c.application_id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-violet-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                      {getInitials(c.intern_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{c.intern_name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{c.role}{c.department ? ` · ${c.department}` : ''}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold', getStageColor(c.status))}>
                          {getDisplayStage(c.status)}
                        </span>
                        {c.ai_score && (
                          <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold', getScoreColor(c.ai_score))}>
                            {c.ai_score}/100
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveId(c.application_id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-purple-600 bg-purple-50 border border-purple-100 rounded-lg hover:bg-purple-100 transition-colors shrink-0"
                    >
                      <Eye size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Kanban View */}
      {view === 'kanban' && (
        <div className="scroll-x-snap flex gap-3 sm:gap-4 pb-4 items-start -mx-3 px-3 sm:mx-0 sm:px-0">
          {stages.map((stage, i) => (
            <KanbanColumn key={stage} stageValue={stage} stageDisplay={displayStages[i]} />
          ))}
        </div>
      )}

      {/* Candidate Drawer */}
      {activeId && (
        <CandidateDrawer
          applicationId={activeId}
          onClose={() => setActiveId(null)}
          onStatusChange={() => {
            fetchCandidates();
            setActiveId(null);
          }}
        />
      )}
    </div>
  );
};

export default Pipeline;
