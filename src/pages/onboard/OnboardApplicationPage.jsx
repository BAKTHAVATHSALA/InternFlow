import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Check, FileText, ArrowRight, ChevronRight, User, GraduationCap, Upload, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useOnboardingAuth } from '../../contexts/OnboardingAuthContext';
import api from '../../services/api';

const OnboardApplicationPage = () => {
  const navigate = useNavigate();
  const { onboardUser } = useOnboardingAuth();
  const fileInputRef = useRef(null);

  // Split name from auth into first/last
  const nameParts = (onboardUser?.name || '').trim().split(' ');
  const defaultFirst = nameParts[0] || '';
  const defaultLast = nameParts.slice(1).join(' ') || '';

  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [resume, setResume] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const [checklist, setChecklist] = useState([
    { id: 1, label: 'I am available for the full internship duration', checked: false },
    { id: 2, label: 'I have no conflicting academic schedule', checked: false },
    { id: 3, label: 'I agree to the referral programme terms', checked: false },
    { id: 4, label: 'All information I have provided is accurate', checked: false },
  ]);

  const [form, setForm] = useState({
    firstName: defaultFirst,
    lastName: defaultLast,
    phone: '',
    city: '',
    college: '',
    degree: '',
    gradYear: '',
    cgpa: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // --- Skills ---
  const addSkill = () => {
    const s = newSkill.trim();
    if (s && !skills.includes(s)) { setSkills([...skills, s]); setNewSkill(''); }
  };

  // --- Checklist ---
  const toggleCheck = (id) => setChecklist(checklist.map(c => c.id === id ? { ...c, checked: !c.checked } : c));
  const allChecked = checklist.every(c => c.checked);

  // --- Resume upload ---
  const handleFile = (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setErrors(prev => ({ ...prev, resume: 'Only PDF files are accepted.' }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, resume: 'File must be under 10 MB.' }));
      return;
    }
    setErrors(prev => ({ ...prev, resume: null }));
    setResume(file);
  };

  const handleFileInput = (e) => handleFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  // --- Validation ---
  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'Required';
    if (!form.phone.trim()) errs.phone = 'Required';
    if (!form.college.trim()) errs.college = 'Required';
    if (!form.degree.trim()) errs.degree = 'Required';
    if (!form.gradYear.trim()) errs.gradYear = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!allChecked) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const token = localStorage.getItem('onboard_token');
      const { data } = await api.post(
        '/api/applications/onboard-apply',
        {
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          city: form.city,
          college: form.college,
          degree: form.degree,
          cgpa: form.cgpa,
          gradYear: form.gradYear,
          skills,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/intern-onboard/screening', { state: { ai: data.ai, applicationId: data.applicationId } });
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = (key) => cn(
    'w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all',
    errors[key] ? 'border-rose-400 bg-rose-50' : 'border-slate-200'
  );

  return (
    <div className="max-w-3xl space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium">
        <span className="text-purple-600 font-bold">Step 2 of 6</span>
        <ChevronRight size={12} className="text-slate-300" />
        <span className="text-slate-400">Complete Your Application</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Your Application</h1>
        <p className="text-sm text-slate-500 mt-1">Fill in your details carefully — this information will be reviewed by HR.</p>
      </div>

      {/* Personal Details */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-5 flex items-center gap-2">
          <User size={12} /> Personal Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              First Name <span className="text-rose-400">*</span>
            </label>
            <input
              value={form.firstName}
              onChange={e => setForm({ ...form, firstName: e.target.value })}
              placeholder="Enter your first name"
              className={inputCls('firstName')}
            />
            {errors.firstName && <p className="text-xs text-rose-500 mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Last Name</label>
            <input
              value={form.lastName}
              onChange={e => setForm({ ...form, lastName: e.target.value })}
              placeholder="Enter your last name"
              className={inputCls('lastName')}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Email Address
            </label>
            <input
              value={onboardUser?.email || ''}
              readOnly
              className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-400 cursor-not-allowed"
            />
            <p className="text-[10px] text-slate-400 mt-1">Verified via OTP — cannot be changed</p>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Phone Number <span className="text-rose-400">*</span>
            </label>
            <input
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              placeholder="+91 98765 43210"
              type="tel"
              className={inputCls('phone')}
            />
            {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>}
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">City</label>
            <input
              value={form.city}
              onChange={e => setForm({ ...form, city: e.target.value })}
              placeholder="Chennai, Mumbai, Bangalore..."
              className={inputCls('city')}
            />
          </div>
        </div>
      </div>

      {/* Education */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-5 flex items-center gap-2">
          <GraduationCap size={12} /> Education
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              College / University <span className="text-rose-400">*</span>
            </label>
            <input
              value={form.college}
              onChange={e => setForm({ ...form, college: e.target.value })}
              placeholder="Anna University, IIT Madras..."
              className={inputCls('college')}
            />
            {errors.college && <p className="text-xs text-rose-500 mt-1">{errors.college}</p>}
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Degree <span className="text-rose-400">*</span>
            </label>
            <input
              value={form.degree}
              onChange={e => setForm({ ...form, degree: e.target.value })}
              placeholder="B.Tech CSE, BCA..."
              className={inputCls('degree')}
            />
            {errors.degree && <p className="text-xs text-rose-500 mt-1">{errors.degree}</p>}
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Graduation Year <span className="text-rose-400">*</span>
            </label>
            <input
              value={form.gradYear}
              onChange={e => setForm({ ...form, gradYear: e.target.value })}
              placeholder="2025, 2026..."
              className={inputCls('gradYear')}
            />
            {errors.gradYear && <p className="text-xs text-rose-500 mt-1">{errors.gradYear}</p>}
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">CGPA / Percentage</label>
            <input
              value={form.cgpa}
              onChange={e => setForm({ ...form, cgpa: e.target.value })}
              placeholder="8.5 / 10 or 85%"
              className={inputCls('cgpa')}
            />
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Skills & Expertise</h3>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {skills.map(s => (
              <span key={s} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-bold rounded-full border border-purple-100">
                {s}
                <button onClick={() => setSkills(skills.filter(x => x !== s))} className="hover:text-rose-500 transition-colors">
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            value={newSkill}
            onChange={e => setNewSkill(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            placeholder="Type a skill and press Enter (e.g. React, Python...)"
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all"
          />
          <button
            type="button"
            onClick={addSkill}
            className="px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
        {skills.length === 0 && (
          <p className="text-xs text-slate-400 mt-2">Add the skills most relevant to this role.</p>
        )}
      </div>

      {/* Resume Upload */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Resume / CV (PDF)</h3>

        {resume ? (
          <div className="flex items-center justify-between p-4 bg-purple-50 border border-purple-100 rounded-xl">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-purple-100 shadow-sm shrink-0">
                <FileText size={18} className="text-purple-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{resume.name}</p>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <Check size={10} className="text-emerald-500" strokeWidth={3} />
                  {(resume.size / 1024).toFixed(0)} KB · PDF
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { setResume(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
              className="text-xs font-bold text-rose-500 px-3 py-1.5 border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors ml-3 shrink-0"
            >
              Remove
            </button>
          </div>
        ) : (
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all',
              dragOver ? 'border-purple-400 bg-purple-50' : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileInput}
              className="hidden"
            />
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors',
              dragOver ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400'
            )}>
              <Upload size={22} />
            </div>
            <p className="text-sm font-bold text-slate-700">
              {dragOver ? 'Drop your PDF here' : 'Click to upload or drag & drop'}
            </p>
            <p className="text-xs text-slate-400 mt-1">PDF only · Max 10 MB</p>
          </div>
        )}

        {errors.resume && (
          <div className="flex items-center gap-2 mt-2 text-xs text-rose-600">
            <AlertCircle size={12} /> {errors.resume}
          </div>
        )}
      </div>

      {/* Checklist */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Requirements Confirmation</h3>
        <div className="space-y-2">
          {checklist.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleCheck(item.id)}
              className={cn(
                'w-full flex items-center gap-3 p-3.5 rounded-xl transition-all text-left',
                item.checked ? 'bg-purple-50 border border-purple-100' : 'hover:bg-slate-50 border border-transparent'
              )}
            >
              <div className={cn(
                'w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all border',
                item.checked ? 'bg-purple-600 border-purple-600' : 'border-slate-300 bg-white'
              )}>
                {item.checked && <Check size={12} className="text-white" strokeWidth={3} />}
              </div>
              <span className={cn('text-sm font-medium', item.checked ? 'text-slate-700' : 'text-slate-500')}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Submit validation warning */}
      {!allChecked && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
          <AlertCircle size={16} className="text-amber-600 shrink-0" />
          <p className="text-sm text-amber-700 font-medium">Please check all requirement boxes before submitting.</p>
        </div>
      )}

      {submitError && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-xl">
          <AlertCircle size={16} className="text-rose-600 shrink-0" />
          <p className="text-sm text-rose-700 font-medium">{submitError}</p>
        </div>
      )}

      {submitting && (
        <div className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-100 rounded-xl">
          <Loader2 size={16} className="text-purple-600 shrink-0 animate-spin" />
          <p className="text-sm text-purple-700 font-medium">Running AI screening — this may take a few seconds...</p>
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full py-4 bg-gradient-to-r from-purple-600 to-violet-500 text-white rounded-xl font-bold shadow-lg shadow-purple-200 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
      >
        {submitting ? (
          <><Loader2 size={18} className="animate-spin" /> Analyzing your profile...</>
        ) : (
          <>Submit Application <ArrowRight size={18} /></>
        )}
      </button>
    </div>
  );
};

export default OnboardApplicationPage;
