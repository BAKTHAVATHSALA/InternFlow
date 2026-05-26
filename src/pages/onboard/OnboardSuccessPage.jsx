import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Calendar, Laptop, Users, BookOpen, ArrowRight, Sparkles, ExternalLink } from 'lucide-react';

const OnboardSuccessPage = () => {
  const navigate = useNavigate();

  const nextSteps = [
    { title: 'Day 1 Schedule', desc: 'Orientation, team intro and project kickoff.', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { title: 'Laptop Setup', desc: 'MacBook Pro arrival & environment setup guide.', icon: Laptop, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
    { title: 'Meet Your Team', desc: 'Connect with your mentor and team members.', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { title: 'Pre-reading', desc: 'Internal docs, codebase and culture handbook.', icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
  ];

  return (
    <div className="max-w-3xl space-y-8 pb-10">
      {/* Success Hero */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
        <div className="relative inline-flex mb-6">
          <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-200 border-4 border-white">
            <CheckCircle2 size={48} />
          </div>
          <div className="absolute -top-2 -right-2 w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white animate-bounce">
            <Sparkles size={18} />
          </div>
        </div>

        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">You're Onboarded! 🎉</h1>
        <p className="text-slate-500 text-sm leading-relaxed max-w-md mx-auto">
          Welcome to the Hexaware team! Your journey starts now. We've set up everything for your first day.
        </p>
      </div>

      {/* Joining Info Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-purple-400 font-bold uppercase tracking-widest text-[10px] mb-2">Joining Date</p>
            <h3 className="text-2xl font-black">June 01, 2024</h3>
            <p className="text-slate-400 text-sm font-medium mt-1">9:00 AM · Virtual Kickoff Meeting</p>
          </div>
          <button
            onClick={() => navigate('/intern/login')}
            className="px-6 py-3.5 bg-gradient-to-r from-purple-600 to-violet-500 text-white rounded-xl font-bold text-sm shadow-xl shadow-purple-900/30 hover:scale-[1.03] transition-all flex items-center gap-2 group whitespace-nowrap"
          >
            Go to Intern Portal
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Next Steps Grid */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">What's Next</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {nextSteps.map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 group hover:border-purple-200 hover:shadow-md transition-all"
            >
              <div className={`w-12 h-12 ${item.bg} border ${item.border} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <item.icon size={22} className={item.color} />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">{item.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">{item.desc}</p>
              <button className="text-[10px] font-black text-purple-600 uppercase tracking-widest hover:underline flex items-center gap-1.5">
                View Details <ExternalLink size={10} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OnboardSuccessPage;
