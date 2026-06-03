import { useState, useContext, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { UserFinancialContext } from '../context/UserFinancialContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard,
  LineChart,
  Wallet, 
  Bot, 
  FlaskConical, 
  HelpCircle, 
  Settings,
  ChevronDown,
  Info
} from 'lucide-react';
import { Logo } from './Logo';
import bgImage from '../assets/background.png';
import { Modal } from './Modal';
import './layout.css';

export const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { userProfile } = useContext(UserFinancialContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('vestlytics_token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('vestlytics_token');
    navigate('/login');
  };
  
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

  const hasGuide = (pathname) => {
    return ['/dashboard', '/market-analysis', '/my-finances', '/ai-consultant'].includes(pathname);
  };

  const getGuideTitle = (pathname, tab) => {
    switch (pathname) {
      case '/dashboard': return 'Dashboard Guide';
      case '/market-analysis': return 'Market Analysis Guide';
      case '/my-finances': return tab === 'assets' ? 'My Finances - Assets Guide' : 'My Finances - Profile & Income Guide';
      case '/ai-consultant': return 'AI Consultant Guide';
      default: return '';
    }
  };

  const renderGuideContent = (pathname, tab) => {
    switch (pathname) {
      case '/dashboard':
        return (
          <div className="space-y-6 text-left text-slate-700" style={{ fontSize: '0.92rem', lineHeight: '1.6', color: '#334155' }}>
            <section className="mb-6">
              <h3 className="text-base font-bold text-slate-900 mb-3 pb-1 border-b border-slate-100 uppercase tracking-wide">
                Part 1: Overview of Each Container’s Functions
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-slate-800">1. Top Metrics Grid (Summary Indicators)</h4>
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-600">
                    <li><strong>Current Value:</strong> Displays the cumulative market value of all asset categories currently saved in the user's portfolio.</li>
                    <li><strong>Invested Value:</strong> Shows the baseline capital invested, assuming consistent contributions (calculated as 95% of current value in the baseline mock portfolio).</li>
                    <li><strong>Financial Health Score Widget:</strong> Displays a circular progress ring indicating the user's overall health score (out of 100), calculated dynamically from the savings rate and debt ratio.</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">2. Investment Statistics (Historical Performance Chart)</h4>
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-600">
                    <li><strong>Timeline Graph:</strong> A dual-bar chart showing the last 6 months (Jan - Jun 2026) of income vs expense DCA contributions.</li>
                    <li><strong>DCA Comparison:</strong> Visualizes the proportion of monthly income saved/invested vs spent, allowing users to track the trend of capital accumulation.</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">3. Assets Detail Table (Portfolio Overview)</h4>
                  <p className="text-slate-600 mt-1">
                    <strong>Summary Matrix:</strong> Lists all active asset categories, their total valuation, 24h/7d simulated price trends, total portfolio allocation percentage, and automated Buy/Hold recommendation signals.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">4. Asset Breakdown (Donut Allocation Chart)</h4>
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-600">
                    <li><strong>Allocation View:</strong> A circular donut chart showing the percentage distribution of assets across classes (Stocks, Gold, Bonds, Cash, Crypto, etc.).</li>
                    <li><strong>Diversification Guide:</strong> Helps users identify if their portfolio is over-concentrated in a single asset type.</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">5. Financial Health Tracker & AI Insight</h4>
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-600">
                    <li><strong>Tracker Bars:</strong> Progress bars showing the status of Income/Month, Expense/Month, Net Savings Rate, and Debt Ratio.</li>
                    <li><strong>AI recommendation box:</strong> A dynamic narrative block giving recommendations based on whether the savings rate is above or below the 40% safe threshold.</li>
                  </ul>
                </div>
              </div>
            </section>
            <section>
              <h3 className="text-base font-bold text-slate-900 mb-3 pb-1 border-b border-slate-100 uppercase tracking-wide">
                Part 2: Key Financial Metrics & Dynamic Interactions
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li><strong>Savings Rate Formula:</strong> Calculated as <code>((Income - Expenses) / Income) * 100</code>. A rate above 40% triggers positive AI growth indicators.</li>
                <li><strong>Debt Ratio Formula:</strong> Calculated as <code>(Total Debt / Income) * 100</code>. Ratios above 30% trigger warning highlights.</li>
                <li><strong>Reactive Synchronicity:</strong> Every modification to assets or profile inputs on the "My Finances" page instantly propagates here.</li>
              </ul>
            </section>
          </div>
        );
      case '/market-analysis':
        return (
          <div className="space-y-6 text-left text-slate-700" style={{ fontSize: '0.92rem', lineHeight: '1.6', color: '#334155' }}>
            <section className="mb-6">
              <h3 className="text-base font-bold text-slate-900 mb-3 pb-1 border-b border-slate-100 uppercase tracking-wide">
                Part 1: Overview of Each Container’s Functions
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-slate-800">1. Stock Selection Cards (Asset Quick-Switcher)</h4>
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-600">
                    <li><strong>Horizontal Switcher:</strong> Displays scrollable cards for analyzed tickers (e.g., BBCA, ASII, TLKM, BBRI, GOTO) with their current market price and 24h percentage change.</li>
                    <li><strong>Analysis Control:</strong> Tickers can be selected to load deep learning models, or removed using the "X" button on the top-right corner of each card.</li>
                    <li><strong>Stock Addition:</strong> Clicking the "+" card triggers a modal dialog listing other available stocks in the database.</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">2. Currently Analyzing Info Panel</h4>
                  <p className="text-slate-600 mt-1">
                    <strong>Status Feed:</strong> Displays the selected ticker name, deep learning model description, current price, and model accuracy score (94.8% MAPE).
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">3. Stock Price Forecast & AI Prediction (Main Chart)</h4>
                  <p className="text-slate-600 mt-1">
                    <strong>LSTM Visualization:</strong> Charts the historical price sequence (solid purple line) and links it directly to future AI projections (dashed cyan line) for short-term and long-term milestones.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">4. LSTM Forecast Matrix</h4>
                  <p className="text-slate-600 mt-1">
                    <strong>Timelines Grid:</strong> Displays the projected price values and percentage changes for:
                  </p>
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-600">
                    <li><strong>1 Day Forecast:</strong> Immediate short-term expectation.</li>
                    <li><strong>7 Days Forecast:</strong> Weekly performance trend.</li>
                    <li><strong>1 Month Forecast:</strong> Medium-term outlook.</li>
                    <li><strong>6 Months Forecast:</strong> Long-term structural trend.</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">5. AI Insight Narrative</h4>
                  <p className="text-slate-600 mt-1">
                    <strong>Verdict Box:</strong> Text box containing descriptive AI-generated summaries of market sentiment, technical indicator status, and tags (e.g., Bullish, Low Volatility).
                  </p>
                </div>
              </div>
            </section>
            <section>
              <h3 className="text-base font-bold text-slate-900 mb-3 pb-1 border-b border-slate-100 uppercase tracking-wide">
                Part 2: Working with LSTM Predictions & Market Data
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li><strong>Understanding MAPE:</strong> The Mean Absolute Percentage Error (MAPE) indicates the accuracy of the LSTM model predictions relative to backtested data.</li>
                <li><strong>DCA Timing:</strong> Projections are designed to help users identify potential Bear Market troughs for strategic Dollar-Cost Averaging.</li>
              </ul>
            </section>
          </div>
        );
      case '/my-finances':
        if (tab === 'assets') {
          return (
            <div className="space-y-6 text-left text-slate-700" style={{ fontSize: '0.92rem', lineHeight: '1.6', color: '#334155' }}>
              <section className="mb-6">
                <h3 className="text-base font-bold text-slate-900 mb-3 pb-1 border-b border-slate-100 uppercase tracking-wide">
                  Part 1: Overview of Each Container’s Functions
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-800">1. Asset Breakdown Donut Chart</h4>
                    <p className="text-slate-600 mt-1">
                      <strong>Portfolio Weighting:</strong> Displays a detailed donut chart reflecting the percentage breakdown of both default assets and custom assets.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">2. Portfolio Risk Metrics Matrix</h4>
                    <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-600">
                      <li><strong>Overall Risk:</strong> Evaluates volatility levels (Low, Medium, High).</li>
                      <li><strong>Sharpe Ratio:</strong> Measures risk-adjusted returns (higher ratios indicate superior returns per unit of risk).</li>
                      <li><strong>Max Drawdown:</strong> Displays the peak-to-trough decline over the past 12 months.</li>
                      <li><strong>Beta:</strong> Measures the asset volatility relative to the IHSG market benchmark.</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">3. Allocation vs Ideal Target Bar</h4>
                    <p className="text-slate-600 mt-1">
                      <strong>Asset Alignment:</strong> Visualizes the active allocation proportions relative to baseline targets in a contiguous horizontal segment bar.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">4. Asset Detail Table</h4>
                    <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-600">
                      <li><strong>Portfolio Ledger:</strong> Lists all asset categories with value, YTD returns, performance ratings, and last update dates.</li>
                      <li><strong>Actions Column:</strong> Includes a trash bin button on the right to remove any custom or default asset category.</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">5. Add Asset Category Button & Modal</h4>
                    <p className="text-slate-600 mt-1">
                      <strong>Asset Expansion:</strong> Opens a dialog to create new asset categories, containing quick-fill templates (Crypto, Mutual Funds, Real Estate) and inputs for custom listings.
                    </p>
                  </div>
                </div>
              </section>
              <section>
                <h3 className="text-base font-bold text-slate-900 mb-3 pb-1 border-b border-slate-100 uppercase tracking-wide">
                  Part 2: Managing Portfolio Assets
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-slate-600">
                  <li><strong>Custom Categories:</strong> Users can define assets outside the standard list (e.g., Crypto or P2P Lending) and specify YTD returns.</li>
                  <li><strong>Performance Levels:</strong> Asset performance is rated as "Outperform", "In Line", or "Underperform" depending on its return relative to market benchmarks.</li>
                </ul>
              </section>
            </div>
          );
        } else {
          return (
            <div className="space-y-6 text-left text-slate-700" style={{ fontSize: '0.92rem', lineHeight: '1.6', color: '#334155' }}>
              <section className="mb-6">
                <h3 className="text-base font-bold text-slate-900 mb-3 pb-1 border-b border-slate-100 uppercase tracking-wide">
                  Part 1: Overview of Each Container’s Functions
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-800">1. Financial Profile Form</h4>
                    <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-600">
                      <li><strong>Wallet Variables:</strong> Allows editing basic cashflow settings: Monthly Income, Monthly Expenses, Emergency Fund reserves, Total Debt, Monthly Debt Payments, and Net Worth.</li>
                      <li><strong>Submit Control:</strong> Saves variables securely to the database and syncs them to local storage to unlock AI analytics.</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">2. Asset Categorization Panel</h4>
                    <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-600">
                      <li><strong>Base Categories:</strong> Fields to input holdings in Stocks, Gold, Bonds, and Cash.</li>
                      <li><strong>Allocation Percentages:</strong> Displays the active percentage of total net worth occupied by each core category.</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">3. Monthly Cashflow History Table</h4>
                    <p className="text-slate-600 mt-1">
                      <strong>Historical Ledger:</strong> Displays income, expenses, net savings, and savings rates for current and previous periods, dynamically scaled from the user's inputs.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">4. Health Score & Health Tracker Widgets</h4>
                    <p className="text-slate-600 mt-1">
                      <strong>Visual Diagnostics:</strong> Renders progress bars for cashflow limits and calculates the circular Health Score (out of 100) based on wallet indicators.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">5. Financial Targets Checklist</h4>
                    <p className="text-slate-600 mt-1">
                      <strong>Goal Indicators:</strong> Shows progress bars for core milestones:
                    </p>
                    <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-600">
                      <li><strong>Emergency Fund:</strong> Target set dynamically to 6x monthly expenses.</li>
                      <li><strong>Property DP:</strong> Target set to Rp 150M.</li>
                      <li><strong>FIRE (Retire Early):</strong> Target set to Rp 360M.</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">6. AI Insight Box</h4>
                    <p className="text-slate-600 mt-1">
                      <strong>Advisory Console:</strong> Evaluates emergency coverage in terms of months of expenses and suggests customized budget reallocations.
                    </p>
                  </div>
                </div>
              </section>
              <section>
                <h3 className="text-base font-bold text-slate-900 mb-3 pb-1 border-b border-slate-100 uppercase tracking-wide">
                  Part 2: Profile Setup Guides
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-slate-600">
                  <li><strong>Ideal Emergency Reserve:</strong> 6 months of living expenses.</li>
                  <li><strong>Target Progress calculation:</strong> Standard targets display progress as <code>(Saved / Target) * 100</code>. Custom targets can be added via the "Set Up Targets" modal.</li>
                </ul>
              </section>
            </div>
          );
        }
      case '/ai-consultant':
        return (
          <div className="space-y-6 text-left text-slate-700" style={{ fontSize: '0.92rem', lineHeight: '1.6', color: '#334155' }}>
            <section className="mb-6">
              <h3 className="text-base font-bold text-slate-900 mb-3 pb-1 border-b border-slate-100 uppercase tracking-wide">
                Part 1: Overview of Each Container’s Functions
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-slate-800">1. Dynamic Scoreboard (Wallet Checkup)</h4>
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-600">
                    <li><strong>Parameter Badges:</strong> Displays the user's Risk Score, Emergency Fund Coverage (in months), Savings Rate, and monthly DCA Budget proportion.</li>
                    <li><strong>Color Coding:</strong> Status badges shift between green, yellow, and red to highlight potential financial vulnerabilities.</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">2. Suggestion Log Checklist</h4>
                  <p className="text-slate-600 mt-1">
                    <strong>Task Cards:</strong> Shows tailored recommendations (e.g., "Build emergency fund first", "Limit investment DCA under 30%") that change states based on the user's profile.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">3. AI Chat Box / Query Console</h4>
                  <p className="text-slate-600 mt-1">
                    <strong>Interactive Querying:</strong> Allows inputting custom questions or selecting pre-set prompts to obtain tailored financial guidance.
                  </p>
                </div>
              </div>
            </section>
            <section>
              <h3 className="text-base font-bold text-slate-900 mb-3 pb-1 border-b border-slate-100 uppercase tracking-wide">
                Part 2: Interacting with your AI Consultant
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li><strong>Wallet Reality Check:</strong> The AI Consultant works by cross-referencing your simulation inputs or profile settings.</li>
                <li><strong>Risk Mitigation:</strong> Alerts are triggered automatically if the monthly DCA amount exceeds 30% of take-home pay, or if emergency cash covers less than 3 months of expenses.</li>
              </ul>
            </section>
          </div>
        );
      default:
        return null;
    }
  };

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
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <h1 className="page-title">{title}</h1>
                   {hasGuide(location.pathname) && (
                     <button
                       onClick={() => setIsGuideOpen(true)}
                       className="header-info-btn"
                       style={{
                         background: 'none',
                         border: 'none',
                         cursor: 'pointer',
                         padding: '4px',
                         display: 'flex',
                         alignItems: 'center',
                       }}
                       title={`${title} Guide`}
                     >
                       <Info size={16} />
                     </button>
                   )}
                 </div>
                 {subtitle && <p className="page-subtitle">{subtitle}</p>}
               </div>
             )}
          </div>
          
          <div className="top-nav-right">
            <div className="user-profile-wrapper" ref={dropdownRef} style={{ position: 'relative' }}>
              <div className="user-profile" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <div className="user-avatar">
                  {userProfile?.avatarUrl ? (
                    <img src={userProfile.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    /* Placeholder avatar */
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-slate-500"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  )}
                </div>
                <span className="user-name">{userProfile?.fullName || 'Guest'}</span>
                <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '100%',
                      marginTop: '8px',
                      width: '160px',
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      padding: '4px',
                      display: 'flex',
                      flexDirection: 'column',
                      zIndex: 100,
                    }}
                  >
                    <Link
                      to="/settings"
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        padding: '8px 12px',
                        fontSize: '0.85rem',
                        color: '#334155',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'background-color 0.15s',
                        fontWeight: '500',
                      }}
                      className="hover:bg-slate-50"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      style={{
                        padding: '8px 12px',
                        fontSize: '0.85rem',
                        color: '#ef4444',
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        width: '100%',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'background-color 0.15s',
                        fontWeight: '500',
                      }}
                      className="hover:bg-red-50"
                    >
                      Log out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="main-content">
          <Outlet />
        </main>

        {/* Centralized Guide Modal */}
        {hasGuide(location.pathname) && (
          <Modal
            isOpen={isGuideOpen}
            onClose={() => setIsGuideOpen(false)}
            title={getGuideTitle(location.pathname, activeTab)}
            className="large-top-modal"
          >
            {renderGuideContent(location.pathname, activeTab)}
          </Modal>
        )}
      </div>
    </div>
  );
};
