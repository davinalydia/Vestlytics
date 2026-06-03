import { useState, useEffect, useContext } from 'react';
import { FileText, Sparkles, ShieldAlert, TrendingUp } from 'lucide-react';
import { UserFinancialContext } from '../context/UserFinancialContext';
import { OnboardingFallback } from '../components/OnboardingFallback';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { api } from '../services/api';
import './aiConsultant.css';

const AIConsultantPage = () => {
  const { financialData } = useContext(UserFinancialContext);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(financialData.isProfileCompleted);
  const [logs, setLogs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [assets, setAssets] = useState([]);

  // On mount, load insights and profile data
  useEffect(() => {
    if (!financialData.isProfileCompleted) {
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [insightsRes, profileRes, assetsRes] = await Promise.all([
          api.getInsights(),
          api.getProfile(),
          api.getAssets()
        ]);
        
        if (insightsRes && insightsRes.success) {
          setLogs(insightsRes.data || []);
        }
        if (profileRes && profileRes.success) {
          setProfile(profileRes);
        }
        if (assetsRes && assetsRes.success) {
          setAssets(assetsRes.assets || []);
        }
      } catch (err) {
        console.error('Failed to load consultant insights', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [financialData.isProfileCompleted]);

  // Onboarding gatekeeping
  if (!financialData.isProfileCompleted) {
    return <OnboardingFallback pageName="AI Consultant" />;
  }

  // Handle generation action
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Simulate backend calculation delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      const res = await api.getInsights();
      if (res && res.success) {
        // Shuffle or reverse logs to simulate new insights
        setLogs([...res.data].reverse());
      }
    } catch (err) {
      console.error('Failed to generate insights', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper numbers parsing
  const parseNum = (val) => {
    if (!val) return 0;
    const cleaned = String(val).replace(/[^0-9]/g, '');
    return parseInt(cleaned, 10) || 0;
  };

  // Derive parameters from context
  const incomeVal = parseNum(financialData.monthlyIncome);
  const expenseVal = parseNum(financialData.monthlyExpenses);
  const debtVal = parseNum(financialData.totalDebt);
  const netSavingsVal = incomeVal - expenseVal;
  const savingsRate = incomeVal > 0 ? (netSavingsVal / incomeVal) * 100 : 0;
  const debtRatio = incomeVal > 0 ? (debtVal / incomeVal) * 100 : 0;

  // Calculate dynamic current portfolio value & allocations
  const totalAssetValue = assets.reduce((sum, item) => sum + parseFloat(item.value || 0), 0);
  const assetAllocations = assets.map((item) => ({
    name: item.asset_category,
    pct: totalAssetValue > 0 ? ((item.value / totalAssetValue) * 100).toFixed(1) : '0'
  }));

  const healthScore = profile?.metrics?.health_score || Math.round(savingsRate > 20 ? 72 : 45);

  // Helper to determine log card styling based on event type
  const getLogCardProps = (type) => {
    const cleanType = String(type).toUpperCase().trim();
    if (cleanType === 'RISK_SIGNAL') {
      return {
        className: 'border-l-4 border-l-red-500 bg-red-50/40 hover:bg-red-50/60 border border-slate-200',
        icon: <ShieldAlert size={20} className="text-red-500" />,
        iconBg: 'bg-red-100',
        badgeClass: 'red'
      };
    }
    if (cleanType === 'BUY_SIGNAL') {
      return {
        className: 'border-l-4 border-l-green-500 bg-green-50/40 hover:bg-green-50/60 border border-slate-200',
        icon: <TrendingUp size={20} className="text-green-600" />,
        iconBg: 'bg-green-100',
        badgeClass: 'green'
      };
    }
    // Default / Overview / Health
    return {
      className: 'border-l-4 border-l-indigo-500 bg-slate-50/30 hover:bg-slate-50/50 border border-slate-200',
      icon: <FileText size={20} className="text-indigo-600" />,
      iconBg: 'bg-indigo-50',
      badgeClass: ''
    };
  };

  return (
    <div className="animate-fade-in">
      <div className="ai-page-layout">
        
        {/* Left Panel: Logs timeline */}
        <div className="ai-logs-container">
          
          <div className="ai-page-header">
            <h1 className="ai-page-title">Insight Suggestions</h1>
            <p className="ai-page-subtitle">Historical suggestion timeline logs generated for your profile</p>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <SkeletonLoader type="text" rows={4} />
              <SkeletonLoader type="text" rows={3} />
            </div>
          ) : (
            <div className="space-y-4 relative pl-4 border-l-2 border-slate-200 dark:border-slate-800 ml-4 py-2">
              {logs.map((log) => {
                const props = getLogCardProps(log.type);
                return (
                  <div key={log.id} className={`ai-log-card relative ${props.className}`}>
                    {/* Timeline dot */}
                    <div className="absolute -left-[27px] top-[24px] w-3 h-3 rounded-full bg-white border-2 border-indigo-500 z-20"></div>
                    
                    <div className={`log-icon-wrap ${props.iconBg}`}>
                      {props.icon}
                    </div>
                    <div className="log-content">
                      <div className="log-category">{log.type}</div>
                      <h3 className="log-title">{log.title}</h3>
                      <p className="log-desc">{log.description}</p>
                      <div className="log-badges">
                        {log.tags && log.tags.map((tag, idx) => (
                          <span key={idx} className={`log-badge ${props.badgeClass}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="log-time">{log.timestamp}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Right Panel: Summary Sidebar */}
        <div className="ai-sidebar shadow-xl">
          
          <div className="sidebar-header">
            <div className="sidebar-title">Portfolio Summary</div>
          </div>

          {/* Health Score Circular representation */}
          <div className="sidebar-section">
            <div className="sidebar-title mb-4">Health Score</div>
            <div className="ai-health-score-wrap">
              <div className="ai-circular-score">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#334155" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#38bdf8" strokeWidth="3" strokeDasharray={`${healthScore}, 100`} />
                </svg>
                <div className="ai-score-text">
                  <span className="ai-score-val">{(healthScore / 10).toFixed(1)}</span>
                  <span className="ai-score-sub">out of 10</span>
                </div>
              </div>
              <div className="ai-score-badge">Risk match - Good</div>
            </div>
          </div>

          {/* Financial Health Progress Bars */}
          <div className="sidebar-section">
            <div className="sidebar-title mb-4">Financial Health</div>
            
            <div className="mini-health-row">
              <span className="mini-health-label">Income</span>
              <div className="mini-bar-wrap">
                <div className="mini-bar-fill" style={{ width: '100%', backgroundColor: '#10b981' }}></div>
              </div>
              <span className="mini-status-badge status-good">Good</span>
            </div>
            
            <div className="mini-health-row">
              <span className="mini-health-label">Expense</span>
              <div className="mini-bar-wrap">
                <div className="mini-bar-fill" style={{ width: `${Math.min(100, (expenseVal / incomeVal) * 100)}%`, backgroundColor: expenseVal < (incomeVal * 0.6) ? '#10b981' : '#f59e0b' }}></div>
              </div>
              <span className="mini-status-badge status-stable">Stable</span>
            </div>
            
            <div className="mini-health-row">
              <span className="mini-health-label">Savings rate</span>
              <div className="mini-bar-wrap">
                <div className="mini-bar-fill" style={{ width: `${Math.min(100, savingsRate)}%`, backgroundColor: savingsRate < 40 ? '#ef4444' : '#10b981' }}></div>
              </div>
              {savingsRate < 40 ? (
                <span className="mini-status-badge status-warning">Warning</span>
              ) : (
                <span className="mini-status-badge status-good">Good</span>
              )}
            </div>
            
            <div className="mini-health-row">
              <span className="mini-health-label">Debt ratio</span>
              <div className="mini-bar-wrap">
                <div className="mini-bar-fill" style={{ width: `${Math.min(100, debtRatio)}%`, backgroundColor: debtRatio <= 30 ? '#10b981' : '#ef4444' }}></div>
              </div>
              <span className="mini-status-badge status-stable">Stable</span>
            </div>

            <div className="net-savings-text">
              <div className="net-savings-label">Net savings rate:</div>
              <div className="net-savings-val">{savingsRate.toFixed(1)}%</div>
            </div>
          </div>

          {/* Dynamic Asset Breakdown list */}
          <div className="sidebar-section">
            <div className="sidebar-title mb-4">Asset Breakdown</div>
            
            {assetAllocations.length > 0 ? (
              assetAllocations.map((item, idx) => {
                const colors = ['#0ea5e9', '#ef4444', '#a855f7', '#eab308'];
                return (
                  <div key={idx} className="asset-mini-row">
                    <div className="asset-mini-left">
                      <div className="asset-dot" style={{ backgroundColor: colors[idx % colors.length] }}></div>
                      <span>{item.name}</span>
                    </div>
                    <div className="asset-mini-right">{item.pct}%</div>
                  </div>
                );
              })
            ) : (
              <div className="text-slate-500 text-xs py-2">No assets added.</div>
            )}
          </div>

          {/* Action Trigger */}
          <div className="generate-btn-wrap">
            <button className="generate-btn" onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? 'Analyzing...' : 'Generate Insight'}
              {!isGenerating && <Sparkles className="sparkle-icon" size={18} fill="#fef08a" />}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AIConsultantPage;
