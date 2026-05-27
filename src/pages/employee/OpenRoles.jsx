import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  MapPin, 
  Search, 
  Filter, 
  ArrowUpRight,
  Monitor,
  Database,
  Layout,
  Globe,
  Award,
  Zap
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const getIconForDept = (dept) => {
  const d = dept?.toLowerCase() || '';
  if (d.includes('design')) return Layout;
  if (d.includes('engineer') || d.includes('cyber')) return Monitor;
  if (d.includes('data')) return Database;
  if (d.includes('market')) return Globe;
  if (d.includes('hr')) return Award;
  return Briefcase;
};

const getColorForDept = (dept) => {
  const d = dept?.toLowerCase() || '';
  if (d.includes('design')) return 'bg-purple-100 text-purple-600';
  if (d.includes('engineer')) return 'bg-blue-100 text-blue-600';
  if (d.includes('cyber')) return 'bg-rose-100 text-rose-600';
  if (d.includes('data')) return 'bg-emerald-100 text-emerald-600';
  if (d.includes('market')) return 'bg-amber-100 text-amber-600';
  if (d.includes('hr')) return 'bg-indigo-100 text-indigo-600';
  return 'bg-slate-100 text-slate-600';
};

const OpenRoles = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await api.get('/api/jobs');
      setRoles(response.data);
    } catch (err) {
      toast.error('Failed to load open roles');
    } finally {
      setLoading(false);
    }
  };

  const filteredRoles = roles.filter(role => {
    const matchesSearch = 
      role.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (role.tech_stack && role.tech_stack.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))) ||
      (role.department && role.department.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesDept = filterDepartment === 'All' || 
      (role.department && role.department.toLowerCase() === filterDepartment.toLowerCase());
    
    return matchesSearch && matchesDept;
  });

  if (loading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse font-medium">Loading open positions...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Open Roles</h1>
          <p className="text-slate-500 mt-1 font-medium text-sm md:text-base">Find roles to refer your contacts to.</p>
        </div>
        <div className="flex gap-3 relative w-full sm:w-auto">
          <div className="relative group flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-purple-500 transition-colors" />
            <input
              type="text"
              placeholder="Search roles or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 w-full sm:w-64"
            />
          </div>
          <button 
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className={cn(
              "p-2 bg-white border rounded-xl transition-colors",
              showFilterMenu || filterDepartment !== 'All' ? "border-purple-500 text-purple-600 bg-purple-50" : "border-slate-200 text-slate-600 hover:bg-slate-50"
            )}
          >
            <Filter size={20} />
          </button>
          
          {showFilterMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-2 overflow-hidden">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest p-2">Filter by Dept</div>
              {['All', 'Design', 'Engineering', 'Marketing', 'Product', 'HR', 'Cybersecurity', 'Data'].map(dept => (
                <button
                  key={dept}
                  onClick={() => { setFilterDepartment(dept); setShowFilterMenu(false); }}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    filterDepartment === dept ? "bg-purple-100 text-purple-700" : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {dept}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles.length > 0 ? filteredRoles.map((role) => {
          const IconComponent = getIconForDept(role.department);
          const colorClass = getColorForDept(role.department);
          return (
            <div key={role.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col hover:border-purple-200 transition-all hover:shadow-md group">
              <div className="flex justify-between items-start mb-6">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", colorClass)}>
                  <IconComponent size={24} />
                </div>
                <button className="p-2 text-slate-400 hover:text-purple-600 transition-colors">
                  <ArrowUpRight size={20} />
                </button>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-600 transition-colors mb-2">{role.title}</h3>
              
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium mb-6">
                <span className="flex items-center gap-1.5"><Briefcase size={12} /> InternFlow</span>
                <span className="w-1 h-1 bg-slate-200 rounded-full" />
                <span className="flex items-center gap-1.5"><MapPin size={12} /> {role.location || 'Remote'}</span>
                <span className="w-1 h-1 bg-slate-200 rounded-full" />
                <span className="text-purple-600 font-bold capitalize">{role.mode || 'Offline'}</span>
              </div>

              {role.tech_stack && role.tech_stack.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {role.tech_stack.map(tag => (
                    <span key={tag} className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-600 uppercase tracking-tight">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-auto space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stipend</p>
                    <p className="text-xs font-bold text-slate-900">
                      {role.stipend === 0 ? 'Unpaid' : `₹${role.stipend.toLocaleString()}/mo`}
                    </p>
                  </div>
                  <div className="text-right space-y-0.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duration</p>
                    <p className="text-xs font-bold text-slate-900">{role.duration_months || 6} Months</p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/refer', { state: { jobId: role.id } })}
                  className="w-full py-3 bg-white border border-slate-200 text-purple-600 text-[10px] font-bold rounded-xl uppercase tracking-widest hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all shadow-sm group-hover:shadow-purple-100 shadow-transparent"
                >
                  Refer Someone
                </button>
              </div>
            </div>
          );
        }) : (
          <div className="lg:col-span-3 py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-400 font-medium">No roles found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpenRoles;
