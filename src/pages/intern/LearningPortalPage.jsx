import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle2, PlayCircle, FileText, ArrowRight, Clock, Award } from 'lucide-react';
import { cn } from '../../utils/cn';
import api from '../../services/api';
import toast from 'react-hot-toast';

const LearningPortalPage = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const response = await api.get('/api/lms/modules');
      setModules(response.data);
    } catch (err) {
      toast.error('Failed to load LMS modules');
    } finally {
      setLoading(false);
    }
  };

  const markComplete = async (id) => {
    try {
      await api.patch(`/api/lms/modules/${id}/complete`);
      toast.success('Module marked as complete');
      fetchModules(); // Refresh
    } catch (err) {
      toast.error('Failed to complete module');
    }
  };

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-slate-200 rounded-lg w-48" />
      <div className="h-32 bg-slate-200 rounded-2xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="h-64 bg-slate-200 rounded-2xl" />)}
      </div>
    </div>
  );

  const completedCount = modules.filter(m => m.completed).length;
  const totalCount = modules.length || 1; // Prevent div by zero
  const progressPct = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Learning Portal</h1>
        <p className="text-slate-500 mt-1 font-medium">Complete all {totalCount} resources before submitting your project</p>
      </div>

      {/* Overall Completion Card */}
      <div className="bg-gradient-to-br from-purple-600 to-violet-500 rounded-2xl md:rounded-3xl p-6 md:p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
          <div className="space-y-3 md:space-y-4 text-center md:text-left">
            <h3 className="text-lg md:text-2xl font-bold uppercase tracking-widest text-purple-100">Overall Completion</h3>
            <div className="space-y-2">
              <div className="text-4xl md:text-6xl font-black">{completedCount} / {modules.length}</div>
              <p className="text-purple-100 font-medium">Resources successfully completed</p>
            </div>
          </div>
          <div className="w-full md:w-1/2 space-y-4">
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-purple-200">
              <span>Progress</span>
              <span>{progressPct}%</span>
            </div>
            <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden border border-white/10">
              <div className="h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.4)]" style={{ width: `${progressPct}%` }} />
            </div>
            <p className="text-[10px] text-purple-200 font-bold uppercase tracking-[0.2em] text-center md:text-left">
              {completedCount === totalCount ? 'All modules completed!' : 'Almost there! Complete the remaining modules.'}
            </p>
          </div>
        </div>
      </div>

      {/* Sections */}
      {[
        { key: 'compliance', label: 'Company Compliance', subtitle: 'Mandatory for all Hexaware interns', accent: 'text-rose-600', dot: 'bg-rose-500' },
        { key: 'role',       label: 'Role-Specific Training', subtitle: 'Tailored to your internship track', accent: 'text-purple-600', dot: 'bg-purple-500' },
      ].map(section => {
        const sectionModules = modules.filter(m => m.category === section.key);
        if (!sectionModules.length) return null;
        return (
          <div key={section.key} className="space-y-4">
            <div className="flex items-center gap-3">
              <span className={cn('w-2 h-2 rounded-full', section.dot)} />
              <div>
                <h2 className={cn('text-sm font-black uppercase tracking-widest', section.accent)}>{section.label}</h2>
                <p className="text-xs text-slate-400 font-medium">{section.subtitle}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {sectionModules.map((res) => {
                let Icon = FileText;
                let colorClass = 'text-blue-500';
                let bgClass = 'bg-blue-50';
                if (res.type?.toLowerCase() === 'video')  { Icon = PlayCircle; colorClass = 'text-purple-500'; bgClass = 'bg-purple-50'; }
                if (res.type?.toLowerCase() === 'course') { Icon = BookOpen;   colorClass = 'text-emerald-500'; bgClass = 'bg-emerald-50'; }
                const resProgress = res.completed ? 100 : (res.progress_pct || 0);

                return (
                  <div key={res.id} className="bg-white rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm p-5 md:p-8 flex flex-col hover:border-purple-200 transition-all group">
                    <div className="flex justify-between items-start mb-5 md:mb-8">
                      <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm', bgClass, colorClass)}>
                        <Icon size={28} className="group-hover:scale-110 transition-transform" />
                      </div>
                      <span className={cn(
                        'px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest',
                        res.completed ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      )}>
                        {res.completed ? 'Completed' : 'Pending'}
                      </span>
                    </div>

                    <div className="space-y-1 mb-5 md:mb-8">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{res.type} · {res.duration_minutes} min</p>
                      <h4 className="text-lg font-bold text-slate-900 group-hover:text-purple-600 transition-colors leading-tight">{res.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2">{res.description}</p>
                    </div>

                    <div className="mt-auto space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <span>Progress</span>
                          <span className={cn(res.completed ? 'text-emerald-500' : 'text-purple-600')}>{resProgress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                          <div className={cn('h-full rounded-full transition-all duration-1000', res.completed ? 'bg-emerald-500' : 'bg-purple-600')} style={{ width: `${resProgress}%` }} />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {!res.completed && (
                          <button
                            onClick={() => markComplete(res.id)}
                            className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 bg-slate-50 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                          >
                            <CheckCircle2 size={16} /> Mark Done
                          </button>
                        )}
                        <button
                          onClick={() => window.open(res.content_url || '#', '_blank')}
                          className={cn(
                            'flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2',
                            res.completed
                              ? 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                              : 'bg-white border border-slate-200 text-purple-600 hover:bg-purple-600 hover:text-white hover:border-purple-600 shadow-lg shadow-transparent hover:shadow-purple-100'
                          )}
                        >
                          {res.completed ? 'Review' : 'Start'} <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {modules.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          No learning modules assigned yet.
        </div>
      )}
    </div>
  );
};

export default LearningPortalPage;
