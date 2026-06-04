import { useState, useMemo } from 'react';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { FlaskConical, BarChart3, ShieldAlert, Sparkles, RotateCcw, Play, Info } from 'lucide-react';
import { Modal } from '../components/Modal';
import './strategyLab.css';

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/** Format number to IDR with dot separator */
const formatIDR = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '--';
  return 'Rp ' + Math.round(num).toLocaleString('id-ID');
};

/** Format number to short IDR label (Million / Billion) */
const formatIDRShort = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '--';
  const abs = Math.abs(num);
  if (abs >= 1_000_000_000) {
    return `Rp ${(num / 1_000_000_000).toFixed(2)} Billion`;
  }
  if (abs >= 1_000_000) {
    return `Rp ${(num / 1_000_000).toFixed(2)} Million`;
  }
  return formatIDR(num);
};

/** Format number for chart Y axis */
const formatChartAxis = (val) => {
  if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)}B`;
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`;
  return val.toString();
};

/** Parse numeric input - strips dots and non-numeric chars */
const parseNumericInput = (val) => {
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9]/g, '');
  return parseInt(cleaned, 10) || 0;
};

/** Format numeric input with dot thousand separators as user types */
const handleNumericChange = (value, setter) => {
  // Remove all non-numeric characters
  const cleanNumber = value.replace(/[^0-9]/g, '');
  if (!cleanNumber) {
    setter('');
    return;
  }
  // Format with dot separators
  const formatted = parseInt(cleanNumber, 10).toLocaleString('id-ID');
  setter(formatted);
};

/** Calculate risk score (1-10) from volatility percentage */
const calcRiskScore = (volatility) => {
  // Map 0-50% volatility to 1-10 scale
  const score = Math.min(10, Math.max(1, (volatility / 50) * 10));
  return Math.round(score * 10) / 10; // 1 decimal
};

/** Get risk label from score */
const getRiskLabel = (score) => {
  if (score <= 3) return 'Low';
  if (score <= 6) return 'Medium';
  if (score <= 8) return 'High';
  return 'Very High';
};

/** Get risk color */
const getRiskColor = (score) => {
  if (score <= 3) return '#10b981';
  if (score <= 6) return '#fbbf24';
  if (score <= 8) return '#f97316';
  return '#ef4444';
};

/** Generate month labels between two dates */
const generateMonthLabels = (startDate, endDate) => {
  const labels = [];
  const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

  while (current <= end) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    labels.push(`${monthNames[current.getMonth()]} ${String(current.getFullYear()).slice(2)}`);
    current.setMonth(current.getMonth() + 1);
  }
  return labels;
};

// ============================================================
// SIMULATION ENGINE
// ============================================================

