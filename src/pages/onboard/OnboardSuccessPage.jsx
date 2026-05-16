import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Calendar, Laptop, Users, BookOpen, ArrowRight, Sparkles } from 'lucide-react';

const OnboardSuccessPage = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <div className="text-center space-y-8">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 rounded-full animate-pulse" />
          <div className="relative w-32 h-32 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-emerald-200 border-8 border-white mx-auto">
            <CheckCircle2 size={64} className="animate-in zoom-in duration-700" />
          </div>
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white animate-bounce">
            <Sparkles size={24} />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">You're Onboarded! 🎉</h1>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">Welcome to the team, Rahul! Your journey at InternFlow starts now. We've set up everything for your first day.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-10 space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 p-8 bg-slate-900 rounded-3xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="space-y-2 relative z-10">
            <p className="text-purple-400 font-bold uppercase tracking-widest text-[10px]">Joining Date</p>
            <h3 className="text-3xl font-black">June 01, 2024</h3>
            <p className="text-slate-400 font-medium">9:00 AM • Virtual Kickoff Meeting</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-10 py-5 bg-gradient-to-r from-purple-600 to-violet-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-purple-900/20 hover:scale-[1.05] transition-all flex items-center gap-4 group relative z-10"
          >
            Go to Intern Dashboard
            <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: 'Day 1 Schedule', desc: 'Orientation, team intro and project kickoff.', icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-50' },
            { title: 'Laptop Setup', desc: 'MacBook Pro arrival & environment setup guide.', icon: Laptop, color: 'text-purple-500', bg: 'bg-purple-50' },
            { title: 'Meet Your Team', desc: 'Connect with your mentor and team members.', icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { title: 'Pre-reading', desc: 'Internal docs, codebase and culture handbook.', icon: BookOpen, color: 'text-amber-500', bg: 'bg-amber-50' },
          ].map((item, i) => (
            <div key={i} className="p-8 bg-slate-50 border border-slate-100 rounded-3xl space-y-6 group hover:bg-white hover:border-purple-200 hover:shadow-md transition-all">
              <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform duration-500`}>
                <item.icon size={28} />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-slate-900">{item.title}</h4>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
              </div>
              <button className="text-[10px] font-black text-purple-600 uppercase tracking-widest hover:underline flex items-center gap-2">
                View Details <ArrowRight size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OnboardSuccessPage;
