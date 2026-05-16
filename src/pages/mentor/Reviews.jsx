import React from 'react';
import { 
  Play, 
  Clock, 
  CheckSquare,
  ExternalLink,
  MessageSquare,
  Code
} from 'lucide-react';
import { cn } from '../../utils/cn';

const Reviews = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Project Review</h1>
        <p className="text-slate-500 mt-1 font-medium">Review and approve intern submissions.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Profile Header */}
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-2xl">
              AR
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-900">Alex Rivera</h2>
                <span className="px-2.5 py-1 bg-rose-50 text-rose-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  Pending Review
                </span>
              </div>
              <p className="text-sm text-slate-500 font-medium mt-1">Frontend Developer Intern • Submitted 4h ago</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-slate-50 border border-slate-100 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-100 transition-all flex items-center gap-2">
              <Code size={16} />
              Repository
            </button>
            <button className="px-4 py-2 bg-slate-50 border border-slate-100 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-100 transition-all flex items-center gap-2">
              <Play size={16} />
              Demo Video
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Project Description</h3>
              <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  Implemented a robust authentication system using Firebase and React Context API. The system supports email/password login, social authentication, and persistent sessions. I also added protected routes and an onboarding flow for new users.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Technology Stack</h3>
              <div className="flex flex-wrap gap-2">
                {['React.js', 'Firebase', 'Context API', 'Tailwind CSS', 'React Router'].map(tag => (
                  <span key={tag} className="px-3 py-1.5 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-600 shadow-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Mentor Feedback</h3>
              <textarea 
                placeholder="Provide detailed feedback on code quality, architecture, and UI/UX..."
                className="w-full h-40 p-6 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all resize-none"
              />
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => alert('Changes requested for Alex Rivera.')}
                className="flex-1 py-4 border border-rose-200 text-rose-600 bg-white hover:bg-rose-50 text-sm font-bold rounded-xl transition-all shadow-sm"
              >
                Request Changes
              </button>
              <button 
                onClick={() => alert('Project approved! Alex Rivera will be notified.')}
                className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-violet-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-purple-200 hover:scale-[1.02]"
              >
                Approve & Complete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
