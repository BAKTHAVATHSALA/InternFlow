import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useOnboardingAuth } from '../contexts/OnboardingAuthContext';
import OnboardSidebar from '../components/onboard/OnboardSidebar';
import OnboardTopNavbar from '../components/onboard/OnboardTopNavbar';

const InternOnboardLayout = () => {
  const { isOnboardAuthenticated, loading } = useOnboardingAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-500">Loading portal...</p>
        </div>
      </div>
    );
  }

  if (!isOnboardAuthenticated) {
    return <Navigate to="/onboard/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <OnboardSidebar />
      <OnboardTopNavbar />
      <main className="ml-64 pt-16 min-h-screen">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default InternOnboardLayout;
