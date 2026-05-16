import React from 'react';
import { Search, Filter, Download, User, Activity, Shield, HardDrive } from 'lucide-react';
import { cn } from '../utils/cn';
import Table from '../components/Table';

const auditStats = [
  { label: "Total Events", value: "1,284", icon: Activity, color: "text-slate-600", bg: "bg-slate-50" },
  { label: "Today's Events", value: "42", icon: User, color: "text-primary-600", bg: "bg-primary-50" },
  { label: "System Actions", value: "856", icon: HardDrive, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Human Actions", value: "428", icon: Shield, color: "text-emerald-600", bg: "bg-emerald-50" },
];

const auditLogs = [
  { id: 1, timestamp: "2024-05-05 14:23:12", user: "HR_Admin_1", action: "NDA_SIGN_COMPLETE", entity: "Sarah Smith", module: "Onboarding", ip: "192.168.1.45" },
  { id: 2, timestamp: "2024-05-05 13:45:08", user: "John_Doe", action: "REFERRAL_SUBMIT", entity: "Mike Johnson", module: "Referrals", ip: "192.168.1.12" },
  { id: 3, timestamp: "2024-05-05 12:12:45", user: "System", action: "ACCESS_REVOKE_AUTO", entity: "Jessica Lee", module: "Closure", ip: "Internal" },
  { id: 4, timestamp: "2024-05-05 10:30:22", user: "HR_Admin_2", action: "STAGE_CHANGE", entity: "Alex Rivera", module: "Pipeline", ip: "192.168.1.28" },
  { id: 5, timestamp: "2024-05-05 09:15:00", user: "HR_Admin_1", action: "PROFILE_UPDATE", entity: "System Settings", module: "Settings", ip: "192.168.1.45" },
];

const getActionColor = (action) => {
  if (action.includes('COMPLETE') || action.includes('SUCCESS')) return 'bg-emerald-100 text-emerald-700';
  if (action.includes('SUBMIT') || action.includes('CHANGE')) return 'bg-blue-100 text-blue-700';
  if (action.includes('REVOKE') || action.includes('DELETE')) return 'bg-rose-100 text-rose-700';
  if (action.includes('UPDATE')) return 'bg-amber-100 text-amber-700';
  return 'bg-slate-100 text-slate-700';
};

const Audit = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterModule, setFilterModule] = React.useState('All Modules');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.entity.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModule = filterModule === 'All Modules' || log.module === filterModule;
    return matchesSearch && matchesModule;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Audit Trail</h1>
          <p className="text-slate-500">Track all system activities and security events</p>
        </div>
        <button 
          onClick={() => alert('Audit logs exported to CSV')}
          className="btn-primary flex items-center gap-2"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {auditStats.map((stat, i) => (
          <div key={i} className="card p-6 flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", stat.bg, stat.color)}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search logs by user, action or entity..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-sm"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="All Modules">All Modules</option>
              <option value="Referrals">Referrals</option>
              <option value="Pipeline">Pipeline</option>
              <option value="Onboarding">Onboarding</option>
              <option value="Closure">Closure</option>
              <option value="Settings">Settings</option>
            </select>
            <button 
              onClick={() => alert('Advanced filters opened')}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg bg-white text-sm hover:bg-slate-50 text-slate-600"
            >
              <Filter size={16} />
              Advanced Filters
            </button>
          </div>
        </div>

        <Table 
          headers={["Timestamp", "User", "Action", "Entity", "Module", "IP Address"]}
        >
          {filteredLogs.map((log) => (
            <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4 text-sm text-slate-500 font-mono">{log.timestamp}</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                    {log.user[0]}
                  </div>
                  <span className="text-sm font-medium text-slate-900">{log.user}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold tracking-tight", getActionColor(log.action))}>
                  {log.action}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-slate-700">{log.entity}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{log.module}</td>
              <td className="px-6 py-4 text-sm text-slate-400 font-mono">{log.ip}</td>
            </tr>
          ))}
        </Table>
        <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex justify-between items-center">
          <span className="text-sm text-slate-500">Showing 5 of 1,284 events</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-slate-200 rounded bg-white text-xs disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 border border-slate-200 rounded bg-white text-xs">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Audit;
