import React, { useState } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  Code, 
  Mail, 
  Clock, 
  AlertCircle,
  Award
} from 'lucide-react';
import { cn } from '../../utils/cn';

const notificationsData = [
  { 
    id: 1, 
    title: 'Onboarding Completed', 
    desc: 'Rahul Verma has successfully completed the onboarding process. Welcome them to the team!', 
    time: '2 hours ago', 
    icon: CheckCircle2, 
    color: 'bg-emerald-50 text-emerald-600',
    unread: true
  },
  { 
    id: 2, 
    title: 'AI Screening Update', 
    desc: 'Ananya Iyer passed the AI resume screening with a score of 88/100. HR review is next.', 
    time: '4 hours ago', 
    icon: Code, 
    color: 'bg-purple-50 text-purple-600',
    unread: true
  },
  { 
    id: 3, 
    title: 'Referral Email Sent', 
    desc: 'An invitation email has been sent to Siddharth Rao for the Backend Intern role.', 
    time: '1 day ago', 
    icon: Mail, 
    color: 'bg-blue-50 text-blue-600',
    unread: false
  },
  { 
    id: 4, 
    title: 'Quota Reminder', 
    desc: 'You have 2 referral slots remaining for this month. The quota resets on June 1st.', 
    time: '2 days ago', 
    icon: AlertCircle, 
    color: 'bg-amber-50 text-amber-600',
    unread: false
  },
  { 
    id: 5, 
    title: 'Reward Issued', 
    desc: 'Congratulations! A reward of ₹2,500 has been added to your balance for the referral of Rahul Verma.', 
    time: '3 days ago', 
    icon: Award, 
    color: 'bg-indigo-50 text-indigo-600',
    unread: false
  }
];

const Notifications = () => {
  const [filter, setFilter] = useState('All');

  const filteredNotifications = notificationsData.filter(note => {
    if (filter === 'Unread') return note.unread;
    return true;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Notifications</h1>
          <p className="text-slate-500 mt-1 font-medium">Stay updated with your referrals and rewards.</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
            {['All', 'Unread'].map(t => (
              <button 
                key={t}
                onClick={() => setFilter(t)}
                className={cn(
                  "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                  filter === t ? "bg-purple-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <button className="text-sm font-bold text-purple-600 hover:underline">Mark all as read</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-50">
          {filteredNotifications.length > 0 ? filteredNotifications.map((note) => (
            <div key={note.id} className={cn(
              "p-8 flex gap-6 transition-colors hover:bg-slate-50/50 relative group",
              note.unread ? "bg-purple-50/10" : ""
            )}>
              {note.unread && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-600" />
              )}
              
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm", note.color)}>
                <note.icon size={24} />
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <h3 className={cn("text-lg font-bold", note.unread ? "text-slate-900" : "text-slate-600")}>{note.title}</h3>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{note.time}</span>
                </div>
                <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-3xl">
                  {note.desc}
                </p>
                <div className="pt-2 flex gap-4">
                  <button className="text-[10px] font-bold text-purple-600 uppercase tracking-widest hover:underline">View Details</button>
                  <button className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600">Dismiss</button>
                </div>
              </div>

              {note.unread && (
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2" />
              )}
            </div>
          )) : (
            <div className="p-20 text-center">
              <p className="text-slate-400 font-medium">No notifications found.</p>
            </div>
          )}
        </div>
      </div>
      
      <button className="w-full py-4 text-xs font-bold text-slate-400 uppercase tracking-[0.2em] hover:text-purple-600 transition-colors">
        Load Older Notifications
      </button>
    </div>
  );
};

export default Notifications;
