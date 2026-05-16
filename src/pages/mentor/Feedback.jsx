import React from 'react';
import { 
  MessageSquare, 
  Send, 
  Clock, 
  Star,
  CheckCircle2,
  Code
} from 'lucide-react';
import { cn } from '../../utils/cn';

const pastFeedback = [
  { 
    id: 1, 
    type: 'Code Review', 
    date: 'May 08, 2024', 
    content: "Great job on the clean code architecture in the latest PR. The component modularization is exactly what we discussed.",
    icon: Code,
    color: 'text-purple-600',
    bg: 'bg-purple-50'
  },
  { 
    id: 2, 
    type: 'General', 
    date: 'May 05, 2024', 
    content: "Excellent communication during the standup today. Keep sharing your blockers early to keep the momentum.",
    icon: MessageSquare,
    color: 'text-blue-600',
    bg: 'bg-blue-50'
  }
];

const Feedback = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Send Feedback</h1>
        <p className="text-slate-500 mt-1 font-medium">Provide constructive feedback to your interns.</p>
      </div>

      {/* Feedback Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Create New Feedback</h3>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Category</label>
              <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 appearance-none">
                <option>General Performance</option>
                <option>Code Quality</option>
                <option>Communication</option>
                <option>Problem Solving</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Intern</label>
              <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 appearance-none">
                <option>Alex Rivera</option>
                <option>Sarah Smith</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Message</label>
            <textarea 
              placeholder="Type your feedback here..."
              className="w-full h-32 p-6 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all resize-none"
            />
          </div>

          <div className="flex justify-end">
            <button 
              onClick={() => alert('Feedback sent successfully!')}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-violet-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-purple-200 hover:scale-[1.02] transition-all flex items-center gap-2"
            >
              <Send size={18} />
              Send Feedback
            </button>
          </div>
        </div>
      </div>

      {/* Past Feedback */}
      <div className="space-y-6">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Past Feedback</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pastFeedback.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:border-purple-200 transition-colors group">
              <div className="flex items-center justify-between mb-6">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", item.bg, item.color)}>
                  <item.icon size={20} />
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.date}</span>
                  <span className={cn("text-[10px] font-bold uppercase tracking-wider mt-1", item.color)}>{item.type}</span>
                </div>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">"{item.content}"</p>
              <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-[10px] font-bold text-purple-600">AR</div>
                  <span className="text-xs font-bold text-slate-500">Alex Rivera</span>
                </div>
                <CheckCircle2 size={16} className="text-emerald-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Feedback;
