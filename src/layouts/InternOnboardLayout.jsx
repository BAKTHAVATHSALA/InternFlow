import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import OnboardNavbar from '../components/onboard/OnboardNavbar';
import StepProgressTracker from '../components/onboard/StepProgressTracker';

const InternOnboardLayout = () => {
  const location = useLocation();
  
  const getStepNumber = () => {
    const path = location.pathname;
    if (path.includes('/job')) return 3;
    if (path.includes('/application')) return 4;
    if (path.includes('/screening')) return 5;
    if (path.includes('/offer')) return 6;
    if (path.includes('/documents')) return 7;
    if (path.includes('/success')) return 8;
    return 3;
  };

  return (
    <div className="min-h-screen bg-[#0a0c14] text-slate-200 flex flex-col font-sans">
      {/* Header Area */}
      <OnboardNavbar />
      
      {/* Progress Bar Area */}
      <div className="w-full border-b border-white/5 bg-[#0a0c14]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <StepProgressTracker currentStep={getStepNumber()} />
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12">
        <Outlet />
      </main>
      
      {/* Footer */}
      <footer className="py-12 text-center border-t border-white/5 opacity-50">
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase">
          InternFlow Systems &copy; 2026 • Enterprise Intern Portal
        </p>
      </footer>
    </div>
  );
};

export default InternOnboardLayout;
