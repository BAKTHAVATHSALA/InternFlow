import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '../utils/cn';
import api from '../services/api';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

const Sidebar = ({ isCollapsed, setIsCollapsed, items = [], isMobileOpen, setIsMobileOpen }) => {
  useBodyScrollLock(isMobileOpen);

  const isMentor   = items.some(item => item.label === 'My Interns');
  const isEmployee = items.some(item => item.label === 'Refer an Intern');
  const isIntern   = items.some(item => item.label === 'Learning');

  const [quota, setQuota]               = useState({ used_slots: 0, total_slots: 5, remaining: 5 });
  const [internProgress, setInternProgress] = useState({ lmsPct: 0, daysElapsed: 0, totalDays: 90, completed: 0, total: 0 });
  const [mentorStats, setMentorStats]   = useState({ count: 0, avgLms: 0 });

  useEffect(() => {
    if (!isEmployee) return;
    api.get('/api/referrals/quota').then(res => setQuota(res.data)).catch(() => {});
  }, [isEmployee]);

  useEffect(() => {
    if (!isIntern) return;
    Promise.all([
      api.get('/api/lms/modules').catch(() => ({ data: [] })),
      api.get('/api/applications/mine').catch(() => ({ data: null })),
    ]).then(([lmsRes, appRes]) => {
      const modules = lmsRes.data || [];
      const app = appRes.data;
      const completed = modules.filter(m => m.completed).length;
      const total = modules.length || 1;
      const lmsPct = Math.round((completed / total) * 100);
      const totalDays = (app?.duration_months || 3) * 30;
      const daysElapsed = app?.onboarded_at
        ? Math.min(Math.floor((Date.now() - new Date(app.onboarded_at)) / 86400000), totalDays)
        : 0;
      setInternProgress({ lmsPct, daysElapsed, totalDays, completed, total });
    });
  }, [isIntern]);

  useEffect(() => {
    if (!isMentor) return;
    api.get('/api/mentor/interns').catch(() => ({ data: [] })).then(res => {
      const interns = res.data || [];
      const count = interns.length;
      const avgLms = count
        ? Math.round(interns.reduce((sum, i) => sum + (i.modules_completed || 0), 0) / count * 10)
        : 0;
      setMentorStats({ count, avgLms });
    });
  }, [isMentor]);

  const groupedItems = items.reduce((acc, item) => {
    const section = item.section || 'MENU';
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {});

  const navContent = (mobile = false) => (
    <>
      {/* Logo */}
      <div className="p-6 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-violet-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-lg shadow-purple-200">
            I
          </div>
          {(!isCollapsed || mobile) && (
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 leading-none text-lg">InternFlow</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                {isMentor ? 'MENTOR PORTAL' : isEmployee ? 'EMPLOYEE PORTAL' : isIntern ? 'INTERN PORTAL' : 'Enterprise'}
              </span>
            </div>
          )}
        </div>
        {mobile && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto px-4 py-2 scrollbar-hide">
        {Object.entries(groupedItems).map(([section, sectionItems]) => (
          <div key={section} className="mb-6">
            {(!isCollapsed || mobile) && (isMentor || isEmployee || isIntern) && (
              <p className="px-4 mb-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                {section === 'MENU' ? (isMentor ? 'Mentor Menu' : 'Menu') : section}
              </p>
            )}
            <nav className="space-y-1">
              {sectionItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => mobile && setIsMobileOpen(false)}
                  className={({ isActive }) => cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative',
                    isActive
                      ? 'bg-purple-50 text-purple-600 font-bold'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-purple-600'
                  )}
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
                      {(!isCollapsed || mobile) && (
                        <span className="flex-1 whitespace-nowrap">{item.label}</span>
                      )}
                      {(!isCollapsed || mobile) && item.badge && (
                        <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[1.5rem] text-center shadow-sm">
                          {item.badge}
                        </span>
                      )}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-purple-600 rounded-r-full" />
                      )}
                      {isCollapsed && !mobile && (
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

        {(!isCollapsed || mobile) && isMentor && (
          <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 mx-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Batch Progress</span>
              <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">Active</span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-purple-600 rounded-full transition-all duration-700" style={{ width: `${mentorStats.avgLms}%` }} />
            </div>
            <p className="text-[10px] font-bold text-slate-500">
              {mentorStats.count} intern{mentorStats.count !== 1 ? 's' : ''} · <span className="text-slate-900">{mentorStats.avgLms}% avg</span>
            </p>
          </div>
        )}

        {(!isCollapsed || mobile) && isEmployee && (
          <div className="mt-4 p-5 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl text-white mx-2 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full -mr-8 -mt-8 blur-2xl" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Referral Quota</span>
                <div className="w-8 h-8 rounded-full border-2 border-indigo-500/30 flex items-center justify-center text-[10px] font-bold">
                  {quota.used_slots}/{quota.total_slots}
                </div>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full transition-all"
                  style={{ width: `${quota.total_slots > 0 ? (quota.used_slots / quota.total_slots) * 100 : 0}%` }}
                />
              </div>
              <p className="text-[10px] text-indigo-200 font-medium leading-relaxed">
                <span className="text-white font-bold">{quota.remaining} referral{quota.remaining !== 1 ? 's' : ''}</span> remaining this month.
              </p>
            </div>
          </div>
        )}

        {(!isCollapsed || mobile) && isIntern && (
          <div className="mt-4 p-5 bg-white border border-slate-100 rounded-2xl mx-2 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Internship Progress</span>
              <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">{internProgress.lmsPct}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-violet-500 rounded-full transition-all duration-700"
                style={{ width: `${internProgress.lmsPct}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 font-medium text-center">
              {internProgress.completed}/{internProgress.total} modules · Day {internProgress.daysElapsed} of {internProgress.totalDays}
            </p>
          </div>
        )}
      </div>

      {/* Collapse Button — desktop only */}
      {!mobile && (
        <div className="p-6 border-t border-slate-50 shrink-0">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center p-3 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-purple-600 transition-all border border-transparent hover:border-slate-100"
          >
            {isCollapsed
              ? <ChevronRight size={20} />
              : <div className="flex items-center gap-2 font-bold text-sm"><ChevronLeft size={20} /><span>Minimize</span></div>}
          </button>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className={cn(
        'hidden md:flex fixed left-0 top-0 h-screen bg-white border-r border-slate-100 transition-all duration-300 z-50 flex-col',
        isCollapsed ? 'w-20' : 'w-[260px]'
      )}>
        {navContent(false)}
      </aside>

      {/* ── Mobile: backdrop ── */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 overscroll-none"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile: slide-over drawer ── */}
      <aside
        className={cn(
          'md:hidden fixed left-0 top-0 h-screen w-[min(280px,85vw)] max-w-[320px] bg-white border-r border-slate-100 z-50 flex flex-col transition-transform duration-300 safe-padding-x',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-hidden={!isMobileOpen}
      >
        {navContent(true)}
      </aside>
    </>
  );
};

export default Sidebar;
