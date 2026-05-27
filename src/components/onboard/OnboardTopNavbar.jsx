import React from 'react';
import { LogOut, HelpCircle, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOnboardingAuth } from '../../contexts/OnboardingAuthContext';

const OnboardTopNavbar = ({ onMobileMenuToggle }) => {
  const { onboardUser, onboardLogout } = useOnboardingAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    onboardLogout();
    navigate('/onboard/login');
  };

  const initials = onboardUser?.name
    ? onboardUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'IN';

  return (
    <header className="fixed top-0 left-0 md:left-64 right-0 h-14 sm:h-16 bg-white/95 backdrop-blur-sm border-b border-slate-100 z-20 flex items-center justify-between px-3 sm:px-4 md:px-8 shadow-sm safe-padding-x">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        {onMobileMenuToggle && (
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden tap-target p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors shrink-0"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        )}
        <div className="min-w-0">
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 truncate">Intern Onboarding Portal</h2>
          <p className="text-[10px] sm:text-xs text-slate-400 font-medium hidden sm:block truncate">
            Complete all steps to finish onboarding
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          title="Help"
          className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-purple-600 hover:border-purple-200 hover:bg-purple-50 transition-all"
        >
          <HelpCircle size={15} />
        </button>

        <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
          <div className="w-7 h-7 bg-gradient-to-br from-purple-600 to-violet-500 rounded-lg flex items-center justify-center text-white text-[10px] font-black shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-700 truncate max-w-[140px]">{onboardUser?.name || 'Intern'}</div>
            <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{onboardUser?.email || ''}</div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Logout"
          className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition-all"
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
};

export default OnboardTopNavbar;
