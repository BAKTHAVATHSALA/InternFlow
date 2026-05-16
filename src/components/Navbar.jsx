import React, { useState, useRef, useEffect } from 'react';
import { Search, User, Shield, Users, LogOut, ChevronDown, Bell, SwitchCamera } from 'lucide-react';
import { cn } from '../utils/cn';

const Navbar = ({ onRoleToggle, currentRole, onLogout, user }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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
      const names = user.name.split(' ');
      const initials = names.map(n => n[0]).join('').toUpperCase();
      return {
        name: user.name,
        email: user.email,
        role: user.role.toUpperCase(),
        dept: "Corporate",
        initials: initials
      };
    }

    switch (currentRole) {
      case 'hr':
        return {
          name: "HR Administrator",
          email: "hr@internyx.com",
          role: "HR Manager",
          dept: "Human Resources",
          initials: "HR"
        };
      case 'employee':
        return {
          name: "Kavya Sharma",
          email: "kavya.sharma@internflow.com",
          role: "Employee",
          dept: "Operations",
          initials: "KS"
        };
      case 'mentor':
        return {
          name: "Dr. Robert Fox",
          email: "robert.fox@internflow.com",
          role: "Senior Mentor",
          dept: "Product Design",
          initials: "RF"
        };
      case 'intern':
        return {
          name: "Priya Das",
          email: "priya.das@college.edu",
          role: "Intern",
          dept: "Engineering",
          initials: "PD"
        };
      default:
        return {};
    }
  };

  const profileData = getProfileData();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-8 bg-white/80 backdrop-blur-md border-b border-slate-100">
      {/* Search Bar */}
      <div className="relative w-96 group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-purple-600 transition-colors" />
        <input
          type="text"
          className="block w-full py-2 pl-10 pr-4 bg-slate-50/50 border border-slate-100 rounded-xl leading-5 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 sm:text-sm transition-all"
          placeholder="Search for interns, tasks, or files..."
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6 relative" ref={dropdownRef}>
        {/* Role Switcher */}
        <button 
          onClick={onRoleToggle}
          className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-100 rounded-xl text-[10px] font-bold text-purple-600 hover:bg-purple-100 transition-all uppercase tracking-wider"
        >
          <SwitchCamera size={14} />
          Role: <span>{currentRole}</span>
        </button>

        {/* Profile */}
        <div 
          className="flex items-center gap-3 pl-6 border-l border-slate-100 cursor-pointer group"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors">{profileData.name}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{currentRole}</p>
          </div>
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-100 group-hover:scale-105 transition-transform">
              {profileData.initials}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
          </div>
          <ChevronDown size={16} className={cn("text-slate-400 transition-transform duration-300", isDropdownOpen && "rotate-180")} />
        </div>

        {/* Profile Dropdown */}
        {isDropdownOpen && (
          <div className="absolute right-0 top-full mt-4 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 py-4 z-50 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 pb-4 border-b border-slate-50 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-lg">
                {profileData.initials}
              </div>
              <div>
                <p className="font-bold text-slate-900 leading-none">{profileData.name}</p>
                <p className="text-xs text-slate-500 mt-1">{profileData.email}</p>
              </div>
            </div>

            <div className="px-2 py-2">
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 rounded-xl transition-all font-bold group">
                <User size={18} className="group-hover:text-purple-600" />
                <span>My Profile</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 rounded-xl transition-all font-bold group">
                <Shield size={18} className="group-hover:text-purple-600" />
                <span>Account Settings</span>
              </button>
              <div className="mt-2 pt-2 border-t border-slate-50">
                <button 
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 rounded-xl transition-all font-bold group"
                >
                  <LogOut size={18} />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};


export default Navbar;

