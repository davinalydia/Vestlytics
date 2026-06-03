import { Mail, ArrowRight } from 'lucide-react';
import './helpCenter.css';

const HelpCenterPage = () => {
  const faqs = [
    "How does the AI Consultant at Vestlytics work?",
    "What is Strategy Lab and how does the simulation work?",
    "How do I link my investment account?",
    "What do the BUY, HOLD, and SELL signals on the transaction page mean?",
    "How is my portfolio data used by AI?",
    "Is my financial data safe with Vestlytics?"
  ];

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
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <span>{faq}</span>
                {/* Arrow icon would go here if it was an accordion, the mockup just shows the list */}
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default HelpCenterPage;
