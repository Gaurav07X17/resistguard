import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AppLayout.css';

const NavItem = ({ to, icon, label }) => (
  <NavLink to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
    <span className="nav-icon">{icon}</span>
    <span className="nav-label">{label}</span>
  </NavLink>
);

// SVG icons — cleaner than unicode characters
const Icons = {
  dashboard: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  ),
  submit: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M8 5v6M5 8h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  samples: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 1h8a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M5.5 5h5M5.5 8h5M5.5 11h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  logout: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M5 2H2.5A1.5 1.5 0 0 0 1 3.5v7A1.5 1.5 0 0 0 2.5 12H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M9 4.5L12 7l-3 2.5M5 7h7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  chevronLeft: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M9 2.5L4.5 7 9 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  chevronRight: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M5 2.5L9.5 7 5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

export default function AppLayout() {
  const { user, logout, isResearcher } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className={`app-shell ${collapsed ? 'collapsed' : ''}`}>
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon-wrap">🛡️</div>
            {!collapsed && <span className="logo-text">ResistGuard</span>}
          </div>
          <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)} title={collapsed ? 'Expand' : 'Collapse'}>
            {collapsed ? Icons.chevronRight : Icons.chevronLeft}
          </button>
        </div>

        <nav className="sidebar-nav">
          {!collapsed && <span className="nav-section-label">Navigation</span>}
          <NavItem to="/dashboard" icon={Icons.dashboard} label="Dashboard" />
          <NavItem to="/submit"    icon={Icons.submit}    label="Submit Sample" />
          <NavItem to="/samples"   icon={Icons.samples}   label="Sample Registry" />
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            {!collapsed && (
              <div className="user-info">
                <span className="user-name">{user?.name}</span>
                <span className={`user-role role-${user?.role}`}>{user?.role}</span>
              </div>
            )}
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Sign out">
            {Icons.logout}
            <span className="logout-label">Sign out</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
