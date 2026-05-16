import React, { useState, useEffect } from 'react';
import { Plus, Clock, CheckCircle2, UserPlus, Info, Bell, Code } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatsCard from '../components/StatsCard';
import { PipelineLineChart, DeptDonutChart, MonthlyBarChart } from '../components/Charts';
import api from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const [pipeline, setPipeline] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pipeRes, notifRes] = await Promise.all([
        api.get('/api/pipeline'),
        api.get('/api/notifications')
      ]);
      setPipeline(pipeRes.data);
      setNotifications(notifRes.data.slice(0, 5));
    } catch (err) {
      toast.error('Failed to load HR dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const activeInterns = pipeline.filter(p => p.status === 'onboarded').length;
  const pendingReview = pipeline.filter(p => p.status === 'applied' || p.status === 'screened').length;
  // This is an estimation since we don't have exact NDA tracking in pipeline easily without joining
  const ndaCount = pipeline.filter(p => p.status === 'onboarded').length; 

  if (loading) {
    return <div className="animate-pulse p-8">Loading HR dashboard...</div>;
  }

  return (
    <div className="space-y-6">

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Active Interns" 
          value={activeInterns.toString()} 
          trend="Total Onboarded" 
          subtext="" 
          color="bg-emerald-500" 
        />
        <StatsCard 
          title="Pending Review" 
          value={pendingReview.toString()} 
          trend="Awaiting HR Action" 
          subtext="" 
          color="bg-amber-500" 
        />
        <StatsCard 
          title="NDAs Signed" 
          value={ndaCount.toString()} 
          trend="Fully onboarded" 
          subtext="" 
          color="bg-blue-500" 
        />
        <StatsCard 
          title="Avg. AI Score" 
          value={(pipeline.reduce((acc, curr) => acc + (parseInt(curr.ai_score) || 0), 0) / (pipeline.length || 1)).toFixed(1)} 
          trend="Across candidates" 
          subtext="" 
          color="bg-primary-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analytics Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-bold mb-6 text-slate-800">Intern Pipeline Funnel</h3>
            <PipelineLineChart />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-lg font-bold mb-6 text-slate-800">Department Distribution</h3>
              <DeptDonutChart />
            </div>
            <div className="card p-6">
              <h3 className="text-lg font-bold mb-6 text-slate-800">Onboarding vs Closures</h3>
              <MonthlyBarChart />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">Recent Activity</h3>
            <button 
              onClick={() => navigate('/audit')}
              className="text-sm text-primary-600 font-medium hover:underline"
            >
              View all
            </button>
          </div>
          <div className="space-y-6">
            {notifications.map((item) => {
              let Icon = Bell;
              let colorClass = 'bg-slate-100 text-slate-700';
              if (item.type === 'referral_submitted') { Icon = UserPlus; colorClass = 'bg-amber-100 text-amber-700'; }
              if (item.type.includes('onboard') || item.type.includes('nda')) { Icon = CheckCircle2; colorClass = 'bg-emerald-100 text-emerald-700'; }
              if (item.type.includes('stage') || item.type.includes('screening')) { Icon = Code; colorClass = 'bg-blue-100 text-blue-700'; }

              return (
              <div key={item.id} className="flex gap-4 relative">
                <div className="shrink-0 w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600">
                  <Icon size={20} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm text-slate-800">{item.title}</p>
                    <span className="text-[10px] text-slate-400">{new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <p className="text-xs text-slate-500">{item.message}</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${colorClass}`}>
                    {item.type.replace('_', ' ')}
                  </span>
                </div>
              </div>
            )})}
            {notifications.length === 0 && (
              <p className="text-sm text-slate-400 text-center">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
