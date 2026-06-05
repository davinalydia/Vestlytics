import { useState, useEffect, useContext } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Sparkles } from 'lucide-react';
import { UserFinancialContext } from '../context/UserFinancialContext';
import { OnboardingFallback } from '../components/OnboardingFallback';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { api } from '../services/api';

import './dashboard.css';

const DashboardPage = () => {
  const { financialData } = useContext(UserFinancialContext);
  const [isLoading, setIsLoading] = useState(financialData.isProfileCompleted);
  const [profile, setProfile] = useState(null);
  const [cashflow, setCashflow] = useState([]);
  const [aiInsight, setAiInsight] = useState(null);

  const assets = financialData.assetsList || [];

  // Mengambil agregasi data metrik dasbor dan wawasan AI dari server
  useEffect(() => {
    if (!financialData.isProfileCompleted) {
      return;
    }

    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const [profileRes, cashflowRes, insightsRes] = await Promise.all([
          api.getProfile(),
          api.getCashflow(),
          api.getInsights(),
        ]);

        if (profileRes && profileRes.success) {
          setProfile(profileRes);
        }
        if (cashflowRes && cashflowRes.success) {
          setCashflow(cashflowRes.history || []);
        }
        if (
          insightsRes &&
          insightsRes.success &&
          insightsRes.data &&
          insightsRes.data.length > 0
        ) {
          // Mengambil log insight terbaru yang dihasilkan oleh AI Engine
          setAiInsight(insightsRes.data[0]);
        }
      } catch (err) {
        console.error('Terjadi kesalahan saat memuat data dasbor:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [financialData.isProfileCompleted]);

  // Menampilkan antarmuka panduan (onboarding) apabila profil pengguna belum lengkap
  if (!financialData.isProfileCompleted) {
    return <OnboardingFallback pageName='Dashboard' />;
  }

  // Fungsi utilitas untuk mengekstraksi nilai numerik murni dari format string
  const parseNum = (val) => {
    if (!val) return 0;
    const cleaned = String(val).replace(/[^0-9]/g, '');
    return parseInt(cleaned, 10) || 0;
  };

  // Mengonversi variabel profil finansial dari state global untuk keperluan visualisasi
  const incomeVal = parseNum(financialData.monthlyIncome);
  const expenseVal = parseNum(financialData.monthlyExpenses);
  const debtVal = parseNum(financialData.totalDebt);

  const netSavingsVal = incomeVal - expenseVal;
  const savingsRate = incomeVal > 0 ? (netSavingsVal / incomeVal) * 100 : 0;
  const debtRatio = incomeVal > 0 ? (debtVal / incomeVal) * 100 : 0;

  // Melakukan kalkulasi total valuasi portofolio berdasarkan data aset saat ini
  const totalAssetValue = assets.reduce(
    (sum, item) => sum + parseFloat(item.value || 0),
    0,
  );
  // Asumsi margin kontribusi aset dasar sebesar 95% untuk ilustrasi investasi tertanam (invested value)
  const investedValue = totalAssetValue > 0 ? totalAssetValue * 0.95 : 0;

  // Memetakan struktur data aset ke dalam format visualisasi grafik lingkaran (Pie Chart)
  const pieData =
    assets.length > 0
      ? assets.map((item, idx) => {
          const colors = [
            '#a855f7',
            '#eab308',
            '#f97316',
            '#6366f1',
            '#10b981',
            '#06b6d4',
            '#ec4899',
          ];
          return {
            name: item.asset_category,
            value:
              totalAssetValue > 0
                ? parseFloat(((item.value / totalAssetValue) * 100).toFixed(1))
                : 0,
            color: colors[idx % colors.length],
          };
        })
      : [{ name: 'Belum ada aset', value: 100, color: '#334155' }];

  // Mengambil indikator skor kesehatan finansial yang tersinkronisasi dari state global
  const healthScore = financialData.healthScore || 0;
  const healthStatus = financialData.healthStatus || 'Needs improvement';

  // Menyusun struktur data arus kas historis untuk divisualisasikan dalam grafik batang (Bar Chart)
  const barData =
    cashflow && cashflow.length > 0
      ? [...cashflow].reverse().map((item) => ({
          name: item.month_period,
          income: parseFloat(item.income || 0),
          expenses: parseFloat(item.expenses || 0),
        }))
      : [];

  return (
    <div className='dashboard-container animate-fade-in'>
      {/* Grid Metrik Utama */}
      <div className='metrics-grid'>
        <div className='metric-card'>
          <span className='metric-label'>Current Value</span>
          {isLoading ? (
            <div className='h-8 bg-slate-800 rounded animate-pulse w-3/4'></div>
          ) : (
            <>
              <div className='metric-value'>
                Rp {Math.round(totalAssetValue).toLocaleString('id-ID')}
              </div>
              <div className='metric-sub text-success'>+5.26% vs invested</div>
            </>
          )}
        </div>

        <div className='metric-card'>
          <span className='metric-label'>Invested Value</span>
          {isLoading ? (
            <div className='h-8 bg-slate-800 rounded animate-pulse w-3/4'></div>
          ) : (
            <>
              <div className='metric-value'>
                Rp {Math.round(investedValue).toLocaleString('id-ID')}
              </div>
              <div className='metric-sub text-slate'>
                Consistent DCA contributions
              </div>
            </>
          )}
        </div>

        <div className='metric-card health-card'>
          <div>
            <span className='metric-label'>Financial Health Score</span>
            {isLoading ? (
              <div className='h-8 bg-slate-800 rounded animate-pulse w-24'></div>
            ) : (
              <>
                <div className='metric-value'>{healthScore}/100</div>
                <div className='metric-sub text-cyan'>{healthStatus}</div>
              </>
            )}
          </div>
          {!isLoading && (
            <div className='w-14 h-14 relative flex-shrink-0'>
              <svg
                viewBox='0 0 36 36'
                className='w-full h-full transform -rotate-90'
              >
                <path
                  d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
                  fill='none'
                  stroke='#1e293b'
                  strokeWidth='4'
                />
                <path
                  d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
                  fill='none'
                  stroke='#10b981'
                  strokeWidth='4'
                  strokeDasharray={`${healthScore}, 100`}
                />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Grid Konten Utama */}
      <div className='main-grid'>
        {/* Kolom Kiri */}
        <div className='grid-col-left'>
          {/* Grafik Statistik Arus Kas */}
          <div className='dash-card dark'>
            <div className='dash-card-header'>
              <div>
                <h3 className='dash-card-title text-white'>
                  Investment statistics
                </h3>
                <p className='dash-card-subtitle'>
                  Performance of income vs expenses per month
                </p>
              </div>
            </div>

            <div className='flex items-center gap-6 mb-6'>
              <div className='flex items-center gap-2'>
                <div className='w-3 h-3 rounded-sm bg-[#0ea5e9]'></div>
                <span className='text-xs text-slate-400'>Monthly Income</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-3 h-3 rounded-sm bg-[#a855f7]'></div>
                <span className='text-xs text-slate-400'>Monthly Expenses</span>
              </div>
            </div>

            {isLoading ? (
              <div className='h-[260px]'>
                <SkeletonLoader type='chart' />
              </div>
            ) : barData.length > 0 ? (
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={barData}
                    margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray='3 3'
                      vertical={false}
                      stroke='#1e293b'
                    />
                    <XAxis
                      dataKey='name'
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      tickFormatter={(val) => `Rp ${val / 1000000}M`}
                    />
                    <Tooltip
                      cursor={{ fill: '#1e293b' }}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#1e293b',
                        color: 'white',
                      }}
                    />
                    <Bar
                      dataKey='income'
                      fill='#0ea5e9'
                      radius={[2, 2, 0, 0]}
                      barSize={10}
                      name='Income'
                    />
                    <Bar
                      dataKey='expenses'
                      fill='#a855f7'
                      radius={[2, 2, 0, 0]}
                      barSize={10}
                      name='Expenses'
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className='flex items-center justify-center h-[260px] text-slate-500 text-sm'>
                Belum ada data historis arus kas yang dapat ditampilkan.
              </div>
            )}
          </div>

          {/* Tabel Detail Portofolio Aset */}
          <div className='dash-card'>
            <div className='dash-card-header'>
              <h3 className='dash-card-title'>Assets Detail</h3>
            </div>

            {isLoading ? (
              <SkeletonLoader type='table' rows={4} />
            ) : (
              <div className='table-responsive'>
                <table className='dash-table'>
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
                    {assets.length > 0 ? (
                      assets.map((row, idx) => {
                        const val = parseFloat(row.value || 0);
                        const returnYtd = parseFloat(row.return_ytd || 0);
                        const allocPct =
                          totalAssetValue > 0
                            ? ((val / totalAssetValue) * 100).toFixed(1)
                            : '0';

                        return (
                          <tr
                            key={idx}
                            className={idx % 2 === 0 ? 'bg-slate-50/50' : ''}
                          >
                            <td>
                              <span className='font-bold'>
                                {row.asset_category}
                              </span>
                            </td>
                            <td>Rp {val.toLocaleString('id-ID')}</td>
                            <td
                              className={
                                returnYtd >= 0 ? 'text-success' : 'text-danger'
                              }
                            >
                              {returnYtd >= 0
                                ? `+${returnYtd}%`
                                : `${returnYtd}%`}
                            </td>
                            <td>
                              <span
                                className={`px-3 py-1 rounded-full text-[0.7rem] font-semibold ${
                                  row.performance === 'Outperform'
                                    ? 'bg-green-100 text-green-700'
                                    : row.performance === 'In Line'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {row.performance}
                              </span>
                            </td>
                            <td>{allocPct}%</td>
                            <td className='text-slate-500 font-medium'>
                              {row.last_updated
                                ? new Date(row.last_updated).toLocaleDateString(
                                    'id-ID',
                                    {
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric',
                                    },
                                  )
                                : '--'}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan='6'
                          className='text-center py-4 text-slate-500'
                        >
                          Belum ada aset yang didaftarkan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Kolom Kanan */}
        <div className='grid-col-right'>
          {/* Visualisasi Grafik Donut (Asset Breakdown) */}
          <div className='dash-card'>
            <div className='dash-card-header'>
              <div>
                <h3 className='dash-card-title'>Asset Breakdown</h3>
                <p className='dash-card-subtitle'>
                  Overview of assets in your portfolio
                </p>
              </div>
            </div>

            {isLoading ? (
              <SkeletonLoader type='pie' />
            ) : (
              <div className='flex flex-col xl:flex-row items-center gap-6 mt-4'>
                <div style={{ width: 160, height: 160, position: 'relative' }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={pieData}
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={2}
                        dataKey='value'
                        stroke='none'
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Label teks terpusat pada grafik lingkaran */}
                  <div className='absolute inset-0 flex flex-col items-center justify-center pointer-events-none'>
                    <span className='text-3xl font-bold text-slate-800'>
                      {assets.length}
                    </span>
                    <span className='text-xs text-slate-500 font-medium'>
                      Assets
                    </span>
                  </div>
                </div>

                <div className='flex-1 w-full donut-legend'>
                  {pieData.map((item, idx) => (
                    <div key={idx} className='donut-legend-item'>
                      <div className='donut-legend-color'>
                        <div
                          className='color-dot'
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span>{item.name}</span>
                      </div>
                      <span className='font-medium text-slate-700'>
                        {item.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Indikator Metrik Kesehatan Finansial Utama */}
          <div className='dash-card dark'>
            <h3 className='dash-card-title text-white mb-6'>
              Financial Health Tracker
            </h3>

            <div className='health-item'>
              <span className='health-label'>Income/Month</span>
              <div className='health-bar-container'>
                <div
                  className='health-bar-fill'
                  style={{
                    width: incomeVal > 0 ? '100%' : '0%',
                    backgroundColor: '#10b981',
                  }}
                ></div>
              </div>
              <span className='health-badge bg-green-soft'>Good</span>
            </div>

            <div className='health-item'>
              <span className='health-label'>Expense/Month</span>
              <div className='health-bar-container'>
                <div
                  className='health-bar-fill'
                  style={{
                    width:
                      incomeVal > 0
                        ? `${Math.min(100, (expenseVal / incomeVal) * 100)}%`
                        : '0%',
                    backgroundColor:
                      expenseVal < incomeVal * 0.6 ? '#10b981' : '#f59e0b',
                  }}
                ></div>
              </div>
              <span className='health-badge bg-yellow-soft'>Stable</span>
            </div>

            <div className='health-item'>
              <span className='health-label'>Net Savings Rate</span>
              <div className='health-bar-container'>
                <div
                  className='health-bar-fill'
                  style={{
                    width:
                      incomeVal > 0 ? `${Math.min(100, savingsRate)}%` : '0%',
                    backgroundColor: savingsRate < 40 ? '#ef4444' : '#10b981',
                  }}
                ></div>
              </div>
              {savingsRate < 40 ? (
                <span className='health-badge bg-red-soft font-bold'>
                  Warning
                </span>
              ) : (
                <span className='health-badge bg-green-soft'>Good</span>
              )}
            </div>

            <div className='health-item'>
              <span className='health-label'>Debt Ratio</span>
              <div className='health-bar-container'>
                <div
                  className='health-bar-fill'
                  style={{
                    width:
                      incomeVal > 0 ? `${Math.min(100, debtRatio)}%` : '0%',
                    backgroundColor: debtRatio <= 30 ? '#10b981' : '#ef4444',
                  }}
                ></div>
              </div>
              <span className='health-badge bg-yellow-soft'>Stable</span>
            </div>

            <div className='mt-8 border-t border-slate-800 pt-4'>
              <span className='savings-label-sm'>Net savings rate</span>
              <div className='savings-rate-lg'>{savingsRate.toFixed(1)}%</div>
              <div
                className='health-bar-container'
                style={{
                  margin: '0',
                  height: '4px',
                  backgroundColor: '#064e3b',
                }}
              >
                <div
                  className='health-bar-fill'
                  style={{
                    width:
                      incomeVal > 0 ? `${Math.min(100, savingsRate)}%` : '0%',
                    backgroundColor: savingsRate < 40 ? '#ef4444' : '#10b981',
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Kotak Kesimpulan Dinamis dari AI Engine */}
          <div className='dash-card' style={{ padding: '1.25rem' }}>
            <div className='flex items-center gap-2 mb-3'>
              <h3 className='dash-card-title'>Financial AI Insight</h3>
              <Sparkles size={16} className='text-yellow-500' />
            </div>
            {isLoading ? (
              <SkeletonLoader type='text' rows={3} />
            ) : (
              <div className='ai-insight-box flex flex-col gap-3'>
                <p className='text-sm text-slate-700 leading-relaxed m-0'>
                  {aiInsight
                    ? aiInsight.description
                    : 'Belum ada wawasan AI yang dapat ditampilkan. Silakan perbarui profil keuangan Anda.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