const runSimulationEngine = (inputs) => {
  const {
    initialInvestment,
    monthlyDCA,
    annualReturn,
    volatility,
    startDate,
    endDate,
    monthlyIncome,
    monthlyExpense,
    emergencyFund,
  } = inputs;

  // Calculate total months
  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());

  if (totalMonths <= 0) return null;

  // Monthly rates
  const baseMonthlyRate = annualReturn / 100 / 12;
  const bullMonthlyRate = (annualReturn + volatility) / 100 / 12;
  const bearMonthlyRate = (annualReturn - volatility) / 100 / 12;

  // Total invested (baseline without returns)
  const totalInvested = initialInvestment + (monthlyDCA * totalMonths);

  // Generate month labels
  const monthLabels = generateMonthLabels(start, end);

  // Calculate growth data for each scenario
  const growthData = [];
  let baseValue = initialInvestment;
  let bullValue = initialInvestment;
  let bearValue = initialInvestment;
  let investedValue = initialInvestment;

  // Determine interval for chart data points (show ~12-24 points max)
  const interval = Math.max(1, Math.floor(totalMonths / 20));

  for (let m = 0; m <= totalMonths; m++) {
    if (m > 0) {
      baseValue = baseValue * (1 + baseMonthlyRate) + monthlyDCA;
      bullValue = bullValue * (1 + bullMonthlyRate) + monthlyDCA;
      bearValue = bearValue * (1 + bearMonthlyRate) + monthlyDCA;
      investedValue += monthlyDCA;
    }

    // Add data point at intervals or at the last month
    if (m % interval === 0 || m === totalMonths) {
      growthData.push({
        month: monthLabels[m] || `M${m}`,
        base: Math.round(baseValue),
        bull: Math.round(bullValue),
        bear: Math.round(bearValue),
        invested: Math.round(investedValue),
      });
    }
  }

  // Final values
  const finalBase = Math.round(baseValue);
  const finalBull = Math.round(bullValue);
  const finalBear = Math.round(bearValue);

  // Returns
  const baseReturn = ((finalBase - totalInvested) / totalInvested) * 100;
  const bullReturn = ((finalBull - totalInvested) / totalInvested) * 100;
  const bearReturn = ((finalBear - totalInvested) / totalInvested) * 100;

  // Risk score
  const riskScore = calcRiskScore(volatility);

  // Financial health analysis
  const netSavings = monthlyIncome - monthlyExpense;
  const savingsRate = monthlyIncome > 0 ? (netSavings / monthlyIncome) * 100 : 0;
  const emergencyMonths = monthlyExpense > 0 ? emergencyFund / monthlyExpense : 0;
  const dcaToIncomeRatio = monthlyIncome > 0 ? (monthlyDCA / monthlyIncome) * 100 : 0;

  // AI Insight generation
  const insights = [];

  insights.push(`Portfolio value of ${formatIDRShort(finalBase)} represents a ${baseReturn >= 0 ? '+' : ''}${baseReturn.toFixed(1)}% total return over ${totalMonths} months.`);
  insights.push(`Risk profile: ${getRiskLabel(riskScore)} (${riskScore}/10).`);

  if (savingsRate < 40) {
    insights.push(`Net savings rate ${savingsRate.toFixed(1)}% is below the 40% target - review monthly expenses to improve readiness.`);
  } else {
    insights.push(`Net savings rate ${savingsRate.toFixed(1)}% exceeds the 40% target - excellent financial discipline.`);
  }

  if (emergencyMonths >= 6) {
    insights.push(`Emergency fund covers ${emergencyMonths.toFixed(1)} months - Investment-ready.`);
  } else if (emergencyMonths >= 3) {
    insights.push(`Emergency fund covers only ${emergencyMonths.toFixed(1)} months - consider building to 6 months before aggressive investing.`);
  } else {
    insights.push(`Emergency fund covers only ${emergencyMonths.toFixed(1)} months - prioritize building emergency reserves before investing.`);
  }

  if (dcaToIncomeRatio > 30) {
    insights.push(`DCA contribution (${formatIDRShort(monthlyDCA)}/month) represents ${dcaToIncomeRatio.toFixed(1)}% of income - consider reducing to maintain financial flexibility.`);
  } else {
    insights.push(`DCA of ${formatIDRShort(monthlyDCA)}/month (${dcaToIncomeRatio.toFixed(1)}% of income) compounds growth steadily without overextending your budget.`);
  }

  // Safety verdict
  let safetyVerdict;
  if (savingsRate >= 40 && emergencyMonths >= 6 && dcaToIncomeRatio <= 30) {
    safetyVerdict = 'safe';
  } else if (savingsRate >= 25 && emergencyMonths >= 3) {
    safetyVerdict = 'moderate';
  } else {
    safetyVerdict = 'risky';
  }

  const verdictMessages = {
    safe: 'Your DCA strategy is safe to execute. Your savings rate, emergency fund, and income allocation are all within healthy parameters.',
    moderate: 'Your DCA strategy is moderately safe. Some financial metrics need improvement - review the warnings above before committing.',
    risky: 'Caution: Your current financial position may not support this DCA strategy safely. Build your emergency fund and reduce expenses first.',
  };

  insights.push(verdictMessages[safetyVerdict]);

  return {
    growthData,
    totalInvested,
    totalMonths,
    scenarios: {
      base: { value: finalBase, return: baseReturn },
      bull: { value: finalBull, return: bullReturn },
      bear: { value: finalBear, return: bearReturn },
    },
    riskScore,
    riskLabel: getRiskLabel(riskScore),
    riskColor: getRiskColor(riskScore),
    healthMetrics: {
      savingsRate,
      emergencyMonths,
      dcaToIncomeRatio,
      netSavings,
    },
    insightText: insights.join(' '),
    safetyVerdict,
  };
};

