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

const StepProgressTracker = ({ currentStep = 3 }) => {
  return (
    <div className="w-full">
      <div className="relative flex justify-between items-center">
        {/* Connection Lines Base */}
        <div className="absolute top-5 left-0 w-full h-[2px] bg-white/5 -z-10" />
        
        {/* Connection Lines Active (Emerald) */}
        <div 
          className="absolute top-5 left-0 h-[2px] bg-emerald-500 transition-all duration-700 -z-10 shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          
          return (
            <div key={step.id} className="flex flex-col items-center gap-3 relative">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2",
                isCompleted ? "bg-emerald-500 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]" : 
                isActive ? "bg-indigo-600 border-indigo-400 text-white shadow-[0_0_20px_rgba(79,70,229,0.5)] scale-110" : 
                "bg-[#1a1c26] border-white/10 text-slate-500"
              )}>
                {isCompleted ? <Check size={18} strokeWidth={3} /> : <step.icon size={18} />}
              </div>
              
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-wider transition-colors duration-300",
                isCompleted ? "text-emerald-500" : 
                isActive ? "text-indigo-400" : 
                "text-slate-600"
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
export default StepProgressTracker;
