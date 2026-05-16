import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import RecruitmentNavbar from '../components/recruitment/RecruitmentNavbar';
import RecruitmentStepper from '../components/recruitment/RecruitmentStepper';

const RecruitmentLayout = () => {
  const location = useLocation();
  
  // Determine current step based on path
  const getStep = () => {
    const path = location.pathname;
    if (path.includes('/job')) return 3;
    if (path.includes('/application')) return 4;
    if (path.includes('/screening')) return 5;
    if (path.includes('/offer')) return 6;
    return 3;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <RecruitmentNavbar />
      
      {/* Progress Bar Container (White) */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto py-8">
          <RecruitmentStepper currentStep={getStep()} />
        </div>
      </div>

      <main className="max-w-6xl mx-auto py-12 px-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 mt-auto bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
            InternFlow Enterprise Recruitment System &copy; 2026
          </p>
        </div>
      </footer>
    </div>
  );
};

export default RecruitmentLayout;
