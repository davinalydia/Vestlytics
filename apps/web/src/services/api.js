const API_URL = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('vestlytics_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Fallback Mock Data
const MOCK_DATA = {
  profile: {
    monthly_income: 0,
    monthly_expenses: 0,
    emergency_fund: 0,
    total_debt: 0,
    monthly_debt_payment: 0,
    net_worth: 0,
  },
  assets: [
    { asset_category: 'Stocks', value: 55000000, return_ytd: 12.5, performance: 'Outperform', last_updated: '2026-05-10T00:00:00.000Z' },
    { asset_category: 'Gold', value: 30000000, return_ytd: 8.1, performance: 'Outperform', last_updated: '2026-05-10T00:00:00.000Z' },
    { asset_category: 'Bonds', value: 29000000, return_ytd: 3.2, performance: 'In Line', last_updated: '2026-05-10T00:00:00.000Z' },
    { asset_category: 'Cash / Deposit', value: 24000000, return_ytd: 0.8, performance: 'Underperform', last_updated: '2026-05-10T00:00:00.000Z' },
  ],
  cashflow: [
    { month_period: 'May 2026', income: 12500000, expenses: 7800000, net_savings: 4700000, savings_rate: 37.6 },
    { month_period: 'Apr 2026', income: 12500000, expenses: 8400000, net_savings: 4100000, savings_rate: 32.8 },
    { month_period: 'Mar 2026', income: 11000000, expenses: 8200000, net_savings: 2800000, savings_rate: 25.4 },
    { month_period: 'Feb 2026', income: 11000000, expenses: 9100000, net_savings: 1900000, savings_rate: 17.2 },
    { month_period: 'Jan 2026', income: 11000000, expenses: 9800000, net_savings: 1200000, savings_rate: 10.9 },
  ],
  market: {
    ticker: 'BBCA',
    current_price: 10250,
    chart_historical: [
      { date: '2026-05-10', price: 9800 },
      { date: '2026-05-12', price: 9900 },
      { date: '2026-05-14', price: 10100 },
      { date: '2026-05-16', price: 10050 },
      { date: '2026-05-18', price: 10200 },
      { date: '2026-05-20', price: 10150 },
      { date: '2026-05-22', price: 10300 },
      { date: '2026-05-24', price: 10250 },
    ],
    prediction_breakdown: {
      short_term_1d: { price: 10352, change_pct: 0.74 },
      short_term_7d: { price: 10499, change_pct: 2.43 },
      long_term_1m: { price: 10738, change_pct: 4.76 },
      long_term_6m: { price: 9870, change_pct: -3.7 },
    },
    ai_insight: {
      text: 'BBCA is showing short-term bullish momentum based on recent trading volume. Watch for key support levels.',
      tags: ['Bullish ST', 'Hold / Accumulation'],
    }
  },
  availableStocks: [
    { ticker: 'BBCA', price: 10250, change_pct: 1.2 },
    { ticker: 'BBRI', price: 4800, change_pct: -0.5 },
    { ticker: 'TLKM', price: 3450, change_pct: 2.1 },
    { ticker: 'ASII', price: 5125, change_pct: 0.0 },
    { ticker: 'GOTO', price: 62, change_pct: -3.1 }
  ],
  insights: [
    {
      id: 1,
      type: 'PORTFOLIO OVERVIEW',
      title: 'Portfolio value increased 8.42% - solid performance',
      description: 'Current value: Rp 8.426.120, with an equivalent invested value. Portfolio score: 7.8/10, with a "Good" risk match. This month\'s performance is above the average for the Indonesian stock market benchmark.',
      tags: ['Score 7.8/10', '+8.42% MoM'],
      timestamp: 'Today, 08:00',
    },
    {
      id: 2,
      type: 'RISK SIGNAL',
      title: 'High volatility detected in Stocks segment',
      description: 'Stocks (14.2% of portfolio) showing negative 24h and 7d trends. HOLD signal issued. Recommended not to add positions until the trend improves. Consider a partial shift to the Money Market.',
      tags: ['HOLD - Stocks', 'High Volatility'],
      timestamp: 'Today, 08:05',
    },
    {
      id: 3,
      type: 'BUY SIGNAL',
      title: 'Assets 2, 4, and 6 are worth accumulating - BUY signal active',
      description: 'All three assets have shown a consistent increase of +5.4% over the past 7 days. Momentum is positive and trading volume is on the rise. The AI recommends gradual accumulation with an allocation of 14-30% based on your risk profile.',
      tags: ['BUY - Asset 2', 'BUY - Asset 4', 'BUY - Asset 6'],
      timestamp: 'Today, 08:12',
    },
  ]
};

// Main API Client Wrapper
export const api = {
  // Authentication
  async login(email, password, rememberMe) {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });
      if (!res.ok) throw new Error('Authentication failed');
      const data = await res.json();
      localStorage.setItem('vestlytics_token', data.token);
      return data;
    } catch (err) {
      console.warn('Login API failed, logging in locally with mock token:', err.message);
      // Fallback
      localStorage.setItem('vestlytics_token', 'mock-jwt-token-value');
      return { success: true, message: 'Logged in locally', user: { email } };
    }
  },
  async register(email, password) {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('Registration failed');
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn('Register API failed, registering locally:', err.message);
      return { success: true, message: 'Registered locally' };
    }
  },

  async getMe() {
    try {
      const res = await fetch(`${API_URL}/auth/me`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to load profile');
      return await res.json();
    } catch (err) {
      console.warn('getMe API failed, using local storage fallback:', err.message);
      const localProfile = localStorage.getItem('vestlytics_user_me');
      if (localProfile) {
        return { success: true, user: JSON.parse(localProfile) };
      }
      return {
        success: true,
        user: {
          id: 'mock-user-id',
          email: 'crazykiller@email.com',
          full_name: 'Crazy Killer',
          username: 'crazykiller',
          phone_number: '+62 812 3456 7890',
          avatar_url: ''
        }
      };
    }
  },

  async updateProfile(payload) {
    try {
      const res = await fetch(`${API_URL}/auth/update-profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update profile');
      }
      const data = await res.json();
      localStorage.setItem('vestlytics_user_me', JSON.stringify(data.user));
      return data;
    } catch (err) {
      console.warn('updateProfile API failed, using simulated success:', err.message);
      const localProfile = localStorage.getItem('vestlytics_user_me');
      const currentUser = localProfile ? JSON.parse(localProfile) : {
        id: 'mock-user-id',
        email: 'crazykiller@email.com',
        full_name: 'Crazy Killer',
        username: 'crazykiller',
        phone_number: '+62 812 3456 7890',
        avatar_url: ''
      };
      const updatedUser = {
        ...currentUser,
        full_name: payload.full_name !== undefined ? payload.full_name : currentUser.full_name,
        username: payload.username !== undefined ? payload.username : currentUser.username,
        phone_number: payload.phone_number !== undefined ? payload.phone_number : currentUser.phone_number,
        avatar_url: payload.avatar_url !== undefined ? payload.avatar_url : currentUser.avatar_url,
      };
      localStorage.setItem('vestlytics_user_me', JSON.stringify(updatedUser));
      return { success: true, message: 'Profile updated locally', user: updatedUser };
    }
  },

  async changePassword(oldPassword, newPassword) {
    try {
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to change password');
      }
      return await res.json();
    } catch (err) {
      console.warn('changePassword API failed, simulating success:', err.message);
      if (oldPassword === 'wrong') {
        throw new Error('Old password is incorrect');
      }
      return { success: true, message: 'Password updated locally' };
    }
  },

  // Profile & Financials
  async getProfile() {
    try {
      const res = await fetch(`${API_URL}/portfolio/profile`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to load profile');
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn('Failed to fetch profile, using mock:', err.message);
      return {
        success: true,
        profile_data: MOCK_DATA.profile,
        metrics: {
          net_savings_rate: '37.8',
          health_score: 72,
          health_status: 'Good - room to improve',
        }
      };
    }
  },

  async saveProfile(payload) {
    try {
      const res = await fetch(`${API_URL}/portfolio/profile`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save profile');
      return await res.json();
    } catch (err) {
      console.warn('Failed to save profile on server, simulated success:', err.message);
      return { success: true, message: 'Profile saved locally' };
    }
  },

  // Assets
  async getAssets() {
    try {
      const res = await fetch(`${API_URL}/portfolio/assets`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to load assets');
      return await res.json();
    } catch (err) {
      console.warn('Failed to fetch assets, using mock:', err.message);
      return {
        success: true,
        assets: MOCK_DATA.assets,
        risk_metrics: {
          overall_risk: 'Medium',
          volatility_index: 0.38,
          sharpe_ratio: 1.14,
          max_drawdown: -6.2,
          beta: 0.82,
        }
      };
    }
  },

  async saveAsset(payload) {
    try {
      const res = await fetch(`${API_URL}/portfolio/assets`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save asset');
      return await res.json();
    } catch (err) {
      console.warn('Failed to save asset, simulating success:', err.message);
      return { success: true, message: 'Asset added locally', asset: [payload] };
    }
  },

  // Cashflow history
  async getCashflow() {
    try {
      const res = await fetch(`${API_URL}/portfolio/cashflow`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to load cashflow history');
      return await res.json();
    } catch (err) {
      console.warn('Failed to fetch cashflow, using mock:', err.message);
      return { success: true, history: MOCK_DATA.cashflow };
    }
  },

  // Market
  async getAvailableStocks() {
    try {
      const res = await fetch(`${API_URL}/market/available-stocks`);
      if (!res.ok) throw new Error('Failed to load stock list');
      return await res.json();
    } catch (err) {
      console.warn('Failed to fetch stock list, using mock:', err.message);
      return { success: true, stocks: MOCK_DATA.availableStocks };
    }
  },

  async getMarketAnalysis(ticker) {
    try {
      const res = await fetch(`${API_URL}/market/analysis/${ticker}`);
      if (!res.ok) throw new Error('Failed to load analysis');
      return await res.json();
    } catch (err) {
      console.warn(`Failed to fetch analysis for ${ticker}, using mock:`, err.message);
      // Simulate prices for other tickers
      const factor = ticker === 'BBCA' ? 1.0 : ticker === 'BBRI' ? 0.45 : ticker === 'TLKM' ? 0.33 : ticker === 'ASII' ? 0.5 : 0.1;
      const basePrice = 10000 * factor;
      const chart_historical = MOCK_DATA.market.chart_historical.map((d, index) => ({
        date: d.date,
        price: Math.round(basePrice * (1 + (index * 0.015) - (Math.random() * 0.02)))
      }));
      const currentPrice = chart_historical[chart_historical.length - 1].price;
      return {
        success: true,
        data: {
          ticker,
          current_price: currentPrice,
          chart_historical,
          prediction_breakdown: {
            short_term_1d: { price: Math.round(currentPrice * 1.01), change_pct: 0.74 },
            short_term_7d: { price: Math.round(currentPrice * 1.02), change_pct: 2.43 },
            long_term_1m: { price: Math.round(currentPrice * 1.04), change_pct: 4.76 },
            long_term_6m: { price: Math.round(currentPrice * 0.96), change_pct: -3.7 },
          },
          ai_insight: {
            text: `${ticker} is showing short-term momentum based on recent trading activity. AI model suggests observing price points close to support.`,
            tags: ['Model Suggestion', 'Hold / Accumulation'],
          }
        }
      };
    }
  },

  // AI Consultant
  async getInsights() {
    try {
      const res = await fetch(`${API_URL}/consultant/insights`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to load insights');
      return await res.json();
    } catch (err) {
      console.warn('Failed to fetch insights, using mock:', err.message);
      return { success: true, data: MOCK_DATA.insights };
    }
  }
};
export default api;
