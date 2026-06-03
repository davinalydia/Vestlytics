import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  LineChart, 
  Wallet, 
  Bot, 
  FlaskConical, 
  HelpCircle, 
  Settings,
  Sun,
  ChevronDown
} from 'lucide-react';
import { Logo } from './Logo';
import bgImage from '../assets/background.png';
import './layout.css';

export const DashboardLayout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Helper to get page title based on path
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard': return { title: 'Dashboard', subtitle: '' };
      case '/market-analysis': return { title: 'Market Analysis', subtitle: 'Market monitoring with predictive analytics for smarter investment decisions.' };
      case '/my-finances': return { title: 'My Finances', subtitle: 'Input your financial profile so the AI can give you personalized recommendations.' };
      case '/ai-consultant': return { title: 'AI Consultant', subtitle: 'The suggestion log generator' };
      case '/strategy-lab': return { title: 'Strategy Lab', subtitle: 'The investment simulation page (The "What If" Page).' };
      case '/help': return { title: 'Help Center', subtitle: 'Contact support and FAQ' };
      case '/settings': return { title: 'Settings', subtitle: 'Manage your account, notifications, security, and preferences' };
      default: return { title: '', subtitle: '' };
    }
  };

  const { title, subtitle } = getPageTitle();

  // Close sidebar on mobile when navigating
  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="layout-container">
      {/* Mobile backdrop overlay */}
      <div 
        className={`sidebar-backdrop ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="sidebar-header">
          <NavLink to="/dashboard" className="sidebar-brand" onClick={handleNavClick}>
            <Logo className="w-8 h-8" />
            <span className="sidebar-brand-text">VESTLYTICS</span>
          </NavLink>
        </div>
        
        <div className="sidebar-content">
          <div className="sidebar-section">
            <span className="sidebar-label">General</span>
            <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
              <LayoutDashboard size={18} /> <span className="sidebar-link-text">Dashboard</span>
            </NavLink>
            <NavLink to="/market-analysis" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
              <LineChart size={18} /> <span className="sidebar-link-text">Market Analysis</span>
            </NavLink>
            <NavLink to="/my-finances" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
              <Wallet size={18} /> <span className="sidebar-link-text">My Finances</span>
            </NavLink>
          </div>

          <div className="sidebar-section">
            <span className="sidebar-label">Insights</span>
            <NavLink to="/ai-consultant" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
              <Bot size={18} /> <span className="sidebar-link-text">AI Consultant</span>
            </NavLink>
            <NavLink to="/strategy-lab" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
              <FlaskConical size={18} /> <span className="sidebar-link-text">Strategy Lab</span>
            </NavLink>
          </div>

          <div className="sidebar-section">
            <span className="sidebar-label">Others</span>
            <NavLink to="/help" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
              <HelpCircle size={18} /> <span className="sidebar-link-text">Help Center</span>
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
              <Settings size={18} /> <span className="sidebar-link-text">Settings</span>
            </NavLink>
          </div>
        </div>

        <div className="sidebar-footer">
          © 2026 Vestlytics
        </div>
      </aside>

      {/* Main Wrapper */}
      <div className="main-wrapper">
        {/* Global Background Illustration */}
        <div className="absolute bottom-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <img src={bgImage} alt="" className="absolute bottom-0 left-0 w-full md:w-[800px] opacity-100 object-contain" />
        </div>

        {/* Top Navbar */}
        <header className="top-navbar">
          <div className="top-nav-left">
             {/* Hamburger toggle button */}
             <button 
               className="hamburger-btn"
               onClick={() => setSidebarOpen(!sidebarOpen)}
               aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
             >
               <div className="hamburger-icon">
                 <span></span>
                 <span></span>
                 <span></span>
               </div>
             </button>
             {/* Logo icon - visible when sidebar is collapsed */}
             <div className={`navbar-logo ${!sidebarOpen ? 'is-visible' : ''}`}>
               <Logo className="w-8 h-8" />
             </div>
             {title && (
               <div className="page-header-info">
                 <h1 className="page-title">{title}</h1>
                 {subtitle && <p className="page-subtitle">{subtitle}</p>}
               </div>
             )}
          </div>
          
          <div className="top-nav-right">
            <div className="theme-toggle">
              <Sun size={20} />
            </div>
            <div className="user-profile">
              <div className="user-avatar">
                {/* Placeholder avatar */}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-slate-500"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <span className="user-name">Crazy Killer</span>
              <ChevronDown size={16} className="text-slate-400" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
