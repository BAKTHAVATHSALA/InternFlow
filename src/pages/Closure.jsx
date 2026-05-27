import React, { useState, useEffect } from 'react';
import { 
  Star, 
  CheckCircle2, 
  Clock, 
  Send, 
  ShieldCheck, 
  UserCheck, 
  FileCheck, 
  Archive, 
  ClipboardCheck,
  Package,
  UserPlus
} from 'lucide-react';
import { cn } from '../utils/cn';
import Table from '../components/Table';
import api from '../services/api';
import toast from 'react-hot-toast';

const checklistItems = [
  { icon: FileCheck, label: "Final performance review completed", status: "completed" },
  { icon: Send, label: "Exit survey sent and completed", status: "completed" },
  { icon: ShieldCheck, label: "Access revoked (GitHub, Slack, Notion, Email)", status: "completed" },
  { icon: ClipboardCheck, label: "Payroll/stipend finalized", status: "completed" },
  { icon: Archive, label: "Intern record archived", status: "completed" },
  { icon: UserCheck, label: "Return offer decision documented", status: "completed" },
  { icon: Package, label: "Equipment return confirmed", status: "pending" },
  { icon: UserPlus, label: "Manager sign-off received", status: "pending" },
  { icon: Clock, label: "NDA reminder sent post-closure", status: "pending" },
];

const Closure = () => {
  const [closures, setClosures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClosures();
  }, []);

  const fetchClosures = async () => {
    try {
      // Assuming GET /api/pipeline also fetches closed applications if we filter, or we use /api/closure
      // For richer data we'll use pipeline and filter, but let's try /api/closure first and merge if needed.
      // Actually we'll just hit /api/pipeline with no stage filter and manually filter for closed or survey_completed.
      const response = await api.get('/api/pipeline');
      const allData = response.data;
      const closedData = allData.filter(c => ['closed', 'survey_completed', 'closure_pending'].includes(c.status));
      setClosures(closedData);
    } catch (err) {
      toast.error('Failed to load closure data');
    } finally {
      setLoading(false);
    }
  };

  const sendSurvey = async (internId) => {
    try {
      await api.post('/api/closure/exit-survey', { intern_id: internId });
      toast.success('Exit survey sent');
      fetchClosures();
    } catch (err) {
      toast.error('Failed to send survey');
    }
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const totalClosed = closures.length;
  const returnOffers = closures.filter(c => c.hr_note?.toLowerCase().includes('return offer')).length; // Just a guess for return offers based on hr_note
  const avgRating = closures.reduce((acc, curr) => acc + (parseFloat(curr.ai_score) || 0), 0) / (totalClosed || 1); // using ai_score as proxy if exit rating isn't present
  const surveySent = closures.filter(c => c.status === 'survey_completed').length;
  
  const closureStats = [
    { label: "Total Closed", value: totalClosed.toString() },
    { label: "Return Offers", value: returnOffers.toString() },
    { label: "Avg Rating", value: (avgRating/20).toFixed(1), sub: "out of 5" }, // Scale AI score (out of 100) to out of 5
    { label: "Exit Survey Rate", value: `${Math.round((surveySent/(totalClosed||1))*100)}%` },
  ];

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-slate-200 rounded-lg w-56" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-20 bg-slate-200 rounded-xl" />)}
      </div>
      <div className="h-64 bg-slate-200 rounded-xl" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Internship Closure</h1>
          <p className="text-slate-400 text-sm mt-0.5 font-medium">Manage offboarding and closure activities</p>
        </div>
        <button
          onClick={() => {
            closures.filter(c => c.status !== 'survey_completed').forEach(c => sendSurvey(c.intern_id));
            toast.success('Sent to all eligible interns');
          }}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto"
        >
          <Send size={18} />
          Send Exit Survey
        </button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {closureStats.map((stat, i) => (
          <div key={i} className="card p-4">
            <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              {stat.sub && <span className="text-xs text-slate-400">{stat.sub}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Closed Internships Table */}
      <div className="card overflow-hidden">
        <div className="p-5 md:p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Closed Internships</h3>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {closures.length === 0 ? (
            <p className="px-5 py-10 text-center text-slate-500 text-sm">No closed internships found.</p>
          ) : closures.map((intern) => (
            <div key={intern.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs shrink-0">
                    {getInitials(intern.intern_name)}
                  </div>
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-900 block truncate">{intern.intern_name}</span>
                    <span className="text-[10px] text-slate-500">{intern.role}</span>
                  </div>
                </div>
                <span className={cn(
                  "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase shrink-0",
                  intern.status === 'survey_completed' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                )}>
                  {intern.status.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
                <span>{intern.department || '-'}</span>
                <span>{new Date(intern.updated_at || intern.created_at).toLocaleDateString()}</span>
                <div className="flex items-center gap-1">
                  <Star size={12} fill="#fbbf24" className="text-amber-400" />
                  <span className="font-semibold text-slate-700">{((intern.ai_score || 80)/20).toFixed(1)}</span>
                </div>
                {intern.status === 'survey_completed' ? (
                  <span className="font-bold text-emerald-600">Survey Done</span>
                ) : (
                  <button
                    onClick={() => sendSurvey(intern.intern_id)}
                    className="flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-600 rounded-lg text-[10px] font-bold"
                  >
                    <Send size={12} /> Send Survey
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block">
          <Table
            headers={["Intern", "Department", "End Date", "Rating", "Exit Survey", "Status"]}
          >
            {closures.map((intern) => (
              <tr key={intern.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs shrink-0">
                      {getInitials(intern.intern_name)}
                    </div>
                    <div>
                      <span className="font-medium text-slate-900 block">{intern.intern_name}</span>
                      <span className="text-[10px] text-slate-500 block">{intern.role}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{intern.department || '-'}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{new Date(intern.updated_at || intern.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    <Star size={14} fill="#fbbf24" className="text-amber-400" />
                    <span className="text-sm font-semibold text-slate-700">{((intern.ai_score || 80)/20).toFixed(1)}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {intern.status === 'survey_completed' ? (
                    <span className="text-xs font-bold text-emerald-600">Completed</span>
                  ) : (
                    <button
                      onClick={() => sendSurvey(intern.intern_id)}
                      className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <Send size={16} />
                    </button>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase",
                    intern.status === 'survey_completed' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  )}>
                    {intern.status.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
            {closures.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  No closed internships found.
                </td>
              </tr>
            )}
          </Table>
        </div>
      </div>

      {/* Closure Checklist Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800">Closure Checklist</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {checklistItems.map((item, i) => (
            <div 
              key={i} 
              className={cn(
                "p-4 rounded-xl border flex items-center gap-4 transition-all",
                item.status === 'completed' 
                  ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                  : "bg-amber-50 border-amber-100 text-amber-700"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                item.status === 'completed' ? "bg-emerald-100" : "bg-amber-100"
              )}>
                <item.icon size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold leading-tight">{item.label}</p>
                <p className="text-[10px] mt-1 font-bold uppercase tracking-wider opacity-70">
                  {item.status}
                </p>
              </div>
              {item.status === 'completed' && <CheckCircle2 size={18} className="text-emerald-600" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Closure;
