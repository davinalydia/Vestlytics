import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Logo } from '../components/Logo';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans animate-fade-in">
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
      <div className="flex-1 flex flex-col relative w-full md:w-1/2">
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
                  <Link to="/forgot-password" className="text-sm font-semibold text-cyan-500 hover:text-cyan-600 transition-colors">Forgot password?</Link>
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

              <button type="submit" className="w-full bg-[#0ea5e9] hover:bg-sky-500 text-white font-medium py-2.5 rounded-lg transition-colors mt-2">
                Sign In
              </button>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-xs">or sign in with</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <button type="button" className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-2.5 rounded-lg transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.71 17.57V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4" />
                  <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.57C14.72 18.23 13.47 18.63 12 18.63C9.15 18.63 6.74 16.71 5.88 14.13H2.21V16.98C4.01 20.55 7.69 23 12 23Z" fill="#34A853" />
                  <path d="M5.88 14.13C5.66 13.47 5.54 12.76 5.54 12C5.54 11.24 5.66 10.53 5.88 9.87V7.02H2.21C1.47 8.5 1.05 10.19 1.05 12C1.05 13.81 1.47 15.5 2.21 16.98L5.88 14.13Z" fill="#FBBC05" />
                  <path d="M12 5.38C13.62 5.38 15.06 5.93 16.2 7.02L19.35 3.87C17.45 2.09 14.97 1 12 1C7.69 1 4.01 3.45 2.21 7.02L5.88 9.87C6.74 7.29 9.15 5.38 12 5.38Z" fill="#EA4335" />
                </svg>
                Sign in with Google
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
