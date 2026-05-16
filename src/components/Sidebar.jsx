import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '../utils/cn';

const Sidebar = ({ isCollapsed, setIsCollapsed, items = [] }) => {
  const isMentor = items.some(item => item.label === 'My Interns');
  const isEmployee = items.some(item => item.label === 'Refer an Intern');
  const isIntern = items.some(item => item.label === 'Learning');

  const groupedItems = items.reduce((acc, item) => {
    const section = item.section || 'MENU';
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {});

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen bg-white border-r border-slate-100 transition-all duration-300 z-50 flex flex-col",
      isCollapsed ? "w-20" : "w-[260px]"
    )}>
      {/* Logo */}
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-violet-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-lg shadow-purple-200">
          I
        </div>
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 leading-none text-lg">InternFlow</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
              {isMentor ? 'MENTOR PORTAL' : isEmployee ? 'EMPLOYEE PORTAL' : isIntern ? 'INTERN PORTAL' : 'Enterprise'}
            </span>
          </div>
        )}
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
        {Object.entries(groupedItems).map(([section, sectionItems]) => (
          <div key={section} className="mb-6">
            {!isCollapsed && (isMentor || isEmployee || isIntern) && (
              <p className="px-4 mb-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{section === 'MENU' ? (isMentor ? 'Mentor Menu' : 'Menu') : section}</p>
            )}
            <nav className="space-y-1">
              {sectionItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative",
                    isActive 
                      ? "bg-purple-50 text-purple-600 font-bold" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-purple-600"
                  )}
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className={cn(
                        "w-5 h-5 shrink-0",
                        "group-hover:scale-110 transition-transform"
                      )} />
                      {!isCollapsed && <span className="flex-1 whitespace-nowrap">{item.label}</span>}
                      {!isCollapsed && item.badge && (
                        <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[1.5rem] text-center shadow-sm">
                          {item.badge}
                        </span>
                      )}
                      
                      {/* Active Indicator Bar */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-purple-600 rounded-r-full" />
                      )}

                      {isCollapsed && (
                        <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                          {item.label}
                        </div>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        ))}

        {!isCollapsed && isMentor && (
          <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 mx-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Batch Progress</span>
              <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">Active</span>
            </div>
            <div className="space-y-3">
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 w-[68%] rounded-full" />
              </div>
              <p className="text-[10px] font-bold text-slate-500">1 intern · <span className="text-slate-900">68% avg</span></p>
            </div>
          </div>
        )}

        {!isCollapsed && isEmployee && (
          <div className="mt-4 p-5 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl text-white mx-2 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full -mr-8 -mt-8 blur-2xl" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Referral Quota</span>
                <div className="w-8 h-8 rounded-full border-2 border-indigo-500/30 flex items-center justify-center text-[10px] font-bold">
                  3/5
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 w-[60%] rounded-full" />
                </div>
                <p className="text-[10px] text-indigo-200 font-medium leading-relaxed">
                  You have <span className="text-white font-bold">2 referrals</span> remaining this month. Resets on June 1st.
                </p>
              </div>
            </div>
          </div>
        )}

        {!isCollapsed && isIntern && (
          <div className="mt-4 p-5 bg-white border border-slate-100 rounded-2xl mx-2 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Internship Progress</span>
              <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">68%</span>
            </div>
            <div className="space-y-2">
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-600 to-violet-500 w-[68%] rounded-full" />
              </div>
              <p className="text-[10px] text-slate-400 font-medium text-center">Day 12 of 90 • Hexaware</p>
            </div>
          </div>
        )}
      </div>

      {/* Collapse Button */}
      <div className="p-6 border-t border-slate-50">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center p-3 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-purple-600 transition-all border border-transparent hover:border-slate-100"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <div className="flex items-center gap-2 font-bold text-sm"><ChevronLeft size={20} /> <span>Minimize</span></div>}
        </button>
      </div>
    </aside>
  );
};


export default Sidebar;

