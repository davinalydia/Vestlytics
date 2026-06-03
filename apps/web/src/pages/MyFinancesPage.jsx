import { useState, useEffect, useContext } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Sparkles, MoreHorizontal, Loader2, Check } from 'lucide-react';
import { UserFinancialContext } from '../context/UserFinancialContext';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { api } from '../services/api';
import './myFinances.css';
import './dashboard.css'; // Reuse dashboard generic card styles

const MyFinancesPage = () => {
  const { financialData, updateFinancialData } = useContext(UserFinancialContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [assetsList, setAssetsList] = useState([]);
  const [riskMetrics, setRiskMetrics] = useState(null);
  const [cashflowHistory, setCashflowHistory] = useState([]);

  // Form states
  const [monthlyIncome, setMonthlyIncome] = useState(financialData.monthlyIncome || '');
  const [monthlyExpenses, setMonthlyExpenses] = useState(financialData.monthlyExpenses || '');
  const [emergencyFund, setEmergencyFund] = useState(financialData.emergencyFund || '');
  const [totalDebt, setTotalDebt] = useState(financialData.totalDebt || '');
  const [monthlyDebtPayment, setMonthlyDebtPayment] = useState(financialData.monthlyDebtPayment || '');
  const [netWorth, setNetWorth] = useState(financialData.netWorth || '');

  // Asset categorization inputs
  const [assetStocks, setAssetStocks] = useState(financialData.assets?.stocks || '55.000.000');
  const [assetGold, setAssetGold] = useState(financialData.assets?.gold || '30.000.000');
  const [assetBonds, setAssetBonds] = useState(financialData.assets?.bonds || '29.000.000');
  const [assetCash, setAssetCash] = useState(financialData.assets?.cash || '24.000.000');

  // Sync state if context updates
  useEffect(() => {
    if (financialData) {
      Promise.resolve().then(() => {
        setMonthlyIncome(financialData.monthlyIncome || '');
        setMonthlyExpenses(financialData.monthlyExpenses || '');
        setEmergencyFund(financialData.emergencyFund || '');
        setTotalDebt(financialData.totalDebt || '');
        setMonthlyDebtPayment(financialData.monthlyDebtPayment || '');
        setNetWorth(financialData.netWorth || '');
        if (financialData.assets) {
          setAssetStocks(financialData.assets.stocks || '55.000.000');
          setAssetGold(financialData.assets.gold || '30.000.000');
          setAssetBonds(financialData.assets.bonds || '29.000.000');
          setAssetCash(financialData.assets.cash || '24.000.000');
        }
      });
    }
  }, [financialData]);

  // Load assets and cashflow history on mount
  useEffect(() => {
    const loadFinData = async () => {
      setIsLoadingAssets(true);
      try {
        const [assetsRes, cashflowRes] = await Promise.all([
          api.getAssets(),
          api.getCashflow(),
        ]);
        if (assetsRes && assetsRes.success) {
          setAssetsList(assetsRes.assets);
          setRiskMetrics(assetsRes.risk_metrics);
        }
        if (cashflowRes && cashflowRes.success) {
          setCashflowHistory(cashflowRes.history);
        }
      } catch (err) {
        console.error('Failed to load assets', err);
      } finally {
        setIsLoadingAssets(false);
      }
    };
    loadFinData();
  }, []);

  const handleNumericChange = (value, setter) => {
    const cleanNumber = value.replace(/[^0-9]/g, '');
    if (!cleanNumber) {
      setter('');
      return;
    }
    const formatted = parseInt(cleanNumber, 10).toLocaleString('id-ID');
    setter(formatted);
  };

  const parseCleanNum = (val) => {
    if (!val) return 0;
    return parseInt(String(val).replace(/[^0-9]/g, ''), 10) || 0;
  };

  // Submit profile values to server
  const handleSubmitProfile = async () => {
    setIsSubmitting(true);
    setSuccessMsg('');
    try {
      const payload = {
        monthly_income: parseCleanNum(monthlyIncome),
        monthly_expenses: parseCleanNum(monthlyExpenses),
        emergency_fund: parseCleanNum(emergencyFund),
        total_debt: parseCleanNum(totalDebt),
        monthly_debt_payment: parseCleanNum(monthlyDebtPayment),
      };

      // 1. Persist profile
      await api.saveProfile(payload);

      // 2. Persist categories
      await Promise.all([
        api.saveAsset({ asset_category: 'Stocks', value: parseCleanNum(assetStocks), return_ytd: 12.5, performance: 'Outperform' }),
        api.saveAsset({ asset_category: 'Gold', value: parseCleanNum(assetGold), return_ytd: 8.1, performance: 'Outperform' }),
        api.saveAsset({ asset_category: 'Bonds', value: parseCleanNum(assetBonds), return_ytd: 3.2, performance: 'In Line' }),
        api.saveAsset({ asset_category: 'Cash / Deposit', value: parseCleanNum(assetCash), return_ytd: 0.8, performance: 'Underperform' })
      ]);

      // 3. Update global context
      updateFinancialData({
        monthlyIncome,
        monthlyExpenses,
        emergencyFund,
        totalDebt,
        monthlyDebtPayment,
        netWorth,
        isProfileCompleted: true,
        assets: {
          stocks: assetStocks,
          gold: assetGold,
          bonds: assetBonds,
          cash: assetCash,
        }
      });

      // Reload resources
      const [assetsRes, cashflowRes] = await Promise.all([
        api.getAssets(),
        api.getCashflow(),
      ]);
      if (assetsRes && assetsRes.success) {
        setAssetsList(assetsRes.assets);
      }
      if (cashflowRes && cashflowRes.success) {
        setCashflowHistory(cashflowRes.history);
      }

      setSuccessMsg('Financial profile successfully saved & AI analytics unlocked!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculations for financial health widgets
  const incVal = parseCleanNum(monthlyIncome);
  const expVal = parseCleanNum(monthlyExpenses);
  const emergVal = parseCleanNum(emergencyFund);
  const debtVal = parseCleanNum(totalDebt);

  const netSavings = incVal - expVal;
  const savingsRate = incVal > 0 ? (netSavings / incVal) * 100 : 0;
  const debtRatio = incVal > 0 ? (debtVal / incVal) * 100 : 0;

  // Milestone Progress bars
  const emergencyTarget = expVal * 6;
  const emergencyProgress = emergencyTarget > 0 ? Math.min(100, Math.round((emergVal / emergencyTarget) * 100)) : 0;

  // Net Worth Target and FIRE Progress
  const parsedNetWorth = parseCleanNum(netWorth) || (parseCleanNum(assetStocks) + parseCleanNum(assetGold) + parseCleanNum(assetBonds) + parseCleanNum(assetCash));
  const fireTarget = 360000000;
  const fireProgress = Math.min(100, Math.round((parsedNetWorth / fireTarget) * 100));

  const propertyTarget = 150000000;
  const propertyProgress = Math.min(100, Math.round((parsedNetWorth / propertyTarget) * 100));

  // Pie chart calculation
  const totalAssetsSum = parseCleanNum(assetStocks) + parseCleanNum(assetGold) + parseCleanNum(assetBonds) + parseCleanNum(assetCash);
  const pieData = totalAssetsSum > 0 ? [
    { name: 'Stocks', value: parseFloat(((parseCleanNum(assetStocks) / totalAssetsSum) * 100).toFixed(1)), color: '#a855f7' },
    { name: 'Gold', value: parseFloat(((parseCleanNum(assetGold) / totalAssetsSum) * 100).toFixed(1)), color: '#eab308' },
    { name: 'Bonds', value: parseFloat(((parseCleanNum(assetBonds) / totalAssetsSum) * 100).toFixed(1)), color: '#f97316' },
    { name: 'Money Market', value: parseFloat(((parseCleanNum(assetCash) / totalAssetsSum) * 100).toFixed(1)), color: '#6366f1' },
  ] : [
    { name: 'Stocks', value: 0, color: '#a855f7' },
    { name: 'Gold', value: 0, color: '#eab308' },
    { name: 'Bonds', value: 0, color: '#f97316' },
    { name: 'Money Market', value: 0, color: '#6366f1' },
  ];

  const healthScore = Math.round(savingsRate > 20 ? 72 : 45);

  return (
    <div className="finances-container animate-fade-in">
      
      {/* Tab Switcher */}
      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile & Income
        </button>
        <button 
          className={`tab-btn ${activeTab === 'assets' ? 'active' : ''}`}
          onClick={() => setActiveTab('assets')}
        >
          Assets
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className="profile-grid">
          {/* Left Column */}
          <div className="flex-col-gap">
            
            {/* Financial Profile Form */}
            <div className="dash-card">
              <div className="dash-card-header">
                <h3 className="dash-card-title">Financial Profile</h3>
                <button 
                  className="submit-btn flex items-center gap-1.5 min-w-[90px] justify-center"
                  onClick={handleSubmitProfile}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    'Submit'
                  )}
                </button>
              </div>

              {successMsg && (
                <div className="mb-4 bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
                  <Check size={14} />
                  {successMsg}
                </div>
              )}
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="monthlyIncome">Monthly Income</label>
                  <div className="form-input-wrapper">
                    <span className="form-prefix">Rp</span>
                    <input 
                      id="monthlyIncome" 
                      name="monthlyIncome" 
                      type="text" 
                      className="form-input" 
                      value={monthlyIncome} 
                      onChange={(e) => handleNumericChange(e.target.value, setMonthlyIncome)}
                      placeholder="e.g. 12.000.000"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="monthlyExpenses">Monthly Expenses</label>
                  <div className="form-input-wrapper">
                    <span className="form-prefix">Rp</span>
                    <input 
                      id="monthlyExpenses" 
                      name="monthlyExpenses" 
                      type="text" 
                      className="form-input" 
                      value={monthlyExpenses} 
                      onChange={(e) => handleNumericChange(e.target.value, setMonthlyExpenses)}
                      placeholder="e.g. 8.000.000" 
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="emergencyFund">Emergency Fund</label>
                  <div className="form-input-wrapper">
                    <span className="form-prefix">Rp</span>
                    <input 
                      id="emergencyFund" 
                      name="emergencyFund" 
                      type="text" 
                      className="form-input" 
                      value={emergencyFund} 
                      onChange={(e) => handleNumericChange(e.target.value, setEmergencyFund)}
                      placeholder="e.g. 24.000.000"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="totalDebt">Total Debt</label>
                  <div className="form-input-wrapper">
                    <span className="form-prefix">Rp</span>
                    <input 
                      id="totalDebt" 
                      name="totalDebt" 
                      type="text" 
                      className="form-input" 
                      value={totalDebt} 
                      onChange={(e) => handleNumericChange(e.target.value, setTotalDebt)}
                      placeholder="e.g. 24.000.000"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="monthlyDebtPayment">Monthly Debt Payment</label>
                  <div className="form-input-wrapper">
                    <span className="form-prefix">Rp</span>
                    <input 
                      id="monthlyDebtPayment" 
                      name="monthlyDebtPayment" 
                      type="text" 
                      className="form-input" 
                      value={monthlyDebtPayment} 
                      onChange={(e) => handleNumericChange(e.target.value, setMonthlyDebtPayment)}
                      placeholder="e.g. 2.000.000"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="netWorth">Net Worth (Total Asset)</label>
                  <div className="form-input-wrapper">
                    <span className="form-prefix">Rp</span>
                    <input 
                      id="netWorth" 
                      name="netWorth" 
                      type="text" 
                      className="form-input" 
                      value={netWorth}
                      onChange={(e) => handleNumericChange(e.target.value, setNetWorth)}
                      placeholder="e.g. 138.000.000" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Asset Categorization Form */}
            <div className="dash-card dark">
              <h3 className="dash-card-title text-white mb-6">Asset categorization</h3>
              
              <div className="asset-cat-item">
                <div className="asset-cat-color bg-[#a855f7]"></div>
                <label htmlFor="assetStocks" className="asset-cat-name">Stocks</label>
                <div className="asset-cat-input-wrap">
                  <span className="form-prefix">Rp</span>
                  <input 
                    id="assetStocks" 
                    name="assetStocks" 
                    type="text" 
                    className="asset-cat-input" 
                    value={assetStocks} 
                    onChange={(e) => handleNumericChange(e.target.value, setAssetStocks)}
                  />
                </div>
                <span className="asset-cat-pct">
                  {totalAssetsSum > 0 ? ((parseCleanNum(assetStocks) / totalAssetsSum) * 100).toFixed(1) : 0}%
                </span>
              </div>

              <div className="asset-cat-item">
                <div className="asset-cat-color bg-[#eab308]"></div>
                <label htmlFor="assetGold" className="asset-cat-name">Gold</label>
                <div className="asset-cat-input-wrap">
                  <span className="form-prefix">Rp</span>
                  <input 
                    id="assetGold" 
                    name="assetGold" 
                    type="text" 
                    className="asset-cat-input" 
                    value={assetGold} 
                    onChange={(e) => handleNumericChange(e.target.value, setAssetGold)}
                  />
                </div>
                <span className="asset-cat-pct">
                  {totalAssetsSum > 0 ? ((parseCleanNum(assetGold) / totalAssetsSum) * 100).toFixed(1) : 0}%
                </span>
              </div>

              <div className="asset-cat-item">
                <div className="asset-cat-color bg-[#f97316]"></div>
                <label htmlFor="assetBonds" className="asset-cat-name">Bonds</label>
                <div className="asset-cat-input-wrap">
                  <span className="form-prefix">Rp</span>
                  <input 
                    id="assetBonds" 
                    name="assetBonds" 
                    type="text" 
                    className="asset-cat-input" 
                    value={assetBonds} 
                    onChange={(e) => handleNumericChange(e.target.value, setAssetBonds)}
                  />
                </div>
                <span className="asset-cat-pct">
                  {totalAssetsSum > 0 ? ((parseCleanNum(assetBonds) / totalAssetsSum) * 100).toFixed(1) : 0}%
                </span>
              </div>

              <div className="asset-cat-item">
                <div className="asset-cat-color bg-[#6366f1]"></div>
                <label htmlFor="assetCash" className="asset-cat-name">Cash / Deposit</label>
                <div className="asset-cat-input-wrap">
                  <span className="form-prefix">Rp</span>
                  <input 
                    id="assetCash" 
                    name="assetCash" 
                    type="text" 
                    className="asset-cat-input" 
                    value={assetCash} 
                    onChange={(e) => handleNumericChange(e.target.value, setAssetCash)}
                  />
                </div>
                <span className="asset-cat-pct">
                  {totalAssetsSum > 0 ? ((parseCleanNum(assetCash) / totalAssetsSum) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>

            {/* Monthly cashflow history */}
            <div className="dash-card dark">
              <h3 className="dash-card-title text-white mb-4">Monthly cashflow history</h3>
              {isLoadingAssets ? (
                <SkeletonLoader type="table" rows={3} />
              ) : (
                <table className="dark-table">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Income</th>
                      <th>Expenses</th>
                      <th>Net savings</th>
                      <th>Savings rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cashflowHistory.map((row, idx) => (
                      <tr key={idx}>
                        <td>{row.month_period}</td>
                        <td>Rp {parseFloat(row.income || 0).toLocaleString('id-ID')}</td>
                        <td>Rp {parseFloat(row.expenses || 0).toLocaleString('id-ID')}</td>
                        <td>Rp {parseFloat(row.net_savings || 0).toLocaleString('id-ID')}</td>
                        <td>{parseFloat(row.savings_rate || 0).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          </div>

          {/* Right Column */}
          <div className="flex-col-gap">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Health Tracker Widget */}
              <div className="dash-card dark">
                <h3 className="dash-card-title text-white mb-6">Financial Health Tracker</h3>
                <div className="health-item">
                  <span className="health-label">Income/Month</span>
                  <div className="health-bar-container">
                    <div className="health-bar-fill" style={{ width: '100%', backgroundColor: '#10b981' }}></div>
                  </div>
                  <span className="health-badge bg-green-soft">Good</span>
                </div>
                <div className="health-item">
                  <span className="health-label">Expense/Month</span>
                  <div className="health-bar-container">
                    <div className="health-bar-fill" style={{ width: `${Math.min(100, (expVal / incVal) * 100)}%`, backgroundColor: expVal < (incVal * 0.6) ? '#10b981' : '#f59e0b' }}></div>
                  </div>
                  <span className="health-badge bg-yellow-soft">Stable</span>
                </div>
                <div className="health-item">
                  <span className="health-label">Net Savings Rate</span>
                  <div className="health-bar-container">
                    <div className="health-bar-fill" style={{ width: `${Math.min(100, savingsRate)}%`, backgroundColor: savingsRate < 40 ? '#ef4444' : '#10b981' }}></div>
                  </div>
                  {savingsRate < 40 ? (
                    <span className="health-badge bg-red-soft font-bold">Warning</span>
                  ) : (
                    <span className="health-badge bg-green-soft">Good</span>
                  )}
                </div>
                <div className="health-item">
                  <span className="health-label">Debt Ratio</span>
                  <div className="health-bar-container">
                    <div className="health-bar-fill" style={{ width: `${Math.min(100, debtRatio)}%`, backgroundColor: debtRatio <= 30 ? '#10b981' : '#ef4444' }}></div>
                  </div>
                  <span className="health-badge bg-yellow-soft">Stable</span>
                </div>

                <div className="mt-6 border-t border-slate-800 pt-4">
                  <span className="savings-label-sm">Net savings rate</span>
                  <div className="savings-rate-lg" style={{ fontSize: '1.25rem' }}>{savingsRate.toFixed(1)}%</div>
                  <div className="health-bar-container" style={{ margin: '0', height: '4px', backgroundColor: '#064e3b' }}>
                    <div className="health-bar-fill" style={{ width: `${Math.min(100, savingsRate)}%`, backgroundColor: savingsRate < 40 ? '#ef4444' : '#10b981' }}></div>
                  </div>
                </div>
              </div>

              {/* Health Score Widget */}
              <div className="dash-card dark health-score-card">
                <h3 className="dash-card-title text-white w-full text-left mb-6">Health score</h3>
                <div className="circular-score-wrapper">
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1e293b" strokeWidth="3" />
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray={`${healthScore}, 100`} />
                  </svg>
                  <div className="circular-score-text">
                    <span className="circular-score-value">{healthScore}</span>
                    <span className="circular-score-sub">out of 100</span>
                  </div>
                </div>
                <div className="health-status-text">Good - room to improve</div>
                
                <div className="health-metrics-row">
                  <div className="health-metric-mini">
                    <span className="health-metric-val" style={{color: '#10b981'}}>{(emergVal / (expVal > 0 ? expVal : 1)).toFixed(1)}x</span>
                    <span className="health-metric-label">Emergency fund</span>
                  </div>
                  <div className="health-metric-mini">
                    <span className="health-metric-val" style={{color: '#f59e0b'}}>{Math.round(debtRatio)}%</span>
                    <span className="health-metric-label">Debt ratio</span>
                  </div>
                  <div className="health-metric-mini">
                    <span className="health-metric-val" style={{color: '#10b981'}}>{Math.round(savingsRate)}%</span>
                    <span className="health-metric-label">Savings rate</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Financial Targets (MILITARY-GRADE REACTIVE FORMULAS) */}
              <div className="dash-card dark flex-1">
                <h3 className="dash-card-title text-white mb-6">Financial targets</h3>
                
                <div className="target-item">
                  <div className="target-header">
                    <span className="target-title">Dana darurat 6 bulan</span>
                    <span className={`target-badge ${emergencyProgress < 50 ? 'behind' : ''}`}>
                      {emergencyProgress >= 100 ? 'Achieved' : emergencyProgress >= 50 ? 'On track' : 'Behind'}
                    </span>
                  </div>
                  <div className="target-bar-bg">
                    <div className={`target-bar-fill ${emergencyProgress < 50 ? 'behind' : ''}`} style={{ width: `${emergencyProgress}%` }}></div>
                  </div>
                  <div className="target-footer">
                    <span>Rp {(emergVal / 1000000).toFixed(0)}M / {(emergencyTarget / 1000000).toFixed(0)}M</span>
                    <span>{emergencyProgress}%</span>
                  </div>
                </div>

                <div className="target-item">
                  <div className="target-header">
                    <span className="target-title">Beli properti 2028</span>
                    <span className={`target-badge ${propertyProgress < 50 ? 'behind' : ''}`}>
                      {propertyProgress >= 50 ? 'On track' : 'Behind'}
                    </span>
                  </div>
                  <div className="target-bar-bg">
                    <div className={`target-bar-fill ${propertyProgress < 50 ? 'behind' : ''}`} style={{ width: `${propertyProgress}%` }}></div>
                  </div>
                  <div className="target-footer">
                    <span>Rp {(parsedNetWorth / 1000000).toFixed(0)}M / 150M</span>
                    <span>{propertyProgress}%</span>
                  </div>
                </div>

                <div className="target-item">
                  <div className="target-header">
                    <span className="target-title">Pensiun dini (FIRE)</span>
                    <span className={`target-badge ${fireProgress < 50 ? 'behind' : ''}`}>
                      {fireProgress >= 50 ? 'On track' : 'Behind'}
                    </span>
                  </div>
                  <div className="target-bar-bg">
                    <div className={`target-bar-fill ${fireProgress < 50 ? 'behind' : ''}`} style={{ width: `${fireProgress}%` }}></div>
                  </div>
                  <div className="target-footer">
                    <span>Rp {(parsedNetWorth / 1000000).toFixed(0)}M / 360M</span>
                    <span>{fireProgress}%</span>
                  </div>
                </div>
              </div>

              {/* AI Insight Box Vertical */}
              <div className="dash-card flex-1" style={{ backgroundColor: '#fdf2f8', borderColor: '#fbcfe8', position: 'relative' }}>
                <Sparkles className="absolute top-4 right-4 text-[#a855f7]" size={20} />
                <p className="text-sm text-slate-800 leading-relaxed mt-4">
                  Your emergency fund is currently at {((emergVal / (expVal > 0 ? expVal : 1)).toFixed(1))} months' worth of expenses.
                  The ideal standard target is 6 months, which requires a total of Rp {emergencyTarget.toLocaleString('id-ID')}.
                  {savingsRate < 40 ? ' Try allocating an additional 15% of your income to accelerate this goal.' : ' Excellent savings rate! You are in a secure position to gradually DCA into other assets.'}
                  {debtRatio > 30 ? ' Caution: Your debt ratio is high - prioritize paying off debt first.' : ' Your debt ratio is within safe parameters.'}
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      {activeTab === 'assets' && (
        <div className="assets-grid animate-fade-in">
          
          {/* Top Row: Chart & Metrics */}
          <div className="dash-card">
            <div className="dash-card-header">
              <div>
                <h3 className="dash-card-title">Asset Breakdown</h3>
                <p className="dash-card-subtitle">Overview of assets in your portfolio</p>
              </div>
              <MoreHorizontal className="text-slate-400" size={20} />
            </div>
            
            {isLoadingAssets ? (
              <SkeletonLoader type="pie" />
            ) : (
              <div className="flex flex-col xl:flex-row items-center justify-center gap-8 mt-4">
                <div style={{ width: 180, height: 180, position: 'relative' }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={pieData}
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-4xl font-bold text-slate-800">{pieData.filter(d => d.value > 0).length}</span>
                    <span className="text-sm text-slate-500 font-medium">Assets</span>
                  </div>
                </div>
                
                <div className="flex-1 w-full max-w-[200px] donut-legend">
                  {pieData.map((item, idx) => (
                    <div key={idx} className="donut-legend-item">
                      <div className="donut-legend-color">
                        <div className="color-dot" style={{ backgroundColor: item.color }}></div>
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium text-slate-700">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="dash-card dark flex flex-col justify-center">
            <h3 className="dash-card-title text-white mb-6">Portfolio Risk Metrics</h3>
            {isLoadingAssets ? (
              <SkeletonLoader type="text" rows={4} />
            ) : (
              <>
                <div className="risk-metrics-grid">
                  <div className="risk-metric-box">
                    <span className="risk-metric-title">Overall risk</span>
                    <span className="risk-metric-value text-yellow-500">{riskMetrics?.overall_risk || 'Medium'}</span>
                    <span className="risk-metric-sub">Volatility index: {riskMetrics?.volatility_index || '0.38'}</span>
                  </div>
                  <div className="risk-metric-box">
                    <span className="risk-metric-title">Sharpe ratio</span>
                    <span className="risk-metric-value text-green-500">{riskMetrics?.sharpe_ratio || '1.14'}</span>
                    <span className="risk-metric-sub">Above benchmark</span>
                  </div>
                  <div className="risk-metric-box">
                    <span className="risk-metric-title">Max drawdown</span>
                    <span className="risk-metric-value text-red-500">{riskMetrics?.max_drawdown || '-6.2'}%</span>
                    <span className="risk-metric-sub">Last 12 months</span>
                  </div>
                  <div className="risk-metric-box">
                    <span className="risk-metric-title">Beta</span>
                    <span className="risk-metric-value text-white">{riskMetrics?.beta || '0.82'}</span>
                    <span className="risk-metric-sub">vs IHSG</span>
                  </div>
                </div>
                
                <div className="mt-2">
                  <span className="text-xs text-slate-400">Allocation vs ideal target</span>
                  <div className="allocation-target-bar">
                    <div className="alloc-segment" style={{ width: `${pieData[0].value}%`, backgroundColor: pieData[0].color }}></div>
                    <div className="alloc-segment" style={{ width: `${pieData[1].value}%`, backgroundColor: pieData[1].color }}></div>
                    <div className="alloc-segment" style={{ width: `${pieData[2].value}%`, backgroundColor: pieData[2].color }}></div>
                    <div className="alloc-segment" style={{ width: `${pieData[3].value}%`, backgroundColor: pieData[3].color }}></div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Bottom Table span full width */}
          <div className="dash-card" style={{ gridColumn: '1 / -1' }}>
            <div className="dash-card-header items-center">
              <h3 className="dash-card-title">Asset Detail</h3>
              <div className="bg-[#bae6fd] text-[#0369a1] px-4 py-1.5 rounded-full text-xs font-semibold">
                {assetsList.length} categories
              </div>
            </div>
            
            {isLoadingAssets ? (
              <SkeletonLoader type="table" rows={4} />
            ) : (
              <div className="table-responsive">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Asset</th>
                      <th>Value</th>
                      <th>Return (YTD)</th>
                      <th>Performance</th>
                      <th>Allocation</th>
                      <th>Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assetsList.map((row, idx) => {
                      const colors = {
                        'Stocks': '#a855f7',
                        'Gold': '#eab308',
                        'Bonds': '#f97316',
                        'Cash / Deposit': '#6366f1',
                        'Money Market': '#6366f1'
                      };
                      const val = parseFloat(row.value || 0);
                      const returnYtd = parseFloat(row.return_ytd || 0);
                      const allocPct = totalAssetsSum > 0 ? ((val / totalAssetsSum) * 100).toFixed(1) : '0';

                      return (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-slate-50/50' : ''}>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: colors[row.asset_category] || '#64748b' }}></div>
                              <span className="font-bold">{row.asset_category}</span>
                            </div>
                          </td>
                          <td>Rp {val.toLocaleString('id-ID')}</td>
                          <td className={returnYtd >= 0 ? 'text-success' : 'text-danger'}>
                            {returnYtd >= 0 ? `+${returnYtd}%` : `${returnYtd}%`}
                          </td>
                          <td>
                            <span className={`px-3 py-1 rounded-full text-[0.7rem] font-semibold ${
                              row.performance === 'Outperform' ? 'bg-green-100 text-green-700' :
                              row.performance === 'In Line' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {row.performance}
                            </span>
                          </td>
                          <td>{allocPct}%</td>
                          <td className="text-slate-500 font-medium">
                            {row.last_updated ? new Date(row.last_updated).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '--'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

export default MyFinancesPage;
