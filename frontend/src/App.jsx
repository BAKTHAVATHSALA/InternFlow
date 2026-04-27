import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import InternPortal from './pages/InternPortal';
import HRDashboard from './pages/HRDashboard';
import BrowseJobs from './pages/BrowseJobs';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#F8F9FA]">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/intern" element={<InternPortal />} />
          <Route path="/hr" element={<HRDashboard />} />
          <Route path="/jobs" element={<BrowseJobs />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Protected routes will be added later */}
          {/* <Route path="/hr/*" element={<ProtectedRoute role="hr"><HRDashboard /></ProtectedRoute>} /> */}
          {/* <Route path="/intern/*" element={<ProtectedRoute role="intern"><InternDashboard /></ProtectedRoute>} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;