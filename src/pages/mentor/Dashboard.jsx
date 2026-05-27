import React from 'react';
import { 
  Users, 
  Clock, 
  TrendingUp, 
  Calendar,
  CheckSquare,
  MessageSquare,
  ArrowUpRight,
  Play,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import StatsCard from '../../components/StatsCard';
import { cn } from '../../utils/cn';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="page-title">Mentor Dashboard</h1>
        <p className="text-slate-500 mt-1 font-medium">Welcome back, Dr. Robert Fox. Here's your overview for today.</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Active Intern" 
          value="01" 
          trend="" 
          subtext="Currently mentoring" 
          icon={Users} 
          color="bg-purple-100 text-purple-600"
        />
        <StatsCard 
          title="Pending Review" 
          value="03" 
          trend="Action required" 
          subtext="Submissions waiting" 
          icon={CheckSquare} 
          color="bg-rose-100 text-rose-600"
        />
        <StatsCard 
          title="Avg Progress" 
          value="68%" 
          trend="+5%" 
          subtext="Batch performance" 
          icon={TrendingUp} 
          color="bg-emerald-100 text-emerald-600"
        />
        <StatsCard 
          title="Batch Day" 
          value="12/90" 
          trend="" 
          subtext="Current program day" 
          icon={Calendar} 
          color="bg-blue-100 text-blue-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Intern Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs">Active Intern</h3>
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                In Training
              </span>
            </div>
            <div className="p-5 md:p-8">
              <div className="flex flex-col sm:flex-row gap-5 md:gap-8 items-start">
                <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-purple-100 to-violet-100 border border-purple-200 flex items-center justify-center text-purple-600 font-bold text-2xl md:text-3xl shadow-inner shrink-0">
                  AR
                </div>
                <div className="flex-1 space-y-4 md:space-y-6 w-full min-w-0">
                  <div>
                    <h4 className="text-xl md:text-2xl font-bold text-slate-900">Alex Rivera</h4>
                    <p className="text-slate-500 font-medium text-sm md:text-base">Frontend Developer Intern</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {['React.js', 'Tailwind CSS', 'TypeScript'].map(skill => (
                      <span key={skill} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 py-2">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-400 uppercase tracking-wider">LMS Progress</span>
                        <span className="text-purple-600">72%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-600 w-[72%] rounded-full shadow-[0_0_8px_rgba(124,58,237,0.3)]" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-400 uppercase tracking-wider">Project Status</span>
                        <span className="text-emerald-600">On Track</span>
                      </div>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className={cn("h-2 flex-1 rounded-full", i <= 3 ? "bg-emerald-500" : "bg-slate-100")} />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={() => navigate('/reviews')}
                      className="flex-1 px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-purple-600 to-violet-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-200 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                    >
                      <CheckSquare size={16} />
                      Review Submission
                    </button>
                    <button
                      onClick={() => navigate('/feedback')}
                      className="flex-1 px-4 md:px-6 py-2.5 md:py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                    >
                      <MessageSquare size={16} />
                      Send Feedback
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Schedule Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs mb-8">Today's Schedule</h3>
            <div className="space-y-6">
              {[
                { time: '09:00 AM', title: 'Morning Standup', desc: 'Sync with frontend team', status: 'completed' },
                { time: '11:30 AM', title: '1-on-1 with Priya', desc: 'Performance review session', status: 'upcoming' },
                { time: '02:00 PM', title: 'Project Review Prep', desc: 'Reviewing Alex\'s latest PR', status: 'upcoming' },
              ].map((item, i) => (
                <div key={i} className="flex gap-6 relative group">
                  {i !== 2 && <div className="absolute left-[31px] top-10 bottom-0 w-0.5 bg-slate-50 group-hover:bg-purple-100 transition-colors" />}
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2 w-16 shrink-0">{item.time}</div>
                  <div className={cn(
                    "w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10",
                    item.status === 'completed' ? "bg-emerald-500 text-white" : "bg-white border-slate-100 text-slate-300"
                  )}>
                    {item.status === 'completed' ? <CheckCircle2 size={14} /> : <div className="w-2 h-2 bg-slate-200 rounded-full" />}
                  </div>
                  <div className="flex-1 pb-6">
                    <h4 className={cn("font-bold text-sm", item.status === 'completed' ? "text-slate-400 line-through" : "text-slate-900")}>{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Action Required Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs mb-6">Action Required</h3>
            <div className="space-y-4">
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                <div className="flex gap-3">
                  <AlertCircle className="text-rose-500 shrink-0" size={18} />
                  <div>
                    <h4 className="text-sm font-bold text-rose-900">Project Review Pending</h4>
                    <button 
                      onClick={() => navigate('/reviews')}
                      className="mt-3 px-4 py-2 bg-rose-600 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider hover:bg-rose-700 transition-colors"
                    >
                      Review Now
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                <div className="flex gap-3">
                  <Clock className="text-amber-500 shrink-0" size={18} />
                  <div>
                    <h4 className="text-sm font-bold text-amber-900">LMS Incomplete Item</h4>
                    <p className="text-xs text-amber-700 mt-1">Unit 4: Advanced React Hooks needs sign-off.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Resume Score Card */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl card-padding text-white shadow-xl shadow-indigo-100">
            <h3 className="font-bold uppercase tracking-widest text-[10px] text-indigo-300 mb-8">AI Resume Score</h3>
            <div className="flex flex-col items-center justify-center space-y-6 py-4">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="64" cy="64" r="58" stroke="rgba(255,255,255,0.1)" strokeWidth="12" fill="none" />
                  <circle cx="64" cy="64" r="58" stroke="url(#gradient)" strokeWidth="12" fill="none" strokeDasharray="364.4" strokeDashoffset="54.6" strokeLinecap="round" />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black">85</span>
                  <span className="text-[10px] font-bold uppercase tracking-tighter text-indigo-300">Scale 100</span>
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm font-bold text-white">Highly Competitive</p>
                <p className="text-[10px] text-indigo-200/60 leading-relaxed max-w-[180px] mx-auto uppercase tracking-wider font-medium">
                  AI analysis suggests strong technical keyword alignment for Frontend roles.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
