import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, LayoutDashboard, Calendar, FileText, Shield, MessageSquare,
  AlertTriangle, CreditCard, Building2, Users, Settings, LogOut,
  Menu, X, Star, Briefcase, Send, Gift, FileCheck, ChevronDown, ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const NAV_SECTIONS = [
  {
    label: 'Core',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['professional'] },
      { to: '/facility', icon: Building2, label: 'Facility Hub', roles: ['facility'] },
      { to: '/admin', icon: Shield, label: 'Admin Panel', roles: ['admin'] },
    ]
  },
  {
    label: 'Shifts',
    items: [
      { to: '/calendar', icon: Calendar, label: 'Calendar' },
      { to: '/offers', icon: Send, label: 'Offers' },
    ]
  },
  {
    label: 'Operations',
    items: [
      { to: '/compliance', icon: FileCheck, label: 'Compliance' },
      { to: '/disputes', icon: AlertTriangle, label: 'Disputes' },
      { to: '/messages', icon: MessageSquare, label: 'Messages' },
    ]
  },
  {
    label: 'Finance',
    items: [
      { to: '/payments', icon: CreditCard, label: 'Payments' },
      { to: '/contracts', icon: FileText, label: 'Contracts' },
    ]
  },
  {
    label: 'Network',
    items: [
      { to: '/facilities', icon: Building2, label: 'Facilities' },
      { to: '/referrals', icon: Gift, label: 'Referrals' },
    ]
  },
];

export default function Layout({ children }) {
  const { userProfile, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const role = userProfile?.role || 'professional';

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Mobile Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="brutal-button small"
        style={{
          position: 'fixed', top: '1rem', left: '1rem', zIndex: 200,
          display: 'none', padding: '0.5rem',
        }}
        id="sidebar-toggle"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      <style>{`@media(max-width:1024px){#sidebar-toggle{display:flex !important;}}`}</style>

      {/* Sidebar */}
      <nav className={`brutal-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div style={{
          padding: '1.5rem 1.25rem',
          borderBottom: '2px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', gap: '0.75rem'
        }}>
          <div style={{
            width: 36, height: 36, background: 'var(--color-accent)',
            border: '2px solid #fff', borderRadius: 'var(--radius-sm)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '2px 2px 0 rgba(255,255,255,0.2)'
          }}>
            <Zap size={20} color="#000" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>
              ERGO
            </div>
            <div style={{ fontSize: '0.6rem', color: 'var(--color-accent)', letterSpacing: '0.1em' }}>
              HEALTHCARE STAFFING
            </div>
          </div>
        </div>

        {/* User Pill */}
        <div style={{
          padding: '1rem 1.25rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          borderBottom: '2px solid rgba(255,255,255,0.05)'
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--color-accent)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.8rem',
            color: '#000'
          }}>
            {userProfile?.full_name?.charAt(0) || 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 500 }} className="truncate">
              {userProfile?.full_name || 'User'}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
              {role}
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
          {NAV_SECTIONS.map(section => {
            const visibleItems = section.items.filter(item =>
              !item.roles || item.roles.includes(role) || role === 'admin'
            );
            if (visibleItems.length === 0) return null;
            return (
              <div key={section.label}>
                <div className="brutal-sidebar-section">{section.label}</div>
                {visibleItems.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => `brutal-sidebar-link ${isActive ? 'active' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ borderTop: '2px solid rgba(255,255,255,0.1)', padding: '0.5rem 0' }}>
          <NavLink
            to="/settings"
            className={({ isActive }) => `brutal-sidebar-link ${isActive ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <Settings size={16} /> Settings
          </NavLink>
          <button className="brutal-sidebar-link" onClick={handleSignOut}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </nav>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.5)', zIndex: 99,
              display: 'none'
            }}
          />
        )}
      </AnimatePresence>
      <style>{`@media(max-width:1024px){.brutal-sidebar+div>div:first-child{display:block !important;}}`}</style>

      {/* Main Content */}
      <main className="brutal-main">
        {children}
      </main>
    </div>
  );
}
