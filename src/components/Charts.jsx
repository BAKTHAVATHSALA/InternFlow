import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar, Legend
} from 'recharts';

const pipelineData = [
  { name: 'Applied', value: 400 },
  { name: 'Screening', value: 300 },
  { name: 'Offer', value: 200 },
  { name: 'Onboarded', value: 150 },
];

const deptData = [
  { name: 'Engineering', value: 45 },
  { name: 'Design', value: 25 },
  { name: 'Marketing', value: 20 },
  { name: 'Product', value: 10 },
];

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#6366f1'];

const monthlyData = [
  { name: 'Jan', onboarding: 40, closures: 24 },
  { name: 'Feb', onboarding: 30, closures: 13 },
  { name: 'Mar', onboarding: 20, closures: 98 },
  { name: 'Apr', onboarding: 27, closures: 39 },
  { name: 'May', onboarding: 18, closures: 48 },
  { name: 'Jun', onboarding: 23, closures: 38 },
];

export const PipelineLineChart = ({ data = [] }) => {
  let chartData = pipelineData;
  if (data && data.length > 0) {
    const applied = data.length;
    const screening = data.filter(d => ['screened', 'offer_pending', 'onboarded', 'completed', 'rejected'].includes(d.status)).length;
    const offer = data.filter(d => ['offer_pending', 'onboarded', 'completed'].includes(d.status)).length;
    const onboarded = data.filter(d => ['onboarded', 'completed'].includes(d.status)).length;
    chartData = [
      { name: 'Applied', value: applied },
      { name: 'Screening', value: screening },
      { name: 'Offer', value: offer },
      { name: 'Onboarded', value: onboarded },
    ];
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
        <Tooltip 
          contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
        />
        <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} dot={{fill: '#8b5cf6', strokeWidth: 2, r: 4}} activeDot={{r: 6}} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export const DeptDonutChart = ({ data = [] }) => {
  let chartData = deptData;
  if (data && data.length > 0) {
    const deptCounts = data.reduce((acc, curr) => {
      const dept = curr.department || 'Other';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});
    chartData = Object.entries(deptCounts).map(([name, value]) => ({ name, value }));
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend verticalAlign="bottom" height={36}/>
      </PieChart>
    </ResponsiveContainer>
  );
};

export const MonthlyBarChart = ({ data = [] }) => {
  let chartData = monthlyData;
  if (data && data.length > 0) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthMap = {};
    
    // Initialize last 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mName = monthNames[d.getMonth()];
      monthMap[mName] = { name: mName, onboarding: 0, closures: 0 };
    }
    
    data.forEach(item => {
      if (item.onboarded_at) {
        const d = new Date(item.onboarded_at);
        const mName = monthNames[d.getMonth()];
        if (monthMap[mName]) {
          monthMap[mName].onboarding += 1;
        }
      }
      if (item.status === 'completed' || item.status === 'rejected') {
        const d = new Date(item.updated_at || item.applied_at);
        const mName = monthNames[d.getMonth()];
        if (monthMap[mName]) {
          monthMap[mName].closures += 1;
        }
      }
    });
    
    chartData = Object.values(monthMap);
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
        <Tooltip 
          contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
        />
        <Bar dataKey="onboarding" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="closures" fill="#ddd6fe" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};
