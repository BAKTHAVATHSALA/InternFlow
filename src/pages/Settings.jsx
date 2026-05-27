import React, { useState, useEffect, useCallback } from 'react';
import {
  User, Shield, Mail, Phone, Building, Briefcase,
  Loader2, CheckCircle2, Eye, EyeOff, KeyRound
} from 'lucide-react';
import { cn } from '../utils/cn';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const TABS = [
  { id: 'profile',  label: 'Profile',  icon: User   },
  { id: 'security', label: 'Security', icon: Shield  },
];

const Field = ({ label, icon: Icon, error, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</label>
    <div className="relative">
      {Icon && <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />}
      <input
        {...props}
        className={cn(
          'w-full py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition-colors',
          Icon ? 'pl-9 pr-4' : 'px-4',
          error ? 'border-rose-300' : 'border-slate-200'
        )}
      />
    </div>
    {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
  </div>
);

const PasswordField = ({ label, value, onChange, error, placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</label>
      <div className="relative">
        <KeyRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder || '••••••••'}
          className={cn(
            'w-full pl-9 pr-10 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition-colors',
            error ? 'border-rose-300' : 'border-slate-200'
          )}
        />
        <button
          type="button"
          onClick={() => setShow(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
    </div>
  );
};

const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'HR';

const Settings = () => {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // Profile state
  const [profile, setProfile]       = useState({ name: '', email: '', role: '', title: '', department: '', phone: '' });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving]   = useState(false);
  const [profileErrors, setProfileErrors]   = useState({});

  // Security state
  const [pwForm, setPwForm]         = useState({ current: '', next: '', confirm: '' });
  const [pwErrors, setPwErrors]     = useState({});
  const [pwSaving, setPwSaving]     = useState(false);
  const [pwSuccess, setPwSuccess]   = useState(false);

  const fetchProfile = useCallback(async () => {
    setProfileLoading(true);
    try {
      const { data } = await api.get('/api/settings/profile');
      setProfile({
        name:       data.name       || '',
        email:      data.email      || '',
        role:       data.role       || '',
        title:      data.title      || '',
        department: data.department || '',
        phone:      data.phone      || '',
      });
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  // --- Profile save ---
  const validateProfile = () => {
    const errs = {};
    if (!profile.name.trim()) errs.name = 'Name is required';
    return errs;
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    const errs = validateProfile();
    if (Object.keys(errs).length) { setProfileErrors(errs); return; }
    setProfileErrors({});
    setProfileSaving(true);
    try {
      await api.patch('/api/settings/profile', {
        name:       profile.name.trim()       || null,
        title:      profile.title.trim()      || null,
        department: profile.department.trim() || null,
        phone:      profile.phone.trim()      || null,
      });
      toast.success('Profile saved');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save profile');
    } finally {
      setProfileSaving(false);
    }
  };

  // --- Password save ---
  const validatePassword = () => {
    const errs = {};
    if (!pwForm.current)           errs.current  = 'Current password is required';
    if (!pwForm.next)              errs.next     = 'New password is required';
    else if (pwForm.next.length < 8) errs.next   = 'Must be at least 8 characters';
    if (pwForm.next !== pwForm.confirm) errs.confirm = 'Passwords do not match';
    return errs;
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    const errs = validatePassword();
    if (Object.keys(errs).length) { setPwErrors(errs); return; }
    setPwErrors({});
    setPwSaving(true);
    setPwSuccess(false);
    try {
      await api.patch('/api/settings/password', {
        current_password: pwForm.current,
        new_password:     pwForm.next,
      });
      toast.success('Password updated');
      setPwForm({ current: '', next: '', confirm: '' });
      setPwSuccess(true);
      setTimeout(() => setPwSuccess(false), 4000);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update password');
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="w-full max-w-2xl space-y-6">

      {/* Header */}
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="text-slate-400 text-sm mt-0.5 font-medium">Manage your account details and security</p>
      </div>

      {/* Tabs */}
      <div className="tabs-scroll bg-slate-100 p-1 rounded-xl">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              'flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all',
              activeTab === id
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {profileLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={24} className="animate-spin text-purple-400" />
            </div>
          ) : (
            <form onSubmit={handleProfileSave}>
              {/* Avatar banner */}
              <div className="bg-gradient-to-r from-purple-600 to-violet-500 px-5 md:px-8 py-5 md:py-6 flex items-center gap-4 md:gap-5">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center text-white text-lg md:text-xl font-black shadow-lg shrink-0">
                  {getInitials(profile.name)}
                </div>
                <div className="min-w-0">
                  <p className="text-white font-black text-base md:text-lg leading-tight truncate">{profile.name || '—'}</p>
                  <p className="text-purple-200 text-sm font-medium mt-0.5 capitalize">{profile.role}</p>
                </div>
              </div>

              <div className="p-5 md:p-8 space-y-5">
                <Field
                  label="Full Name"
                  value={profile.name}
                  onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                  error={profileErrors.name}
                  placeholder="Your full name"
                />

                <Field
                  label="Email Address"
                  icon={Mail}
                  value={profile.email}
                  readOnly
                  disabled
                  className="opacity-60 cursor-not-allowed"
                  placeholder="—"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field
                    label="Job Title"
                    icon={Briefcase}
                    value={profile.title}
                    onChange={e => setProfile(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. HR Administrator"
                  />
                  <Field
                    label="Department"
                    icon={Building}
                    value={profile.department}
                    onChange={e => setProfile(p => ({ ...p, department: e.target.value }))}
                    placeholder="e.g. People Operations"
                  />
                  <Field
                    label="Phone Number"
                    icon={Phone}
                    value={profile.phone}
                    onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+91 99999 99999"
                    type="tel"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-violet-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-purple-100 hover:scale-[1.02] transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {profileSaving
                      ? <><Loader2 size={15} className="animate-spin" /> Saving…</>
                      : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-8 space-y-6">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Password Management</p>
            <p className="text-sm text-slate-500">Choose a strong password that you don't use elsewhere.</p>
          </div>

          {pwSuccess && (
            <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span className="text-sm font-semibold text-emerald-700">Password updated successfully.</span>
            </div>
          )}

          <form onSubmit={handlePasswordSave} className="space-y-4">
            <PasswordField
              label="Current Password"
              value={pwForm.current}
              onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))}
              error={pwErrors.current}
              placeholder="Your current password"
            />
            <PasswordField
              label="New Password"
              value={pwForm.next}
              onChange={e => setPwForm(p => ({ ...p, next: e.target.value }))}
              error={pwErrors.next}
              placeholder="Min. 8 characters"
            />
            <PasswordField
              label="Confirm New Password"
              value={pwForm.confirm}
              onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
              error={pwErrors.confirm}
              placeholder="Repeat new password"
            />

            {/* Strength hint */}
            {pwForm.next && (
              <div className="space-y-1.5">
                <div className="flex gap-1">
                  {[8, 12, 16].map(len => (
                    <div
                      key={len}
                      className={cn(
                        'flex-1 h-1 rounded-full transition-colors',
                        pwForm.next.length >= len ? 'bg-emerald-500' : 'bg-slate-100'
                      )}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  {pwForm.next.length < 8 ? 'Too short' : pwForm.next.length < 12 ? 'Acceptable' : 'Strong'}
                </p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={pwSaving}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-violet-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-purple-100 hover:scale-[1.02] transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {pwSaving
                  ? <><Loader2 size={15} className="animate-spin" /> Updating…</>
                  : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Settings;
