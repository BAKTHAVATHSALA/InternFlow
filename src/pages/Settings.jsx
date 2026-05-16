import React from 'react';
import { User, Bell, Shield, Users, Camera, Mail, Phone, Building, Briefcase } from 'lucide-react';
import { cn } from '../utils/cn';

const Settings = () => {
  const [activeTab, setActiveTab] = React.useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'team', label: 'Team & Access', icon: Users },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500">Manage your account and platform preferences</p>
      </div>

      <div className="flex border-b border-slate-200 gap-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 py-4 border-b-2 transition-all font-medium text-sm",
              activeTab === tab.id 
                ? "border-primary-600 text-primary-600" 
                : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card p-8">
        {activeTab === 'profile' && (
          <div className="space-y-8">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-3xl font-bold border-4 border-white shadow-sm">
                  HR
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border border-slate-100 text-primary-600 hover:bg-primary-50 transition-colors">
                  <Camera size={16} />
                </button>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">HR Team Profile</h3>
                <p className="text-sm text-slate-500">Update your photo and personal details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">First Name</label>
                <input type="text" defaultValue="HR" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Last Name</label>
                <input type="text" defaultValue="Team" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="email" defaultValue="hr@internyx.com" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Job Title</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" defaultValue="HR Administrator" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Department</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" defaultValue="People Operations" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="tel" defaultValue="+1 (555) 000-0000" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button className="btn-primary px-8">Save Changes</button>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900">Notification Preferences</h3>
            <p className="text-sm text-slate-500">Control how you receive updates about internship activities</p>
            
            <div className="space-y-4 pt-4">
              {[
                { id: 'n1', label: 'New Referral Submitted', desc: 'Get notified when a new intern is referred' },
                { id: 'n2', label: 'NDA Signed', desc: 'Alert when a candidate completes NDA signature' },
                { id: 'n3', label: 'Pipeline Stage Update', desc: 'Notify when candidate moves to next stage' },
                { id: 'n4', label: 'Internship Closure', desc: 'Alert before an internship period ends' },
                { id: 'n5', label: 'Weekly Report', desc: 'Receive a summary of all activities every Monday' },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Password Management</h3>
              <div className="grid grid-cols-1 gap-6 max-w-md">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Current Password</label>
                  <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Confirm Password</label>
                  <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-4">
              <Shield className="text-amber-600 shrink-0" size={24} />
              <div>
                <p className="font-bold text-amber-800 text-sm">Two-factor authentication (2FA)</p>
                <p className="text-xs text-amber-700 mt-1">2FA is currently enabled for your account using Authenticator App. This adds an extra layer of security.</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button className="btn-primary px-8">Update Password</button>
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <Users size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Team Management</h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">This section is restricted to super administrators only.</p>
            </div>
            <button className="text-primary-600 font-bold hover:underline">Request Access</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
