import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  BookOpen, 
  Briefcase, 
  Users, 
  ShieldCheck, 
  Award,
  Clock,
  Calendar,
  Zap,
  ArrowUpRight,
  MessageSquare,
  PlayCircle
} from 'lucide-react';
import StatsCard from '../../components/StatsCard';
import { cn } from '../../utils/cn';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const ProgressNode = ({ label, step, currentStep, status }) => {
  const isCompleted = step < currentStep;
  const isActive = step === currentStep;
  
  return (
    <div className="flex flex-col items-center gap-3 relative z-10">
      <div className={cn(
        "w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center transition-all duration-500",
        isCompleted ? "bg-emerald-500 text-white" : isActive ? "bg-purple-600 text-white ring-4 ring-purple-100" : "bg-slate-200 text-slate-400"
      )}>
        {isCompleted ? <CheckCircle2 size={14} /> : <span className="text-[10px] font-black">{step}</span>}
      </div>
      <span className={cn(
        "text-[10px] font-bold uppercase tracking-widest absolute -bottom-6 whitespace-nowrap",
        isCompleted ? "text-emerald-600" : isActive ? "text-purple-600" : "text-slate-400"
      )}>
        {label}
      </span>
    </div>
  );
};

const InternDashboardHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appData, setAppData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [lmsData, setLmsData] = useState([]);
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appRes, notifRes, lmsRes, projRes] = await Promise.all([
        api.get('/api/applications/mine').catch(() => ({ data: null })),
        api.get('/api/notifications').catch(() => ({ data: [] })),
        api.get('/api/lms/modules').catch(() => ({ data: [] })),
        api.get('/api/projects/mine').catch(() => ({ data: null }))
      ]);
      setAppData(appRes.data);
      setNotifications(notifRes.data.slice(0, 5));
      setLmsData(lmsRes.data);
      setProjectData(projRes.data);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-36 md:h-48 bg-slate-200 rounded-2xl" />
      <div className="h-16 bg-slate-100 rounded-2xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-2xl" />)}
      </div>
    </div>
  );

  const completedLms = lmsData.filter(m => m.completed).length;
  const allLmsDone = lmsData.length > 0 && completedLms === lmsData.length;
  const projectSubmitted = projectData && !projectData.message;
  const projectApproved = projectData?.status === 'approved';

  let currentStep = 0;
  if (appData?.status === 'completed' || projectApproved) {
    currentStep = 6; // all 5 steps completed
  } else if (projectSubmitted) {
    currentStep = 4; // Review active
  } else if (allLmsDone && appData?.status === 'onboarded') {
    currentStep = 3; // Project active
  } else if (appData?.status === 'onboarded') {
    currentStep = 2; // Learning active
  } else if (appData?.status === 'offer_accepted') {
    currentStep = 1; // Onboarded active
  }

  const barWidth = currentStep <= 0 ? 0 : Math.min((currentStep - 1) * 20 + 10, 80);
  const lmsPct = lmsData.length ? Math.round((completedLms / lmsData.length) * 100) : 0;
  
  const fmt = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const endDate = appData?.onboarded_at
    ? new Date(new Date(appData.onboarded_at).getTime() + (appData.duration_months || 3) * 30 * 86400000)
    : null;

  const timeline = [];
  if (!allLmsDone && appData?.status === 'onboarded') {
    timeline.push({ id: 1, title: 'Complete Learning Modules', type: 'Task', time: `${completedLms} of ${lmsData.length} done`, status: 'In Progress' });
  }
  if (allLmsDone && !projectSubmitted) {
    timeline.push({ id: 2, title: 'Submit Your Project', type: 'Deadline', time: endDate ? `Due by ${fmt(endDate)}` : 'Due soon', status: 'Pending' });
  }
  if (projectSubmitted && !projectApproved) {
    timeline.push({ id: 3, title: 'Project Under Review', type: 'Review', time: projectData?.updated_at ? fmt(projectData.updated_at) : 'Submitted', status: 'Upcoming' });
  }
  if (appData?.status === 'completed' || projectApproved) {
    timeline.push({ id: 4, title: 'Generate Your Certificate', type: 'Achievement', time: 'Available now', status: 'Upcoming' });
  }
  if (endDate && appData?.status !== 'completed') {
    timeline.push({ id: 5, title: 'Internship End Date', type: 'Deadline', time: fmt(endDate), status: new Date() > endDate ? 'Overdue' : 'Upcoming' });
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl md:rounded-[2rem] p-6 md:p-10 text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] -mr-40 -mt-40 transition-all group-hover:bg-indigo-500/20 duration-1000" />
        <div className="relative z-10 space-y-4 md:space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-4xl font-black tracking-tight">Welcome back, {user?.name?.split(' ')[0] || 'Intern'} 👋</h1>
            <p className="text-indigo-200 font-medium">{appData?.role || 'Intern'} at Hexaware Technologies</p>
          </div>
          <div className="flex items-center gap-4 pt-4">
            <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 text-xs font-bold uppercase tracking-widest">
              {currentStep >= 2 ? 'Active' : 'Onboarding'}
            </div>
            <div className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-emerald-500/20">
              {currentStep >= 6 ? 'Completed' : currentStep === 4 ? 'Under Review' : currentStep === 3 ? 'Project Phase' : currentStep === 2 ? 'Learning' : currentStep === 1 ? 'Onboarded' : (appData?.status || 'Pending')}
            </div>
          </div>
        </div>
      </div>

      {/* Top Progress Tracker */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="overflow-x-auto -mx-2 px-2">
          <div className="relative min-w-[320px]">
            <div className="absolute top-[16px] left-[10%] right-[10%] h-0.5 bg-slate-100" />
            <div className="absolute top-[16px] left-[10%] h-0.5 bg-emerald-500 transition-all duration-1000" style={{ width: `${barWidth}%` }} />
            <div className="flex justify-between pb-8">
              <ProgressNode label="Onboarded" step={1} currentStep={currentStep} />
              <ProgressNode label="Learning"  step={2} currentStep={currentStep} />
              <ProgressNode label="Project"   step={3} currentStep={currentStep} />
              <ProgressNode label="Review"    step={4} currentStep={currentStep} />
              <ProgressNode label="Complete"  step={5} currentStep={currentStep} />
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="LMS Progress" value={`${lmsPct}%`} trend="" subtext="Overall completion" icon={Zap} color="bg-purple-100 text-purple-600" />
        <StatsCard title="LMS Modules" value={`${completedLms}/${lmsData.length}`} trend="In Progress" subtext="Resources completed" icon={BookOpen} color="bg-emerald-100 text-emerald-600" />
        <StatsCard title="Duration" value={`${appData?.duration_months || '-'}m`} trend="" subtext="Total duration" icon={Clock} color="bg-blue-100 text-blue-600" />
        <StatsCard title="Start Date" value={appData?.joining_signed_at ? new Date(appData.joining_signed_at).toLocaleDateString() : '-'} trend="" subtext="Joined Date" icon={Calendar} color="bg-amber-100 text-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-5 md:space-y-8">
          {/* Mentor Card */}
          <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm p-5 md:p-8 flex flex-col sm:flex-row items-center gap-5 md:gap-8 group hover:border-purple-200 transition-all">
            <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 font-black text-2xl md:text-3xl shadow-inner group-hover:scale-105 transition-transform duration-500 shrink-0">
              {getInitials(appData?.mentor_name)}
            </div>
            <div className="flex-1 text-center sm:text-left space-y-1.5 md:space-y-2 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h3 className="text-base md:text-xl font-bold text-slate-900 truncate">{appData?.mentor_name || 'No Mentor Assigned'}</h3>
                {appData?.mentor_name && <span className="self-center px-2.5 py-1 bg-purple-50 text-purple-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-purple-100 shrink-0">Assigned Mentor</span>}
              </div>
              {appData?.mentor_name && <p className="text-sm text-slate-500 font-medium truncate">{appData?.mentor_email}</p>}
            </div>
            {appData?.mentor_name && (
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => navigate('/mentor')}
                className="flex-1 sm:flex-none px-4 md:px-6 py-2.5 md:py-3 bg-slate-50 border border-slate-100 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-100 transition-all"
              >
                View
              </button>
              <button
                onClick={() => navigate('/mentor')}
                className="flex-1 sm:flex-none px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-purple-600 to-violet-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-100 flex items-center justify-center gap-2"
              >
                <MessageSquare size={13} /> Chat
              </button>
            </div>
            )}
          </div>

          {/* Upcoming Section */}
          <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 md:p-6 border-b border-slate-50 flex items-center justify-between">
              <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px]">Upcoming Timeline</h3>
              <ArrowUpRight size={16} className="text-slate-400" />
            </div>
            <div className="divide-y divide-slate-50">
              {timeline.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-400 font-medium">No upcoming events</div>
              )}
              {timeline.map((item) => {
                const iconMap = {
                  Task:        { icon: BookOpen,  bg: 'bg-purple-50', color: 'text-purple-600' },
                  Deadline:    { icon: Clock,      bg: 'bg-rose-50',   color: 'text-rose-600'   },
                  Review:      { icon: Briefcase,  bg: 'bg-amber-50',  color: 'text-amber-600'  },
                  Achievement: { icon: Award,      bg: 'bg-emerald-50',color: 'text-emerald-600'},
                  Meeting:     { icon: Users,      bg: 'bg-blue-50',   color: 'text-blue-600'   },
                };
                const { icon: Icon, bg, color } = iconMap[item.type] || iconMap.Deadline;
                const badgeColor = item.status === 'Upcoming' ? 'bg-emerald-50 text-emerald-600'
                  : item.status === 'In Progress' ? 'bg-purple-50 text-purple-600'
                  : item.status === 'Overdue'     ? 'bg-red-50 text-red-600'
                  : 'bg-amber-50 text-amber-600';
                return (
                <div key={item.id} className="p-4 md:p-6 flex items-center justify-between gap-3 group hover:bg-slate-50 transition-all">
                  <div className="flex gap-4 items-center">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", bg, color)}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors">{item.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{item.time}</p>
                    </div>
                  </div>
                  <span className={cn("px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest", badgeColor)}>
                    {item.status}
                  </span>
                </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Notifications */}
          <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm p-5 md:p-8 space-y-5 md:space-y-6">
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px]">Recent Notifications</h3>
            <div className="space-y-4 md:space-y-6">
              {notifications.map((note) => {
                let Icon = PlayCircle;
                let colorClass = 'text-slate-600';
                if (note.type?.includes('lms')) { Icon = PlayCircle; colorClass = 'text-emerald-600'; }
                if (note.type?.includes('meeting')) { Icon = Calendar; colorClass = 'text-blue-600'; }
                if (note.type?.includes('task')) { Icon = Briefcase; colorClass = 'text-purple-600'; }

                return (
                <div key={note.id} className="flex gap-4">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-slate-50", colorClass.replace('text', 'bg').replace('600', '50'))}>
                    <Icon size={18} className={colorClass} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 leading-tight">{note.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{note.message}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pt-1">{new Date(note.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              )})}
              {notifications.length === 0 && <p className="text-xs text-slate-500">No notifications.</p>}
            </div>
            <button
              onClick={() => alert('All notifications marked as read')}
              className="w-full py-3 border border-dashed border-slate-200 rounded-2xl text-xs font-bold text-slate-400 hover:border-purple-200 hover:text-purple-600 transition-all uppercase tracking-widest"
            >
              Mark all read
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternDashboardHome;