// ============================================================
// CUSTOM TOOLTIP
// ============================================================

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="strategy-tooltip">
      <div className="strategy-tooltip-label">{label}</div>
      {payload.map((entry, idx) => (
        <div key={idx} className="strategy-tooltip-item">
          <span className="strategy-tooltip-dot" style={{ backgroundColor: entry.color }} />
          <span className="strategy-tooltip-name">{entry.name}:</span>
          <span className="strategy-tooltip-val">{formatIDRShort(entry.value)}</span>
        </div>
      ))}
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const StrategyLabPage = () => {
  // Form state
  const [initialInvestment, setInitialInvestment] = useState('');
  const [monthlyDCA, setMonthlyDCA] = useState('');
  const [annualReturn, setAnnualReturn] = useState('');
  const [volatility, setVolatility] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [monthlyExpense, setMonthlyExpense] = useState('');
  const [emergencyFund, setEmergencyFund] = useState('');
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  // Simulation result
  const [result, setResult] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Check if all required fields are filled
  const isFormValid = useMemo(() => {
    return (
      parseNumericInput(initialInvestment) > 0 &&
      parseNumericInput(monthlyDCA) > 0 &&
      parseFloat(annualReturn) > 0 &&
      parseFloat(volatility) > 0 &&
      startDate !== '' &&
      endDate !== '' &&
      parseNumericInput(monthlyIncome) > 0 &&
      parseNumericInput(monthlyExpense) > 0 &&
      parseNumericInput(emergencyFund) > 0
    );
  }, [initialInvestment, monthlyDCA, annualReturn, volatility, startDate, endDate, monthlyIncome, monthlyExpense, emergencyFund]);

  const handleRunSimulation = () => {
    if (!isFormValid) return;

    setIsAnimating(true);

    // Small delay to show loading state
    setTimeout(() => {
      const simResult = runSimulationEngine({
        initialInvestment: parseNumericInput(initialInvestment),
        monthlyDCA: parseNumericInput(monthlyDCA),
        annualReturn: parseFloat(annualReturn),
        volatility: parseFloat(volatility),
        startDate,
        endDate,
        monthlyIncome: parseNumericInput(monthlyIncome),
        monthlyExpense: parseNumericInput(monthlyExpense),
        emergencyFund: parseNumericInput(emergencyFund),
      });

      setResult(simResult);
      setIsAnimating(false);
    }, 600);
  };

  const handleReset = () => {
    setInitialInvestment('');
    setMonthlyDCA('');
    setAnnualReturn('');
    setVolatility('');
    setStartDate('');
    setEndDate('');
    setMonthlyIncome('');
    setMonthlyExpense('');
    setEmergencyFund('');
    setResult(null);
  };

  return (
    <div className="animate-fade-in strategy-layout">

      {/* Left Sidebar Form */}
      <div className="strategy-sidebar">
        <div className="strategy-sidebar-title">
          <FlaskConical size={14} />
          <span>Portfolio Setup</span>
          <button
            type="button"
            onClick={() => setIsGuideModalOpen(true)}
            className="strategy-info-btn"
            title="Strategy Lab Guide"
          >
            <Info size={14} />
          </button>
        </div>

        <div className="strategy-form-group">
          <label className="strategy-form-label" htmlFor="sl-initial">Initial Investment (IDR)</label>
          <div className="strategy-input-wrapper">
            <span className="strategy-input-prefix">Rp</span>
            <input
              id="sl-initial"
              type="text"
              className="strategy-input"
              placeholder="e.g. 10.000.000"
              value={initialInvestment}
              onChange={(e) => handleNumericChange(e.target.value, setInitialInvestment)}
            />
          </div>
        </div>

        <div className="strategy-input-row">
          <div className="strategy-form-group">
            <label className="strategy-form-label" htmlFor="sl-start">Start Date</label>
            <input
              id="sl-start"
              type="date"
              className="strategy-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              onClick={(e) => {
                try {
                  e.target.showPicker();
                } catch {
                  // ignore
                }
              }}
            />
          </div>
          <div className="strategy-form-group">
            <label className="strategy-form-label" htmlFor="sl-end">End Date</label>
            <input
              id="sl-end"
              type="date"
              className="strategy-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              onClick={(e) => {
                try {
                  e.target.showPicker();
                } catch {
                  // ignore
                }
              }}
            />
          </div>
        </div>

        <div className="strategy-divider" />

        <div className="strategy-sidebar-title">
          <ShieldAlert size={14} />
          Risk Parameters
        </div>

        <div className="strategy-form-group">
          <label className="strategy-form-label" htmlFor="sl-return">Expected Annual Return (%)</label>
          <div className="strategy-input-wrapper">
            <input
              id="sl-return"
              type="number"
              className="strategy-input"
              step="0.1"
              placeholder="e.g. 8"
              value={annualReturn}
              onChange={(e) => setAnnualReturn(e.target.value)}
            />
            <span className="strategy-input-suffix">%</span>
          </div>
        </div>

        <div className="strategy-form-group">
          <label className="strategy-form-label" htmlFor="sl-vol">Volatility / Risk Level (%)</label>
          <div className="strategy-input-wrapper">
            <input
              id="sl-vol"
              type="number"
              className="strategy-input"
              step="0.1"
              placeholder="e.g. 14"
              value={volatility}
              onChange={(e) => setVolatility(e.target.value)}
            />
            <span className="strategy-input-suffix">%</span>
          </div>
        </div>

        <div className="strategy-form-group">
          <label className="strategy-form-label" htmlFor="sl-dca">Monthly DCA Contribution (IDR)</label>
          <div className="strategy-input-wrapper">
            <span className="strategy-input-prefix">Rp</span>
            <input
              id="sl-dca"
              type="text"
              className="strategy-input"
              placeholder="e.g. 1.200.000"
              value={monthlyDCA}
              onChange={(e) => handleNumericChange(e.target.value, setMonthlyDCA)}
            />
          </div>
        </div>

        <div className="strategy-divider" />

        <div className="strategy-sidebar-title">
          <Sparkles size={14} />
          Financial Health Check
        </div>

        <div className="strategy-input-row">
          <div className="strategy-form-group">
            <label className="strategy-form-label" htmlFor="sl-income">Monthly Income (IDR)</label>
            <div className="strategy-input-wrapper compact">
              <span className="strategy-input-prefix">Rp</span>
              <input
                id="sl-income"
                type="text"
                className="strategy-input"
                placeholder="8.000.000"
                value={monthlyIncome}
                onChange={(e) => handleNumericChange(e.target.value, setMonthlyIncome)}
              />
            </div>
          </div>
          <div className="strategy-form-group">
            <label className="strategy-form-label" htmlFor="sl-expense">Monthly Expense (IDR)</label>
            <div className="strategy-input-wrapper compact">
              <span className="strategy-input-prefix">Rp</span>
              <input
                id="sl-expense"
                type="text"
                className="strategy-input"
                placeholder="4.970.000"
                value={monthlyExpense}
                onChange={(e) => handleNumericChange(e.target.value, setMonthlyExpense)}
              />
            </div>
          </div>
        </div>

        <div className="strategy-form-group">
          <label className="strategy-form-label" htmlFor="sl-emergency">Emergency Fund Saved (IDR)</label>
          <div className="strategy-input-wrapper">
            <span className="strategy-input-prefix">Rp</span>
            <input
              id="sl-emergency"
              type="text"
              className="strategy-input"
              placeholder="e.g. 29.820.000"
              value={emergencyFund}
              onChange={(e) => handleNumericChange(e.target.value, setEmergencyFund)}
            />
          </div>
        </div>

        <div className="strategy-btn-group">
          <button
            className={`strategy-btn strategy-btn-primary ${!isFormValid ? 'disabled' : ''}`}
            onClick={handleRunSimulation}
            disabled={!isFormValid || isAnimating}
          >
            <Play size={16} />
            {isAnimating ? 'Running...' : 'Run Simulation'}
          </button>
          <button
            className="strategy-btn strategy-btn-secondary"
            onClick={handleReset}
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>
      </div>

      {/* Right Main Content */}
      <div className="strategy-main">

        {/* Top Metrics */}
        <div className="strategy-metrics-row">
          <div className="strategy-metric-card">
            <span className="smc-title">Portfolio Value</span>
            <span className="smc-val">
              {result ? formatIDRShort(result.scenarios.base.value) : '--'}
            </span>
            <span className={`smc-sub ${result && result.scenarios.base.return >= 0 ? 'green' : 'red'}`}>
              {result ? `${result.scenarios.base.return >= 0 ? '+' : ''}${result.scenarios.base.return.toFixed(1)}% total return` : 'Run simulation to see results'}
            </span>
          </div>
          <div className="strategy-metric-card">
            <span className="smc-title">Total Return</span>
            <span className="smc-val" style={{ color: result ? (result.scenarios.base.return >= 0 ? '#10b981' : '#ef4444') : '#64748b' }}>
              {result ? `${result.scenarios.base.return >= 0 ? '+' : ''}${result.scenarios.base.return.toFixed(1)}%` : '--'}
            </span>
            <span className="smc-sub">
              {result ? `vs. ${formatIDRShort(result.totalInvested)} invested` : 'Waiting for input'}
            </span>
          </div>
          <div className="strategy-metric-card">
            <span className="smc-title">Risk Score</span>
            <span className="smc-val" style={{ color: result ? result.riskColor : '#64748b' }}>
              {result ? result.riskScore : '--'}
              {result && <span style={{ fontSize: '1rem', color: '#64748b' }}>/10</span>}
            </span>
            <span className="smc-sub" style={{ color: result ? result.riskColor : undefined }}>
              {result ? `Risk match - ${result.riskLabel}` : 'Waiting for input'}
            </span>
          </div>
        </div>

        {/* Projected Portfolio Growth Chart */}
        <div className={`strategy-chart-card ${result ? 'has-data' : ''}`}>
          <div className="scc-header">
            <div className="scc-title-badge">Projected Portfolio Growth</div>
            {result && (
              <div className="scc-legend">
                <span className="scc-legend-item"><span className="scc-dot" style={{ backgroundColor: '#38bdf8' }} />Bull</span>
                <span className="scc-legend-item"><span className="scc-dot" style={{ backgroundColor: '#10b981' }} />Base</span>
                <span className="scc-legend-item"><span className="scc-dot" style={{ backgroundColor: '#ef4444' }} />Bear</span>
                <span className="scc-legend-item"><span className="scc-dot" style={{ backgroundColor: '#64748b', borderStyle: 'dashed' }} />Invested</span>
              </div>
            )}
          </div>
          <div style={{ width: '100%', height: '280px' }}>
            {result ? (
              <ResponsiveContainer>
                <AreaChart data={result.growthData} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
                  <defs>
                    <linearGradient id="gradBull" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradBase" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradBear" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={formatChartAxis} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="bull" name="Bull" stroke="#38bdf8" strokeWidth={2} fill="url(#gradBull)" dot={false} />
                  <Area type="monotone" dataKey="base" name="Base" stroke="#10b981" strokeWidth={2.5} fill="url(#gradBase)" dot={false} />
                  <Area type="monotone" dataKey="bear" name="Bear" stroke="#ef4444" strokeWidth={2} fill="url(#gradBear)" dot={false} />
                  <Line type="monotone" dataKey="invested" name="Total Invested" stroke="#64748b" strokeWidth={1.5} strokeDasharray="6 4" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-placeholder">
                <BarChart3 size={48} className="chart-placeholder-icon" />
                <p className="chart-placeholder-text">Configure your portfolio and click "Run Simulation" to see projected growth</p>
              </div>
            )}
          </div>
        </div>

        {/* Scenario Comparison */}
        <div className="scenario-section">
          <div className="scenario-header">Scenario Comparison</div>

          <div className="scenario-cards">
            <div className={`scenario-card bull ${result ? 'has-data' : ''}`}>
              <span className="sc-icon">🐂</span>
              <span className="sc-title">Bull Market</span>
              <span className={`sc-pct ${result && result.scenarios.bull.return >= 0 ? 'green' : 'red'}`}>
                {result ? `${result.scenarios.bull.return >= 0 ? '+' : ''}${result.scenarios.bull.return.toFixed(1)}%` : '--'}
              </span>
              <span className="sc-val">
                {result ? formatIDRShort(result.scenarios.bull.value) : '--'}
              </span>
              {result && (
                <span className="sc-rate-label">
                  Return rate: {(parseFloat(annualReturn) + parseFloat(volatility)).toFixed(1)}%/yr
                </span>
              )}
            </div>
            <div className={`scenario-card base ${result ? 'has-data' : ''}`}>
              <span className="sc-icon">📊</span>
              <span className="sc-title">Base Case</span>
              <span className={`sc-pct ${result && result.scenarios.base.return >= 0 ? 'green-alt' : 'red'}`}>
                {result ? `${result.scenarios.base.return >= 0 ? '+' : ''}${result.scenarios.base.return.toFixed(1)}%` : '--'}
              </span>
              <span className="sc-val">
                {result ? formatIDRShort(result.scenarios.base.value) : '--'}
              </span>
              {result && (
                <span className="sc-rate-label">
                  Return rate: {parseFloat(annualReturn).toFixed(1)}%/yr
                </span>
              )}
            </div>
            <div className={`scenario-card bear ${result ? 'has-data' : ''}`}>
              <span className="sc-icon">🐻</span>
              <span className="sc-title">Bear Market</span>
              <span className={`sc-pct ${result && result.scenarios.bear.return >= 0 ? 'green-alt' : 'red'}`}>
                {result ? `${result.scenarios.bear.return >= 0 ? '+' : ''}${result.scenarios.bear.return.toFixed(1)}%` : '--'}
              </span>
              <span className="sc-val">
                {result ? formatIDRShort(result.scenarios.bear.value) : '--'}
              </span>
              {result && (
                <span className="sc-rate-label">
                  Return rate: {(parseFloat(annualReturn) - parseFloat(volatility)).toFixed(1)}%/yr
                </span>
              )}
            </div>
          </div>

          {/* Insight Box */}
          <div className={`strategy-insight-box ${result ? 'has-data' : ''}`}>
            <div className="insight-header">
              <span className="insight-label">Insight</span>
              {result && (
                <span className={`insight-verdict-badge ${result.safetyVerdict}`}>
                  {result.safetyVerdict === 'safe' ? 'Safe to Execute' : result.safetyVerdict === 'moderate' ? 'Moderate Risk' : 'High Risk'}
                </span>
              )}
            </div>
            <p className="insight-text">
              {result
                ? result.insightText
                : 'Complete all input fields and run the simulation to receive personalized insights about your investment strategy and financial readiness.'
              }
            </p>
            {result && (
              <div className="insight-metrics-strip">
                <div className="insight-metric">
                  <span className="insight-metric-label">Savings Rate</span>
                  <span className="insight-metric-val" style={{ color: result.healthMetrics.savingsRate >= 40 ? '#10b981' : '#fbbf24' }}>
                    {result.healthMetrics.savingsRate.toFixed(1)}%
                  </span>
                </div>
                <div className="insight-metric">
                  <span className="insight-metric-label">Emergency Coverage</span>
                  <span className="insight-metric-val" style={{ color: result.healthMetrics.emergencyMonths >= 6 ? '#10b981' : '#fbbf24' }}>
                    {result.healthMetrics.emergencyMonths.toFixed(1)} months
                  </span>
                </div>
                <div className="insight-metric">
                  <span className="insight-metric-label">DCA / Income</span>
                  <span className="insight-metric-val" style={{ color: result.healthMetrics.dcaToIncomeRatio <= 30 ? '#10b981' : '#fbbf24' }}>
                    {result.healthMetrics.dcaToIncomeRatio.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Strategy Lab Guide Modal */}
      <Modal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        title="Strategy Lab Guide"
        className="large-top-modal"
      >
        <div className="space-y-6 text-left text-slate-700" style={{ fontSize: '0.92rem', lineHeight: '1.6', color: '#334155' }}>
          
          <section className="mb-6">
            <h3 className="text-base font-bold text-slate-900 mb-3 pb-1 border-b border-slate-100 uppercase tracking-wide">
              Part 1: Overview of Each Container’s Functions
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-800">1. Left Sidebar (Parameter & Input Panel)</h4>
                <p className="text-slate-600 mt-1">
                  This container on the left is the <strong>“engine room.”</strong> Its function is to capture all of the user’s financial variables. This panel is intentionally divided into three subcategories (Portfolio Setup, Risk Parameters, and Financial Health) so that compound interest calculations can be directly linked to the reality of the user’s wallet.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800">2. Top Metrics (Summary Numbers Container)</h4>
                <p className="text-slate-600 mt-1">
                  Located at the very top on the right, this container provides instant results to the user immediately after the “Run Simulation” button is pressed.
                </p>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-600">
                  <li><strong>Portfolio Value:</strong> Displays the final total amount in the base case scenario.</li>
                  <li><strong>Total Return:</strong> Displays the gross return percentage relative to the initial investment.</li>
                  <li><strong>Risk Score:</strong> Converts the volatility percentage into a 1–10 score that is easier for the general public to understand.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-800">3. Projected Portfolio Growth (Projection Chart Container)</h4>
                <p className="text-slate-600 mt-1">
                  The primary function of this container is to visualize the power of compound interest over time. Using Recharts’ AreaChart, this graph distinguishes the gray dashed line (deposited capital) from the colored area (asset growth). The wider the gap between the dashed line and the colored area, the greater the profit earned.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800">4. Scenario Comparison (Market Conditions Comparison Container)</h4>
                <p className="text-slate-600 mt-1">
                  Stock or crypto markets don’t always rise. This container helps manage user expectations by presenting three calculation scenarios:
                </p>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-600">
                  <li><strong>Bull Market (Optimistic):</strong> Results when the market is performing exceptionally well.</li>
                  <li><strong>Base Case (Normal):</strong> Standard industry-expected results.</li>
                  <li><strong>Bear Market (Pessimistic):</strong> Worst-case results if the market is declining, so users are mentally prepared for potential temporary losses.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-800">5. Insight Box (AI Decision Container)</h4>
                <p className="text-slate-600 mt-1">
                  This is the most vital feature. Instead of just providing numbers, this container analyzes the user’s financial health metrics (Monthly Take-Home Pay and Emergency Fund) and then issues a Verdict. If a user attempts to invest too heavily despite having an insufficient emergency fund, this container will activate and display a “High Risk” warning.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-base font-bold text-slate-900 mb-3 pb-1 border-b border-slate-100 uppercase tracking-wide">
              Part 2: Filling Guide & Purpose of Each Column
            </h3>
            <p className="text-slate-600 mb-3">
              To ensure users get accurate simulation results, here is a guide for filling out the panel on the left:
            </p>

            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-800">A. Portfolio Setup (Initial Settings)</h4>
                <p className="text-slate-600 mt-1">
                  The focus of this section is to define the starting point and end goal of the investment journey.
                </p>
                <div className="mt-2 pl-4 border-l-2 border-slate-200 space-y-2">
                  <div>
                    <strong className="text-slate-700">Initial Investment (IDR):</strong>
                    <ul className="list-disc pl-5 text-slate-600 text-sm">
                      <li><strong>Purpose:</strong> To determine the initial lump-sum investment deposited in the first month.</li>
                      <li><strong>Filling Guide:</strong> If the user is starting from scratch, enter 0. If the user is transferring funds from another savings account to begin investing, enter the total amount (e.g., 10,000,000).</li>
                    </ul>
                  </div>
                  <div>
                    <strong className="text-slate-700">Start Date & End Date:</strong>
                    <ul className="list-disc pl-5 text-slate-600 text-sm">
                      <li><strong>Purpose:</strong> To calculate the total number of months/years the funds will be held and compounded by the simulation engine.</li>
                      <li><strong>Filling Guide:</strong> Flexible, but it is highly recommended that the time range (End Date) be at least 3–5 years in the future so that the effect of compound interest is clearly visible on the graph.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800">B. Risk Parameters (Return & Risk Parameters)</h4>
                <p className="text-slate-600 mt-1">
                  The focus of this section is to determine which investment instrument is being simulated (Stocks, Mutual Funds, or Cryptocurrency).
                </p>
                <div className="mt-2 pl-4 border-l-2 border-slate-200 space-y-2">
                  <div>
                    <strong className="text-slate-700">Expected Annual Return (%):</strong>
                    <ul className="list-disc pl-5 text-slate-600 text-sm">
                      <li><strong>Purpose:</strong> The average expected return over one year.</li>
                      <li><strong>Filling Guide:</strong> For Money Market Mutual Funds, typically 4–6%. For Bonds/SBN, around 6–8%. For Stocks (IHSG), the average is 10–12%.</li>
                    </ul>
                  </div>
                  <div>
                    <strong className="text-slate-700">Volatility / Risk Level (%):</strong>
                    <ul className="list-disc pl-5 text-slate-600 text-sm">
                      <li><strong>Purpose:</strong> To determine how extreme the asset’s price can rise and fall within a year. This figure determines the distance between the Bull Market and Bear Market curves.</li>
                      <li><strong>Filling Guide:</strong> The higher the potential return, the higher the volatility should be set. (For example, Crypto can have volatility of 30–50%, while Money Market Mutual Funds are closer to 1–2%).</li>
                    </ul>
                  </div>
                  <div>
                    <strong className="text-slate-700">Monthly DCA Contribution (IDR):</strong>
                    <ul className="list-disc pl-5 text-slate-600 text-sm">
                      <li><strong>Purpose:</strong> The amount of money (Dollar Cost Averaging) to be consistently deposited every month.</li>
                      <li><strong>Filling Guide:</strong> Enter a realistic amount set aside from your salary (e.g., 1,000,000).</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800">C. Financial Health Check (Wallet Reality Check)</h4>
                <p className="text-slate-600 mt-1">
                  The data here does not appear in the investment chart; instead, it is used by the system to evaluate whether the DCA amount above is safe or could jeopardize the user’s finances.
                </p>
                <div className="mt-2 pl-4 border-l-2 border-slate-200 space-y-2">
                  <div>
                    <strong className="text-slate-700">Monthly Income & Expense (IDR):</strong>
                    <ul className="list-disc pl-5 text-slate-600 text-sm">
                      <li><strong>Purpose:</strong> To determine the user’s “Net Savings” or monthly remaining funds.</li>
                      <li><strong>Filling Guide:</strong> Enter the total monthly net salary/income under Income. Enter all primary, secondary living expenses, and debt installments under Expense.</li>
                    </ul>
                  </div>
                  <div>
                    <strong className="text-slate-700">Emergency Fund Saved (IDR):</strong>
                    <ul className="list-disc pl-5 text-slate-600 text-sm">
                      <li><strong>Purpose:</strong> To check the thickness of the user’s “safety cushion” before diving into risky investments.</li>
                      <li><strong>Filling Guide:</strong> Enter the total cash/liquid savings the user currently holds that are strictly allocated for emergencies.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="flex justify-end pt-4 border-t border-slate-100 mt-6">
            <button
              onClick={() => setIsGuideModalOpen(false)}
              className="px-5 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-semibold cursor-pointer border-none shadow transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Got It
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default StrategyLabPage;
