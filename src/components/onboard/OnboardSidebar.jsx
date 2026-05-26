import React from 'react';
import { useLocation } from 'react-router-dom';
import { Briefcase, FileText, Cpu, Gift, FolderOpen, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';

const STEPS = [
  { label: 'Job Position', path: '/intern-onboard/job', icon: Briefcase, step: 1 },
  { label: 'Application', path: '/intern-onboard/application', icon: FileText, step: 2 },
  { label: 'AI Screening', path: '/intern-onboard/screening', icon: Cpu, step: 3 },
  { label: 'Offer Letter', path: '/intern-onboard/offer', icon: Gift, step: 4 },
  { label: 'Documents', path: '/intern-onboard/documents', icon: FolderOpen, step: 5 },
  { label: 'Complete', path: '/intern-onboard/success', icon: Sparkles, step: 6 },
];

const STEP_MAP = {
  '/intern-onboard/job': 1,
  '/intern-onboard/application': 2,
  '/intern-onboard/screening': 3,
  '/intern-onboard/offer': 4,
  '/intern-onboard/documents': 5,
  '/intern-onboard/success': 6,
};

const OnboardSidebar = () => {
  const { pathname } = useLocation();
  const currentStep = STEP_MAP[pathname] || 1;
  const progressPct = Math.round(((currentStep - 1) / (STEPS.length - 1)) * 100);

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-100 flex flex-col z-30 shadow-sm">
      {/* Logo */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-violet-500 rounded-xl flex items-center justify-center shadow-md shadow-purple-100 shrink-0">
            <Briefcase size={17} className="text-white" />
          </div>
          <div className="min-w-0">
            <div className="font-black text-slate-900 text-sm leading-none">InternFlow</div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Onboarding Portal</div>
          </div>
        </div>
      </div>

      {/* Steps Nav */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-3">Your Journey</p>
        <div className="space-y-0.5">
          {STEPS.map((s) => {
            const isCompleted = s.step < currentStep;
            const isActive = s.step === currentStep;
            const isLocked = s.step > currentStep;
            const Icon = s.icon;

            return (
              <div key={s.path} className="relative">
                {s.step < STEPS.length && (
                  <div className={cn(
                    'absolute left-[22px] top-[46px] w-0.5 h-3 z-0',
                    isCompleted ? 'bg-purple-200' : 'bg-slate-100'
                  )} />
                )}
                <div className={cn(
                  'relative z-10 flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                  isActive && 'bg-purple-50 border border-purple-100',
                  !isActive && !isLocked && 'hover:bg-slate-50 cursor-pointer',
                  isLocked && 'opacity-40 cursor-not-allowed'
                )}>
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all',
                    isCompleted && 'bg-purple-100 text-purple-600',
                    isActive && 'bg-gradient-to-br from-purple-600 to-violet-500 text-white shadow-md shadow-purple-200',
                    isLocked && 'bg-slate-100 text-slate-300'
                  )}>
                    {isCompleted
                      ? <CheckCircle2 size={15} />
                      : isLocked
                        ? <Lock size={13} />
                        : <Icon size={15} />
                    }
                  </div>
                  <div className="min-w-0">
                    <div className={cn(
                      'text-sm font-semibold truncate leading-tight',
                      isActive ? 'text-purple-700' : isCompleted ? 'text-slate-700' : 'text-slate-300'
                    )}>
                      {s.label}
                    </div>
                    <div className={cn(
                      'text-[10px] font-medium mt-0.5',
                      isActive ? 'text-purple-500' : isCompleted ? 'text-slate-400' : 'text-slate-300'
                    )}>
                      {isCompleted ? 'Completed' : isActive ? 'In Progress' : 'Pending'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </nav>

      {/* Progress Footer */}
      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-500">Progress</span>
            <span className="text-xs font-black text-purple-600">{progressPct}%</span>
          </div>
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-violet-500 rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 font-medium mt-2">
            Step {currentStep} of {STEPS.length}
          </p>
        </div>
      </div>
    </aside>
  );
};

export default OnboardSidebar;
