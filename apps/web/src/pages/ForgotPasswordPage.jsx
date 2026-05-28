import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSent(true);
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
            • Password Recovery
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
            Forgot your <span className="text-cyan-400">password?</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-md mb-12">
            No worries, it happens to the best of us. We'll send you recovery instructions to get you back on track.
          </p>
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
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Reset Password</h2>
            
            {isSent ? (
              <div className="mt-6">
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                  Reset link has been sent to your email. Please check your inbox and spam folder.
                </div>
                <Link to="/login" className="block text-center w-full bg-[#0ea5e9] hover:bg-sky-500 text-white font-medium py-2.5 rounded-lg transition-colors">
                  Back to Sign In
                </Link>
              </div>
            ) : (
              <>
                <p className="text-slate-500 text-sm mb-8">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                <form onSubmit={handleSubmit} className="space-y-5">
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

                  <button type="submit" className="w-full bg-[#0ea5e9] hover:bg-sky-500 text-white font-medium py-2.5 rounded-lg transition-colors mt-2">
                    Send reset link
                  </button>

                  <div className="text-center mt-6">
                    <Link to="/login" className="text-sm font-semibold text-cyan-500 hover:text-cyan-600 transition-colors">
                      Back to Sign In
                    </Link>
                  </div>
                </form>
              </>
            )}
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

export default ForgotPasswordPage;
