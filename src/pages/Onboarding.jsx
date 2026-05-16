import React, { useState, useEffect } from 'react';
import { UserCheck, FileText, Monitor, Users, CheckCircle2, Circle, MessageSquare, Mail, FileStack } from 'lucide-react';
import { cn } from '../utils/cn';
import ProgressBar from '../components/ProgressBar';
import api from '../services/api';
import toast from 'react-hot-toast';

const Onboarding = () => {
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOnboarding();
  }, []);

  const fetchOnboarding = async () => {
    try {
      const response = await api.get('/api/onboarding');
      setInterns(response.data);
    } catch (err) {
      toast.error('Failed to load onboarding data');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const calculateProgress = (intern) => {
    let completed = 0;
    if (intern.nda_signed) completed++;
    if (intern.credentials_issued) completed += 2;
    // Assuming 3 main steps: NDA, Credentials (Access + Email)
    return Math.min(100, Math.round((completed / 3) * 100));
  };

  const activeInterns = interns.filter(i => ['offered', 'offer_pending', 'offer_accepted', 'onboarded'].includes(i.app_status));
  const onboardedInterns = interns.filter(i => i.app_status === 'onboarded');
  const ndaCount = interns.filter(i => i.nda_signed).length;
  const accessCount = interns.filter(i => i.credentials_issued).length;

  const onboardingStats = [
    { label: "Total Onboarding", value: activeInterns.length.toString(), icon: Users, color: "text-primary-600", bg: "bg-primary-50" },
    { label: "Fully Onboarded", value: onboardedInterns.length.toString(), icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "NDAs Signed", value: ndaCount.toString(), icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Access Granted", value: accessCount.toString(), icon: Monitor, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  if (loading) return <div className="p-8 animate-pulse">Loading onboarding data...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Onboarding Process</h1>
          <p className="text-slate-500">Monitor and manage new intern arrivals</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {onboardingStats.map((stat, i) => (
          <div key={i} className="card p-6 flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", stat.bg, stat.color)}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-bold mb-6 text-slate-800">Active Onboarding</h3>
            <div className="space-y-8">
              {activeInterns.map((intern) => {
                const progress = calculateProgress(intern);
                return (
                <div key={intern.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold shrink-0">
                        {getInitials(intern.name)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 leading-none">{intern.name}</h4>
                        <p className="text-xs text-slate-500 mt-1">{intern.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-primary-600">{progress}%</span>
                    </div>
                  </div>
                  
                  <ProgressBar progress={progress} className="mt-4" />

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="flex items-center gap-2">
                      {intern.nda_signed ? (
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                      ) : (
                        <Circle size={16} className="text-slate-300 shrink-0" />
                      )}
                      <span className={cn("text-xs", intern.nda_signed ? "text-slate-900 font-medium" : "text-slate-400")}>
                        NDA Signed
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {intern.credentials_issued ? (
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                      ) : (
                        <Circle size={16} className="text-slate-300 shrink-0" />
                      )}
                      <span className={cn("text-xs", intern.credentials_issued ? "text-slate-900 font-medium" : "text-slate-400")}>
                        Access Provisioned
                      </span>
                    </div>
                  </div>
                </div>
              )})}
              {activeInterns.length === 0 && (
                <p className="text-slate-500 text-sm">No interns currently onboarding.</p>
              )}
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-bold mb-6 text-slate-800">Access Provisioning Overview</h3>
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-50 space-y-4 border border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-900 border border-slate-200">
                    <MessageSquare size={18} />
                  </div>
                  <span className="font-semibold text-sm">Slack Workspace</span>
                </div>
                <span className="text-xs font-bold text-emerald-600">
                  {Math.round((accessCount / (activeInterns.length || 1)) * 100)}%
                </span>
              </div>
              <ProgressBar progress={(accessCount / (activeInterns.length || 1)) * 100} className="h-1.5 bg-white" />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 space-y-4 border border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-900 border border-slate-200">
                    <Mail size={18} />
                  </div>
                  <span className="font-semibold text-sm">Corporate Email</span>
                </div>
                <span className="text-xs font-bold text-blue-600">
                  {Math.round((accessCount / (activeInterns.length || 1)) * 100)}%
                </span>
              </div>
              <ProgressBar progress={(accessCount / (activeInterns.length || 1)) * 100} className="h-1.5 bg-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
