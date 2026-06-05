import { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import {
  Sparkles,
  Loader2,
  Check,
  Trash2,
  X,
  Edit2,
  RotateCcw,
} from 'lucide-react';
import { UserFinancialContext } from '../context/UserFinancialContext';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { OnboardingFallback } from '../components/OnboardingFallback';
import { Modal } from '../components/Modal';
import { api } from '../services/api';

import './myFinances.css';
import './dashboard.css';

const MyFinancesPage = () => {
  const {
    financialData,
    updateFinancialData,
    addAssetCategory,
    deleteAssetCategory,
    addFinancialTarget,
    updateFinancialTarget,
    deleteFinancialTarget,
  } = useContext(UserFinancialContext);

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';
  const setActiveTab = (tab) => setSearchParams({ tab }, { replace: true });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [riskMetrics, setRiskMetrics] = useState(null);
  const [cashflowHistory, setCashflowHistory] = useState([]);
  const [aiInsight, setAiInsight] = useState(null);

  // Menginisialisasi state lokal untuk pengelolaan formulir profil keuangan
  const [monthlyIncome, setMonthlyIncome] = useState(
    financialData.monthlyIncome || '',
  );
  const [monthlyExpenses, setMonthlyExpenses] = useState(
    financialData.monthlyExpenses || '',
  );
  const [emergencyFund, setEmergencyFund] = useState(
    financialData.emergencyFund || '',
  );
  const [totalDebt, setTotalDebt] = useState(financialData.totalDebt || '');
  const [monthlyDebtPayment, setMonthlyDebtPayment] = useState(
    financialData.monthlyDebtPayment || '',
  );

  const [profileMonth, setProfileMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  // Mengelola state untuk jendela modal (popup) penambahan aset portofolio
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [newAssetCategory, setNewAssetCategory] = useState('');
  const [newAssetValue, setNewAssetValue] = useState('');
  const [newAssetReturn, setNewAssetReturn] = useState('');
  const [newAssetPerf, setNewAssetPerf] = useState('In Line');
  const [newAssetDate, setNewAssetDate] = useState(
    () => new Date().toISOString().split('T')[0],
  );

  // Mengelola state untuk jendela modal (popup) konfigurasi target keuangan
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [editingTargetId, setEditingTargetId] = useState(null);
  const [newTargetName, setNewTargetName] = useState('');
  const [newTargetAmount, setNewTargetAmount] = useState('');
  const [newTargetSaved, setNewTargetSaved] = useState('');
  const [newTargetDeadline, setNewTargetDeadline] = useState('');

  // Fungsi utilitas untuk memformat nilai input ke dalam standar Rupiah yang mudah dibaca
  const formatInputVal = (val) => {
    if (
      val === null ||
      val === undefined ||
      val === '' ||
      val === 0 ||
      val === '0'
    )
      return '';
    const strVal = String(val);
    const isNegative = strVal.startsWith('-');
    const cleanNumber = strVal.replace(/[^0-9]/g, '');
    if (!cleanNumber || cleanNumber === '0') return '';
    const formatted = parseInt(cleanNumber, 10).toLocaleString('id-ID');
    return isNegative ? '-' + formatted : formatted;
  };

  useEffect(() => {
    if (financialData) {
      Promise.resolve().then(() => {
        setMonthlyIncome(formatInputVal(financialData.monthlyIncome));
        setMonthlyExpenses(formatInputVal(financialData.monthlyExpenses));
        setEmergencyFund(formatInputVal(financialData.emergencyFund));
        setTotalDebt(formatInputVal(financialData.totalDebt));
        setMonthlyDebtPayment(formatInputVal(financialData.monthlyDebtPayment));
      });
    }
  }, [financialData]);

  // Memuat data portofolio aset, riwayat arus kas, dan analisis AI saat halaman diinisialisasi
  useEffect(() => {
    const loadFinData = async () => {
      setIsLoadingAssets(true);
      try {
        const [assetsRes, cashflowRes, insightsRes] = await Promise.all([
          api.getAssets(),
          api.getCashflow(),
          api.getInsights(),
        ]);

        if (assetsRes && assetsRes.success) {
          if (
            !financialData.assetsList ||
            financialData.assetsList.length === 0
          ) {
            updateFinancialData({ assetsList: assetsRes.assets });
          }
          setRiskMetrics(assetsRes.risk_metrics);
        }
        if (cashflowRes && cashflowRes.success) {
          setCashflowHistory(cashflowRes.history || []);
        }
        if (
          insightsRes &&
          insightsRes.success &&
          insightsRes.data &&
          insightsRes.data.length > 0
        ) {
          setAiInsight(insightsRes.data[0]);
        }
      } catch (err) {
        console.error('Terjadi kesalahan saat memuat data finansial:', err);
      } finally {
        setIsLoadingAssets(false);
      }
    };
    loadFinData();
  }, []);

  // Menangani perubahan numerik pada input profil keuangan pengguna
  const handleNumericChange = (value, setter) => {
    const isNegative = value.startsWith('-');
    const cleanNumber = value.replace(/[^0-9]/g, '');
    if (!cleanNumber) {
      setter('');
      return;
    }
    const formatted = parseInt(cleanNumber, 10).toLocaleString('id-ID');
    setter(isNegative ? '-' + formatted : formatted);
  };

  const parseCleanNum = (val) => {
    if (!val) return 0;
    const strVal = String(val);
    const isNegative = strVal.startsWith('-');
    const cleanNumber = parseInt(strVal.replace(/[^0-9]/g, ''), 10) || 0;
    return isNegative ? -cleanNumber : cleanNumber;
  };

  // Mengekstraksi nilai input pengguna ke dalam format numerik murni untuk perhitungan
  const incVal = parseCleanNum(monthlyIncome);
  const expVal = parseCleanNum(monthlyExpenses);
  const emergVal = parseCleanNum(emergencyFund);

  const totalDebtVal = parseCleanNum(totalDebt);
  const monthlyDebtPaymentVal = parseCleanNum(monthlyDebtPayment);

  const netSavings = incVal - expVal;
  const savingsRate = incVal > 0 ? (netSavings / incVal) * 100 : 0;

  // Menghitung Debt-to-Income (DTI) rasio berdasarkan cicilan bulanan
  const debtRatio = incVal > 0 ? (monthlyDebtPaymentVal / incVal) * 100 : 0;

  const emergencyTarget = expVal * 6;
  const assetsList = financialData.assetsList || [];
  const totalAssetsSum = assetsList.reduce(
    (sum, item) => sum + parseFloat(item.value || 0),
    0,
  );

  const baseAssets = totalAssetsSum > 0 ? totalAssetsSum : emergVal;
  // Melakukan kalkulasi kekayaan bersih total (Total Aset dikurangi Total Beban Hutang)
  const dynamicNetWorth = baseAssets - totalDebtVal;
  const parsedNetWorth = dynamicNetWorth;

  const pieData =
    totalAssetsSum > 0
      ? assetsList.map((item, idx) => {
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
            value: parseFloat(
              ((parseFloat(item.value || 0) / totalAssetsSum) * 100).toFixed(1),
            ),
            color: colors[idx % colors.length],
          };
        })
      : [
          { name: 'Stocks', value: 0, color: '#a855f7' },
          { name: 'Gold', value: 0, color: '#eab308' },
          { name: 'Bonds', value: 0, color: '#f97316' },
          { name: 'Money Market', value: 0, color: '#6366f1' },
        ];

  let cashflowListToUse = [...cashflowHistory];

  if (incVal > 0 && !isSubmitting) {
    const [year, month] = profileMonth.split('-');
    const dateObj = new Date(year, month - 1);
    const formattedMonth = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });

    const isAlreadyExists = cashflowListToUse.some(
      (c) => c.month_period === formattedMonth,
    );

    if (!isAlreadyExists) {
      cashflowListToUse.push({
        id: 'draft-id',
        month_period: `${formattedMonth} (Draft)`,
        income: incVal,
        expenses: expVal,
        net_savings: netSavings,
        savings_rate: savingsRate,
      });
    }
  }

  const sortedCashflow = cashflowListToUse.sort((a, b) => {
    if (a.month_period.includes('(Draft)')) return -1;
    if (b.month_period.includes('(Draft)')) return 1;
    const dateA = new Date(a.month_period);
    const dateB = new Date(b.month_period);
    return dateB - dateA;
  });

  // Mengambil skor kesehatan finansial yang dihitung dari backend untuk menjaga sinkronisasi UI
  const healthScore = financialData.healthScore || 0;
  const healthStatusText = financialData.healthStatus || 'Needs improvement';

  const handleSubmitProfile = async () => {
    setIsSubmitting(true);
    setSuccessMsg('');

    try {
      const payload = {
        month_period: profileMonth,
        monthly_income: incVal,
        monthly_expenses: expVal,
        emergency_fund: emergVal,
        total_debt: totalDebtVal,
        monthly_debt_payment: monthlyDebtPaymentVal,
      };

      await api.saveProfile(payload);

      // Memperbarui secara asinkron seluruh metrik analisis setelah data profil disubmit
      const [assetsRes, cashflowRes, profileRes, insightsRes] =
        await Promise.all([
          api.getAssets(),
          api.getCashflow(),
          api.getProfile(),
          api.getInsights(),
        ]);

      // Menyesuaikan status dan skor kesehatan terbaru
      let newHealthScore = financialData.healthScore;
      let newHealthStatus = financialData.healthStatus;

      if (profileRes && profileRes.success && profileRes.metrics) {
        newHealthScore = profileRes.metrics.health_score;
        newHealthStatus = profileRes.metrics.health_status;
      }

      updateFinancialData({
        monthlyIncome,
        monthlyExpenses,
        emergencyFund,
        totalDebt,
        monthlyDebtPayment,
        netWorth: dynamicNetWorth.toString(),
        isProfileCompleted: true,
        healthScore: newHealthScore,
        healthStatus: newHealthStatus,
      });

      if (assetsRes && assetsRes.success)
        setRiskMetrics(assetsRes.risk_metrics);
      if (cashflowRes && cashflowRes.success)
        setCashflowHistory(cashflowRes.history || []);
      if (
        insightsRes &&
        insightsRes.success &&
        insightsRes.data &&
        insightsRes.data.length > 0
      ) {
        setAiInsight(insightsRes.data[0]);
      }

      setSuccessMsg(
        'Profil keuangan berhasil disimpan & wawasan analisis AI telah diperbarui!',
      );
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCashflow = async (id) => {
    if (id === 'draft-id') return;
    try {
      await api.deleteCashflow(id);
      setCashflowHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Terjadi kendala saat menghapus riwayat arus kas:', err);
    }
  };

  const handleResetCashflow = async () => {
    const isConfirm = window.confirm(
      'Apakah Anda yakin ingin menghapus seluruh riwayat arus kas secara permanen?',
    );
    if (isConfirm) {
      try {
        await api.resetCashflow();
        setCashflowHistory([]);
      } catch (err) {
        console.error(
          'Terjadi kendala saat melakukan reset riwayat arus kas:',
          err,
        );
      }
    }
  };

  const handleDeleteAssetBackend = async (assetRow) => {
    try {
      if (assetRow.id) {
        await api.deleteAsset(assetRow.id);
      }

      deleteAssetCategory(assetRow.asset_category);

      const assetsRes = await api.getAssets();
      if (assetsRes && assetsRes.success) {
        updateFinancialData({ assetsList: assetsRes.assets || [] });
        if (assetsRes.risk_metrics) setRiskMetrics(assetsRes.risk_metrics);
      }
    } catch (error) {
      console.error(
        'Terjadi kegagalan komunikasi saat menghapus aset di server:',
        error,
      );
    }
  };

  const handleSaveNewAsset = async () => {
    if (!newAssetCategory || !newAssetValue) return;

    const newAsset = {
      asset_category: newAssetCategory,
      value: parseCleanNum(newAssetValue),
      return_ytd: parseFloat(newAssetReturn) || 0,
      performance: newAssetPerf,
      last_updated: newAssetDate
        ? new Date(newAssetDate).toISOString()
        : new Date().toISOString(),
    };

    try {
      await api.saveAsset(newAsset);

      const assetsRes = await api.getAssets();
      if (assetsRes && assetsRes.success) {
        updateFinancialData({ assetsList: assetsRes.assets || [] });
        if (assetsRes.risk_metrics) setRiskMetrics(assetsRes.risk_metrics);
      } else {
        addAssetCategory(newAsset);
      }
    } catch (error) {
      console.error(
        'Terjadi kendala operasional saat mengunggah aset ke server:',
        error,
      );
      addAssetCategory(newAsset);
    }

    setIsAssetModalOpen(false);
    setNewAssetCategory('');
    setNewAssetValue('');
    setNewAssetReturn('');
    setNewAssetPerf('In Line');
    setNewAssetDate(new Date().toISOString().split('T')[0]);
  };

  const handleOpenAddTarget = () => {
    setEditingTargetId(null);
    setNewTargetName('');
    setNewTargetAmount('');
    setNewTargetSaved('');
    setNewTargetDeadline('');
    setIsTargetModalOpen(true);
  };

  const handleEditTarget = (target) => {
    setEditingTargetId(target.id);
    setNewTargetName(target.name || target.target_name || '');
    setNewTargetAmount(
      target.targetAmount ? target.targetAmount.toLocaleString('id-ID') : '',
    );
    setNewTargetSaved(target.saved ? target.saved.toLocaleString('id-ID') : '');
    setNewTargetDeadline(target.deadline || '');
    setIsTargetModalOpen(true);
  };

  const handleSaveTarget = () => {
    if (!newTargetName || !newTargetAmount) return;

    const targetData = {
      name: newTargetName,
      targetAmount: parseCleanNum(newTargetAmount),
      saved: parseCleanNum(newTargetSaved),
      deadline: newTargetDeadline,
      isDefault: false,
    };

    if (editingTargetId) {
      updateFinancialTarget(editingTargetId, targetData);
    } else {
      addFinancialTarget(targetData);
    }

    setIsTargetModalOpen(false);
    setEditingTargetId(null);
    setNewTargetName('');
    setNewTargetAmount('');
    setNewTargetSaved('');
    setNewTargetDeadline('');
  };

  return (
    <div className='finances-container animate-fade-in'>
      {/* Tombol Navigasi Konteks Halaman (Tab Switcher) */}
      <div className='tabs-container'>
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
        <div className='profile-grid'>
          {/* Kolom Kiri */}
          <div className='flex-col-gap'>
            {/* Struktur Formulir Pembaruan Profil Keuangan */}
            <div className='dash-card'>
              <div className='dash-card-header'>
                <h3 className='dash-card-title'>Financial Profile</h3>
                <button
                  className='submit-btn flex items-center gap-1.5 min-w-[90px] justify-center'
                  onClick={handleSubmitProfile}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className='animate-spin' size={14} />
                  ) : (
                    'Submit'
                  )}
                </button>
              </div>

              {successMsg && (
                <div className='mb-4 bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in'>
                  <Check size={14} />
                  {successMsg}
                </div>
              )}

              <div className='form-grid'>
                <div className='form-group' style={{ gridColumn: '1 / -1' }}>
                  <label className='form-label' htmlFor='profileMonth'>
                    Month Period
                  </label>
                  <input
                    id='profileMonth'
                    name='profileMonth'
                    type='month'
                    className='form-input w-full px-4 py-2.5 rounded-lg border border-slate-200'
                    value={profileMonth}
                    onChange={(e) => setProfileMonth(e.target.value)}
                    style={{ color: '#0f172a' }}
                    onClick={(e) => {
                      try {
                        e.target.showPicker();
                      } catch {}
                    }}
                  />
                </div>

                <div className='form-group'>
                  <label className='form-label' htmlFor='monthlyIncome'>
                    Monthly Income
                  </label>
                  <div className='form-input-wrapper'>
                    <span className='form-prefix'>Rp</span>
                    <input
                      id='monthlyIncome'
                      name='monthlyIncome'
                      type='text'
                      className='form-input'
                      value={monthlyIncome}
                      onChange={(e) =>
                        handleNumericChange(e.target.value, setMonthlyIncome)
                      }
                      placeholder='e.g. 12.000.000'
                    />
                  </div>
                </div>
                <div className='form-group'>
                  <label className='form-label' htmlFor='monthlyExpenses'>
                    Monthly Expenses
                  </label>
                  <div className='form-input-wrapper'>
                    <span className='form-prefix'>Rp</span>
                    <input
                      id='monthlyExpenses'
                      name='monthlyExpenses'
                      type='text'
                      className='form-input'
                      value={monthlyExpenses}
                      onChange={(e) =>
                        handleNumericChange(e.target.value, setMonthlyExpenses)
                      }
                      placeholder='e.g. 8.000.000'
                    />
                  </div>
                </div>
                <div className='form-group'>
                  <label className='form-label' htmlFor='emergencyFund'>
                    Emergency Fund
                  </label>
                  <div className='form-input-wrapper'>
                    <span className='form-prefix'>Rp</span>
                    <input
                      id='emergencyFund'
                      name='emergencyFund'
                      type='text'
                      className='form-input'
                      value={emergencyFund}
                      onChange={(e) =>
                        handleNumericChange(e.target.value, setEmergencyFund)
                      }
                      placeholder='e.g. 24.000.000'
                    />
                  </div>
                </div>
                <div className='form-group'>
                  <label className='form-label' htmlFor='totalDebt'>
                    Total Debt
                  </label>
                  <div className='form-input-wrapper'>
                    <span className='form-prefix'>Rp</span>
                    <input
                      id='totalDebt'
                      name='totalDebt'
                      type='text'
                      className='form-input'
                      value={totalDebt}
                      onChange={(e) =>
                        handleNumericChange(e.target.value, setTotalDebt)
                      }
                      placeholder='e.g. 24.000.000'
                    />
                  </div>
                </div>
                <div className='form-group'>
                  <label className='form-label' htmlFor='monthlyDebtPayment'>
                    Monthly Debt Payment
                  </label>
                  <div className='form-input-wrapper'>
                    <span className='form-prefix'>Rp</span>
                    <input
                      id='monthlyDebtPayment'
                      name='monthlyDebtPayment'
                      type='text'
                      className='form-input'
                      value={monthlyDebtPayment}
                      onChange={(e) =>
                        handleNumericChange(
                          e.target.value,
                          setMonthlyDebtPayment,
                        )
                      }
                      placeholder='e.g. 2.000.000'
                    />
                  </div>
                </div>

                <div className='form-group'>
                  <label className='form-label' htmlFor='netWorth'>
                    Net Worth (Auto-Calculated)
                  </label>
                  <div
                    className='form-input-wrapper'
                    style={{
                      backgroundColor: '#f1f5f9',
                      borderColor: '#e2e8f0',
                    }}
                  >
                    <span className='form-prefix' style={{ color: '#94a3b8' }}>
                      Rp
                    </span>
                    <input
                      id='netWorth'
                      name='netWorth'
                      type='text'
                      className='form-input'
                      value={dynamicNetWorth.toLocaleString('id-ID')}
                      disabled
                      style={{ cursor: 'not-allowed', color: '#64748b' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Riwayat Tabulasi Arus Kas Bulanan */}
            <div className='dash-card dark'>
              <div
                className='dash-card-header items-center'
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderBottom: 'none',
                  padding: '0 0 1rem 0',
                }}
              >
                <h3 className='dash-card-title text-white mb-0'>
                  Monthly cashflow history
                </h3>
                <button
                  onClick={handleResetCashflow}
                  className='submit-btn text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5'
                  style={{
                    backgroundColor: 'transparent',
                    color: '#ef4444',
                    border: '1px solid #ef4444',
                    cursor: 'pointer',
                  }}
                  title='Reset keseluruhan arsip riwayat data'
                >
                  <RotateCcw size={12} /> Reset Table
                </button>
              </div>

              {isLoadingAssets ? (
                <SkeletonLoader type='table' rows={3} />
              ) : (
                <table className='dark-table'>
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Income</th>
                      <th>Expenses</th>
                      <th>Net savings</th>
                      <th>Savings rate</th>
                      <th style={{ width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedCashflow.length > 0 ? (
                      sortedCashflow.map((row, idx) => (
                        <tr key={row.id || idx}>
                          <td
                            style={{
                              color: row.month_period.includes('Draft')
                                ? '#38bdf8'
                                : 'inherit',
                            }}
                          >
                            {row.month_period}
                          </td>
                          <td>
                            Rp{' '}
                            {parseFloat(row.income || 0).toLocaleString(
                              'id-ID',
                            )}
                          </td>
                          <td>
                            Rp{' '}
                            {parseFloat(row.expenses || 0).toLocaleString(
                              'id-ID',
                            )}
                          </td>
                          <td>
                            Rp{' '}
                            {parseFloat(row.net_savings || 0).toLocaleString(
                              'id-ID',
                            )}
                          </td>
                          <td>
                            {parseFloat(row.savings_rate || 0).toFixed(1)}%
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {!row.month_period.includes('Draft') && (
                              <button
                                onClick={() => handleDeleteCashflow(row.id)}
                                className='text-slate-500 hover:text-red-500 bg-transparent border-none cursor-pointer p-1 transition-colors inline-block'
                                title='Menghapus log arsip terpilih'
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan='6'
                          className='text-center text-slate-500 py-4'
                        >
                          Sistem belum mencatat adanya riwayat arus kas yang
                          tervalidasi.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Kolom Kanan */}
          <div className='flex-col-gap'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Komponen Visualisasi Indikator Kesehatan Finansial */}
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
                        width: incVal > 0 ? '100%' : '0%',
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
                          incVal > 0
                            ? `${Math.min(100, (expVal / incVal) * 100)}%`
                            : '0%',
                        backgroundColor:
                          expVal < incVal * 0.6 ? '#10b981' : '#f59e0b',
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
                          incVal > 0 ? `${Math.min(100, savingsRate)}%` : '0%',
                        backgroundColor:
                          savingsRate < 40 ? '#ef4444' : '#10b981',
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
                          incVal > 0 ? `${Math.min(100, debtRatio)}%` : '0%',
                        backgroundColor:
                          debtRatio <= 30 ? '#10b981' : '#ef4444',
                      }}
                    ></div>
                  </div>
                  <span className='health-badge bg-yellow-soft'>Stable</span>
                </div>

                <div className='mt-6 border-t border-slate-800 pt-4'>
                  <span className='savings-label-sm'>Net savings rate</span>
                  <div
                    className='savings-rate-lg'
                    style={{ fontSize: '1.25rem' }}
                  >
                    {savingsRate.toFixed(1)}%
                  </div>
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
                          incVal > 0 ? `${Math.min(100, savingsRate)}%` : '0%',
                        backgroundColor:
                          savingsRate < 40 ? '#ef4444' : '#10b981',
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Tampilan Numerik Skor Kesehatan Keseluruhan */}
              <div className='dash-card dark health-score-card'>
                <h3 className='dash-card-title text-white w-full text-left mb-6'>
                  Health score
                </h3>
                <div className='circular-score-wrapper'>
                  <svg
                    viewBox='0 0 36 36'
                    className='w-full h-full transform -rotate-90'
                  >
                    <path
                      d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
                      fill='none'
                      stroke='#1e293b'
                      strokeWidth='3'
                    />
                    <path
                      d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
                      fill='none'
                      stroke='#10b981'
                      strokeWidth='3'
                      strokeDasharray={`${healthScore}, 100`}
                    />
                  </svg>
                  <div className='circular-score-text'>
                    <span className='circular-score-value'>{healthScore}</span>
                    <span className='circular-score-sub'>out of 100</span>
                  </div>
                </div>
                <div className='health-status-text'>{healthStatusText}</div>

                <div className='health-metrics-row'>
                  <div className='health-metric-mini'>
                    <span
                      className='health-metric-val'
                      style={{ color: '#10b981' }}
                    >
                      {(emergVal / (expVal > 0 ? expVal : 1)).toFixed(1)}x
                    </span>
                    <span className='health-metric-label'>Emergency fund</span>
                  </div>
                  <div className='health-metric-mini'>
                    <span
                      className='health-metric-val'
                      style={{ color: '#f59e0b' }}
                    >
                      {Math.round(debtRatio)}%
                    </span>
                    <span className='health-metric-label'>Debt ratio</span>
                  </div>
                  <div className='health-metric-mini'>
                    <span
                      className='health-metric-val'
                      style={{ color: '#10b981' }}
                    >
                      {Math.round(savingsRate)}%
                    </span>
                    <span className='health-metric-label'>Savings rate</span>
                  </div>
                </div>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Seksi Implementasi Daftar Tujuan Pembiayaan (Financial Targets) */}
              <div className='dash-card dark flex-1'>
                <div
                  className='dash-card-header items-center'
                  style={{ borderBottom: 'none', padding: '0 0 1.5rem 0' }}
                >
                  <h3 className='dash-card-title text-white'>
                    Financial targets
                  </h3>
                  <button
                    onClick={handleOpenAddTarget}
                    className='submit-btn text-xs font-semibold px-3 py-1.5 rounded-lg'
                    style={{
                      backgroundColor: '#0ea5e9',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Set Up Targets
                  </button>
                </div>

                {(financialData.financialTargets || []).map((target) => {
                  let targetAmount =
                    target.targetAmount || target.target_amount || 0;
                  let savedAmount =
                    target.saved || target.current_progress || 0;

                  if (target.isDefault) {
                    if (target.id === 'emergency') {
                      targetAmount = expVal * 6;
                      savedAmount = emergVal;
                    } else {
                      savedAmount = parsedNetWorth;
                    }
                  }

                  const progress =
                    targetAmount > 0
                      ? Math.min(
                          100,
                          Math.round((savedAmount / targetAmount) * 100),
                        )
                      : 0;

                  return (
                    <div
                      key={target.id || target.name}
                      className='target-item relative group'
                    >
                      <div className='absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity'>
                        <button
                          onClick={() => handleEditTarget(target)}
                          className='text-slate-400 hover:text-sky-400 bg-transparent border-none cursor-pointer p-0'
                          title='Mengubah detail target referensi'
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => deleteFinancialTarget(target.id)}
                          className='text-slate-400 hover:text-red-500 bg-transparent border-none cursor-pointer p-0'
                          title='Menghapus target dari daftar pemantauan'
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className='target-header pr-10'>
                        <span className='target-title'>
                          {target.name || target.target_name}
                        </span>
                        <span
                          className={`target-badge ${progress < 50 ? 'behind' : ''}`}
                        >
                          {progress >= 100
                            ? 'Achieved'
                            : progress >= 50
                              ? 'On track'
                              : 'Behind'}
                        </span>
                      </div>
                      <div className='target-bar-bg'>
                        <div
                          className={`target-bar-fill ${progress < 50 ? 'behind' : ''}`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <div className='target-footer'>
                        <span>
                          Rp {(savedAmount / 1000000).toFixed(1)}M /{' '}
                          {(targetAmount / 1000000).toFixed(1)}M
                        </span>
                        <span>{progress}%</span>
                      </div>
                    </div>
                  );
                })}
                {(!financialData.financialTargets ||
                  financialData.financialTargets.length === 0) && (
                  <div className='text-center text-slate-500 py-4 text-sm'>
                    Belum terdapat target keuangan yang disetel ke dalam sistem.
                  </div>
                )}
              </div>

              {/* Area Penyajian Rekomendasi Algoritmik dari AI (Konsultan Wawasan Dinamis) */}
              <div
                className='dash-card flex-1'
                style={{
                  backgroundColor: '#fdf2f8',
                  borderColor: '#fbcfe8',
                  position: 'relative',
                }}
              >
                <div className='flex items-center gap-2 mb-3'>
                  <h3
                    className='dash-card-title'
                    style={{ color: '#a855f7', margin: 0 }}
                  >
                    AI Consultant Insight
                  </h3>
                  <Sparkles className='text-[#a855f7]' size={16} />
                </div>

                {isSubmitting || isLoadingAssets ? (
                  <SkeletonLoader type='text' rows={3} />
                ) : (
                  <div className='flex flex-col gap-3'>
                    <p className='text-sm text-slate-800 leading-relaxed m-0'>
                      {aiInsight
                        ? aiInsight.description
                        : 'Sistem sedang menganalisis profil Anda. Silakan isi dan simpan data keuangan untuk mendapatkan wawasan terbaru.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'assets' &&
        (!financialData.isProfileCompleted ? (
          <div style={{ gridColumn: '1 / -1' }}>
            <OnboardingFallback
              pageName='Assets Portfolio'
              onUnlock={() => setActiveTab('profile')}
            />
          </div>
        ) : (
          <div className='assets-grid animate-fade-in'>
            {/* Area Penyajian Grafik Lingkaran (Donut Chart) Agregasi Aset */}
            <div className='dash-card'>
              <div className='dash-card-header'>
                <div>
                  <h3 className='dash-card-title'>Asset Breakdown</h3>
                  <p className='dash-card-subtitle'>
                    Overview of assets in your portfolio
                  </p>
                </div>
              </div>

              {isLoadingAssets ? (
                <SkeletonLoader type='pie' />
              ) : (
                <div className='flex flex-col xl:flex-row items-center justify-center gap-8 mt-4'>
                  <div
                    style={{ width: 180, height: 180, position: 'relative' }}
                  >
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={pieData}
                          innerRadius={65}
                          outerRadius={85}
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
                    <div className='absolute inset-0 flex flex-col items-center justify-center pointer-events-none'>
                      <span className='text-4xl font-bold text-slate-800'>
                        {pieData.filter((d) => d.value > 0).length}
                      </span>
                      <span className='text-sm text-slate-500 font-medium'>
                        Assets
                      </span>
                    </div>
                  </div>

                  <div className='flex-1 w-full max-w-[200px] donut-legend'>
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

            {/* Rekapitulasi Matriks Risiko Portofolio Tingkat Lanjut */}
            <div className='dash-card dark flex flex-col justify-center'>
              <h3 className='dash-card-title text-white mb-6'>
                Portfolio Risk Metrics
              </h3>
              {isLoadingAssets ? (
                <SkeletonLoader type='text' rows={4} />
              ) : (
                <>
                  <div className='risk-metrics-grid'>
                    <div className='risk-metric-box'>
                      <span className='risk-metric-title'>Overall risk</span>
                      <span className='risk-metric-value text-yellow-500'>
                        {riskMetrics?.overall_risk || 'Medium'}
                      </span>
                      <span className='risk-metric-sub'>
                        Volatility index:{' '}
                        {riskMetrics?.volatility_index || '0.38'}
                      </span>
                    </div>
                    <div className='risk-metric-box'>
                      <span className='risk-metric-title'>Sharpe ratio</span>
                      <span className='risk-metric-value text-green-500'>
                        {riskMetrics?.sharpe_ratio || '1.14'}
                      </span>
                      <span className='risk-metric-sub'>Above benchmark</span>
                    </div>
                    <div className='risk-metric-box'>
                      <span className='risk-metric-title'>Max drawdown</span>
                      <span className='risk-metric-value text-red-500'>
                        {riskMetrics?.max_drawdown || '-6.2'}%
                      </span>
                      <span className='risk-metric-sub'>Last 12 months</span>
                    </div>
                    <div className='risk-metric-box'>
                      <span className='risk-metric-title'>Beta</span>
                      <span className='risk-metric-value text-white'>
                        {riskMetrics?.beta || '0.82'}
                      </span>
                      <span className='risk-metric-sub'>vs IHSG</span>
                    </div>
                  </div>

                  <div className='mt-2'>
                    <span className='text-xs text-slate-400'>
                      Allocation vs ideal target
                    </span>
                    <div className='allocation-target-bar'>
                      {pieData.map((item, idx) => (
                        <div
                          key={idx}
                          className='alloc-segment'
                          style={{
                            width: `${item.value}%`,
                            backgroundColor: item.color,
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Tabulasi Ekstensif Mengenai Rincian Kategori Aset Terdaftar */}
            <div className='dash-card' style={{ gridColumn: '1 / -1' }}>
              <div
                className='dash-card-header items-center'
                style={{ display: 'flex', justifyContent: 'space-between' }}
              >
                <div className='flex items-center gap-3'>
                  <h3 className='dash-card-title'>Asset Detail</h3>
                  <div className='bg-[#bae6fd] text-[#0369a1] px-4 py-1.5 rounded-full text-xs font-semibold'>
                    {assetsList.length} categories
                  </div>
                </div>
                <button
                  onClick={() => setIsAssetModalOpen(true)}
                  className='submit-btn text-xs font-semibold px-3 py-1.5 rounded-lg'
                  style={{
                    backgroundColor: '#0ea5e9',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Add Asset Category
                </button>
              </div>

              {isLoadingAssets ? (
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
                        <th style={{ width: '40px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {assetsList.map((row, idx) => {
                        const val = parseFloat(row.value || 0);
                        const returnYtd = parseFloat(row.return_ytd || 0);
                        const allocPct =
                          totalAssetsSum > 0
                            ? ((val / totalAssetsSum) * 100).toFixed(1)
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
                            <td style={{ textAlign: 'right' }}>
                              <button
                                onClick={() => handleDeleteAssetBackend(row)}
                                className='text-slate-400 hover:text-red-500 bg-transparent border-none cursor-pointer p-1 flex items-center justify-center transition-colors inline-block'
                                title='Menghapus kategori aset yang terhubung ke server'
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
        ))}

      {/* Tampilan antarmuka dialog modal untuk pengisian spesifikasi aset baru */}
      <Modal
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
        title='Add Asset Category'
        className='large-top-modal'
      >
        <div className='space-y-4 text-left'>
          <div className='bg-indigo-50 border border-indigo-200 text-indigo-800 p-3 rounded-lg text-xs'>
            <strong className='text-indigo-900 block mb-1'>
              AI Asset Idea:
            </strong>
            Need ideas for portfolio diversification? You can add:
            <ul className='list-disc pl-4 mt-1 space-y-1'>
              <li>
                <strong>Mutual Funds</strong>: (Stable growth, YTD Return ~6-8%,
                Performance: "In Line")
              </li>
              <li>
                <strong>Cryptocurrency</strong>: (High risk & volatility, YTD
                Return ~35-50%, Performance: "Outperform")
              </li>
              <li>
                <strong>Real Estate</strong>: (Tangible property value, YTD
                Return ~4-6%, Performance: "In Line")
              </li>
            </ul>
          </div>
          <div className='flex flex-wrap gap-2 mb-2'>
            <span className='text-xs text-slate-500 w-full font-medium'>
              Or choose a template:
            </span>
            <button
              type='button'
              onClick={() => {
                setNewAssetCategory('Cryptocurrency');
                setNewAssetValue('20.000.000');
                setNewAssetReturn('45.0');
                setNewAssetPerf('Outperform');
              }}
              className='bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-2.5 py-1.5 rounded-lg border-none cursor-pointer font-medium'
            >
              Crypto Template
            </button>
            <button
              type='button'
              onClick={() => {
                setNewAssetCategory('Mutual Funds');
                setNewAssetValue('15.000.000');
                setNewAssetReturn('7.5');
                setNewAssetPerf('In Line');
              }}
              className='bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-2.5 py-1.5 rounded-lg border-none cursor-pointer font-medium'
            >
              Mutual Funds Template
            </button>
            <button
              type='button'
              onClick={() => {
                setNewAssetCategory('Real Estate');
                setNewAssetValue('150.000.000');
                setNewAssetReturn('5.0');
                setNewAssetPerf('In Line');
              }}
              className='bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-2.5 py-1.5 rounded-lg border-none cursor-pointer font-medium'
            >
              Real Estate Template
            </button>
          </div>
          <div className='form-group'>
            <label className='form-label' htmlFor='newAssetCategory'>
              Category Name
            </label>
            <input
              id='newAssetCategory'
              type='text'
              className='form-input w-full px-4 py-2.5 rounded-lg border border-slate-200'
              placeholder='e.g. Cryptocurrency'
              style={{ color: '#0f172a' }}
              value={newAssetCategory}
              onChange={(e) => setNewAssetCategory(e.target.value)}
            />
          </div>
          <div className='form-group'>
            <label className='form-label' htmlFor='newAssetValue'>
              Current Value (Rp)
            </label>
            <div className='form-input-wrapper'>
              <span className='form-prefix'>Rp</span>
              <input
                id='newAssetValue'
                type='text'
                className='form-input'
                placeholder='e.g. 10.000.000'
                value={newAssetValue}
                onChange={(e) =>
                  handleNumericChange(e.target.value, setNewAssetValue)
                }
              />
            </div>
          </div>
          <div className='form-group'>
            <label className='form-label' htmlFor='newAssetReturn'>
              YTD Return (%)
            </label>
            <input
              id='newAssetReturn'
              type='number'
              className='form-input w-full px-4 py-2.5 rounded-lg border border-slate-200'
              placeholder='e.g. 12.5'
              step='0.1'
              style={{ color: '#0f172a' }}
              value={newAssetReturn}
              onChange={(e) => setNewAssetReturn(e.target.value)}
            />
          </div>
          <div className='form-group'>
            <label className='form-label' htmlFor='newAssetPerf'>
              Performance Status
            </label>
            <select
              id='newAssetPerf'
              className='form-input w-full px-4 py-2.5 rounded-lg border border-slate-200'
              style={{ color: '#0f172a', appearance: 'auto' }}
              value={newAssetPerf}
              onChange={(e) => setNewAssetPerf(e.target.value)}
            >
              <option value='Outperform'>Outperform</option>
              <option value='In Line'>In Line</option>
              <option value='Underperform'>Underperform</option>
            </select>
          </div>
          <div className='form-group'>
            <label className='form-label' htmlFor='newAssetDate'>
              Date / Tanggal
            </label>
            <input
              id='newAssetDate'
              type='date'
              className='form-input w-full px-4 py-2.5 rounded-lg border border-slate-200'
              style={{ color: '#0f172a' }}
              value={newAssetDate}
              onChange={(e) => setNewAssetDate(e.target.value)}
              onClick={(e) => {
                try {
                  e.target.showPicker();
                } catch {
                  // Fallback fungsionalitas kalender di perangkat tanpa dukungan penuh
                }
              }}
            />
          </div>
          <div className='flex justify-end gap-3 pt-4 border-t border-slate-100'>
            <button
              onClick={() => setIsAssetModalOpen(false)}
              className='px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold'
              style={{ background: 'none', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveNewAsset}
              className='px-4 py-2 rounded-lg text-white font-semibold'
              style={{
                backgroundColor: '#0ea5e9',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Save Asset
            </button>
          </div>
        </div>
      </Modal>

      {/* Tampilan antarmuka dialog modal untuk pengubahan batas target investasi portofolio */}
      <Modal
        isOpen={isTargetModalOpen}
        onClose={() => setIsTargetModalOpen(false)}
        title={
          editingTargetId
            ? 'Edit Financial Target'
            : 'Configure Financial Targets'
        }
        className='large-top-modal'
      >
        <div className='space-y-4 text-left'>
          {!editingTargetId && (
            <>
              <div className='bg-cyan-50 border border-cyan-200 text-cyan-800 p-3 rounded-lg text-xs'>
                <strong className='text-cyan-900 block mb-1'>
                  AI Target Recommendation:
                </strong>
                Based on your monthly surplus of{' '}
                <strong>Rp {netSavings.toLocaleString('id-ID')}</strong>:
                <ul className='list-disc pl-4 mt-1 space-y-1'>
                  <li>
                    An Emergency Fund of{' '}
                    <strong>Rp {(expVal * 6).toLocaleString('id-ID')}</strong>{' '}
                    (6x expenses) is recommended and can be achieved in{' '}
                    <strong>
                      {netSavings > 0
                        ? Math.ceil((expVal * 6 - emergVal) / netSavings)
                        : ' '}{' '}
                      months
                    </strong>
                    .
                  </li>
                  <li>
                    A custom Rp 150M property purchase goal will take{' '}
                    <strong>
                      {netSavings > 0 ? Math.ceil(150000000 / netSavings) : ' '}{' '}
                      months
                    </strong>{' '}
                    of surplus accumulation.
                  </li>
                </ul>
              </div>
              <div className='flex flex-wrap gap-2 mb-2'>
                <span className='text-xs text-slate-500 w-full font-medium'>
                  Or choose a template:
                </span>
                <button
                  type='button'
                  onClick={() => {
                    setNewTargetName('Down Payment for House');
                    setNewTargetAmount('150.000.000');
                    setNewTargetSaved('15.000.000');
                    setNewTargetDeadline('');
                  }}
                  className='bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-2.5 py-1.5 rounded-lg border-none cursor-pointer font-medium'
                >
                  House DP Template
                </button>
                <button
                  type='button'
                  onClick={() => {
                    setNewTargetName('Hajj / Pilgrimage');
                    setNewTargetAmount('50.000.000');
                    setNewTargetSaved('5.000.000');
                    setNewTargetDeadline('');
                  }}
                  className='bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-2.5 py-1.5 rounded-lg border-none cursor-pointer font-medium'
                >
                  Pilgrimage Template
                </button>
                <button
                  type='button'
                  onClick={() => {
                    setNewTargetName('New Car');
                    setNewTargetAmount('250.000.000');
                    setNewTargetSaved('20.000.000');
                    setNewTargetDeadline('');
                  }}
                  className='bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-2.5 py-1.5 rounded-lg border-none cursor-pointer font-medium'
                >
                  New Car Template
                </button>
                <button
                  type='button'
                  onClick={() => {
                    setNewTargetName('Emergency Fund (Extra)');
                    setNewTargetAmount((expVal * 12).toLocaleString('id-ID'));
                    setNewTargetSaved(emergVal.toLocaleString('id-ID'));
                    setNewTargetDeadline('');
                  }}
                  className='bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-2.5 py-1.5 rounded-lg border-none cursor-pointer font-medium'
                >
                  12x Expenses Template
                </button>
              </div>
            </>
          )}

          <div className='form-group'>
            <label className='form-label' htmlFor='newTargetName'>
              Target Goal Name
            </label>
            <input
              id='newTargetName'
              type='text'
              className='form-input w-full px-4 py-2.5 rounded-lg border border-slate-200'
              placeholder='e.g. Marriage or Education Fund'
              style={{ color: '#0f172a' }}
              value={newTargetName}
              onChange={(e) => setNewTargetName(e.target.value)}
            />
          </div>
          <div className='form-group'>
            <label className='form-label' htmlFor='newTargetAmount'>
              Target Amount (Rp)
            </label>
            <div className='form-input-wrapper'>
              <span className='form-prefix'>Rp</span>
              <input
                id='newTargetAmount'
                type='text'
                className='form-input'
                placeholder='e.g. 50.000.000'
                value={newTargetAmount}
                onChange={(e) =>
                  handleNumericChange(e.target.value, setNewTargetAmount)
                }
              />
            </div>
          </div>
          <div className='form-group'>
            <label className='form-label' htmlFor='newTargetSaved'>
              Current Savings (Rp)
            </label>
            <div className='form-input-wrapper'>
              <span className='form-prefix'>Rp</span>
              <input
                id='newTargetSaved'
                type='text'
                className='form-input'
                placeholder='e.g. 5.000.000'
                value={newTargetSaved}
                onChange={(e) =>
                  handleNumericChange(e.target.value, setNewTargetSaved)
                }
              />
            </div>
          </div>
          <div className='form-group'>
            <label className='form-label' htmlFor='newTargetDeadline'>
              Deadline / Timeframe
            </label>
            <input
              id='newTargetDeadline'
              type='date'
              className='form-input w-full px-4 py-2.5 rounded-lg border border-slate-200'
              style={{ color: '#0f172a' }}
              value={newTargetDeadline}
              onChange={(e) => setNewTargetDeadline(e.target.value)}
              onClick={(e) => {
                try {
                  e.target.showPicker();
                } catch {
                  // Menyediakan cadangan pemilihan elemen kalender
                }
              }}
            />
          </div>
          <div className='flex justify-end gap-3 pt-4 border-t border-slate-100'>
            <button
              onClick={() => setIsTargetModalOpen(false)}
              className='px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold'
              style={{ background: 'none', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveTarget}
              className='px-4 py-2 rounded-lg text-white font-semibold'
              style={{
                backgroundColor: '#0ea5e9',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {editingTargetId ? 'Update Goal' : 'Save Goal'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyFinancesPage;
