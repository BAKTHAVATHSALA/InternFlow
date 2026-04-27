import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BarChart3, Users, Clock, AlertTriangle, Search, Plus, X, Check, XCircle, Trophy, BarChart, Loader2, Upload, ChevronDown, PieChart, TrendingUp, Cpu, UserCheck, RotateCcw, LogOut } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const HRDashboard = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('kanban'); 
  const [loading, setLoading] = useState(false);
  
  // Job State
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  
  // Dashboard Data
  const [applications, setApplications] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  
  // UI State
  const [showPostJD, setShowPostJD] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [expandedCard, setExpandedCard] = useState(null);
  const [error, setError] = useState('');

  // Form State
  const [jdForm, setJdForm] = useState({ 
    title: '', 
    description: '', 
    experience: 'Medium (Projects)', 
    skills: [], 
    file: null,
    cutoff: 70 
  });
  const [fileLabel, setFileLabel] = useState('Upload PDF');

  const skillOptions = [
    // Software Engineering
    'Python', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'TypeScript', 'Java', 'C++', 'Kubernetes', 'GraphQL',
    // Data Analysis
    'Pandas', 'Tableau', 'Power BI', 'SQL', 'R', 'Excel (Advanced)',
    // AI / ML
    'PyTorch', 'TensorFlow', 'Scikit-learn', 'LangChain', 'OpenAI API', 'HuggingFace'
  ];
  const expOptions = ['Low (Basics only)', 'Medium (Projects)', 'High (Internship / Real-world)'];

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8000/jobs/', { headers: { Authorization: `Bearer ${token}` } });
      setJobs(res.data);
      if (res.data.length > 0) {
        // Always select the first job if none is selected
        setSelectedJobId(prev => prev || res.data[0].id);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  };

  const fetchJobSpecificData = async () => {
    if (!selectedJobId) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [appRes, analyticsRes] = await Promise.all([
        axios.get(`http://localhost:8000/applications/?job_id=${selectedJobId}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`http://localhost:8000/applications/analytics/${selectedJobId}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setApplications(appRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error('Error fetching job data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);
  useEffect(() => { fetchJobSpecificData(); }, [selectedJobId]);

  const selectedJob = jobs.find(j => j.id === selectedJobId);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handlePostJD = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:8000/jobs/', {
        title: jdForm.title,
        description: jdForm.description || "Internship position focusing on " + jdForm.skills.join(', '),
        requirements: { required_skills: jdForm.skills, experience_level: jdForm.experience },
        experience_level: jdForm.experience,
        cutoff_score: jdForm.cutoff
      }, { headers: { Authorization: `Bearer ${token}` } });
      setShowPostJD(false);
      setJdForm({ title: '', description: '', experience: 'Medium (Projects)', skills: [], file: null, cutoff: 70 });
      setFileLabel('Upload PDF');
      await fetchJobs();
      setSelectedJobId(res.data.id);
    } catch (err) {
      console.error('Error posting JD:', err);
      setError(err.response?.data?.detail || 'Failed to create job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:8000/applications/${appId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchJobSpecificData();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleSkillToggle = (skill) => {
    setJdForm(prev => {
      const isSelected = prev.skills.includes(skill);
      const newSkills = isSelected ? prev.skills.filter(s => s !== skill) : [...prev.skills, skill];
      return { ...prev, skills: newSkills };
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setJdForm(prev => ({ ...prev, file: file }));
      setFileLabel(file.name.substring(0, 20) + (file.name.length > 20 ? '...' : ''));
    }
  };

  const handleSelectForCompare = (candidate) => {
    if (selectedForCompare.find(c => c.id === candidate.id)) {
      setSelectedForCompare(selectedForCompare.filter(c => c.id !== candidate.id));
    } else if (selectedForCompare.length < 2) {
      setSelectedForCompare([...selectedForCompare, candidate]);
    }
  };

  const groupedApps = {
    'Applied': applications.filter(a => a.status === 'applied' || a.status === 'processing'),
    'Reviewed': applications.filter(a => a.status === 'reviewed'),
    'Selected': applications.filter(a => a.status === 'selected'),
    'Onboarded': applications.filter(a => a.status === 'onboarded'),
    'Rejected': applications.filter(a => a.status === 'rejected'),
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 lg:p-10">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* Top Header & Logout */}
        <div className="flex items-center justify-between bg-white px-8 py-4 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-[#6D28D9] rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Sparkles className="w-6 h-6" />
             </div>
             <div>
                <h1 className="text-xl font-black text-[#1A1A1A]">InternFlow</h1>
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400">Recruiter Portal</p>
             </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="hidden md:flex flex-col items-end">
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Hiring Manager</span>
                <span className="text-xs font-bold text-[#1A1A1A]">Baktha Vathasala</span>
             </div>
             <button 
               onClick={handleLogout}
               className="p-3 bg-red-50 text-red-500 hover:bg-red-100 rounded-2xl transition-all flex items-center gap-2 group border border-red-100"
               title="Sign Out"
             >
               <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
               <span className="text-[10px] font-black uppercase tracking-widest">Logout</span>
             </button>
          </div>
        </div>
        
        {/* Top Navigation & Job Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
            <button 
              onClick={() => fetchJobs(false)} 
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-[#6D28D9]"
              title="Refresh Jobs"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <div className="px-4 py-2 bg-indigo-50 text-[#6D28D9] rounded-xl text-xs font-bold uppercase tracking-wider">Current Job</div>
            <div className="relative group">
              <select 
                value={selectedJobId || ''} 
                onChange={(e) => setSelectedJobId(Number(e.target.value))} 
                className="appearance-none bg-transparent font-bold text-[#1A1A1A] pr-10 pl-2 py-2 outline-none cursor-pointer"
              >
                {jobs.map(job => <option key={job.id} value={job.id}>{job.title}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button onClick={() => { setCompareMode(!compareMode); setSelectedForCompare([]); }} className={cn("px-6 py-3 rounded-2xl text-xs font-bold transition-all shadow-sm", compareMode ? "bg-[#6D28D9] text-white" : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-50")}>Compare Mode</button>
            <button onClick={() => setView(view === 'kanban' ? 'rankings' : 'kanban')} className="bg-white px-6 py-3 rounded-2xl text-xs font-bold text-gray-600 border border-gray-100 shadow-sm hover:bg-gray-50">{view === 'kanban' ? 'AI Rankings' : 'Kanban View'}</button>
            <button onClick={() => setShowPostJD(true)} className="bg-[#6D28D9] text-white px-6 py-3 rounded-2xl text-xs font-bold shadow-lg hover:bg-[#5B21B6] transition-all flex items-center gap-2"><Plus className="w-4 h-4" /> Post JD</button>
          </div>
        </div>

        {/* Dashboard Header */}
        <header className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full -translate-y-1/2 translate-x-1/2 -z-10" />
          <div className="space-y-1">
            <div className="flex items-center gap-3 mb-1">
               <h1 className="text-3xl font-black text-[#1A1A1A]">{selectedJob?.title || 'Select Job Role'}</h1>
               <span className="bg-indigo-50 text-[#6D28D9] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Cutoff: {selectedJob?.cutoff_score}%</span>
            </div>
            <p className="text-gray-400 font-medium">Hiring Pipeline — <span className="text-[#6D28D9] font-bold">AI Screening Enabled</span></p>
          </div>

          {/* Mini Analytics Panel */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-10 pt-8 border-t border-gray-50">
            {[
              { label: 'Total Applicants', value: analytics?.total || 0, icon: Users, color: 'text-indigo-600' },
              { label: 'Avg AI Match', value: `${analytics?.avg_score || 0}%`, icon: Sparkles, color: 'text-purple-600' },
              { label: 'Screening Passed', value: groupedApps['Reviewed'].length + groupedApps['Selected'].length, icon: TrendingUp, color: 'text-green-600' },
              { label: 'SLA Alerts', value: applications.filter(a => a.status === 'applied' && a.id % 2 === 0).length, icon: AlertTriangle, color: 'text-red-500' },
            ].map((stat, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center bg-gray-50", stat.color)}><stat.icon className="w-6 h-6" /></div>
                <div><div className="text-xl font-black text-[#1A1A1A]">{stat.value}</div><div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div></div>
              </div>
            ))}
          </div>
        </header>

        {/* Kanban Board */}
        <div className="flex gap-6 overflow-x-auto pb-10">
          {Object.entries(groupedApps).map(([status, apps]) => (
            <div key={status} className="min-w-[320px] flex-1 space-y-4">
              <div className="flex items-center justify-between px-3">
                <div className="flex items-center gap-3">
                  <span className="font-black text-[#1A1A1A] text-sm uppercase tracking-wider">{status}</span>
                  <span className="bg-white border border-gray-100 text-[#6D28D9] w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shadow-sm">{apps.length}</span>
                </div>
              </div>

              <div className="space-y-4">
                {apps.map((app) => (
                  <motion.div key={app.id} layoutId={`card-${app.id}`} whileHover={{ y: -4 }} className={cn("bg-white p-6 rounded-[2rem] border shadow-sm transition-all relative", app.status === 'processing' ? "border-indigo-100 bg-indigo-50/10" : "border-gray-50")}>
                    
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-[#1A1A1A]">Candidate #{app.id}</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Applied {new Date(app.created_at).toLocaleDateString()}</p>
                      </div>
                      {app.status === 'processing' && <div className="flex items-center gap-1.5 text-[#6D28D9] bg-indigo-50 px-2 py-1 rounded-full text-[8px] font-black uppercase animate-pulse"><Cpu className="w-2.5 h-2.5" /> Processing...</div>}
                      {app.status === 'reviewed' && <div className="bg-green-50 text-[#10B981] px-2 py-1 rounded-full text-[8px] font-black uppercase">Qualified</div>}
                      {app.status === 'closed' && <div className="bg-red-50 text-red-500 px-2 py-1 rounded-full text-[8px] font-black uppercase">Rejected</div>}
                    </div>

                    {app.status !== 'processing' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-black text-[#1A1A1A]">{app.overall_score}%</span>
                          <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded", app.overall_score >= (app.job?.cutoff_score || 70) ? "text-green-600 bg-green-50" : "text-red-500 bg-red-50")}>
                            {app.overall_score >= (app.job?.cutoff_score || 70) ? "Above Cutoff" : "Below Cutoff"}
                          </span>
                        </div>
                        
                        {status === 'Reviewed' && (
                          <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 flex items-center gap-2 mb-2">
                             <UserCheck className="w-4 h-4 text-[#6D28D9]" />
                             <span className="text-[10px] font-bold text-[#6D28D9] uppercase tracking-wider">AI Recommendation: YES</span>
                          </div>
                        )}

                        <div className="mt-4 flex flex-col gap-2">
                          <button onClick={() => setExpandedCard(expandedCard === app.id ? null : app.id)} className="w-full py-2 bg-[#F9FAFB] hover:bg-gray-100 rounded-xl text-[9px] font-black uppercase tracking-widest text-[#1A1A1A] transition-all">
                            {expandedCard === app.id ? "Hide Details" : "Why this candidate?"}
                          </button>
                          
                          <div className="flex gap-2">
                            {app.status === 'reviewed' && (
                              <>
                                <button 
                                  onClick={() => handleUpdateStatus(app.id, 'selected')}
                                  className="flex-1 py-2 bg-green-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-green-600 transition-colors shadow-sm"
                                >
                                  Select
                                </button>
                                <button 
                                  onClick={() => handleUpdateStatus(app.id, 'rejected')}
                                  className="flex-1 py-2 bg-red-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-600 transition-colors shadow-sm"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                          {app.status === 'selected' && (
                            <button 
                              disabled
                              className="flex-1 py-2 bg-indigo-50 text-[#6D28D9] rounded-xl text-[9px] font-black uppercase tracking-widest opacity-50"
                            >
                              Awaiting Onboarding
                            </button>
                          )}
                          {app.status === 'onboarded' && (
                            <div className="flex-1 py-2 bg-green-50 text-green-600 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1">
                               <Check className="w-3 h-3" /> Onboarded
                            </div>
                          )}
                          {app.status === 'rejected' && (
                            <div className="flex-1 py-2 bg-red-50 text-red-600 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1">
                               <XCircle className="w-3 h-3" /> Not Selected
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <AnimatePresence>
                      {expandedCard === app.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-4 pt-4 border-t border-gray-50 overflow-hidden space-y-4">
                           {(() => {
                                try {
                                  const exp = typeof app.explanation === 'string' ? JSON.parse(app.explanation) : app.explanation;
                                  if (!exp) return <p className="text-[10px] text-gray-400">Analysis pending...</p>;
                                  
                                  return (
                                    <>
                                      <div className="space-y-2">
                                        <p className="text-[9px] font-black text-[#1A1A1A] uppercase tracking-widest">Decision Insights</p>
                                        <ul className="space-y-1.5">
                                          {exp.strengths?.map((s, i) => (
                                            <li key={i} className="flex items-start gap-2 text-[10px] text-gray-600 font-medium">
                                              <span className="text-green-500 mt-0.5">✔</span> {s}
                                            </li>
                                          ))}
                                          {exp.gaps?.map((g, i) => (
                                            <li key={i} className="flex items-start gap-2 text-[10px] text-gray-600 font-medium">
                                              <span className="text-amber-500 mt-0.5">⚠</span> {g}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                      <div className="pt-2 border-t border-gray-50">
                                         <p className="text-[9px] font-black text-[#6D28D9] uppercase tracking-widest mb-1">AI Confidence</p>
                                         <p className="text-[10px] text-gray-500 font-medium italic">{exp.confidence_rationale || "High based on core match."}</p>
                                      </div>
                                    </>
                                  );
                                } catch(e) {
                                  return <p className="text-[10px] text-gray-400">Evaluation complete.</p>;
                                }
                             })()}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Post JD Modal */}
        <AnimatePresence>
          {showPostJD && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-xl rounded-[3rem] p-12 shadow-2xl overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-[#1A1A1A]">Create New Role</h2>
                  <button onClick={() => setShowPostJD(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handlePostJD} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-xs font-bold border border-red-100 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      {error}
                    </div>
                  )}
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Job Title</label>
                    <input type="text" required placeholder="Software Engineer Intern" className="w-full bg-[#F3F4F6] border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#6D28D9] outline-none font-bold" value={jdForm.title} onChange={e => setJdForm({...jdForm, title: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">AI Cutoff (%)</label>
                      <input type="number" min="0" max="100" className="w-full bg-[#F3F4F6] border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#6D28D9] outline-none font-bold text-center" value={jdForm.cutoff} onChange={e => setJdForm({...jdForm, cutoff: Number(e.target.value)})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Exposure</label>
                      <select className="w-full bg-[#F3F4F6] border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#6D28D9] outline-none font-bold" value={jdForm.experience} onChange={e => setJdForm({...jdForm, experience: e.target.value})}>
                        {expOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">JD PDF</label>
                       <label htmlFor="jd-pdf-upload" className="w-full bg-[#F3F4F6] border-2 border-dashed border-gray-200 rounded-2xl px-5 py-3 flex items-center justify-center gap-2 text-gray-400 cursor-pointer hover:border-[#6D28D9] transition-all h-[56px]">
                          <Upload className="w-4 h-4" /> <span className="text-[10px] font-black uppercase truncate">{fileLabel === 'Upload PDF' ? 'Upload' : fileLabel}</span>
                       </label>
                       <input type="file" id="jd-pdf-upload" className="hidden" accept=".pdf" onChange={handleFileChange} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Required Skills</label>
                    <div className="flex flex-wrap gap-2">
                      {skillOptions.map(skill => (
                        <button key={skill} type="button" onClick={() => handleSkillToggle(skill)} className={cn("px-4 py-2 rounded-xl text-[10px] font-black transition-all border", jdForm.skills.includes(skill) ? "bg-[#6D28D9] text-white border-[#6D28D9]" : "bg-white text-gray-400 border-gray-100 hover:border-gray-200")}>
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-[#6D28D9] text-white py-5 rounded-[2rem] font-black uppercase tracking-widest hover:bg-[#5B21B6] transition-all shadow-xl shadow-indigo-100 mt-4">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Create Job & Start AI Screening"}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default HRDashboard;
