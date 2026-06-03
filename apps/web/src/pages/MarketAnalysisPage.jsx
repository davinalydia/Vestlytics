import { useState, useEffect, useContext } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { UserFinancialContext } from '../context/UserFinancialContext';
import { OnboardingFallback } from '../components/OnboardingFallback';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { Modal } from '../components/Modal';
import { api } from '../services/api';
import './marketAnalysis.css';
import './dashboard.css'; // For card styles

const MarketAnalysisPage = () => {
  const { financialData } = useContext(UserFinancialContext);
  const [selectedTicker, setSelectedTicker] = useState('BBCA');
  const [availableStocks, setAvailableStocks] = useState([]);
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoadingList, setIsLoadingList] = useState(financialData.isProfileCompleted);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(financialData.isProfileCompleted);
  const [analyzedTickers, setAnalyzedTickers] = useState(['BBCA', 'ASII', 'TLKM']);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getTickerDetails = (ticker) => {
    const stock = availableStocks.find(s => s.ticker === ticker);
    if (stock) {
      return {
        price: stock.price,
        change: stock.change_pct
      };
    }
    const fallbacks = {
      BBCA: { price: 9450, change: 1.2 },
      ASII: { price: 4800, change: -0.8 },
      TLKM: { price: 3210, change: 0.4 },
      BBRI: { price: 4800, change: -0.8 },
      GOTO: { price: 62, change: -3.1 }
    };
    return fallbacks[ticker] || { price: 0, change: 0 };
  };
  const handleRemoveTicker = (tickerToRemove) => {
    if (analyzedTickers.length <= 1) return;

    const newTickers = analyzedTickers.filter(t => t !== tickerToRemove);
    setAnalyzedTickers(newTickers);

    if (selectedTicker === tickerToRemove) {
      setSelectedTicker(newTickers[0]);
    }
  };
  // Load available stocks on mount
  useEffect(() => {
    if (!financialData.isProfileCompleted) {
      return;
    }

    const loadStocks = async () => {
      try {
        const res = await api.getAvailableStocks();
        if (res && res.success) {
          setAvailableStocks(res.stocks || []);
        }
      } catch (err) {
        console.error('Failed to load stocks list', err);
      } finally {
        setIsLoadingList(false);
      }
    };
    loadStocks();
  }, [financialData.isProfileCompleted]);

  // Load analysis whenever selectedTicker changes
  useEffect(() => {
    if (!financialData.isProfileCompleted) {
      return;
    }

    const loadAnalysis = async () => {
      setIsLoadingAnalysis(true);
      try {
        const res = await api.getMarketAnalysis(selectedTicker);
        if (res && res.success) {
          setAnalysisData(res.data);
        }
      } catch (err) {
        console.error(`Failed to load analysis for ${selectedTicker}`, err);
      } finally {
        setIsLoadingAnalysis(false);
      }
    };
    loadAnalysis();
  }, [selectedTicker, financialData.isProfileCompleted]);

  // Onboarding check
  if (!financialData.isProfileCompleted) {
    return <OnboardingFallback pageName="Market Analysis" />;
  }

  // Structure chart data: connect historical actual price with future predicted price
  const getChartData = () => {
    if (!analysisData) return [];

    const historical = analysisData.chart_historical || [];
    const pred = analysisData.prediction_breakdown || {};

    const formattedData = historical.map((d, index) => ({
      name: d.date,
      actualPrice: d.price,
      // Connect predicted line to the last historical point
      predictedPrice: index === historical.length - 1 ? d.price : null,
    }));

    // Add future LSTM prediction points
    const predictionPoints = [
      { name: '1 Day Out', actualPrice: null, predictedPrice: pred.short_term_1d?.price },
      { name: '7 Days Out', actualPrice: null, predictedPrice: pred.short_term_7d?.price },
      { name: '1 Month Out', actualPrice: null, predictedPrice: pred.long_term_1m?.price },
      { name: '6 Months Out', actualPrice: null, predictedPrice: pred.long_term_6m?.price },
    ];

    return [...formattedData, ...predictionPoints];
  };

  const chartData = getChartData();
  const todayLabel = analysisData?.chart_historical 
    ? analysisData.chart_historical[analysisData.chart_historical.length - 1]?.date 
    : 'Today';

  const predictions = analysisData?.prediction_breakdown || {};

  return (
    <div className="market-container animate-fade-in">
      
      {/* Stock Selection Cards */}
      <div className="stock-cards-container">
        {analyzedTickers.map((ticker) => {
          const details = getTickerDetails(ticker);
          const isSelected = selectedTicker === ticker;
          const isPositive = details.change >= 0;

          return (
            <div
              key={ticker}
              className={`stock-select-card ${isSelected ? 'selected' : ''}`}
              onClick={() => setSelectedTicker(ticker)}
            >
              {analyzedTickers.length > 1 && (
                <button
                  type="button"
                  className="stock-card-close-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveTicker(ticker);
                  }}
                  title="Hapus analisis"
                >
                  &times;
                </button>
              )}
              <div className="stock-card-ticker">{ticker}</div>
              <div className="stock-card-price">Rp {details.price.toLocaleString('id-ID')}</div>
              <div className={`stock-card-change ${isPositive ? 'up' : 'down'}`}>
                {isPositive ? `▲ +${details.change}%` : `▼ ${details.change}%`}
              </div>
            </div>
          );
        })}

        {/* Plus Card to add a stock */}
        {analyzedTickers.length < availableStocks.length && (
          <button 
            type="button" 
            className="stock-add-card" 
            onClick={() => setIsModalOpen(true)}
            title="Tambah saham untuk dianalisis"
          >
            +
          </button>
        )}
      </div>

      {/* Top Metrics Info Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl mb-6">
        <div>
          <h2 className="text-lg font-bold text-white mb-1">Currently Analyzing: {selectedTicker}</h2>
          <p className="text-xs text-slate-400">Deep Learning LSTM analysis feed for {selectedTicker} equity asset.</p>
        </div>
        
        <div className="flex gap-6 items-center">
          <div>
            <span className="block text-xs text-slate-400 uppercase tracking-wider mb-1">Current Value</span>
            {isLoadingAnalysis ? (
              <div className="h-8 bg-slate-800 rounded animate-pulse w-32"></div>
            ) : (
              <span className="text-2xl font-bold text-white">
                Rp {analysisData?.current_price ? Math.round(analysisData.current_price).toLocaleString('id-ID') : '--'}
              </span>
            )}
          </div>
          <div>
            <span className="block text-xs text-slate-400 uppercase tracking-wider mb-1">Model Accuracy</span>
            <span className="text-xs font-bold bg-cyan-950 text-cyan-400 border border-cyan-800 px-3 py-1.5 rounded-full inline-block">
              94.8% MAPE (LSTM)
            </span>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="dash-card">
        <div className="dash-card-header items-center">
          <div>
            <h3 className="dash-card-title">Stock price forecast & AI Prediction</h3>
            <p className="dash-card-subtitle">Real-time database feed coupled with Deep Learning LSTM projections.</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-purple-500 rounded-full"></span> Actual Price</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 border-t border-dashed border-cyan-400"></span> AI Projections</span>
          </div>
        </div>
        
        <div className="chart-container-large min-h-[300px]">
          {isLoadingAnalysis ? (
            <SkeletonLoader type="chart" />
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} dx={-10} domain={['dataMin - 100', 'dataMax + 100']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: 'white', fontSize: 12 }}
                  formatter={(val, name) => [name === 'actualPrice' ? `Rp ${Math.round(val).toLocaleString('id-ID')}` : `Rp ${Math.round(val).toLocaleString('id-ID')}`, name === 'actualPrice' ? 'Actual Price' : 'LSTM Forecast']}
                />
                
                <ReferenceLine x={todayLabel} stroke="#94a3b8" strokeDasharray="3 3" label={{ position: 'top', value: 'Today', fill: '#64748b', fontSize: 12 }} />
                
                <Line type="monotone" dataKey="actualPrice" name="Actual Price" stroke="#a855f7" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls={false} />
                <Line type="monotone" dataKey="predictedPrice" name="Predicted Price" stroke="#06b6d4" strokeWidth={2.5} strokeDasharray="5 5" dot={{ r: 3 }} connectNulls={true} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Grid Prediction Breakdown & Sentiment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Prediction Breakdown (2x2 Grid) */}
        <div className="dash-card lg:col-span-2">
          <h3 className="dash-card-title mb-4">LSTM Forecast Matrix</h3>
          {isLoadingAnalysis ? (
            <SkeletonLoader type="table" rows={2} />
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col justify-between">
                <span className="text-xs text-slate-500 font-semibold uppercase">1 Day Forecast</span>
                <span className="text-xl font-bold text-slate-800 mt-2">
                  Rp {Math.round(predictions.short_term_1d?.price || 0).toLocaleString('id-ID')}
                </span>
                <span className={`text-xs font-bold mt-1 ${predictions.short_term_1d?.change_pct >= 0 ? 'text-success' : 'text-danger'}`}>
                  {predictions.short_term_1d?.change_pct >= 0 ? '▲ +' : '▼ '}{predictions.short_term_1d?.change_pct}%
                </span>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col justify-between">
                <span className="text-xs text-slate-500 font-semibold uppercase">7 Days Forecast</span>
                <span className="text-xl font-bold text-slate-800 mt-2">
                  Rp {Math.round(predictions.short_term_7d?.price || 0).toLocaleString('id-ID')}
                </span>
                <span className={`text-xs font-bold mt-1 ${predictions.short_term_7d?.change_pct >= 0 ? 'text-success' : 'text-danger'}`}>
                  {predictions.short_term_7d?.change_pct >= 0 ? '▲ +' : '▼ '}{predictions.short_term_7d?.change_pct}%
                </span>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col justify-between">
                <span className="text-xs text-slate-500 font-semibold uppercase">1 Month Forecast</span>
                <span className="text-xl font-bold text-slate-800 mt-2">
                  Rp {Math.round(predictions.long_term_1m?.price || 0).toLocaleString('id-ID')}
                </span>
                <span className={`text-xs font-bold mt-1 ${predictions.long_term_1m?.change_pct >= 0 ? 'text-success' : 'text-danger'}`}>
                  {predictions.long_term_1m?.change_pct >= 0 ? '▲ +' : '▼ '}{predictions.long_term_1m?.change_pct}%
                </span>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col justify-between">
                <span className="text-xs text-slate-500 font-semibold uppercase">6 Months Forecast</span>
                <span className="text-xl font-bold text-slate-800 mt-2">
                  Rp {Math.round(predictions.long_term_6m?.price || 0).toLocaleString('id-ID')}
                </span>
                <span className={`text-xs font-bold mt-1 ${predictions.long_term_6m?.change_pct >= 0 ? 'text-success' : 'text-danger'}`}>
                  {predictions.long_term_6m?.change_pct >= 0 ? '▲ +' : '▼ '}{predictions.long_term_6m?.change_pct}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* AI Insight narratives */}
        <div className="dash-card flex flex-col justify-between">
          <div>
            <h3 className="dash-card-title mb-4">AI Insight</h3>
            {isLoadingAnalysis ? (
              <SkeletonLoader type="text" rows={4} />
            ) : (
              <div className="space-y-4">
                <p className="text-slate-600 text-sm leading-relaxed">
                  {analysisData?.ai_insight?.text || 'No sentiment description available.'}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {analysisData?.ai_insight?.tags?.map((tag, i) => (
                    <span key={i} className="bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 rounded-full text-xs font-semibold">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="border-t border-slate-100 pt-4 mt-6 flex justify-between items-center text-xs text-slate-400 font-medium">
            <span>Model: LSTM Neural Net</span>
            <span>Refresh rate: 24h</span>
          </div>
        </div>

      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Select Stock for Analysis"
        className="large-top-modal"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {availableStocks
            .filter(stock => !analyzedTickers.includes(stock.ticker))
            .map((stock) => {
              const isPositive = stock.change_pct >= 0;
              return (
                <div 
                  key={stock.ticker}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 0',
                    borderBottom: '1px solid #f1f5f9'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {/* Placeholder logo */}
                    <div style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: '#cbd5e1',
                      borderRadius: '8px'
                    }}></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>{stock.ticker}</span>
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Rp {stock.price.toLocaleString('id-ID')}</span>
                      <span style={{ 
                        fontSize: '0.8rem', 
                        fontWeight: '700', 
                        color: isPositive ? '#10b981' : '#ef4444' 
                      }}>
                        {isPositive ? `▲ +${stock.change_pct}%` : `▼ ${stock.change_pct}%`}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    style={{
                      backgroundColor: '#2563eb',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onClick={() => {
                      setAnalyzedTickers(prev => [...prev, stock.ticker]);
                      setSelectedTicker(stock.ticker);
                      setIsModalOpen(false);
                    }}
                    className="hover:bg-blue-700"
                  >
                    Select Stock
                  </button>
                </div>
              );
            })}
          {availableStocks.filter(stock => !analyzedTickers.includes(stock.ticker)).length === 0 && (
            <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem', padding: '1rem 0' }}>
              All stocks are currently being analyzed.
            </div>
          )}
        </div>
      </Modal>
      
    </div>
  );
};

export default MarketAnalysisPage;
