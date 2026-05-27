import React from 'react';
import { 
  Mail, 
  LogIn, 
  Briefcase, 
  FileText, 
  Cpu, 
  Target, 
  FileCheck, 
  CheckCircle2,
  Check
} from 'lucide-react';
import { cn } from '../../utils/cn';

const steps = [
  { id: 1, label: 'Email', icon: Mail },
  { id: 2, label: 'Login', icon: LogIn },
  { id: 3, label: 'Job', icon: Briefcase },
  { id: 4, label: 'Apply', icon: FileText },
  { id: 5, label: 'Screened', icon: Cpu },
  { id: 6, label: 'Offered', icon: Target },
  { id: 7, label: 'Joining', icon: FileCheck },
  { id: 8, label: 'Onboarded', icon: CheckCircle2 },
];

const RecruitmentStepper = ({ currentStep = 3 }) => {
  const progressPct = Math.round(((currentStep - 1) / (steps.length - 1)) * 100);

  return (
    <div className="w-full px-1 sm:px-2 md:px-4 space-y-3">
      {/* Mobile: compact progress */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Step {currentStep} of {steps.length}
          </span>
          <span className="text-[10px] font-bold text-indigo-600">
            {steps.find(s => s.id === currentStep)?.label}
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="relative flex justify-between items-center overflow-x-auto scrollbar-hide pb-1 md:pb-0">
        {/* Connection Lines Base */}
        <div className="absolute top-4 md:top-5 left-0 w-full h-[2px] bg-slate-100 -z-0" />

        {/* Connection Lines Active (Emerald) */}
        <div
          className="absolute top-4 md:top-5 left-0 h-[2px] bg-emerald-500 transition-all duration-700 -z-0 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;

          return (
            <div key={step.id} className="flex flex-col items-center gap-1.5 md:gap-3 relative z-10 shrink-0 min-w-[2rem]">
              <div className={cn(
                "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2",
                isCompleted ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100" :
                isActive ? "bg-white border-indigo-600 text-indigo-600 shadow-xl shadow-indigo-100 scale-110" :
                "bg-slate-50 border-slate-200 text-slate-400"
              )}>
                {isCompleted ? <Check size={14} strokeWidth={3} className="md:hidden" /> : <step.icon size={14} className="md:hidden" />}
                {isCompleted ? <Check size={18} strokeWidth={3} className="hidden md:block" /> : <step.icon size={18} className="hidden md:block" />}
              </div>

              <span className={cn(
                "hidden md:block text-[9px] font-bold uppercase tracking-wider transition-colors duration-300",
                isCompleted ? "text-emerald-600" :
                isActive ? "text-indigo-600" :
                "text-slate-400"
              )}>
                {step.label}
              </span>
              {/* Mobile: only show label for active step */}
              {isActive && (
                <span className="md:hidden text-[9px] font-bold uppercase tracking-wider text-indigo-600">
                  {step.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecruitmentStepper;
