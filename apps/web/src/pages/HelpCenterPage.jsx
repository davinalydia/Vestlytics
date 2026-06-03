import { useState } from 'react';
import { Mail, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './helpCenter.css';

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
    <div className="border-b border-slate-100 last:border-0">
      <button 
        className="w-full text-left py-4 px-6 flex justify-between items-center focus:outline-none hover:bg-slate-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span className="font-medium text-slate-700 pr-8 text-sm">{question}</span>
        {isOpen ? <ChevronUp size={18} className="text-slate-400 shrink-0" /> : <ChevronDown size={18} className="text-slate-400 shrink-0" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 pt-3 text-slate-500 text-sm leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const HelpCenterPage = () => {
  return (
    <div className="animate-fade-in relative min-h-full">
      <div className="help-container">
        
        {/* Contact Card */}
        <div className="help-contact-card">
          <div className="help-icon-wrap">
            <Mail size={24} />
          </div>
          <div className="help-contact-info">
            <h3 className="help-contact-title">Email support</h3>
            <p className="help-contact-desc">Send your question to our team. We'll respond within 24 business hours.</p>
            <a href="mailto:support@vestlytics.id" className="help-contact-link">
              support@vestlytics.id <ArrowRight size={14} />
            </a>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="faq-container">
          <div className="faq-header">Frequently Asked Questions (FAQ)</div>
          <div className="faq-list">
            {faqData.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default HelpCenterPage;
