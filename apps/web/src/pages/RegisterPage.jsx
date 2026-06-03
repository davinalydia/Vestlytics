import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Modal } from '../components/Modal';
import { UserFinancialContext } from '../context/UserFinancialContext';
import { api } from '../services/api';

const TermsOfServiceContent = () => (
  <>
    <h3>General Nature of the Platform</h3>
    <p>Welcome to Vestlytics. Vestlytics is an AI-powered Investment Portfolio Analyzer and financial health tracker designed specifically as an educational Decision Support System. By using our service, you agree that Vestlytics is built to bridge the gap between market trends and personal financial awareness to help you build a healthy financial foundation before investing.</p>
    
    <h3>No Financial Advice or Broker Integration</h3>
    <p>Vestlytics is not a financial advisor. The platform utilizes Deep Learning models (LSTM/GRU) to analyze historical data and predict stock trends. Vestlytics does not support direct integration with stock broker systems, and we do not execute live transactions on your behalf. You are solely responsible for any investment decisions you make.</p>
    
    <h3>Simulations and Predictive Analytics</h3>
    <p>Features such as the Strategy Lab provide "What If" simulations based on parameters you input, including Expected Annual Return, Risk Level, and Monthly DCA (Dollar Cost Averaging) contributions. Projections shown for Bull Market, Base Case, and Bear Market scenarios are estimates intended for educational planning and do not guarantee future market performance.</p>
  </>
);

const PrivacyPolicyContent = () => (
  <>
    <h3>Information We Collect</h3>
    <p>To provide you with highly personalized AI insights, Vestlytics collects information during the 3-Step Onboarding process and ongoing application use. The data we collect includes: Basic Information (First name, last name, email address, and phone number), Financial Profile (Monthly income, monthly expenses, total debt, and the amount of your saved emergency fund), Portfolio Data (Your current asset allocations across market instruments).</p>

    <h3>How We Use Your Data</h3>
    <p>Your financial data is never used to judge you, but rather to evaluate your "Financial Awareness". We process your data through our Integrated Cashflow Engine to calculate your Financial Health Score, Net Savings Rate, and your specific Risk Match. This allows our AI Consultant to generate context-aware advice tailored exclusively to your wallet's health and risk capacity.</p>
    <p>Vestlytics applies strict risk management strategies, including the use of local data storage practices to ensure environment consistency and secure data handling.</p>

    <h3>Data Sharing and Third Parties</h3>
    <p>Vestlytics operates independently as an educational decision-support tool. Because direct execution of market trades falls explicitly out of our project scope, we do not link your account to, nor do we share your personal financial data with, third-party live brokers or trading platforms.</p>
  </>
);

const RegisterPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('tos');
  const navigate = useNavigate();
  const { updateFinancialData } = useContext(UserFinancialContext);

  const getPasswordStrength = (pass) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/\d/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (getPasswordStrength(password) < 3) {
      setError('Password must meet at least 3 criteria (Strong) to create an account.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await api.register(email, password);
      // Automatically log them in after registration
      await api.login(email, password);
      // Initialize Context
      updateFinancialData({
        monthlyIncome: '',
        monthlyExpenses: '',
        emergencyFund: '',
        totalDebt: '',
        monthlyDebtPayment: '',
        isProfileCompleted: false,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const strengthScore = getPasswordStrength(password);

  const getStrengthDisplay = () => {
    if (password.length === 0) return { text: '', color: 'bg-slate-200', bars: 0, textColor: 'text-slate-400' };
    if (strengthScore === 0) return { text: 'Very weak', color: 'bg-red-500', bars: 1, textColor: 'text-red-500' };
    if (strengthScore <= 2) return { text: 'Weak', color: 'bg-yellow-500', bars: 2, textColor: 'text-yellow-600' };
    if (strengthScore === 3) return { text: 'Strong', color: 'bg-green-500', bars: 3, textColor: 'text-green-600' };
    return { text: 'Very strong', color: 'bg-green-500', bars: 4, textColor: 'text-green-600' };
  };

  const strengthInfo = getStrengthDisplay();

  return (
    <div className="h-screen flex bg-slate-50 font-sans overflow-hidden animate-fade-in">
      {/* Left Pane - Branding & Steps */}
      <div className="hidden md:flex flex-col w-1/2 bg-[#0d1117] relative overflow-hidden text-white p-12 lg:p-20 justify-center animate-blur-in">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-900/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[50rem] h-[50rem] bg-purple-900/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

        {/* Upward Arrow Graphic */}
        <div className="absolute bottom-10 right-20 opacity-30 transform rotate-[15deg]">
          <svg width="350" height="350" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 0L100 50H75V100H25V50H0L50 0Z" fill="url(#paint0_linear_reg)" />
            <defs>
              <linearGradient id="paint0_linear_reg" x1="50" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6366f1" />
                <stop offset="1" stopColor="#a855f7" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <Logo />
            <span className="text-3xl font-semibold tracking-wider">VESTLYTICS</span>
          </div>

          <div className="inline-block bg-[#0891b2]/20 border border-[#0891b2]/30 text-cyan-400 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            • 3-Step Onboarding
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
            Start your <span className="text-cyan-400">smarter</span><br />investment journey
          </h1>
          <p className="text-slate-400 text-lg max-w-md mb-12">
            Creating an account takes less than 2 minutes. You'll be analyzing your portfolio with AI before you know it.
          </p>

          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center font-bold flex-shrink-0 z-10 relative">
                1
                {/* Connector line */}
                <div className="absolute top-8 left-1/2 w-0.5 h-12 bg-slate-700 -translate-x-1/2"></div>
              </div>
              <div>
                <h3 className="font-bold text-white">Create your account</h3>
                <p className="text-slate-500 text-sm">Basic info - name, email, password</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold flex-shrink-0 z-10 relative">
                2
                <div className="absolute top-8 left-1/2 w-0.5 h-12 bg-slate-800 -translate-x-1/2"></div>
              </div>
              <div>
                <h3 className="font-bold text-slate-300">Set up financial profile</h3>
                <p className="text-slate-500 text-sm">Income, expenses & emergency fund</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-bold text-slate-300">Explore your dashboard</h3>
                <p className="text-slate-500 text-sm">AI insights ready instantly</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50">
        {/* Top Navbar */}
        <div className="w-full p-6 flex justify-end items-center gap-6 text-sm font-medium text-slate-600">
          <Link to="/" className="hover:text-slate-900 transition-colors">Features</Link>
          <Link to="/" className="hover:text-slate-900 transition-colors">About</Link>
          <Link to="/login" className="bg-[#0ea5e9] hover:bg-sky-500 text-white px-5 py-2 rounded-full transition-colors">
            Sign In
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 sm:px-12 py-4">
          <div className="w-full max-w-lg bg-white rounded-2xl p-8 sm:p-10 shadow-[0_0_40px_rgba(0,0,0,0.05)] animate-scale-pop">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Create your account</h2>
            <p className="text-slate-500 text-sm mb-8">
              Already have an account? <Link to="/login" className="text-cyan-500 font-semibold hover:text-cyan-600">Sign in here</Link>
            </p>

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1.5">First name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="Budi"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-colors placeholder:text-slate-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1.5">Last name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="Santoso"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-colors placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">Email address <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-colors placeholder:text-slate-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">Phone number <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  placeholder="+62 812 xxxx xxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-colors placeholder:text-slate-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-colors placeholder:text-slate-400 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Dynamic Password Strength */}
                <div className="flex items-center gap-2 mt-3">
                  {[1, 2, 3, 4].map((index) => (
                    <div
                      key={index}
                      className={`flex-1 h-1.5 rounded-full transition-colors duration-300 ${strengthInfo.bars >= index ? strengthInfo.color : 'bg-slate-200'
                        }`}
                    ></div>
                  ))}
                  <span className={`text-xs font-bold ml-2 w-16 text-right ${strengthInfo.textColor}`}>
                    {strengthInfo.text}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed bg-slate-50 p-2 rounded-md border border-slate-100">
                  <strong className="text-slate-700">Guide:</strong> Password must be at least 8 characters long, contain numbers, at least 1 uppercase letter, and at least 1 special character.
                </p>
                {error && <p className="text-red-500 text-xs mt-2 font-medium">{error}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">Confirm password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-colors placeholder:text-slate-400 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input type="checkbox" required className="mt-1 w-4 h-4 rounded border-slate-300 text-cyan-500 focus:ring-cyan-500" />
                <span className="text-sm text-slate-600">
                  I agree to Vestlytics <button type="button" onClick={() => { setModalType('tos'); setIsModalOpen(true); }} className="text-cyan-500 hover:text-cyan-600 font-semibold focus:outline-none">Terms of Service</button> and <button type="button" onClick={() => { setModalType('privacy'); setIsModalOpen(true); }} className="text-cyan-500 hover:text-cyan-600 font-semibold focus:outline-none">Privacy Policy</button>
                </span>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-[#0ea5e9] hover:bg-sky-500 text-white font-medium py-2.5 rounded-lg transition-colors mt-2 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Creating account...
                  </>
                ) : (
                  'Create account & continue'
                )}
              </button>


            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full flex justify-between items-center px-8 py-6 text-xs text-slate-500 border-t border-slate-100">
          <span>Copyright 2026 © CC26-PSU313</span>
          <span className="font-bold tracking-widest text-slate-800">VEST<span className="font-light">LYTICS</span></span>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={modalType === 'tos' ? "Terms of Service" : "Privacy Policy"}
      >
        {modalType === 'tos' ? <TermsOfServiceContent /> : <PrivacyPolicyContent />}
      </Modal>
    </div>
  );
};

export default RegisterPage;
