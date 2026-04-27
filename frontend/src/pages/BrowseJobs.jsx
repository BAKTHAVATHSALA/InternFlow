import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Briefcase, MapPin, Clock, ArrowRight, Sparkles, CheckCircle, Loader2, Info, X, Upload, Mail, User, FileText } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const BrowseJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(null); // Will store the selected job object
  const [applying, setApplying] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({ name: '', email: '', resume: null });
  const [resumeLabel, setResumeLabel] = useState('Upload Resume (PDF)');

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8000/jobs/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(res.data);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, resume: file });
      setResumeLabel(file.name.substring(0, 20) + (file.name.length > 20 ? '...' : ''));
    }
  };

  const handleFinalApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    try {
      const token = localStorage.getItem('token');
      // In a real production app, we would use FormData for file upload
      // For this demo, we'll simulate the successful upload and create the application
      await axios.post('http://localhost:8000/applications/', {
        job_id: showApplyModal.id
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setShowApplyModal(null);
      setSuccess(true);
      setTimeout(() => {
        navigate('/intern');
      }, 2500);
    } catch (err) {
      console.error('Error applying:', err);
      const errorMsg = err.response?.data?.detail || 'An error occurred during application. Please try again.';
      alert(errorMsg);
      setShowApplyModal(null); // Close modal so they can see the list again
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <Loader2 className="w-10 h-10 animate-spin text-[#6D28D9]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 lg:p-12">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-[#1A1A1A] mb-2 tracking-tight">Discover Opportunities</h1>
            <p className="text-gray-500 font-medium">Find the perfect internship and let our AI showcase your potential.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search roles or skills..."
              className="pl-12 pr-6 py-4 bg-white border-none rounded-2xl shadow-sm w-full md:w-80 focus:ring-2 focus:ring-[#6D28D9] outline-none font-medium"
            />
          </div>
        </header>

        {/* Job Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <motion.div 
              key={job.id}
              whileHover={{ y: -8 }}
              className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-50 flex flex-col h-full group transition-all hover:shadow-xl hover:shadow-indigo-100/50"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-[#6D28D9] group-hover:bg-[#6D28D9] group-hover:text-white transition-all duration-500">
                  <Briefcase className="w-7 h-7" />
                </div>
                <div className="bg-green-50 text-[#10B981] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Active
                </div>
              </div>

              <h2 className="text-xl font-black text-[#1A1A1A] mb-2">{job.title}</h2>
              <p className="text-gray-400 text-sm font-medium mb-6 line-clamp-2">{job.description}</p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2 text-gray-400 text-xs font-bold">
                  <Clock className="w-4 h-4" /> {job.experience_level}
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {job.requirements?.required_skills?.slice(0, 3).map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-50 text-gray-500 rounded-lg text-[9px] font-black uppercase tracking-wider">{skill}</span>
                  ))}
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-gray-50">
                <button 
                  onClick={() => setShowApplyModal(job)}
                  className="w-full py-4 bg-[#6D28D9] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-[#5B21B6] transition-all flex items-center justify-center gap-2"
                >
                  Apply Now <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Apply Modal */}
        <AnimatePresence>
          {showApplyModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-[#1A1A1A]/60 backdrop-blur-md flex items-center justify-center p-6"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white w-full max-w-xl rounded-[3rem] p-12 shadow-2xl relative"
              >
                <button onClick={() => setShowApplyModal(null)} className="absolute top-8 right-8 p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-6 h-6" />
                </button>
                
                <div className="text-center mb-10">
                   <div className="w-16 h-16 bg-indigo-50 text-[#6D28D9] rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8" />
                   </div>
                   <h2 className="text-2xl font-black text-[#1A1A1A]">Apply for {showApplyModal.title}</h2>
                   <p className="text-gray-400 font-medium text-sm">Please provide your details for AI evaluation</p>
                </div>

                <form onSubmit={handleFinalApply} className="space-y-6">
                   <div className="space-y-4">
                      <div className="relative">
                         <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                         <input 
                           type="text" 
                           required
                           placeholder="Full Name"
                           className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-6 py-4 focus:ring-2 focus:ring-[#6D28D9] outline-none font-bold"
                           value={formData.name}
                           onChange={e => setFormData({...formData, name: e.target.value})}
                         />
                      </div>
                      <div className="relative">
                         <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                         <input 
                           type="email" 
                           required
                           placeholder="Email Address"
                           className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-6 py-4 focus:ring-2 focus:ring-[#6D28D9] outline-none font-bold"
                           value={formData.email}
                           onChange={e => setFormData({...formData, email: e.target.value})}
                         />
                      </div>
                      <div className="relative">
                         <input 
                           type="file" 
                           id="resume-upload" 
                           className="hidden" 
                           accept=".pdf"
                           onChange={handleFileChange}
                           required
                         />
                         <label htmlFor="resume-upload" className="w-full bg-indigo-50/50 border-2 border-dashed border-indigo-100 rounded-2xl px-6 py-8 flex flex-col items-center gap-3 cursor-pointer hover:bg-indigo-50 transition-all">
                            <Upload className="w-8 h-8 text-[#6D28D9]" />
                            <span className="text-xs font-black uppercase tracking-widest text-[#6D28D9]">{resumeLabel}</span>
                         </label>
                      </div>
                   </div>

                   <button 
                     type="submit" 
                     disabled={applying}
                     className="w-full bg-[#6D28D9] text-white py-5 rounded-[2rem] font-black uppercase tracking-widest hover:bg-[#5B21B6] transition-all shadow-xl shadow-indigo-100 mt-4 flex items-center justify-center gap-2"
                   >
                     {applying ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Application & Start AI Screening"}
                   </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Modal */}
        <AnimatePresence>
          {success && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-[#6D28D9]/95 backdrop-blur-xl flex items-center justify-center p-6"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="text-center text-white"
              >
                <div className="w-24 h-24 bg-white text-[#6D28D9] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                  <Sparkles className="w-12 h-12" />
                </div>
                <h2 className="text-4xl font-black mb-4">Application Sent!</h2>
                <p className="text-white/70 font-medium text-lg">Our AI is now analyzing your profile against the role...</p>
                <div className="mt-10 flex items-center justify-center gap-2 text-white/50 text-xs font-black uppercase tracking-[0.2em]">
                  <Loader2 className="w-4 h-4 animate-spin" /> Redirecting to Portal
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default BrowseJobs;
