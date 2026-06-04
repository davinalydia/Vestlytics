import re

with open(r'c:\Users\acer\Vestlytics\apps\web\src\pages\RegisterPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
content = content.replace(
'''import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Logo } from '../components/Logo';''',
'''import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Modal } from '../components/Modal';

const TermsOfServiceContent = () => (
  <>
    <h3>General Nature of the Platform</h3>
    <p>Welcome to Vestlytics. Vestlytics is an AI-powered Investment Portfolio Analyzer and financial health tracker designed specifically as an educational Decision Support System. By using our service, you agree that Vestlytics is built to bridge the gap between market trends and personal financial awareness to help you build a healthy financial foundation before investing.</p>
    
    <h3>No Financial Advice or Broker Integration</h3>
    <p>Vestlytics is not a financial advisor. The platform utilizes Deep Learning models (LSTM/GRU) to analyze historical data and predict stock trends. Vestlytics does not support direct integration with stock broker systems, and we do not execute live transactions on your behalf. You are solely responsible for any investment decisions you make.</p>
    
    <h3>Simulations and Predictive Analytics</h3>
    <p>Features such as the Strategy Lab provide "What If" simulations based on parameters you input, including Expected Annual Return, Risk Level, and Monthly DCA (Dollar Cost Averaging) contributions. Projections shown for Bull Market, Base Case, and Bear Market scenarios are estimates intended for educational planning and do not guarantee future market performance.</p>
  </>
);

const PrivacyPolicyContent = () => (
  <>
    <h3>Information We Collect</h3>
    <p>To provide you with highly personalized AI insights, Vestlytics collects information during the 3-Step Onboarding process and ongoing application use. The data we collect includes: Basic Information (First name, last name, email address, and phone number), Financial Profile (Monthly income, monthly expenses, total debt, and the amount of your saved emergency fund), Portfolio Data (Your current asset allocations across market instruments).</p>

    <h3>How We Use Your Data</h3>
    <p>Your financial data is never used to judge you, but rather to evaluate your "Financial Awareness". We process your data through our Integrated Cashflow Engine to calculate your Financial Health Score, Net Savings Rate, and your specific Risk Match. This allows our AI Consultant to generate context-aware advice tailored exclusively to your wallet's health and risk capacity.</p>
    <p>Vestlytics applies strict risk management strategies, including the use of local data storage practices to ensure environment consistency and secure data handling.</p>

    <h3>Data Sharing and Third Parties</h3>
    <p>Vestlytics operates independently as an educational decision-support tool. Because direct execution of market trades falls explicitly out of our project scope, we do not link your account to, nor do we share your personal financial data with, third-party live brokers or trading platforms.</p>
  </>
);'''
)

# 2. States
content = content.replace(
'''  const [error, setError] = useState('');
  const navigate = useNavigate();''',
'''  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('tos');
  const navigate = useNavigate();'''
)

# 3. Checkbox Links
content = content.replace(
'''              <div className="flex items-start gap-2 pt-1">
                <input type="checkbox" required className="mt-1 w-4 h-4 rounded border-slate-300 text-cyan-500 focus:ring-cyan-500" />
                <span className="text-sm text-slate-600">
                  I agree to Vestlytics <Link to="#" className="text-cyan-500 hover:text-cyan-600">Terms of Service</Link> and <Link to="#" className="text-cyan-500 hover:text-cyan-600">Privacy Policy</Link>
                </span>
              </div>''',
'''              <div className="flex items-start gap-2 pt-1">
                <input type="checkbox" required className="mt-1 w-4 h-4 rounded border-slate-300 text-cyan-500 focus:ring-cyan-500" />
                <span className="text-sm text-slate-600">
                  I agree to Vestlytics <button type="button" onClick={() => { setModalType('tos'); setIsModalOpen(true); }} className="text-cyan-500 hover:text-cyan-600 font-semibold focus:outline-none">Terms of Service</button> and <button type="button" onClick={() => { setModalType('privacy'); setIsModalOpen(true); }} className="text-cyan-500 hover:text-cyan-600 font-semibold focus:outline-none">Privacy Policy</button>
                </span>
              </div>'''
)

# 4. Modal Component
content = content.replace(
'''        </div>
      </div>
    </div>
  );
};''',
'''        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={modalType === 'tos' ? "Terms of Service" : "Privacy Policy"}
      >
        {modalType === 'tos' ? <TermsOfServiceContent /> : <PrivacyPolicyContent />}
      </Modal>
    </div>
  );
};'''
)

with open(r'c:\Users\acer\Vestlytics\apps\web\src\pages\RegisterPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Success')
