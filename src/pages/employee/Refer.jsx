import React, { useState, useRef, useEffect } from 'react';
import { 
  UserPlus, 
  Upload, 
  Send, 
  Info,
  Mail,
  Smartphone,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  Award,
  FileText,
  X,
  UserCheck
} from 'lucide-react';
import { cn } from '../../utils/cn';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Refer = () => {
  const [jobs, setJobs] = useState([]);
  const [departments, setDepartments] = useState({});
  const [quota, setQuota] = useState({ remaining: 0, total_slots: 5, used_slots: 0 });
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    jobId: '',
    college: '',
    note: ''
  });

  const [resume, setResume] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [jobsRes, quotaRes] = await Promise.all([
        api.get('/api/jobs'),
        api.get('/api/referrals/quota')
      ]);
      
      const jobsData = jobsRes.data;
      setJobs(jobsData);
      setQuota(quotaRes.data);

      // Group jobs by department
      const depts = {};
      jobsData.forEach(job => {
        if (!depts[job.department]) depts[job.department] = [];
        depts[job.department].push(job);
      });
      setDepartments(depts);
    } catch (err) {
      toast.error('Failed to load referral data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDeptChange = (e) => {
    const dept = e.target.value;
    setFormData({ ...formData, department: dept, jobId: '' });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setResume(file);
    } else {
      toast.error('Please upload a PDF file.');
    }
  };

  const removeResume = () => {
    setResume(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.email || !formData.jobId) {
      toast.error('Please fill all required fields');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // In a real app, you would upload the resume to S3 first and get a URL
      const resumeUrl = resume ? 'https://example.com/resume.pdf' : null;

      await api.post('/api/referrals', {
        intern_name: `${formData.firstName} ${formData.lastName}`,
        intern_email: formData.email,
        job_id: formData.jobId,
        intern_college: formData.college,
        intern_degree: '', // Optional for now
        intern_grad_year: '',
        resume_url: resumeUrl,
        note_to_hr: formData.note
      });

      toast.success('Referral submitted successfully!');
      
      // Reset form
      setFormData({
        firstName: '', lastName: '', email: '', phone: '',
        department: '', jobId: '', college: '', note: ''
      });
      removeResume();
      fetchData(); // Refresh quota
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit referral');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading referral form...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Refer an Intern</h1>
        <p className="text-slate-500 mt-1 font-medium">Help a talented student join InternFlow.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Referral Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-8">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Intern Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">First Name *</label>
                <input required name="firstName" value={formData.firstName} onChange={handleInputChange} type="text" placeholder="e.g. Rahul" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Last Name</label>
                <input name="lastName" value={formData.lastName} onChange={handleInputChange} type="text" placeholder="e.g. Verma" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-2">
                  <Mail size={12} /> Email Address *
                </label>
                <input required name="email" value={formData.email} onChange={handleInputChange} type="email" placeholder="rahul.v@college.edu" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-2">
                  <Smartphone size={12} /> Phone Number
                </label>
                <input name="phone" value={formData.phone} onChange={handleInputChange} type="tel" placeholder="+91 98765 43210" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all" />
              </div>

              {/* Department Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-2">
                  <Briefcase size={12} /> Department *
                </label>
                <select 
                  required
                  value={formData.department}
                  onChange={handleDeptChange}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 appearance-none cursor-pointer"
                >
                  <option value="">Select Department</option>
                  {Object.keys(departments).map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Target Role Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-2">
                  <UserPlus size={12} /> Target Role *
                </label>
                <select 
                  required
                  name="jobId"
                  value={formData.jobId}
                  onChange={handleInputChange}
                  disabled={!formData.department}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select Role</option>
                  {formData.department && departments[formData.department]?.map(job => (
                    <option key={job.id} value={job.id}>{job.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-2">
                  <GraduationCap size={12} /> University / College
                </label>
                <input name="college" value={formData.college} onChange={handleInputChange} type="text" placeholder="IIT Delhi" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Resume / CV (PDF Only)</label>
                {!resume ? (
                  <div 
                    onClick={() => fileInputRef.current.click()}
                    className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-purple-50 hover:border-purple-200 transition-all group cursor-pointer"
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden" 
                      accept=".pdf"
                    />
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-purple-600 transition-colors mb-4">
                      <Upload size={24} />
                    </div>
                    <p className="text-sm font-bold text-slate-600">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-400 mt-1">PDF up to 10MB</p>
                  </div>
                ) : (
                  <div className="p-4 bg-purple-50 border border-purple-100 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-purple-600 shadow-sm">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{resume.name}</p>
                        <p className="text-[10px] text-slate-500">{(resume.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={removeResume}
                      className="p-2 hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded-lg transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Notes for HR (Optional)</label>
                <textarea name="note" value={formData.note} onChange={handleInputChange} placeholder="Tell us why you recommend this candidate..." className="w-full h-32 p-6 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all resize-none" />
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={isSubmitting || quota.remaining <= 0}
                className={`w-full py-4 bg-gradient-to-r from-purple-600 to-violet-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2 ${isSubmitting || quota.remaining <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.01]'}`}
              >
                <Send size={18} />
                {isSubmitting ? 'Submitting...' : 'Submit Referral & Send Email'}
              </button>
            </div>
          </form>
        </div>

        {/* Info Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs mb-8">What happens next?</h3>
            <div className="space-y-8 relative">
              <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-50" />
              {[
                { title: 'Email Sent', desc: 'Intern receives a personal invite email from you.', icon: Mail, status: 'done' },
                { title: 'Intern Logs In', desc: 'They complete their profile and take assessments.', icon: UserPlus, status: 'pending' },
                { title: 'AI Screening', desc: 'Our AI analyzes their resume and skill set.', icon: Info, status: 'pending' },
                { title: 'HR Review', desc: 'HR team reviews the application for final selection.', icon: CheckCircle2, status: 'pending' },
                { title: 'Onboarding', desc: 'Onboarding completed & your reward is issued!', icon: Award, status: 'pending' },
              ].map((step, i) => (
                <div key={i} className="flex gap-4 relative z-10">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-white border-4 border-white shadow-sm shrink-0",
                    step.status === 'done' ? "bg-emerald-500" : "bg-slate-100 text-slate-400"
                  )}>
                    {step.status === 'done' ? <CheckCircle2 size={14} /> : <div className="w-2 h-2 bg-slate-300 rounded-full" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{step.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <Award className="text-amber-400" size={20} />
              </div>
              <h4 className="font-bold text-sm">Reward Program</h4>
            </div>
            <p className="text-xs text-indigo-100 leading-relaxed font-medium mb-6">
              Earn <span className="text-white font-bold">₹2,500</span> for every successful onboarded referral. Rewards are issued within 48 hours of joining.
            </p>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-indigo-300 mb-2">
                <span>Quota Usage</span>
                <span>{quota.used_slots}/{quota.total_slots}</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 rounded-full transition-all" 
                  style={{ width: `${(quota.used_slots / quota.total_slots) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Refer;
