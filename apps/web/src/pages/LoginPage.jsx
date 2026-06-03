import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Logo } from '../components/Logo';
import { UserFinancialContext } from '../context/UserFinancialContext';
import { api } from '../services/api';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { updateFinancialData } = useContext(UserFinancialContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await api.login(email, password);
      const profileRes = await api.getProfile();
      if (profileRes && profileRes.success) {
        const p = profileRes.profile_data;
        const isCompleted = p.monthly_income > 0 && p.monthly_expenses > 0;
        updateFinancialData({
          monthlyIncome: p.monthly_income ? p.monthly_income.toLocaleString('id-ID') : '',
          monthlyExpenses: p.monthly_expenses ? p.monthly_expenses.toLocaleString('id-ID') : '',
          emergencyFund: p.emergency_fund ? p.emergency_fund.toLocaleString('id-ID') : '',
          totalDebt: p.total_debt ? p.total_debt.toLocaleString('id-ID') : '',
          monthlyDebtPayment: p.monthly_debt_payment ? p.monthly_debt_payment.toLocaleString('id-ID') : '',
          isProfileCompleted: isCompleted,
        });
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-slate-50 font-sans overflow-hidden animate-fade-in">
      {/* Left Pane - Branding & Steps */}
      <div className="hidden md:flex flex-col w-1/2 bg-[#0d1117] relative overflow-hidden text-white p-12 lg:p-20 justify-center animate-blur-in">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-900/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[50rem] h-[50rem] bg-purple-900/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <Logo />
            <span className="text-3xl font-semibold tracking-wider">VESTLYTICS</span>
          </div>

          <div className="inline-block bg-[#0891b2]/20 border border-[#0891b2]/30 text-cyan-400 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            • Welcome Back
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
            Log in to your <span className="text-cyan-400">dashboard</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-md mb-12">
            Access your AI-powered portfolio insights and continue your smarter investment journey.
          </p>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50">
        {/* Top Navbar */}
        <div className="w-full p-6 flex justify-end items-center gap-6 text-sm font-medium text-slate-600">
          <Link to="/" className="hover:text-slate-900 transition-colors">Features</Link>
          <Link to="/" className="hover:text-slate-900 transition-colors">About</Link>
          <Link to="/register" className="bg-[#0ea5e9] hover:bg-sky-500 text-white px-5 py-2 rounded-full transition-colors">
            Sign Up
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 sm:px-12 py-4">
          <div className="w-full max-w-lg bg-white rounded-2xl p-8 sm:p-10 shadow-[0_0_40px_rgba(0,0,0,0.05)] animate-scale-pop">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome back</h2>
            <p className="text-slate-500 text-sm mb-8">
              Don't have an account? <Link to="/register" className="text-cyan-500 font-semibold hover:text-cyan-600">Create one here</Link>
            </p>

            <form onSubmit={handleLogin} className="space-y-5">
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
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-semibold text-slate-800">Password <span className="text-red-500">*</span></label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
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
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input type="checkbox" className="mt-1 w-4 h-4 rounded border-slate-300 text-cyan-500 focus:ring-cyan-500" />
                <span className="text-sm text-slate-600">
                  Keep me signed in
                </span>
              </div>

              {error && (
                <div className="text-red-500 text-sm font-medium mt-2 bg-red-50 border border-red-100 rounded-lg p-2 text-center animate-fade-in">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-[#0ea5e9] hover:bg-sky-500 text-white font-medium py-2.5 rounded-lg transition-colors mt-2 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
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
    </div>
  );
};

export default LoginPage;
