import React, { useState, useEffect } from 'react';
import { Briefcase, Code, Play, FileText, Send, AlertCircle, Clock, CheckCircle2, Lock } from 'lucide-react';
import { cn } from '../../utils/cn';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ProjectSubmissionPage = () => {
  const [lmsData, setLmsData] = useState([]);
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [formData, setFormData] = useState({
    github_url: '',
    demo_url: '',
    description: '',
    features: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [lmsRes, projRes] = await Promise.all([
        api.get('/api/lms/modules').catch(() => ({ data: [] })),
        api.get('/api/projects/mine').catch(() => ({ data: null }))
      ]);
      setLmsData(lmsRes.data);
      if (projRes.data && !projRes.data.message) {
        setProjectData(projRes.data);
      }
    } catch (err) {
      toast.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.github_url || !formData.description) {
      return toast.error('Please fill in required fields');
    }
    try {
      await api.post('/api/projects/submit', { ...formData, features: formData.description.split('\n') });
      toast.success('Project submitted successfully!');
      fetchData(); // Refresh to see submitted state
    } catch (err) {
      toast.error('Failed to submit project');
    }
  };

  if (loading) return <div className="p-8 animate-pulse">Loading...</div>;

  const totalLms = lmsData.length || 1;
  const completedLms = lmsData.filter(m => m.completed).length;
  const isLMSComplete = completedLms === lmsData.length && lmsData.length > 0;
  
  const isSubmitted = !!projectData?.id;

  return (
    <div className="space-y-8 pb-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Project Submission</h1>
          <p className="text-slate-500 mt-1 font-medium">Submit your project for mentor review</p>
        </div>
        <div className={cn(
          "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border",
          isSubmitted ? "bg-purple-50 text-purple-600 border-purple-100" 
          : isLMSComplete ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
          : "bg-rose-50 text-rose-600 border-rose-100"
        )}>
          {isSubmitted ? `Status: ${projectData.status.replace('_', ' ')}` : (isLMSComplete ? 'Submission Unlocked' : 'Submission Locked')}
        </div>
      </div>

      {/* Project Overview Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden group hover:border-purple-200 transition-all">
        <div className="p-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 shadow-inner group-hover:scale-110 transition-transform duration-500">
                <Briefcase size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Full-Stack Intern Project</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hexaware Technologies</span>
                  <span className="w-1 h-1 bg-slate-200 rounded-full" />
                  <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">Final Phase</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {['React', 'Node.js', 'PostgreSQL'].map(tag => (
                <span key={tag} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="p-6 bg-slate-50/50 border border-slate-100 rounded-2xl space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" />
              <p className="text-sm text-slate-600 font-medium leading-relaxed">Implement a task management dashboard with real-time updates and user authentication. Use PostgreSQL for the database and Node.js for the backend API.</p>
            </div>
          </div>
        </div>
      </div>

      {!isLMSComplete && !isSubmitted && (
        <div className="bg-rose-50 border border-rose-100 rounded-3xl p-8 flex items-start gap-6 animate-pulse">
          <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-rose-200">
            <Lock size={24} />
          </div>
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-rose-900">Submission Locked</h4>
            <p className="text-sm text-rose-700 font-medium leading-relaxed">Complete all {totalLms} LMS modules in the Learning Portal to unlock project submission. You currently have {totalLms - completedLms} module(s) remaining.</p>
          </div>
        </div>
      )}

      {/* Submission Form */}
      <div className={cn(
        "bg-white rounded-3xl border border-slate-200 shadow-sm p-10 space-y-8 transition-all",
        (!isLMSComplete && !isSubmitted) && "opacity-50 pointer-events-none grayscale"
      )}>
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{isSubmitted ? 'Submitted Details' : 'Project Links'}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Code size={14} /> GitHub Repository URL
            </label>
            <input 
              type="text" 
              name="github_url"
              value={isSubmitted ? projectData.github_url : formData.github_url}
              onChange={handleInputChange}
              readOnly={isSubmitted}
              placeholder="https://github.com/yourusername/project-repo" 
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Play size={14} /> Demo Video Link
            </label>
            <input 
              type="text"
              name="demo_url" 
              value={isSubmitted ? projectData.demo_url : formData.demo_url}
              onChange={handleInputChange}
              readOnly={isSubmitted}
              placeholder="https://loom.com/share/..." 
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
            <FileText size={14} /> Project Description
          </label>
          <textarea 
            name="description"
            value={isSubmitted ? projectData.description : formData.description}
            onChange={handleInputChange}
            readOnly={isSubmitted}
            placeholder="Describe the core features and architecture of your project..." 
            className="w-full h-40 p-6 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all resize-none"
          />
        </div>

        {isSubmitted && projectData.mentor_feedback && (
          <div className="bg-purple-50 border border-purple-100 p-6 rounded-2xl space-y-2">
            <h4 className="text-[10px] font-black text-purple-600 uppercase tracking-[0.2em]">Mentor Feedback</h4>
            <p className="text-sm font-medium text-slate-700 italic">"{projectData.mentor_feedback}"</p>
          </div>
        )}

        {!isSubmitted && (
        <div className="pt-4">
          <button 
            onClick={handleSubmit}
            className="w-full py-5 bg-gradient-to-r from-purple-600 to-violet-500 text-white rounded-2xl font-black text-lg shadow-2xl shadow-purple-200 hover:scale-[1.01] transition-all flex items-center justify-center gap-4"
          >
            Submit for Mentor Review
            <Send size={24} />
          </button>
        </div>
        )}
      </div>
    </div>
  );
};

export default ProjectSubmissionPage;
