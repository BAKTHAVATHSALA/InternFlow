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
  return (
    <div className="w-full">
      <div className="relative flex justify-between items-center px-4">
        {/* Connection Lines Base */}
        <div className="absolute top-5 left-0 w-full h-[2px] bg-slate-100 -z-0" />
        
        {/* Connection Lines Active (Emerald) */}
        <div 
          className="absolute top-5 left-0 h-[2px] bg-emerald-500 transition-all duration-700 -z-0 shadow-[0_0_10px_rgba(16,185,129,0.2)]" 
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          
          return (
            <div key={step.id} className="flex flex-col items-center gap-3 relative z-10">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2",
                isCompleted ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100" : 
                isActive ? "bg-white border-indigo-600 text-indigo-600 shadow-xl shadow-indigo-100 scale-110" : 
                "bg-slate-50 border-slate-200 text-slate-400"
              )}>
                {isCompleted ? <Check size={18} strokeWidth={3} /> : <step.icon size={18} />}
              </div>
              
              <span className={cn(
                "text-[9px] font-bold uppercase tracking-wider transition-colors duration-300",
                isCompleted ? "text-emerald-600" : 
                isActive ? "text-indigo-600" : 
                "text-slate-400"
              )}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecruitmentStepper;
