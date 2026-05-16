import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, Calendar, Star, CheckCircle2, PlayCircle, ArrowRight, Clock, MapPin, Briefcase } from 'lucide-react';
import { cn } from '../../utils/cn';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const meetings = [
  { id: 1, title: 'Kickoff Call', date: 'May 01, 2024', status: 'Completed', icon: PlayCircle },
  { id: 2, title: 'Week 1 Check-in', date: 'May 08, 2024', status: 'Completed', icon: CheckCircle2 },
  { id: 3, title: 'Week 2 Sync', date: 'May 15, 2024', status: 'Upcoming', icon: Clock },
];

const MyMentorPage = () => {
  const { user } = useAuth();
  const [mentor, setMentor] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMentorData();
  }, []);

  const fetchMentorData = async () => {
    try {
      const [appRes, feedbackRes] = await Promise.all([
        api.get('/api/applications/mine').catch(() => ({ data: {} })),
        api.get(`/api/mentor/feedback/${user.id}`).catch(() => ({ data: [] }))
      ]);

      if (appRes.data?.mentor_name) {
        setMentor({
          name: appRes.data.mentor_name,
          email: appRes.data.mentor_email,
        });
      }
      setFeedback(feedbackRes.data);
    } catch (err) {
      toast.error('Failed to load mentor info');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (loading) return <div className="p-8 animate-pulse">Loading mentor details...</div>;

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Mentor</h1>
        <p className="text-slate-500 mt-1 font-medium">Communicate and learn from your assigned mentor</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Mentor Profile */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-10 flex flex-col md:flex-row items-center gap-10 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
            <div className="relative z-10 w-40 h-40 rounded-3xl bg-purple-100 flex items-center justify-center text-purple-600 font-black text-5xl shadow-inner group-hover:scale-105 transition-transform duration-500">
              {getInitials(mentor?.name)}
              {mentor && (
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center" title="Online">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              </div>
              )}
            </div>
            <div className="relative z-10 flex-1 text-center md:text-left space-y-6">
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-slate-900">{mentor?.name || 'No Mentor Assigned'}</h3>
                {mentor && (
                  <>
                  <p className="text-slate-500 font-bold flex items-center justify-center md:justify-start gap-2">
                    <Briefcase size={16} /> Senior Software Engineer at Hexaware
                  </p>
                  <p className="text-xs text-slate-400 font-medium flex items-center justify-center md:justify-start gap-2">
                    <MapPin size={14} /> Bangalore, India
                  </p>
                  </>
                )}
              </div>
              {mentor && (
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {['System Design', 'React', 'Node.js', 'PostgreSQL', 'AWS'].map(tag => (
                  <span key={tag} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest">{tag}</span>
                ))}
              </div>
              )}
              {mentor && (
              <div className="flex gap-4 pt-2">
                <button 
                  onClick={() => alert(`Chat opened with ${mentor.name}`)}
                  className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-violet-500 text-white text-xs font-black rounded-2xl shadow-lg shadow-purple-200 flex items-center justify-center gap-3 hover:scale-[1.02] transition-all"
                >
                  <MessageSquare size={18} /> Send Message
                </button>
                <button 
                  onClick={() => alert('Opening calendar to schedule a call...')}
                  className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 text-xs font-black rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
                >
                  <Calendar size={18} /> Schedule Call
                </button>
              </div>
              )}
            </div>
          </div>

          {/* Meetings Panel */}
          {mentor && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px]">Recent Meetings</h3>
              <button 
                onClick={() => alert('Viewing full meeting history')}
                className="text-[10px] font-black text-purple-600 uppercase tracking-widest hover:underline"
              >
                View History
              </button>
            </div>
            <div className="divide-y divide-slate-50">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="p-8 flex items-center justify-between group hover:bg-slate-50 transition-all">
                  <div className="flex gap-6 items-center">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border",
                      meeting.status === 'Completed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-blue-50 text-blue-600 border-blue-100"
                    )}>
                      <meeting.icon size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 group-hover:text-purple-600 transition-colors leading-tight">{meeting.title}</h4>
                      <p className="text-sm text-slate-400 font-medium mt-1 uppercase tracking-widest text-[10px]">{meeting.date}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "px-4 py-1.5 text-[10px] font-black rounded-full uppercase tracking-[0.2em]",
                    meeting.status === 'Completed' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600 shadow-lg shadow-blue-100"
                  )}>
                    {meeting.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
          )}
        </div>

        {/* Feedback Column */}
        {mentor && (
        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-8 h-full">
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px]">Mentor Feedback</h3>
            <div className="space-y-8">
              {feedback.map((item) => (
                <div key={item.id} className="space-y-4 group">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-black text-slate-900 group-hover:text-purple-600 transition-colors uppercase tracking-tight">{item.type || 'Feedback'}</h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="p-5 bg-slate-50/50 border border-slate-100 rounded-2xl relative">
                    <div className="absolute -left-2 top-4 w-1 h-8 bg-purple-500 rounded-full" />
                    <p className="text-xs text-slate-600 font-medium leading-relaxed italic">"{item.message}"</p>
                  </div>
                </div>
              ))}
              {feedback.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-4">No feedback received yet.</p>
              )}
            </div>
            {feedback.length > 0 && (
            <button 
              onClick={() => alert('Viewing all feedback')}
              className="w-full mt-6 py-4 border border-dashed border-slate-200 rounded-2xl text-xs font-bold text-slate-400 hover:border-purple-200 hover:text-purple-600 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
            >
              View All Feedback <ArrowRight size={14} />
            </button>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default MyMentorPage;
