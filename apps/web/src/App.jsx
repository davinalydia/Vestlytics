import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageTransition from './components/PageTransition';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { DashboardLayout } from './components/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import MarketAnalysisPage from './pages/MarketAnalysisPage';
import MyFinancesPage from './pages/MyFinancesPage';
import AIConsultantPage from './pages/AIConsultantPage';
import StrategyLabPage from './pages/StrategyLabPage';
import HelpCenterPage from './pages/HelpCenterPage';
import SettingsPage from './pages/SettingsPage';
import { UserFinancialProvider } from './context/UserFinancialContext';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
        
        {/* Authenticated Routes wrapped in DashboardLayout */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<PageTransition><DashboardPage /></PageTransition>} />
          <Route path="/market-analysis" element={<PageTransition><MarketAnalysisPage /></PageTransition>} />
          <Route path="/my-finances" element={<PageTransition><MyFinancesPage /></PageTransition>} />
          <Route path="/ai-consultant" element={<PageTransition><AIConsultantPage /></PageTransition>} />
          <Route path="/strategy-lab" element={<PageTransition><StrategyLabPage /></PageTransition>} />
          <Route path="/help" element={<PageTransition><HelpCenterPage /></PageTransition>} />
          <Route path="/settings" element={<PageTransition><SettingsPage /></PageTransition>} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <UserFinancialProvider>
      <Router>
        <AnimatedRoutes />
      </Router>
    </UserFinancialProvider>
  );
}

export default App;
