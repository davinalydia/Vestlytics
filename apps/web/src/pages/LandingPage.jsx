import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, Lock, BarChart3, Eye, 
  Brain, PieChart, ShieldAlert, Wallet 
} from 'lucide-react';
import { Logo } from '../components/Logo';

// Import the illustrations directly to guarantee they load in Vite
import heroIllustration from '../assets/hero_illustration.png';
import struggleIllustration from '../assets/struggle_illustration.png';
import solutionIllustration from '../assets/solution_illustration.png';
import ctaIllustration from '../assets/cta_illustration.png';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 animate-fade-in">
      {/* Hero Section */}
      <section className="bg-[#0b1120] text-white overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-8 lg:px-16 py-8">
          {/* Navbar */}
          <nav className="flex justify-between items-center mb-16 lg:mb-24">
            <div className="flex items-center gap-3">
              <Logo />
              <span className="text-2xl font-semibold tracking-wider">VESTLYTICS</span>
            </div>
            {/* Navigation links intentionally removed to match the provided design mockup */}
          </nav>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 pb-20 relative">
            <div className="flex-1 space-y-8 text-center lg:text-left z-10">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Predict. Manage. Grow. The only AI-powered platform you need to master your stocks and cashflow.
              </h1>
              <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto lg:mx-0">
                Bridge the gap between market trends and your wallet. Get instant AI predictions and automated financial tracking in one seamless dashboard. Total control, no hidden risks.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/login" className="bg-[#6366f1] hover:bg-indigo-500 text-white px-10 py-3.5 rounded-full font-medium transition-colors text-center text-lg">
                  Login
                </Link>
                <Link to="/register" className="border border-slate-600 hover:border-slate-400 text-white px-10 py-3.5 rounded-full font-medium transition-colors text-center text-lg bg-transparent">
                  Register
                </Link>
              </div>
            </div>
            <div className="flex-1 w-full max-w-lg lg:max-w-none relative z-10">
              <img src={heroIllustration} alt="Dashboard Illustration" className="w-full h-auto object-contain drop-shadow-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Struggle Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-[1600px] mx-auto px-8 lg:px-16 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <div className="flex-1 w-full max-w-lg lg:max-w-none order-2 lg:order-1">
             <img src={struggleIllustration} alt="Market Volatility" className="w-full h-auto drop-shadow-xl" />
          </div>
          <div className="flex-1 order-1 lg:order-2 space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800">The retail investor's struggle</h2>
            <p className="text-slate-600 text-lg leading-relaxed">
              Millions of retail investors lose their capital due to emotional bias and poor cashflow management. Traditional trading is fragmented and risky. Investors face:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-800 rounded-full text-white"><Brain size={18} /></div>
                <h4 className="font-semibold text-sm text-slate-700 leading-snug pt-1">Emotional decision making</h4>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-800 rounded-full text-white"><PieChart size={18} /></div>
                <h4 className="font-semibold text-sm text-slate-700 leading-snug pt-1">Fragmented financial data</h4>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-800 rounded-full text-white"><ShieldAlert size={18} /></div>
                <h4 className="font-semibold text-sm text-slate-700 leading-snug pt-1">Uncertainty & high risk</h4>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-800 rounded-full text-white"><Wallet size={18} /></div>
                <h4 className="font-semibold text-sm text-slate-700 leading-snug pt-1">Poor emergency fund planning</h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-[1600px] mx-auto px-8 lg:px-16 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <div className="flex-1 space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800">The Vestlytics solution</h2>
            <p className="text-slate-600 text-lg leading-relaxed">
              An all-in-one AI platform that bridges deep learning stock insights with personal finance. We handle the complex data science so you can grow your wealth with confidence.
            </p>
            <div className="space-y-4 pt-4">
              <div className="bg-slate-100/80 p-4 px-5 rounded-xl border border-slate-200/50">
                <p className="text-sm text-slate-600 leading-relaxed">
                  <strong className="text-slate-900 block mb-1">Intelligent Stock Forecasting:</strong> 
                  AI driven price trends using LSTM neural networks.
                </p>
              </div>
              <div className="bg-slate-100/80 p-4 px-5 rounded-xl border border-slate-200/50">
                <p className="text-sm text-slate-600 leading-relaxed">
                  <strong className="text-slate-900 block mb-1">Smart Risk Assessment:</strong> 
                  Real-Time volatility analysis to protect your capital.
                </p>
              </div>
              <div className="bg-slate-100/80 p-4 px-5 rounded-xl border border-slate-200/50">
                <p className="text-sm text-slate-600 leading-relaxed">
                  <strong className="text-slate-900 block mb-1">Integrated Cashflow Engine:</strong> 
                  Unified tracking for income, expenses, and savings.
                </p>
              </div>
              <div className="bg-slate-100/80 p-4 px-5 rounded-xl border border-slate-200/50">
                <p className="text-sm text-slate-600 leading-relaxed">
                  <strong className="text-slate-900 block mb-1">AI Insight Generator:</strong> 
                  Context-aware advice tailored to your wallet's health.
                </p>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full max-w-lg lg:max-w-none">
            <img src={solutionIllustration} alt="Platform Dashboard" className="w-full h-auto drop-shadow-xl" />
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-20 px-6 lg:px-16">
        <div className="max-w-[1500px] mx-auto bg-[#1e2330] rounded-[2rem] p-10 lg:p-20 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-[#1e2330] to-[#1e2330] pointer-events-none"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for the Modern Investor</h2>
            <p className="text-slate-400 max-w-2xl mx-auto mb-16 leading-relaxed">
              Powerful AI analytics with a user-centric design, providing seamless market insights and automated financial management that scales alongside your personal goals.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-8 text-slate-800 text-center flex flex-col items-center shadow-xl hover:-translate-y-1 transition-transform duration-300">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <Zap size={36} strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-lg mb-3">AI Precision</h3>
                <p className="text-sm text-slate-500 leading-relaxed">Get high-accuracy stock trends powered by Deep Learning</p>
              </div>
              
              <div className="bg-white rounded-2xl p-8 text-slate-800 text-center flex flex-col items-center shadow-xl hover:-translate-y-1 transition-transform duration-300">
                <div className="w-20 h-20 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center mb-6">
                  <Lock size={36} strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-lg mb-3">Financial Safety</h3>
                <p className="text-sm text-slate-500 leading-relaxed">Invest only when your emergency fund says "Go".</p>
              </div>

              <div className="bg-white rounded-2xl p-8 text-slate-800 text-center flex flex-col items-center shadow-xl hover:-translate-y-1 transition-transform duration-300">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mb-6">
                  <BarChart3 size={36} strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-lg mb-3">Data-Driven Clarity</h3>
                <p className="text-sm text-slate-500 leading-relaxed">No more guesswork; just pure, actionable financial data.</p>
              </div>

              <div className="bg-white rounded-2xl p-8 text-slate-800 text-center flex flex-col items-center shadow-xl hover:-translate-y-1 transition-transform duration-300">
                <div className="w-20 h-20 bg-cyan-50 text-cyan-500 rounded-2xl flex items-center justify-center mb-6">
                  <Eye size={36} strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-lg mb-3">Total Control</h3>
                <p className="text-sm text-slate-500 leading-relaxed">Manage your portfolio and cashflow in one single view.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="px-6 lg:px-16 pb-20">
        <div className="max-w-[1500px] mx-auto bg-[#1e2330] rounded-[2rem] p-10 lg:p-20 flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative">
          <div className="flex-1 space-y-6 text-center md:text-left z-10">
            <h2 className="text-3xl font-bold text-white">Ready to master the market?</h2>
            <p className="text-slate-400 text-lg max-w-md">
              We turn complex market data into instant, actionable insights—so you can stop guessing and start growing.
            </p>
            <div className="pt-2">
              <Link to="/register" className="inline-block bg-[#0ea5e9] hover:bg-sky-400 text-white px-8 py-3.5 rounded-full font-medium transition-colors shadow-lg shadow-sky-500/20">
                Get Started
              </Link>
            </div>
          </div>
          <div className="flex-1 flex justify-center md:justify-end w-full max-w-sm z-10">
            <img src={ctaIllustration} alt="Get Started" className="w-full max-w-xs h-auto drop-shadow-2xl" />
          </div>
        </div>
      </section>

      {/* Copyright Footer */}
      <footer className="border-t border-slate-200 py-8 px-8 lg:px-16">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>Copyright 2026 © CC26-PSU313</p>
          <div className="flex items-center gap-2 text-slate-800">
            <span className="font-bold tracking-widest text-slate-800">VEST<span className="font-light">LYTICS</span></span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
