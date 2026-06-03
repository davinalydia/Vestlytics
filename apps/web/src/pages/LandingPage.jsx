import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Lock, BarChart3, Eye, 
  Brain, PieChart, ShieldAlert, Wallet,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { Logo } from '../components/Logo';

const fadeUpVariant = {
  hidden: { opacity: 0, filter: 'blur(5px)', y: 30 },
  visible: { 
    opacity: 1, 
    filter: 'blur(0px)', 
    y: 0,
    transition: { ease: "easeOut", duration: 0.8 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

// Import the illustrations directly to guarantee they load in Vite
import heroIllustration from '../assets/hero_illustration.png';
import struggleIllustration from '../assets/struggle_illustration.png';
import solutionIllustration from '../assets/solution_illustration.png';
import ctaIllustration from '../assets/cta_illustration.png';

const faqData = [
  {
    question: "How does the AI Consultant at Vestlytics work?",
    answer: "The AI Consultant functions as an automated \"Investment Insight Generator\". It continuously monitors market conditions and your personal financial metrics, taking complex data from Vestlytics' Deep Learning models (LSTM/GRU) and translating it into easy-to-understand, narrative insights. Based on rule-based logic, it will automatically issue a Risk signal to warn you during periods of high market volatility, or a Buy signal when it detects positive asset momentum and rising trading volume."
  },
  {
    question: "What is Strategy Lab and how does the simulation work?",
    answer: "The Strategy Lab is Vestlytics' investment simulation feature, often referred to as the \"What If\" page. The simulation works by running a logical comparison between your current savings capacity and your target risk parameters. You input your initial investment, expected annual return, risk level, and monthly DCA (Dollar Cost Averaging) contributions. The AI then processes this data to project your future portfolio value, giving you a direct comparison across three different market scenarios: Bull Market (optimal), Base Case (normal), and Bear Market (downturn)."
  },
  {
    question: "How do I link my investment account?",
    answer: "Currently, you cannot directly link your live broker or investment accounts to the platform. Vestlytics is strictly designed to be an educational Decision Support System. Direct integration with stock broker systems and live transaction executions are explicitly out of the project's scope."
  },
  {
    question: "What do the BUY, HOLD, and SELL signals on the transaction page mean?",
    answer: "It is important to note that these signals are data-driven momentum indicators, not absolute financial advice or commands. A BUY signal means the AI has detected positive momentum and rising trading volume for a specific asset, suggesting it may be a good time for gradual accumulation. A HOLD signal is triggered when the AI detects high volatility or negative trends, advising you to protect your capital and wait for the trend to improve. Ultimately, these signals are designed to give you objective insights so you can avoid making emotional (FOMO) investment decisions."
  },
  {
    question: "How is my portfolio data used by AI?",
    answer: "Your inputted data-including your current assets, monthly income, expenses, and emergency fund-is processed by the platform's Integrated Cashflow Engine to establish your \"Financial Awareness\". The AI uses this data to calculate your Financial Health Score and your Risk Match. By doing this, the AI ensures that any investment suggestions or insights it generates are highly personalized and safely tailored to your actual financial readiness."
  },
  {
    question: "Is my financial data safe with Vestlytics?",
    answer: "Yes, your financial data is safe. Vestlytics stores your profile and portfolio metrics securely using Supabase authentication and database encryption. We do not link to real bank accounts or execute actual stock transactions."
  }
];

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 last:border-0">
      <button 
        className="w-full text-left py-5 px-4 flex justify-between items-center focus:outline-none hover:bg-slate-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium text-slate-800 pr-8">{question}</span>
        {isOpen ? <ChevronUp size={20} className="text-slate-500 shrink-0" /> : <ChevronDown size={20} className="text-slate-500 shrink-0" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-5 pt-1 text-slate-600 text-sm leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 animate-fade-in">
      {/* Hero Section */}
      <section className="bg-[#0b1120] text-white overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-8 lg:px-16 py-8">
          {/* Navbar */}
          <nav className="flex justify-between items-center mb-16 lg:mb-24 relative z-20">
            <div className="flex items-center gap-3">
              <Logo />
              <span className="text-2xl font-semibold tracking-wider text-white">VESTLYTICS</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-slate-300 font-medium">
              <a href="#problem" className="nav-link-animated">Problem</a>
              <a href="#solutions" className="nav-link-animated">Solutions</a>
              <a href="#benefits" className="nav-link-animated">Benefits</a>
              <a href="#faq" className="nav-link-animated">FAQ</a>
            </div>
            <div>
              <Link to="/register" className="bg-[#6366f1] text-white px-6 py-2.5 rounded-full font-medium text-sm shadow-lg shadow-indigo-500/20 btn-nav-premium">
                Get Started
              </Link>
            </div>
          </nav>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="flex flex-col lg:flex-row items-center justify-between gap-12 pb-20 relative"
          >
            <motion.div variants={fadeUpVariant} className="flex-1 space-y-8 text-center lg:text-left z-10">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Predict. Manage. Grow. The only AI-powered platform you need to master your stocks and cashflow.
              </h1>
              <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto lg:mx-0">
                Bridge the gap between market trends and your wallet. Get instant AI predictions and automated financial tracking in one seamless dashboard. Total control, no hidden risks.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/register" className="bg-[#6366f1] text-white px-10 py-3.5 rounded-full font-medium text-center text-lg shadow-lg shadow-indigo-500/25 btn-primary-premium">
                  Unlock AI Insights
                </Link>
                <Link to="/login" className="border border-slate-600 text-white px-10 py-3.5 rounded-full font-medium text-center text-lg bg-transparent btn-secondary-premium">
                  See How It Works
                </Link>
              </div>
            </motion.div>
            <motion.div variants={fadeUpVariant} className="flex-1 w-full max-w-lg lg:max-w-none relative z-10">
              <img src={heroIllustration} alt="Dashboard Illustration" className="w-full h-auto object-contain drop-shadow-2xl" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Struggle Section */}
      <motion.section 
        id="problem" 
        className="py-20 lg:py-32"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <div className="max-w-[1600px] mx-auto px-8 lg:px-16 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <motion.div variants={fadeUpVariant} className="flex-1 w-full max-w-lg lg:max-w-none order-2 lg:order-1">
             <img src={struggleIllustration} alt="Market Volatility" className="w-full h-auto drop-shadow-xl" />
          </motion.div>
          <motion.div variants={fadeUpVariant} className="flex-1 order-1 lg:order-2 space-y-8">
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
          </motion.div>
        </div>
      </motion.section>

      {/* Solution Section */}
      <motion.section 
        id="solutions" 
        className="py-20 lg:py-32 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <div className="max-w-[1600px] mx-auto px-8 lg:px-16 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <motion.div variants={fadeUpVariant} className="flex-1 space-y-8">
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
          </motion.div>
          <motion.div variants={fadeUpVariant} className="flex-1 w-full max-w-lg lg:max-w-none">
            <img src={solutionIllustration} alt="Platform Dashboard" className="w-full h-auto drop-shadow-xl" />
          </motion.div>
        </div>
      </motion.section>

      {/* Benefits Grid */}
      <motion.section 
        id="benefits" 
        className="py-20 px-6 lg:px-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <div className="max-w-[1500px] mx-auto bg-[#1e2330] rounded-[2rem] p-10 lg:p-20 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-[#1e2330] to-[#1e2330] pointer-events-none"></div>
          
          <div className="relative z-10">
            <motion.h2 variants={fadeUpVariant} className="text-3xl md:text-4xl font-bold mb-4">Built for the Modern Investor</motion.h2>
            <motion.p variants={fadeUpVariant} className="text-slate-400 max-w-2xl mx-auto mb-16 leading-relaxed">
              Powerful AI analytics with a user-centric design, providing seamless market insights and automated financial management that scales alongside your personal goals.
            </motion.p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div variants={fadeUpVariant} className="bg-white rounded-2xl p-8 text-slate-800 text-center flex flex-col items-center shadow-xl hover:-translate-y-1 transition-transform duration-300">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <Zap size={36} strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-lg mb-3">AI Precision</h3>
                <p className="text-sm text-slate-500 leading-relaxed">Get high-accuracy stock trends powered by Deep Learning</p>
              </motion.div>
              
              <motion.div variants={fadeUpVariant} className="bg-white rounded-2xl p-8 text-slate-800 text-center flex flex-col items-center shadow-xl hover:-translate-y-1 transition-transform duration-300">
                <div className="w-20 h-20 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center mb-6">
                  <Lock size={36} strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-lg mb-3">Financial Safety</h3>
                <p className="text-sm text-slate-500 leading-relaxed">Invest only when your emergency fund says "Go".</p>
              </motion.div>

              <motion.div variants={fadeUpVariant} className="bg-white rounded-2xl p-8 text-slate-800 text-center flex flex-col items-center shadow-xl hover:-translate-y-1 transition-transform duration-300">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mb-6">
                  <BarChart3 size={36} strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-lg mb-3">Data-Driven Clarity</h3>
                <p className="text-sm text-slate-500 leading-relaxed">No more guesswork; just pure, actionable financial data.</p>
              </motion.div>

              <motion.div variants={fadeUpVariant} className="bg-white rounded-2xl p-8 text-slate-800 text-center flex flex-col items-center shadow-xl hover:-translate-y-1 transition-transform duration-300">
                <div className="w-20 h-20 bg-cyan-50 text-cyan-500 rounded-2xl flex items-center justify-center mb-6">
                  <Eye size={36} strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-lg mb-3">Total Control</h3>
                <p className="text-sm text-slate-500 leading-relaxed">Manage your portfolio and cashflow in one single view.</p>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section 
        id="faq" 
        className="py-20 lg:py-32 bg-slate-50/50"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div variants={fadeUpVariant} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-500 text-lg">Everything you need to know about Vestlytics and how it works.</p>
          </motion.div>
          
          <motion.div variants={fadeUpVariant} className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            {faqData.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Footer */}
      <motion.section 
        className="px-6 lg:px-16 pb-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <div className="max-w-[1500px] mx-auto bg-[#1e2330] rounded-[2rem] p-10 lg:p-20 flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative">
          <motion.div variants={fadeUpVariant} className="flex-1 space-y-6 text-center md:text-left z-10">
            <h2 className="text-3xl font-bold text-white">Ready to master the market?</h2>
            <p className="text-slate-400 text-lg max-w-md">
              We turn complex market data into instant, actionable insights-so you can stop guessing and start growing.
            </p>
            <div className="pt-2">
              <Link to="/register" className="inline-block bg-[#0ea5e9] text-white px-8 py-3.5 rounded-full font-medium shadow-lg shadow-sky-500/20 btn-primary-premium">
                Get Started
              </Link>
            </div>
          </motion.div>
          <motion.div variants={fadeUpVariant} className="flex-1 flex justify-center md:justify-end w-full max-w-sm z-10">
            <img src={ctaIllustration} alt="Get Started" className="w-full max-w-xs h-auto drop-shadow-2xl" />
          </motion.div>
        </div>
      </motion.section>

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
