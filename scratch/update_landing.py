import re

with open(r'c:\Users\acer\Vestlytics\apps\web\src\pages\LandingPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
content = content.replace(
'''import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, Lock, BarChart3, Eye, 
  Brain, PieChart, ShieldAlert, Wallet,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { Logo } from '../components/Logo';''',
'''import React, { useState } from 'react';
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
};'''
)

# 2. FAQItem
content = content.replace(
'''      {isOpen && (
        <div className="px-4 pb-5 pt-1 text-slate-600 text-sm leading-relaxed">
          {answer}
        </div>
      )}''',
'''      <AnimatePresence>
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
      </AnimatePresence>'''
)

# 3. Navbar Links
content = content.replace(
'''            <div className="hidden md:flex items-center gap-8 text-slate-300 font-medium">
              <a href="#problem" className="hover:text-white transition-colors">Problem</a>
              <a href="#solutions" className="hover:text-white transition-colors">Solutions</a>
              <a href="#benefits" className="hover:text-white transition-colors">Benefits</a>
              <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            </div>
            <div>
              <Link to="/register" className="bg-[#6366f1] hover:bg-indigo-500 text-white px-6 py-2.5 rounded-full font-medium transition-colors text-sm shadow-lg shadow-indigo-500/20">
                Get The Access
              </Link>
            </div>''',
'''            <div className="hidden md:flex items-center gap-8 text-slate-300 font-medium">
              <a href="#problem" className="nav-link-animated">Problem</a>
              <a href="#solutions" className="nav-link-animated">Solutions</a>
              <a href="#benefits" className="nav-link-animated">Benefits</a>
              <a href="#faq" className="nav-link-animated">FAQ</a>
            </div>
            <div>
              <Link to="/register" className="bg-[#6366f1] text-white px-6 py-2.5 rounded-full font-medium text-sm shadow-lg shadow-indigo-500/20 btn-nav-premium">
                Get The Access
              </Link>
            </div>'''
)

# 4. Hero Content
content = content.replace(
'''          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 pb-20 relative">
            <div className="flex-1 space-y-8 text-center lg:text-left z-10">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Predict. Manage. Grow. The only AI-powered platform you need to master your stocks and cashflow.
              </h1>
              <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto lg:mx-0">
                Bridge the gap between market trends and your wallet. Get instant AI predictions and automated financial tracking in one seamless dashboard. Total control, no hidden risks.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/register" className="bg-[#6366f1] hover:bg-indigo-500 text-white px-10 py-3.5 rounded-full font-medium transition-colors text-center text-lg shadow-lg shadow-indigo-500/25">
                  Unlock AI Insights
                </Link>
                <Link to="/login" className="border border-slate-600 hover:border-slate-400 text-white px-10 py-3.5 rounded-full font-medium transition-colors text-center text-lg bg-transparent hover:bg-slate-800/50">
                  See How It Works
                </Link>
              </div>
            </div>
            <div className="flex-1 w-full max-w-lg lg:max-w-none relative z-10">
              <img src={heroIllustration} alt="Dashboard Illustration" className="w-full h-auto object-contain drop-shadow-2xl" />
            </div>
          </div>''',
'''          <motion.div 
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
          </motion.div>'''
)

# 5. Sections
content = content.replace(
'''      <section id="problem" className="py-20 lg:py-32">
        <div className="max-w-[1600px] mx-auto px-8 lg:px-16 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <div className="flex-1 w-full max-w-lg lg:max-w-none order-2 lg:order-1">
             <img src={struggleIllustration} alt="Market Volatility" className="w-full h-auto drop-shadow-xl" />
          </div>
          <div className="flex-1 order-1 lg:order-2 space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800">The retail investor's struggle</h2>''',
'''      <motion.section 
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
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800">The retail investor's struggle</h2>'''
)

content = content.replace(
'''      <section id="solutions" className="py-20 lg:py-32 bg-white">
        <div className="max-w-[1600px] mx-auto px-8 lg:px-16 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <div className="flex-1 space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800">The Vestlytics solution</h2>''',
'''      <motion.section 
        id="solutions" 
        className="py-20 lg:py-32 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <div className="max-w-[1600px] mx-auto px-8 lg:px-16 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <motion.div variants={fadeUpVariant} className="flex-1 space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800">The Vestlytics solution</h2>'''
)

content = content.replace(
'''          </div>
          <div className="flex-1 w-full max-w-lg lg:max-w-none">
            <img src={solutionIllustration} alt="Platform Dashboard" className="w-full h-auto drop-shadow-xl" />
          </div>
        </div>
      </section>''',
'''          </motion.div>
          <motion.div variants={fadeUpVariant} className="flex-1 w-full max-w-lg lg:max-w-none">
            <img src={solutionIllustration} alt="Platform Dashboard" className="w-full h-auto drop-shadow-xl" />
          </motion.div>
        </div>
      </motion.section>'''
)
content = content.replace(
'''          </div>
        </div>
      </section>

      {/* Solution Section */}''',
'''          </motion.div>
        </div>
      </motion.section>

      {/* Solution Section */}'''
)

content = content.replace(
'''      <section id="benefits" className="py-20 px-6 lg:px-16">
        <div className="max-w-[1500px] mx-auto bg-[#1e2330] rounded-[2rem] p-10 lg:p-20 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-[#1e2330] to-[#1e2330] pointer-events-none"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for the Modern Investor</h2>
            <p className="text-slate-400 max-w-2xl mx-auto mb-16 leading-relaxed">
              Powerful AI analytics with a user-centric design, providing seamless market insights and automated financial management that scales alongside your personal goals.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-8 text-slate-800 text-center flex flex-col items-center shadow-xl hover:-translate-y-1 transition-transform duration-300">''',
'''      <motion.section 
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
              <motion.div variants={fadeUpVariant} className="bg-white rounded-2xl p-8 text-slate-800 text-center flex flex-col items-center shadow-xl hover:-translate-y-1 transition-transform duration-300">'''
)
content = content.replace(
'''              </div>
              
              <div className="bg-white rounded-2xl p-8 text-slate-800 text-center flex flex-col items-center shadow-xl hover:-translate-y-1 transition-transform duration-300">''',
'''              </motion.div>
              
              <motion.div variants={fadeUpVariant} className="bg-white rounded-2xl p-8 text-slate-800 text-center flex flex-col items-center shadow-xl hover:-translate-y-1 transition-transform duration-300">'''
)
content = content.replace(
'''              </div>

              <div className="bg-white rounded-2xl p-8 text-slate-800 text-center flex flex-col items-center shadow-xl hover:-translate-y-1 transition-transform duration-300">''',
'''              </motion.div>

              <motion.div variants={fadeUpVariant} className="bg-white rounded-2xl p-8 text-slate-800 text-center flex flex-col items-center shadow-xl hover:-translate-y-1 transition-transform duration-300">'''
)
content = content.replace(
'''              </div>
            </div>
          </div>
        </div>
      </section>''',
'''              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>'''
)

content = content.replace(
'''      <section id="faq" className="py-20 lg:py-32 bg-slate-50/50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-500 text-lg">Everything you need to know about Vestlytics and how it works.</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">''',
'''      <motion.section 
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
          
          <motion.div variants={fadeUpVariant} className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">'''
)

content = content.replace(
'''          </div>
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
      </section>''',
'''          </motion.div>
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
              We turn complex market data into instant, actionable insights—so you can stop guessing and start growing.
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
      </motion.section>'''
)

with open(r'c:\Users\acer\Vestlytics\apps\web\src\pages\LandingPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Success')
