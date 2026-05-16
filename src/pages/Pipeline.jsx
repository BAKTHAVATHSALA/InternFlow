import React, { useState, useEffect } from 'react';
import { Search, Filter, LayoutGrid, List, MoreVertical, ExternalLink } from 'lucide-react';
import { cn } from '../utils/cn';
import Table from '../components/Table';
import api from '../services/api';
import toast from 'react-hot-toast';

const stages = ["applied", "screened", "offer_pending", "onboarded", "rejected"];
const displayStages = ["Applied", "Screened", "Offer", "Onboarded", "Rejected"];

const getStageColor = (stage) => {
  switch (stage?.toLowerCase()) {
    case 'applied': return 'bg-slate-100 text-slate-700';
    case 'screened': return 'bg-blue-100 text-blue-700';
    case 'offer_pending': return 'bg-purple-100 text-purple-700';
    case 'onboarded': return 'bg-emerald-100 text-emerald-700';
    case 'rejected': return 'bg-rose-100 text-rose-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

const getScoreColor = (score) => {
  if (!score) return 'bg-slate-100 text-slate-700';
  if (score >= 90) return 'bg-emerald-100 text-emerald-700';
  if (score >= 80) return 'bg-blue-100 text-blue-700';
  if (score >= 70) return 'bg-amber-100 text-amber-700';
  return 'bg-rose-100 text-rose-700';
};

const Pipeline = () => {
  const [view, setView] = useState('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStage, setFilterStage] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandidates();
  }, [filterStage, searchQuery]);

  const fetchCandidates = async () => {
    try {
      const params = {};
      if (filterStage) params.stage = filterStage;
      if (searchQuery) params.search = searchQuery;

      const response = await api.get('/api/pipeline', { params });
      setCandidates(response.data);
    } catch (err) {
      toast.error('Failed to load pipeline data');
    } finally {
      setLoading(false);
    }
  };

  const updateStage = async (id, newStage) => {
    try {
      await api.patch(`/api/pipeline/${id}/stage`, { status: newStage, hr_note: 'Updated from Pipeline Kanban' });
      toast.success(`Stage updated to ${newStage}`);
      fetchCandidates();
    } catch (err) {
      toast.error('Failed to update stage');
    }
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getDisplayStage = (status) => {
    if (status === 'applied') return 'Applied';
    if (status === 'screened') return 'Screened';
    if (status === 'offer_pending') return 'Offer';
    if (status === 'onboarded') return 'Onboarded';
    if (status === 'rejected') return 'Rejected';
    return status;
  };

  const KanbanColumn = ({ stageValue, stageDisplay }) => {
    const stageCandidates = candidates.filter(c => c.status === stageValue);
    return (
      <div className="flex flex-col gap-4 min-w-[280px] bg-slate-50/50 p-4 rounded-xl border border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-slate-700">{stageDisplay}</h3>
          <span className="bg-white px-2 py-0.5 rounded-md text-xs font-bold text-slate-400 border border-slate-200">
            {stageCandidates.length}
          </span>
        </div>
        <div className="space-y-3">
          {stageCandidates.map(candidate => (
            <div key={candidate.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm shrink-0">
                    {getInitials(candidate.intern_name)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm leading-tight truncate">{candidate.intern_name}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">{candidate.role || candidate.department}</p>
                  </div>
                </div>
                <div className="relative group">
                  <button className="text-slate-400 hover:text-slate-600">
                    <MoreVertical size={16} />
                  </button>
                  <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg border border-slate-100 hidden group-hover:block z-20">
                    <div className="py-1">
                      {stages.map(s => (
                        <button
                          key={s}
                          className="block px-4 py-2 text-xs text-slate-700 hover:bg-slate-100 w-full text-left"
                          onClick={() => updateStage(candidate.id, s)}
                        >
                          Move to {getDisplayStage(s)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">AI Score</span>
                  <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold", getScoreColor(candidate.ai_score))}>
                    {candidate.ai_score || '-'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">{new Date(candidate.applied_at || candidate.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
          {stageCandidates.length === 0 && (
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
              <p className="text-xs text-slate-400">No candidates</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Candidate Pipeline</h1>
          <p className="text-slate-500">Track and manage your potential interns</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-slate-200 rounded-lg p-1">
            <button 
              onClick={() => setView('table')}
              className={cn("flex items-center gap-2 px-3 py-1.5 rounded-md transition-all text-sm font-medium", view === 'table' ? "bg-slate-100 text-primary-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
            >
              <List size={16} />
              <span>Table</span>
            </button>
            <button 
              onClick={() => setView('kanban')}
              className={cn("flex items-center gap-2 px-3 py-1.5 rounded-md transition-all text-sm font-medium", view === 'kanban' ? "bg-slate-100 text-primary-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
            >
              <LayoutGrid size={16} />
              <span>Kanban</span>
            </button>
          </div>
          <button 
            onClick={() => alert('Pipeline exported to CSV')}
            className="btn-primary flex items-center gap-2"
          >
            <ExternalLink size={18} />
            Export
          </button>
        </div>
      </div>

      {view === 'table' ? (
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidates by name, role..." 
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              />
            </div>
            <div className="flex gap-2">
              <select 
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Stages</option>
                {stages.map((s, i) => <option key={s} value={s}>{displayStages[i]}</option>)}
              </select>
              <button 
                onClick={() => alert('Advanced filters opened')}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg bg-white text-sm hover:bg-slate-50 text-slate-600"
              >
                <Filter size={16} />
                Filters
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500">Loading candidates...</div>
          ) : (
            <Table 
              headers={["Candidate", "Department", "Referred By", "AI Score", "Stage", "Date", "Action"]}
            >
              {candidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs shrink-0">
                        {getInitials(candidate.intern_name)}
                      </div>
                      <div>
                        <span className="font-medium text-slate-900 block">{candidate.intern_name}</span>
                        <span className="text-[10px] text-slate-400">{candidate.role}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{candidate.department || '-'}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{candidate.referred_by_name || 'Self/Other'}</td>
                  <td className="px-6 py-4">
                    <div className="flex">
                      <span className={cn("px-2.5 py-1 rounded-full text-xs font-bold", getScoreColor(candidate.ai_score))}>
                        {candidate.ai_score || '-'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", getStageColor(candidate.status))}>
                      {getDisplayStage(candidate.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{new Date(candidate.applied_at || candidate.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative group inline-block">
                      <button className="text-primary-600 hover:text-primary-700 font-semibold text-sm">
                        Action
                      </button>
                      <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg border border-slate-100 hidden group-hover:block z-20 text-left">
                        <div className="py-1">
                          {stages.map(s => (
                            <button
                              key={s}
                              className="block px-4 py-2 text-xs text-slate-700 hover:bg-slate-100 w-full text-left"
                              onClick={() => updateStage(candidate.id, s)}
                            >
                              Move to {getDisplayStage(s)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {candidates.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No candidates found.
                  </td>
                </tr>
              )}
            </Table>
          )}
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-4 items-start">
          {stages.map((stage, i) => (
            <KanbanColumn key={stage} stageValue={stage} stageDisplay={displayStages[i]} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Pipeline;
