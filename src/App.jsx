import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Briefcase, 
  TrendingUp, 
  FileText, 
  Settings as SettingsIcon,
  GitBranch,
  UserCheck,
  LogOut,
  History,
  Upload,
  Award,
  Users,
  MessageSquare,
  Calendar,
  UserPlus,
  Bell,
  BookOpen,
  ShieldCheck
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// HR Pages
import HRDashboard from './pages/Dashboard';
import HRPipeline from './pages/Pipeline';
import HROnboarding from './pages/Onboarding';
import HRClosure from './pages/Closure';
import HRAudit from './pages/Audit';
import HRSettings from './pages/Settings';
// Employee Pages
import EmpDashboard from './pages/employee/Dashboard';
import EmpRefer from './pages/employee/Refer';
import EmpMyReferrals from './pages/employee/MyReferrals';
import EmpOpenRoles from './pages/employee/OpenRoles';
import EmpRewards from './pages/employee/Rewards';
// Mentor Pages
import MentorDashboard from './pages/mentor/Dashboard';
import MentorInterns from './pages/mentor/MyInterns';
import MentorReviews from './pages/mentor/Reviews';
import MentorFeedback from './pages/mentor/Feedback';
import MentorSchedule from './pages/mentor/Schedule';

// Intern Pages
import IntDashboard from './pages/intern/InternDashboardHome';
import IntLearning from './pages/intern/LearningPortalPage';
import IntProject from './pages/intern/ProjectSubmissionPage';
import IntMentor from './pages/intern/MyMentorPage';
import IntCredentials from './pages/intern/CredentialsPage';
import IntCertificate from './pages/intern/CertificatePage';

// Recruitment Portal Pages
import RecruitmentLayout from './layouts/RecruitmentLayout';
import RecruitmentEmail from './pages/recruitment/EmailEntry';
import RecruitmentOTP from './pages/recruitment/OTPEntry';
import RecruitmentJobPage from './pages/recruitment/RecruitmentJobPage';
import RecruitmentApplicationPage from './pages/recruitment/RecruitmentApplicationPage';
import RecruitmentAIScreeningPage from './pages/recruitment/RecruitmentAIScreeningPage';
import RecruitmentOfferPage from './pages/recruitment/RecruitmentOfferPage';
import InternOnboardLayout from './layouts/InternOnboardLayout';
import OnboardJobPage from './pages/onboard/OnboardJobPage';
import OnboardApplicationPage from './pages/onboard/OnboardApplicationPage';
import OnboardAIScreeningPage from './pages/onboard/OnboardAIScreeningPage';
import OnboardOfferPage from './pages/onboard/OnboardOfferPage';
import OnboardDocumentsPage from './pages/onboard/OnboardDocumentsPage';
import OnboardSuccessPage from './pages/onboard/OnboardSuccessPage';

import Login from './pages/Login';
import OnboardingLogin from './pages/onboard/OnboardingLogin';
import InternPortalLogin from './pages/intern/InternPortalLogin';

import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { OnboardingAuthProvider } from './contexts/OnboardingAuthContext';

