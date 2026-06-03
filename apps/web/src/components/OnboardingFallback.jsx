import { Link } from 'react-router-dom';
import { Lock, Sparkles } from 'lucide-react';

export const OnboardingFallback = ({ pageName }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center animate-fade-in">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-2xl scale-125 animate-pulse"></div>
        <div className="relative z-10 w-20 h-20 bg-slate-900 border border-slate-700/50 rounded-2xl flex items-center justify-center text-cyan-400 shadow-xl">
          <Lock size={36} className="text-cyan-400" />
        </div>
        <div className="absolute -top-1 -right-1 bg-purple-500 text-white p-1 rounded-lg shadow-lg">
          <Sparkles size={14} />
        </div>
      </div>

      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 tracking-tight">
        Unlock {pageName}
      </h2>
      <p className="text-slate-500 max-w-md text-sm md:text-base mb-8 leading-relaxed">
        To activate AI-powered predictive analytics, risk scoring, and personalized investment suggestions, we first need to understand your wallet's capacity.
      </p>

      <Link 
        to="/my-finances" 
        className="relative group overflow-hidden bg-[#0ea5e9] hover:bg-sky-500 text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2"
      >
        Complete your Financial Profile to unlock AI Analytics
      </Link>
    </div>
  );
};
export default OnboardingFallback;
