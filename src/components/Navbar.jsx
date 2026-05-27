import React, { useState, useRef, useEffect } from 'react';
import { Search, User, LogOut, ChevronDown, SwitchCamera, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';

const Navbar = ({ onRoleToggle, currentRole, onLogout, user, onMobileMenuToggle }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getProfileData = () => {
    if (user) {
      const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
      return { name: user.name, email: user.email, role: user.role.toUpperCase(), initials };
    }
    return { name: 'User', email: '', role: currentRole?.toUpperCase() || '', initials: 'U' };
  };

  const profileData = getProfileData();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 safe-padding-x">
      <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 md:px-8">
        {/* Left: hamburger (mobile) + search */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden tap-target p-2 rounded-xl hover:bg-slate-100 text-slate-500 shrink-0"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          <div className="relative w-full max-w-xs hidden sm:block group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-purple-600 transition-colors" />
            <input
              type="text"
              className="block w-full py-2 pl-10 pr-4 bg-slate-50/50 border border-slate-100 rounded-xl leading-5 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 sm:text-sm transition-all"
              placeholder="Search…"
            />
          </div>

          <button
            onClick={() => setIsMobileSearchOpen(v => !v)}
            className="sm:hidden tap-target p-2 rounded-xl hover:bg-slate-100 text-slate-500 shrink-0"
            aria-label="Search"
            aria-expanded={isMobileSearchOpen}
          >
            <Search size={20} />
          </button>
        </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 md:gap-4 relative shrink-0" ref={dropdownRef}>
        {/* Role switcher — hidden on mobile */}
        {onRoleToggle && (
          <button
            onClick={onRoleToggle}
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-100 rounded-xl text-[10px] font-bold text-purple-600 hover:bg-purple-100 transition-all uppercase tracking-wider"
          >
            <SwitchCamera size={14} />
            Role: <span>{currentRole}</span>
          </button>
        )}

        {/* Profile trigger */}
        <div
          className="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 md:border-l border-slate-100 cursor-pointer group"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div className="hidden md:block text-right">
            <p className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors truncate max-w-[120px]">{profileData.name}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{currentRole}</p>
          </div>
          <div className="relative">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-purple-100 group-hover:scale-105 transition-transform">
              {profileData.initials}
            </div>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
          </div>
          <ChevronDown size={16} className={cn('text-slate-400 transition-transform duration-300 hidden sm:block', isDropdownOpen && 'rotate-180')} />
        </div>

        {/* Dropdown */}
        {isDropdownOpen && (
          <div className="absolute right-0 top-full mt-3 w-[min(16rem,calc(100vw-2rem))] bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-50">
            {/* User info */}
            <div className="px-5 pb-3 border-b border-slate-50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-bold shrink-0">
                {profileData.initials}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 leading-none truncate">{profileData.name}</p>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{profileData.email}</p>
              </div>
            </div>

            <div className="px-2 pt-2">
              <button
                onClick={() => { setIsDropdownOpen(false); navigate('/settings'); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 rounded-xl transition-all font-bold group"
              >
                <User size={17} className="group-hover:text-purple-600" />
                My Profile
              </button>
              <div className="mt-1 pt-1 border-t border-slate-50">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 rounded-xl transition-all font-bold"
                >
                  <LogOut size={17} />
                  Log Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>

      {isMobileSearchOpen && (
        <div className="sm:hidden px-3 pb-3 border-t border-slate-50 pt-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              autoFocus
              className="block w-full py-2.5 pl-10 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              placeholder="Search…"
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