const MainLayout = ({ isCollapsed, setIsCollapsed, role, user, getMenu, handleLogout }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        items={getMenu()}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isCollapsed ? 'md:ml-20' : 'md:ml-[260px]'}`}>
        <Navbar
          currentRole={role}
          onLogout={handleLogout}
          user={user}
          onMobileMenuToggle={() => setIsMobileOpen(v => !v)}
        />
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 max-w-[100vw] overflow-x-hidden safe-padding-x">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, isAuthenticated, loading, logout } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-[#f8fafc]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div>;
  }

  const role = user?.role || 'intern';

  const hrMenu = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: GitBranch, label: 'Candidate Pipeline', path: '/pipeline' },
    { icon: UserCheck, label: 'Onboarding', path: '/onboarding' },
    { icon: LogOut, label: 'Closure', path: '/closure' },
    { icon: History, label: 'Audit Trail', path: '/audit' },
    { icon: SettingsIcon, label: 'Settings', path: '/settings' },
  ];

  const mentorMenu = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'My Interns', path: '/interns', badge: 1 },
    { icon: CheckSquare, label: 'Reviews', path: '/reviews', badge: 3 },
    { icon: MessageSquare, label: 'Feedback', path: '/feedback' },
    { icon: Calendar, label: 'Schedule', path: '/schedule' },
  ];

  const employeeMenu = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/', section: 'MAIN' },
    { icon: UserPlus, label: 'Refer an Intern', path: '/refer', section: 'MAIN' },
    { icon: Users, label: 'My Referrals', path: '/my-referrals', section: 'MAIN' },
    { icon: Briefcase, label: 'Open Roles', path: '/open-roles', section: 'MAIN' },
    { icon: Award, label: 'Rewards', path: '/rewards', section: 'ACCOUNT' },
  ];

  const internMenu = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/', section: 'MAIN' },
    { icon: BookOpen, label: 'Learning', path: '/learning', section: 'MAIN' },
    { icon: Briefcase, label: 'Project', path: '/project', section: 'MAIN' },
    { icon: Users, label: 'My Mentor', path: '/mentor', section: 'MAIN' },
    { icon: ShieldCheck, label: 'Credentials', path: '/credentials', section: 'ACCOUNT' },
    { icon: Award, label: 'Certificate', path: '/certificate', section: 'ACCOUNT' },
  ];

  const getMenu = () => {
    if (role === 'hr' || role === 'admin') return hrMenu;
    if (role === 'employee') return employeeMenu;
    if (role === 'mentor') return mentorMenu;
    return internMenu;
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/intern/login" element={isAuthenticated && user?.role === 'intern' ? <Navigate to="/" replace /> : <InternPortalLogin />} />

        {/* Onboarding Portal (Standalone — separate auth) */}
        <Route path="/onboard/login" element={<OnboardingLogin />} />
        <Route path="/intern-onboard" element={<InternOnboardLayout />}>
          <Route path="job" element={<OnboardJobPage />} />
          <Route path="application" element={<OnboardApplicationPage />} />
          <Route path="screening" element={<OnboardAIScreeningPage />} />
          <Route path="offer" element={<OnboardOfferPage />} />
          <Route path="documents" element={<OnboardDocumentsPage />} />
          <Route path="success" element={<OnboardSuccessPage />} />
          <Route index element={<Navigate to="job" replace />} />
        </Route>
        
        {/* Recruitment Portal (Standalone) */}
        <Route path="/recruitment">
          <Route path="login" element={<RecruitmentEmail />} />
          <Route path="otp" element={<RecruitmentOTP />} />
          <Route element={<RecruitmentLayout />}>
            <Route path="job" element={<RecruitmentJobPage />} />
            <Route path="application" element={<RecruitmentApplicationPage />} />
            <Route path="screening" element={<RecruitmentAIScreeningPage />} />
            <Route path="offer" element={<RecruitmentOfferPage />} />
          </Route>
        </Route>

        {/* Protected Dashboard Routes */}
        <Route 
          element={
            isAuthenticated ? (
              <MainLayout 
                isCollapsed={isCollapsed} 
                setIsCollapsed={setIsCollapsed} 
                role={role} 
                user={user} 
                getMenu={getMenu} 
                handleLogout={logout} 
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          {/* HR Routes */}
          <Route path="/pipeline" element={<HRPipeline />} />
          <Route path="/onboarding" element={<HROnboarding />} />
          <Route path="/closure" element={<HRClosure />} />
          <Route path="/audit" element={<HRAudit />} />
          <Route path="/settings" element={<HRSettings />} />

          {/* Employee Routes */}
          <Route path="/refer" element={<EmpRefer />} />
          <Route path="/my-referrals" element={<EmpMyReferrals />} />
          <Route path="/open-roles" element={<EmpOpenRoles />} />
          <Route path="/rewards" element={<EmpRewards />} />

          {/* Mentor Routes */}
          <Route path="/interns" element={<MentorInterns />} />
          <Route path="/reviews" element={<MentorReviews />} />
          <Route path="/feedback" element={<MentorFeedback />} />
          <Route path="/schedule" element={<MentorSchedule />} />

          {/* Intern Routes */}
          <Route path="/learning" element={<IntLearning />} />
          <Route path="/project" element={<IntProject />} />
          <Route path="/mentor" element={<IntMentor />} />
          <Route path="/credentials" element={<IntCredentials />} />
          <Route path="/certificate" element={<IntCertificate />} />

          {/* Shared Home Route */}
          <Route 
            path="/" 
            element={
              (role === 'hr' || role === 'admin') ? <HRDashboard /> :
              role === 'employee' ? <EmpDashboard /> :
              role === 'mentor' ? <MentorDashboard /> :
              <IntDashboard />
            } 
          />

        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <OnboardingAuthProvider>
        <Toaster position="top-center" containerStyle={{ top: 8 }} toastOptions={{ style: { maxWidth: 'calc(100vw - 2rem)' } }} />
        <AppRoutes />
      </OnboardingAuthProvider>
    </AuthProvider>
  );
};

export default App;
