import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './components/Toast';
import AIConcierge from './components/AIConcierge';

// Pages
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import Landing from './pages/Landing';
import Onboarding from './pages/Onboarding';
import ProfessionalDashboard from './pages/ProfessionalDashboard';
import FacilityDashboard from './pages/FacilityDashboard';
import ShiftDetail from './pages/ShiftDetail';
import CalendarPage from './pages/Calendar';
import ComplianceDashboard from './pages/ComplianceDashboard';
import Disputes from './pages/Disputes';
import Messages from './pages/Messages';
import AdminPanel from './pages/AdminPanel';
import Offers from './pages/Offers';
import Payments from './pages/Payments';
import Referrals from './pages/Referrals';
import Contracts from './pages/Contracts';
import FacilitiesPage from './pages/FacilitiesPage';
import ProfessionalDetail from './pages/ProfessionalDetail';

function ProtectedRoute({ children, requiredRole }) {
  const { user, userProfile, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userProfile && userProfile.role !== requiredRole && userProfile.role !== 'admin') {
    const targetPath = userProfile.role === 'facility' ? '/facility' : '/dashboard';
    if (window.location.pathname !== targetPath) {
      return <Navigate to={targetPath} replace />;
    }
  }

  return (
    <>
      {children}
      <AIConcierge />
    </>
  );
}

function RootRedirect() {
  const { user, userProfile, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  if (userProfile?.role === 'facility') return <Navigate to="/facility" replace />;
  if (userProfile?.role === 'admin') return <Navigate to="/admin" replace />;
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/onboarding" element={<Onboarding />} />

            {/* Role-Specific Dashboards */}
            <Route path="/dashboard" element={<ProtectedRoute requiredRole="professional"><ProfessionalDashboard /></ProtectedRoute>} />
            <Route path="/professional/*" element={<ProtectedRoute requiredRole="professional"><ProfessionalDashboard /></ProtectedRoute>} />
            <Route path="/facility/*" element={<ProtectedRoute requiredRole="facility"><FacilityDashboard /></ProtectedRoute>} />
            <Route path="/admin/*" element={<ProtectedRoute requiredRole="admin"><AdminPanel /></ProtectedRoute>} />

            {/* Shared Authenticated Routes */}
            <Route path="/shifts/:id" element={<ProtectedRoute><ShiftDetail /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
            <Route path="/compliance" element={<ProtectedRoute><ComplianceDashboard /></ProtectedRoute>} />
            <Route path="/disputes" element={<ProtectedRoute><Disputes /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/offers" element={<ProtectedRoute><Offers /></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
            <Route path="/referrals" element={<ProtectedRoute><Referrals /></ProtectedRoute>} />
            <Route path="/contracts" element={<ProtectedRoute><Contracts /></ProtectedRoute>} />
            <Route path="/facilities" element={<ProtectedRoute><FacilitiesPage /></ProtectedRoute>} />
            <Route path="/professionals/:id" element={<ProtectedRoute><ProfessionalDetail /></ProtectedRoute>} />

            {/* Settings - reuse existing */}
            <Route path="/settings" element={<ProtectedRoute><ProfessionalDashboard /></ProtectedRoute>} />

            {/* Catch-all */}
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
