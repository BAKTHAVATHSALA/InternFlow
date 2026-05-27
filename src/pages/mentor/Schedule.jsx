import React from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  Users, 
  ChevronRight,
  Plus,
  MoreVertical,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../../utils/cn';

const Schedule = () => {
  const events = [
    { 
      id: 1, 
      time: '11:30 AM - 12:00 PM', 
      title: '1-on-1 Performance Review', 
      intern: 'Alex Rivera', 
      type: 'Meeting', 
      status: 'In 30 mins',
      color: 'bg-purple-500'
    },
    { 
      id: 2, 
      time: '02:00 PM - 03:00 PM', 
      title: 'Group Tech Sync', 
      intern: 'Frontend Batch', 
      type: 'Internal', 
      status: 'Upcoming',
      color: 'bg-blue-500'
    },
    { 
      id: 3, 
      time: '04:30 PM - 05:00 PM', 
      title: 'Final Project Kickoff', 
      intern: 'Sarah Smith', 
      type: 'Meeting', 
      status: 'Upcoming',
      color: 'bg-indigo-500'
    }
  ];

  return (
    <div className="page-section">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Schedule</h1>
          <p className="page-description">Manage your meetings and review sessions.</p>
        </div>
        <button className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-purple-200 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
          <Plus size={18} />
          Create Session
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar View (Placeholder) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
              <div className="flex items-center gap-4">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">May 2024</h2>
                <div className="flex gap-1">
                  <button className="tap-target p-1.5 hover:bg-slate-50 rounded-lg text-slate-400"><ChevronRight size={18} className="rotate-180" /></button>
                  <button className="tap-target p-1.5 hover:bg-slate-50 rounded-lg text-slate-400"><ChevronRight size={18} /></button>
                </div>
              </div>
              <div className="flex bg-slate-50 p-1 rounded-xl w-full sm:w-auto overflow-x-auto scrollbar-hide">
                {['Day', 'Week', 'Month'].map(view => (
                  <button key={view} className={cn(
                    "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                    view === 'Week' ? "bg-white text-purple-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}>
                    {view}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2 min-w-0">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="text-center text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest py-1 sm:py-2">{day}</div>
              ))}
              {Array.from({ length: 31 }).map((_, i) => (
                <div key={i} className={cn(
                  "h-10 sm:h-16 md:h-24 rounded-lg sm:rounded-xl border border-slate-50 p-1 sm:p-2 transition-all hover:border-purple-100 relative group",
                  i + 1 === 10 ? "bg-purple-50/50 border-purple-100" : ""
                )}>
                  <span className={cn(
                    "text-xs font-bold",
                    i + 1 === 10 ? "text-purple-600" : "text-slate-400"
                  )}>{i + 1}</span>
                  {i + 1 === 10 && (
                    <div className="mt-2 space-y-1">
                      <div className="h-1 w-full bg-purple-500 rounded-full" />
                      <div className="h-1 w-2/3 bg-blue-500 rounded-full" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="space-y-6">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Upcoming Sessions</h3>
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow group">
                <div className="flex justify-between items-start mb-4">
                  <div className={cn("px-2.5 py-1 rounded-lg text-[10px] font-black text-white uppercase tracking-wider shadow-sm", event.color)}>
                    {event.type}
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                    event.status.includes('mins') ? "bg-rose-50 text-rose-600 animate-pulse" : "bg-slate-50 text-slate-500"
                  )}>
                    {event.status}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 group-hover:text-purple-600 transition-colors">{event.title}</h4>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Clock size={14} />
                    <span className="text-xs font-medium">{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Users size={14} />
                    <span className="text-xs font-medium">{event.intern}</span>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-50 flex gap-2">
                  <button className="flex-1 py-2 bg-slate-50 hover:bg-purple-50 hover:text-purple-600 text-slate-600 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all">
                    Reschedule
                  </button>
                  <button className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all">
                    <Video size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-gradient-to-br from-purple-600 to-violet-500 rounded-2xl p-6 text-white shadow-lg shadow-purple-200">
            <h4 className="font-bold text-sm mb-2">Mentor Session Tip</h4>
            <p className="text-xs text-purple-100 leading-relaxed font-medium">
              Review previous feedback notes before the session to track improvement and provide consistent guidance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
