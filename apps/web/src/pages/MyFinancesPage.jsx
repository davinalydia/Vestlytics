import { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Sparkles, Loader2, Check, Trash2, X } from 'lucide-react';
import { UserFinancialContext } from '../context/UserFinancialContext';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { OnboardingFallback } from '../components/OnboardingFallback';
import { Modal } from '../components/Modal';
import { api } from '../services/api';
import './myFinances.css';
import './dashboard.css'; // Reuse dashboard generic card styles

const MyFinancesPage = () => {
  const { 
    financialData, 
    updateFinancialData,
    addAssetCategory,
    deleteAssetCategory,
    addFinancialTarget,
    deleteFinancialTarget
  } = useContext(UserFinancialContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';
  const setActiveTab = (tab) => setSearchParams({ tab }, { replace: true });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
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

  // Popup states for Asset Creation
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [newAssetCategory, setNewAssetCategory] = useState('');
  const [newAssetValue, setNewAssetValue] = useState('');
  const [newAssetReturn, setNewAssetReturn] = useState('');
  const [newAssetPerf, setNewAssetPerf] = useState('In Line');

  // Popup states for Financial Targets Configuration
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [newTargetName, setNewTargetName] = useState('');
  const [newTargetAmount, setNewTargetAmount] = useState('');
  const [newTargetSaved, setNewTargetSaved] = useState('');
  const [newTargetDeadline, setNewTargetDeadline] = useState('');

  const formatInputVal = (val) => {
    if (val === null || val === undefined || val === '' || val === 0 || val === '0') return '';
    const cleanNumber = String(val).replace(/[^0-9]/g, '');
    if (!cleanNumber || cleanNumber === '0') return '';
    return parseInt(cleanNumber, 10).toLocaleString('id-ID');
  };

  // Sync state if context updates
  useEffect(() => {
    if (financialData) {
      Promise.resolve().then(() => {
        setMonthlyIncome(formatInputVal(financialData.monthlyIncome));
        setMonthlyExpenses(formatInputVal(financialData.monthlyExpenses));
        setEmergencyFund(formatInputVal(financialData.emergencyFund));
        setTotalDebt(formatInputVal(financialData.totalDebt));
        setMonthlyDebtPayment(formatInputVal(financialData.monthlyDebtPayment));
        setNetWorth(formatInputVal(financialData.netWorth));
        
        // Find main categories from dynamic assetsList to sync back to form inputs
        const list = financialData.assetsList || [];
        const stocks = list.find(a => a.asset_category === 'Stocks');
        const gold = list.find(a => a.asset_category === 'Gold');
        const bonds = list.find(a => a.asset_category === 'Bonds');
        const cash = list.find(a => a.asset_category === 'Cash / Deposit' || a.asset_category === 'Money Market');

        if (stocks) setAssetStocks(stocks.value.toLocaleString('id-ID'));
        if (gold) setAssetGold(gold.value.toLocaleString('id-ID'));
        if (bonds) setAssetBonds(bonds.value.toLocaleString('id-ID'));
        if (cash) setAssetCash(cash.value.toLocaleString('id-ID'));
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
          // Store default assets list if not initialized in context
          if (!financialData.assetsList || financialData.assetsList.length === 0) {
            updateFinancialData({ assetsList: assetsRes.assets });
          }
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

  // Submit profile values to server and context
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

      const newAssetsList = [
        { asset_category: 'Stocks', value: parseCleanNum(assetStocks), return_ytd: 12.5, performance: 'Outperform', last_updated: new Date().toISOString() },
        { asset_category: 'Gold', value: parseCleanNum(assetGold), return_ytd: 8.1, performance: 'Outperform', last_updated: new Date().toISOString() },
        { asset_category: 'Bonds', value: parseCleanNum(assetBonds), return_ytd: 3.2, performance: 'In Line', last_updated: new Date().toISOString() },
        { asset_category: 'Cash / Deposit', value: parseCleanNum(assetCash), return_ytd: 0.8, performance: 'Underperform', last_updated: new Date().toISOString() }
      ];
      
      const customAssets = (financialData.assetsList || []).filter(
        a => !['Stocks', 'Gold', 'Bonds', 'Cash / Deposit', 'Money Market'].includes(a.asset_category)
      );
      const finalAssetsList = [...newAssetsList, ...customAssets];

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
        },
        assetsList: finalAssetsList
      });

      // Reload resources
      const [assetsRes, cashflowRes] = await Promise.all([
        api.getAssets(),
        api.getCashflow(),
      ]);
      if (assetsRes && assetsRes.success) {
        setRiskMetrics(assetsRes.risk_metrics);
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

  // Asset category popup save handler
  const handleSaveNewAsset = () => {
    if (!newAssetCategory || !newAssetValue) return;
    const newAsset = {
      asset_category: newAssetCategory,
      value: parseCleanNum(newAssetValue),
      return_ytd: parseFloat(newAssetReturn) || 0,
      performance: newAssetPerf,
    };
    
    api.saveAsset(newAsset).catch(console.error);
    addAssetCategory(newAsset);
    
    setIsAssetModalOpen(false);
    setNewAssetCategory('');
    setNewAssetValue('');
    setNewAssetReturn('');
    setNewAssetPerf('In Line');
  };

  // Target popup save handler
  const handleSaveNewTarget = () => {
    if (!newTargetName || !newTargetAmount) return;
    const newTarget = {
      name: newTargetName,
      targetAmount: parseCleanNum(newTargetAmount),
      saved: parseCleanNum(newTargetSaved),
      deadline: newTargetDeadline,
      isDefault: false
    };

    addFinancialTarget(newTarget);
    setIsTargetModalOpen(false);
    setNewTargetName('');
    setNewTargetAmount('');
    setNewTargetSaved('');
    setNewTargetDeadline('');
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

  // Synced assets sum
  const assetsList = financialData.assetsList || [];
  const totalAssetsSum = assetsList.reduce((sum, item) => sum + parseFloat(item.value || 0), 0);
  
  // Net Worth Target and FIRE Progress
  const parsedNetWorth = parseCleanNum(netWorth) || totalAssetsSum;
  const fireTarget = 360000000;
  const fireProgress = Math.min(100, Math.round((parsedNetWorth / fireTarget) * 100));

  const propertyTarget = 150000000;
  const propertyProgress = Math.min(100, Math.round((parsedNetWorth / propertyTarget) * 100));

  // Pie chart calculation based on full synced assetsList
  const pieData = totalAssetsSum > 0 ? assetsList.map((item, idx) => {
    const colors = ['#a855f7', '#eab308', '#f97316', '#6366f1', '#10b981', '#06b6d4', '#ec4899'];
    return {
      name: item.asset_category,
      value: parseFloat(((parseFloat(item.value || 0) / totalAssetsSum) * 100).toFixed(1)),
      color: colors[idx % colors.length]
    };
  }) : [
    { name: 'Stocks', value: 0, color: '#a855f7' },
    { name: 'Gold', value: 0, color: '#eab308' },
    { name: 'Bonds', value: 0, color: '#f97316' },
    { name: 'Money Market', value: 0, color: '#6366f1' },
  ];

  // Interconnect monthly cashflow history to inputs
  let cashflowListToUse = [];
  if (financialData.isProfileCompleted) {
    cashflowListToUse.push({
      month_period: 'Jun 2026 (Current)',
      income: incVal,
      expenses: expVal,
      net_savings: netSavings,
      savings_rate: savingsRate
    });
    const historicalMonths = ['May 2026', 'Apr 2026', 'Mar 2026', 'Feb 2026', 'Jan 2026'];
    historicalMonths.forEach((m, idx) => {
      const multiplier = 0.95 - (idx * 0.05);
      cashflowListToUse.push({
        month_period: m,
        income: Math.round(incVal * multiplier),
        expenses: Math.round(expVal * multiplier),
        net_savings: Math.round((incVal - expVal) * multiplier),
        savings_rate: savingsRate
      });
    });
  } else {
    cashflowListToUse = cashflowHistory;
  }

  const healthScore = Math.round(
    Math.min(100, Math.max(10, (savingsRate * 1.5) + (50 - debtRatio * 0.5)))
  );

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
                    {cashflowListToUse.map((row, idx) => (
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
              {/* Financial Targets */}
              <div className="dash-card dark flex-1">
                <div className="dash-card-header items-center" style={{ borderBottom: 'none', padding: '0 0 1.5rem 0' }}>
                  <h3 className="dash-card-title text-white">Financial targets</h3>
                  <button 
                    onClick={() => setIsTargetModalOpen(true)}
                    className="submit-btn text-xs font-semibold px-3 py-1.5 rounded-lg"
                    style={{ backgroundColor: '#0ea5e9', color: 'white', border: 'none', cursor: 'pointer' }}
                  >
                    Set Up Targets
                  </button>
                </div>
                
                {(financialData.financialTargets || []).map((target) => {
                  let targetAmount = target.targetAmount;
                  let savedAmount = target.saved;
                  
                  if (target.isDefault) {
                    if (target.id === 'emergency') {
                      targetAmount = expVal * 6;
                      savedAmount = emergVal;
                    } else {
                      savedAmount = parsedNetWorth;
                    }
                  }
                  
                  const progress = targetAmount > 0 ? Math.min(100, Math.round((savedAmount / targetAmount) * 100)) : 0;
                  
                  return (
                    <div key={target.id || target.name} className="target-item relative group">
                      <button
                        onClick={() => deleteFinancialTarget(target.id)}
                        className="absolute top-2 right-2 text-slate-400 hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Delete target"
                      >
                        <Trash2 size={14} />
                      </button>
                      <div className="target-header pr-6">
                        <span className="target-title">{target.name}</span>
                        <span className={`target-badge ${progress < 50 ? 'behind' : ''}`}>
                          {progress >= 100 ? 'Achieved' : progress >= 50 ? 'On track' : 'Behind'}
                        </span>
                      </div>
                      <div className="target-bar-bg">
                        <div className={`target-bar-fill ${progress < 50 ? 'behind' : ''}`} style={{ width: `${progress}%` }}></div>
                      </div>
                      <div className="target-footer">
                        <span>Rp {(savedAmount / 1000000).toFixed(1)}M / {(targetAmount / 1000000).toFixed(1)}M</span>
                        <span>{progress}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* AI Insight Box Vertical */}
              <div className="dash-card flex-1" style={{ backgroundColor: '#fdf2f8', borderColor: '#fbcfe8', position: 'relative' }}>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="dash-card-title" style={{ color: '#a855f7', margin: 0 }}>AI Insight</h3>
                  <Sparkles className="text-[#a855f7]" size={16} />
                </div>
                <p className="text-sm text-slate-800 leading-relaxed">
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
        !financialData.isProfileCompleted ? (
          <div style={{ gridColumn: '1 / -1' }}>
            <OnboardingFallback pageName="Assets Portfolio" onUnlock={() => setActiveTab('profile')} />
          </div>
        ) : (
          <div className="assets-grid animate-fade-in">
            
            {/* Top Row: Chart & Metrics */}
            <div className="dash-card">
              <div className="dash-card-header">
                <div>
                  <h3 className="dash-card-title">Asset Breakdown</h3>
                  <p className="dash-card-subtitle">Overview of assets in your portfolio</p>
                </div>
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
                      {pieData.map((item, idx) => (
                        <div key={idx} className="alloc-segment" style={{ width: `${item.value}%`, backgroundColor: item.color }}></div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Bottom Table span full width */}
            <div className="dash-card" style={{ gridColumn: '1 / -1' }}>
              <div className="dash-card-header items-center" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className="flex items-center gap-3">
                  <h3 className="dash-card-title">Asset Detail</h3>
                  <div className="bg-[#bae6fd] text-[#0369a1] px-4 py-1.5 rounded-full text-xs font-semibold">
                    {assetsList.length} categories
                  </div>
                </div>
                <button 
                  onClick={() => setIsAssetModalOpen(true)}
                  className="submit-btn text-xs font-semibold px-3 py-1.5 rounded-lg"
                  style={{ backgroundColor: '#0ea5e9', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                  Add Asset Category
                </button>
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
                        <th style={{ width: '40px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {assetsList.map((row, idx) => {
                        const colors = [
                          '#a855f7', '#eab308', '#f97316', '#6366f1', '#10b981', '#06b6d4', '#ec4899'
                        ];
                        const val = parseFloat(row.value || 0);
                        const returnYtd = parseFloat(row.return_ytd || 0);
                        const allocPct = totalAssetsSum > 0 ? ((val / totalAssetsSum) * 100).toFixed(1) : '0';

                        return (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-slate-50/50' : ''}>
                            <td>
                              <span className="font-bold">{row.asset_category}</span>
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
                            <td style={{ textAlign: 'right' }}>
                              <button
                                onClick={() => deleteAssetCategory(row.asset_category)}
                                className="text-slate-400 hover:text-red-500 bg-transparent border-none cursor-pointer p-1 flex items-center justify-center transition-colors inline-block"
                                title="Delete Category"
                              >
                                <Trash2 size={14} />
                              </button>
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
        )
      )}

      {/* Add Asset Modal */}
      <Modal
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
        title="Add Asset Category"
        className="large-top-modal"
      >
        <div className="space-y-4 text-left">
          <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 p-3 rounded-lg text-xs">
            <strong className="text-indigo-900 block mb-1">AI Asset Idea:</strong>
            Need ideas for portfolio diversification? You can add:
            <ul className="list-disc pl-4 mt-1 space-y-1">
              <li><strong>Mutual Funds</strong>: (Stable growth, YTD Return ~6-8%, Performance: "In Line")</li>
              <li><strong>Cryptocurrency</strong>: (High risk & volatility, YTD Return ~35-50%, Performance: "Outperform")</li>
              <li><strong>Real Estate</strong>: (Tangible property value, YTD Return ~4-6%, Performance: "In Line")</li>
            </ul>
          </div>

          <div className="flex flex-wrap gap-2 mb-2">
            <span className="text-xs text-slate-500 w-full font-medium">Or choose a template:</span>
            <button
              type="button"
              onClick={() => {
                setNewAssetCategory('Cryptocurrency');
                setNewAssetValue('20.000.000');
                setNewAssetReturn('45.0');
                setNewAssetPerf('Outperform');
              }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-2.5 py-1.5 rounded-lg border-none cursor-pointer font-medium"
            >
              Crypto Template
            </button>
            <button
              type="button"
              onClick={() => {
                setNewAssetCategory('Mutual Funds');
                setNewAssetValue('15.000.000');
                setNewAssetReturn('7.5');
                setNewAssetPerf('In Line');
              }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-2.5 py-1.5 rounded-lg border-none cursor-pointer font-medium"
            >
              Mutual Funds Template
            </button>
            <button
              type="button"
              onClick={() => {
                setNewAssetCategory('Real Estate');
                setNewAssetValue('150.000.000');
                setNewAssetReturn('5.0');
                setNewAssetPerf('In Line');
              }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-2.5 py-1.5 rounded-lg border-none cursor-pointer font-medium"
            >
              Real Estate Template
            </button>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="newAssetCategory">Category Name</label>
            <input
              id="newAssetCategory"
              type="text"
              className="form-input w-full px-4 py-2.5 rounded-lg border border-slate-200"
              placeholder="e.g. Cryptocurrency"
              style={{ color: '#0f172a' }}
              value={newAssetCategory}
              onChange={(e) => setNewAssetCategory(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="newAssetValue">Current Value (Rp)</label>
            <div className="form-input-wrapper">
              <span className="form-prefix">Rp</span>
              <input
                id="newAssetValue"
                type="text"
                className="form-input"
                placeholder="e.g. 10.000.000"
                value={newAssetValue}
                onChange={(e) => handleNumericChange(e.target.value, setNewAssetValue)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="newAssetReturn">YTD Return (%)</label>
            <input
              id="newAssetReturn"
              type="number"
              className="form-input w-full px-4 py-2.5 rounded-lg border border-slate-200"
              placeholder="e.g. 12.5"
              step="0.1"
              style={{ color: '#0f172a' }}
              value={newAssetReturn}
              onChange={(e) => setNewAssetReturn(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="newAssetPerf">Performance Status</label>
            <select
              id="newAssetPerf"
              className="form-input w-full px-4 py-2.5 rounded-lg border border-slate-200"
              style={{ color: '#0f172a', appearance: 'auto' }}
              value={newAssetPerf}
              onChange={(e) => setNewAssetPerf(e.target.value)}
            >
              <option value="Outperform">Outperform</option>
              <option value="In Line">In Line</option>
              <option value="Underperform">Underperform</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => setIsAssetModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold"
              style={{ background: 'none', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveNewAsset}
              className="px-4 py-2 rounded-lg text-white font-semibold"
              style={{ backgroundColor: '#0ea5e9', border: 'none', cursor: 'pointer' }}
            >
              Save Asset
            </button>
          </div>
        </div>
      </Modal>

      {/* Set Up Targets Modal */}
      <Modal
        isOpen={isTargetModalOpen}
        onClose={() => setIsTargetModalOpen(false)}
        title="Configure Financial Targets"
        className="large-top-modal"
      >
        <div className="space-y-4 text-left">
          <div className="bg-cyan-50 border border-cyan-200 text-cyan-800 p-3 rounded-lg text-xs">
            <strong className="text-cyan-900 block mb-1">AI Target Recommendation:</strong>
            Based on your monthly surplus of <strong>Rp {netSavings.toLocaleString('id-ID')}</strong>:
            <ul className="list-disc pl-4 mt-1 space-y-1">
              <li>An Emergency Fund of <strong>Rp {(expVal * 6).toLocaleString('id-ID')}</strong> (6x expenses) is recommended and can be achieved in <strong>{netSavings > 0 ? Math.ceil((expVal * 6 - emergVal) / netSavings) : '∞'} months</strong>.</li>
              <li>A custom Rp 150M property purchase goal will take <strong>{netSavings > 0 ? Math.ceil(150000000 / netSavings) : '∞'} months</strong> of surplus accumulation.</li>
            </ul>
          </div>

          <div className="flex flex-wrap gap-2 mb-2">
            <span className="text-xs text-slate-500 w-full font-medium">Or choose a template:</span>
            <button
              type="button"
              onClick={() => {
                setNewTargetName('Down Payment for House');
                setNewTargetAmount('150.000.000');
                setNewTargetSaved('15.000.000');
                setNewTargetDeadline('2028');
              }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-2.5 py-1.5 rounded-lg border-none cursor-pointer font-medium"
            >
              House DP Template
            </button>
            <button
              type="button"
              onClick={() => {
                setNewTargetName('Hajj / Pilgrimage');
                setNewTargetAmount('50.000.000');
                setNewTargetSaved('5.000.000');
                setNewTargetDeadline('24 months');
              }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-2.5 py-1.5 rounded-lg border-none cursor-pointer font-medium"
            >
              Pilgrimage Template
            </button>
            <button
              type="button"
              onClick={() => {
                setNewTargetName('New Car');
                setNewTargetAmount('250.000.000');
                setNewTargetSaved('20.000.000');
                setNewTargetDeadline('2029');
              }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-2.5 py-1.5 rounded-lg border-none cursor-pointer font-medium"
            >
              New Car Template
            </button>
            <button
              type="button"
              onClick={() => {
                setNewTargetName('Emergency Fund (Extra)');
                setNewTargetAmount((expVal * 12).toLocaleString('id-ID'));
                setNewTargetSaved(emergVal.toLocaleString('id-ID'));
                setNewTargetDeadline('12 months');
              }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-2.5 py-1.5 rounded-lg border-none cursor-pointer font-medium"
            >
              12x Expenses Template
            </button>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="newTargetName">Target Goal Name</label>
            <input
              id="newTargetName"
              type="text"
              className="form-input w-full px-4 py-2.5 rounded-lg border border-slate-200"
              placeholder="e.g. Marriage or Education Fund"
              style={{ color: '#0f172a' }}
              value={newTargetName}
              onChange={(e) => setNewTargetName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="newTargetAmount">Target Amount (Rp)</label>
            <div className="form-input-wrapper">
              <span className="form-prefix">Rp</span>
              <input
                id="newTargetAmount"
                type="text"
                className="form-input"
                placeholder="e.g. 50.000.000"
                value={newTargetAmount}
                onChange={(e) => handleNumericChange(e.target.value, setNewTargetAmount)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="newTargetSaved">Current Savings (Rp)</label>
            <div className="form-input-wrapper">
              <span className="form-prefix">Rp</span>
              <input
                id="newTargetSaved"
                type="text"
                className="form-input"
                placeholder="e.g. 5.000.000"
                value={newTargetSaved}
                onChange={(e) => handleNumericChange(e.target.value, setNewTargetSaved)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="newTargetDeadline">Deadline / Timeframe</label>
            <input
              id="newTargetDeadline"
              type="text"
              className="form-input w-full px-4 py-2.5 rounded-lg border border-slate-200"
              placeholder="e.g. 12 months or 2027"
              style={{ color: '#0f172a' }}
              value={newTargetDeadline}
              onChange={(e) => setNewTargetDeadline(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => setIsTargetModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold"
              style={{ background: 'none', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveNewTarget}
              className="px-4 py-2 rounded-lg text-white font-semibold"
              style={{ backgroundColor: '#0ea5e9', border: 'none', cursor: 'pointer' }}
            >
              Save Goal
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default MyFinancesPage;
