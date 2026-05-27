import React, { useState } from 'react';
import { 
  Users, 
  MoreVertical,
  Mail,
  Calendar,
  Search,
  Filter
} from 'lucide-react';
import { cn } from '../../utils/cn';

const internsData = [
  { 
    id: 1, 
    name: 'Alex Rivera', 
    initials: 'AR', 
    role: 'Frontend Developer Intern', 
    email: 'alex.rivera@internflow.com', 
    status: 'In Progress', 
    percentage: 72, 
    batchDay: 12 
  },
  { 
    id: 2, 
    name: 'Sarah Smith', 
    initials: 'SS', 
    role: 'UI/UX Design Intern', 
    email: 'sarah.smith@internflow.com', 
    status: 'Upcoming', 
    percentage: 0, 
    batchDay: 1 
  },
];

const MyInterns = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const filteredInterns = internsData.filter(intern => {
    const matchesSearch = intern.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          intern.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'All' || intern.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="page-section">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">My Interns</h1>
          <p className="page-description">Manage and track your assigned interns.</p>
        </div>
        <div className="flex gap-2 relative w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search interns..." 
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
          <button 
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className={cn(
              "p-2 bg-white border rounded-xl transition-colors",
              showFilterMenu || filterStatus !== 'All' ? "border-purple-500 text-purple-600 bg-purple-50" : "border-slate-200 text-slate-600 hover:bg-slate-50"
            )}
          >
            <Filter size={20} />
          </button>
          
          {showFilterMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-2 overflow-hidden">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest p-2">Filter by Status</div>
              {['All', 'In Progress', 'Upcoming'].map(status => (
                <button
                  key={status}
                  onClick={() => { setFilterStatus(status); setShowFilterMenu(false); }}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    filterStatus === status ? "bg-purple-100 text-purple-700" : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {filteredInterns.length > 0 ? filteredInterns.map((intern) => (
          <div key={intern.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8">
              <div className="w-16 h-16 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-xl shrink-0">
                {intern.initials}
              </div>
              
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-lg leading-tight">{intern.name}</h4>
                  <p className="text-sm text-slate-500 font-medium">{intern.role}</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Mail size={14} />
                    <span className="text-xs font-bold uppercase tracking-wider">Email</span>
                  </div>
                  <p className="text-sm text-slate-700 font-medium">{intern.email}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <span>Progress</span>
                    <span className="text-purple-600">{intern.percentage}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-600 rounded-full" style={{ width: `${intern.percentage}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-8">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Batch Day</p>
                    <p className="text-sm font-bold text-slate-900">{intern.batchDay}/90</p>
                  </div>
                  <span className={cn(
                    "px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider whitespace-nowrap",
                    intern.status === 'In Progress' ? "bg-purple-50 text-purple-600" : "bg-slate-50 text-slate-500"
                  )}>
                    {intern.status}
                  </span>
                </div>
              </div>

              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                <MoreVertical size={20} />
              </button>
            </div>
          </div>
        )) : (
          <div className="py-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-400 font-medium">No interns found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyInterns;
