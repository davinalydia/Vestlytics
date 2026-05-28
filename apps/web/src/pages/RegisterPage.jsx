import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Logo } from '../components/Logo';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const getPasswordStrength = (pass) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/\d/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (getPasswordStrength(password) < 3) {
      setError('Password must meet at least 3 criteria (Strong) to create an account.');
      return;
    }
    setError('');
    navigate('/dashboard');
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
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans animate-fade-in">
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
                <p className="text-slate-500 text-sm">Basic info — name, email, password</p>
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
      <div className="flex-1 flex flex-col relative w-full md:w-1/2">
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
            <h3 className="text-cyan-500 text-xs font-bold tracking-widest uppercase mb-2">Step 1 of 3</h3>
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
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-colors placeholder:text-slate-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1.5">Last name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="Santoso"
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
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-colors placeholder:text-slate-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">Phone number <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  placeholder="+62 812 xxxx xxxx"
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
                  I agree to Vestlytics <Link to="#" className="text-cyan-500 hover:text-cyan-600">Terms of Service</Link> and <Link to="#" className="text-cyan-500 hover:text-cyan-600">Privacy Policy</Link>
                </span>
              </div>

              <button type="submit" className="w-full bg-[#0ea5e9] hover:bg-sky-500 text-white font-medium py-2.5 rounded-lg transition-colors mt-2">
                Create account & continue
              </button>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-xs">or sign up with</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <button type="button" className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-2.5 rounded-lg transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.71 17.57V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4" />
                  <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.57C14.72 18.23 13.47 18.63 12 18.63C9.15 18.63 6.74 16.71 5.88 14.13H2.21V16.98C4.01 20.55 7.69 23 12 23Z" fill="#34A853" />
                  <path d="M5.88 14.13C5.66 13.47 5.54 12.76 5.54 12C5.54 11.24 5.66 10.53 5.88 9.87V7.02H2.21C1.47 8.5 1.05 10.19 1.05 12C1.05 13.81 1.47 15.5 2.21 16.98L5.88 14.13Z" fill="#FBBC05" />
                  <path d="M12 5.38C13.62 5.38 15.06 5.93 16.2 7.02L19.35 3.87C17.45 2.09 14.97 1 12 1C7.69 1 4.01 3.45 2.21 7.02L5.88 9.87C6.74 7.29 9.15 5.38 12 5.38Z" fill="#EA4335" />
                </svg>
                Sign up with Google
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

export default RegisterPage;
