import React from 'react';
import { cn } from '../utils/cn';

const ProgressBar = ({ progress, className }) => {
  return (
    <div className={cn("h-2 w-full bg-slate-100 rounded-full overflow-hidden", className)}>
      <div 
        className="h-full bg-primary-600 transition-all duration-500 ease-out" 
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ProgressBar;
