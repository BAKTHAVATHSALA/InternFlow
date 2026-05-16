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

const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'];

const monthlyData = [
  { name: 'Jan', onboarding: 40, closures: 24 },
  { name: 'Feb', onboarding: 30, closures: 13 },
  { name: 'Mar', onboarding: 20, closures: 98 },
  { name: 'Apr', onboarding: 27, closures: 39 },
  { name: 'May', onboarding: 18, closures: 48 },
  { name: 'Jun', onboarding: 23, closures: 38 },
];

export const PipelineLineChart = () => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={pipelineData}>
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

export const DeptDonutChart = () => (
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={deptData}
        cx="50%"
        cy="50%"
        innerRadius={60}
        outerRadius={80}
        paddingAngle={5}
        dataKey="value"
      >
        {deptData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend verticalAlign="bottom" height={36}/>
    </PieChart>
  </ResponsiveContainer>
);

export const MonthlyBarChart = () => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={monthlyData}>
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
