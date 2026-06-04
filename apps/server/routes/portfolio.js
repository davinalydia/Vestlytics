import express from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// =======================================================================
// ENDPOINT PROFIL KEUANGAN & ARUS KAS (CASHFLOW)
// =======================================================================

// Endpoint untuk mengambil profil keuangan & menghitung skor kesehatan finansial
router.get('/profile', requireAuth, async (req, res) => {
  const userId = req.user.id;

  const { data, error } = await supabase
    .from('financial_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    return res
      .status(500)
      .json({ error: 'Gagal memuat profil keuangan pengguna.' });
  }

  // Menambahkan fallback untuk monthly_debt_payment agar kalkulasi rasio hutang tidak bernilai undefined
  const profile = data || {
    monthly_income: 0,
    monthly_expenses: 0,
    total_debt: 0,
    monthly_debt_payment: 0,
  };

  const netSavings = profile.monthly_income - profile.monthly_expenses;
  const savingsRate =
    profile.monthly_income > 0
      ? (netSavings / profile.monthly_income) * 100
      : 0;

  // Memperbaiki kalkulasi rasio hutang (DTI) dengan menggunakan cicilan bulanan (monthly_debt_payment)
  const debtRatio =
    profile.monthly_income > 0
      ? (profile.monthly_debt_payment / profile.monthly_income) * 100
      : 0;

  const healthScore = Math.round(
    Math.min(100, Math.max(10, savingsRate * 1.5 + (50 - debtRatio * 0.5))),
  );

  let healthStatus = 'Needs improvement';
  if (healthScore >= 70) healthStatus = 'Good - on track';
  else if (healthScore >= 50) healthStatus = 'Fair - needs attention';

  res.json({
    success: true,
    profile_data: profile,
    metrics: {
      net_savings_rate: savingsRate.toFixed(1),
      health_score: healthScore,
      health_status: healthStatus,
    },
  });
});

// Endpoint untuk menyimpan profil keuangan & mencatat riwayat arus kas
router.post('/profile', requireAuth, async (req, res) => {
  const userId = req.user.id;

  const {
    month_period, // Menangkap parameter periode bulan (format: YYYY-MM) dari klien (frontend)
    monthly_income,
    monthly_expenses,
    emergency_fund,
    total_debt,
    monthly_debt_payment,
  } = req.body;

  // 1. Memperbarui (update) atau memasukkan (insert) data profil utama ke tabel financial_profiles
  const { error: profileError } = await supabase
    .from('financial_profiles')
    .upsert({
      user_id: userId,
      monthly_income,
      monthly_expenses,
      emergency_fund,
      total_debt,
      monthly_debt_payment,
      updated_at: new Date().toISOString(),
    });

  if (profileError) {
    return res
      .status(500)
      .json({ error: 'Gagal memperbarui profil keuangan.' });
  }

  // 2. Menghitung metrik rasio tabungan (savings rate)
  const netSavings = monthly_income - monthly_expenses;
  const savingsRate =
    monthly_income > 0 ? (netSavings / monthly_income) * 100 : 0;

  // 3. Mengonversi format bulan dari input pengguna (Date Picker) ke format baca sistem
  const date = new Date();
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  // Nilai default menggunakan bulan berjalan dari sistem server jika input kosong
  let finalMonthPeriod = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

  // Jika frontend mengirimkan data month_period (format: 'YYYY-MM'), parsing nilainya menjadi 'Bulan Tahun'
  if (month_period) {
    const [year, month] = month_period.split('-');
    if (year && month) {
      finalMonthPeriod = `${monthNames[parseInt(month, 10) - 1]} ${year}`;
    } else {
      finalMonthPeriod = month_period;
    }
  }

  // 4. Menyimpan riwayat arus kas bulanan ke tabel monthly_cashflow
  const { error: historyError } = await supabase
    .from('monthly_cashflow')
    .insert([
      {
        user_id: userId,
        month_period: finalMonthPeriod,
        income: monthly_income,
        expenses: monthly_expenses,
        net_savings: netSavings,
        savings_rate: savingsRate,
      },
    ]);

  if (historyError) {
    return res
      .status(500)
      .json({ error: 'Gagal mencatat riwayat arus kas bulanan.' });
  }

  res.status(200).json({
    success: true,
    message: 'Profil berhasil disimpan dan riwayat bulan ini telah diperbarui.',
  });
});

// Endpoint untuk mengambil riwayat arus kas beserta ID-nya untuk keperluan tabel
router.get('/cashflow', requireAuth, async (req, res) => {
  const userId = req.user.id;

  const { data, error } = await supabase
    .from('monthly_cashflow')
    .select('id, month_period, income, expenses, net_savings, savings_rate')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: 'Gagal memuat riwayat arus kas.' });
  }

  res.json({ success: true, history: data });
});

// Endpoint untuk menghapus seluruh (RESET) riwayat arus kas pengguna
// Catatan: Route ini diletakkan di atas /:id agar parameter 'reset/all' tidak ditangkap sebagai ID
router.delete('/cashflow/reset/all', requireAuth, async (req, res) => {
  const userId = req.user.id;

  const { error } = await supabase
    .from('monthly_cashflow')
    .delete()
    .eq('user_id', userId);

  if (error) {
    return res.status(500).json({
      error: 'Gagal mereset riwayat tabel arus kas.',
      details: error.message,
    });
  }

  res.json({
    success: true,
    message: 'Seluruh riwayat arus kas berhasil direset.',
  });
});

// Endpoint untuk menghapus (DELETE) satu baris riwayat arus kas spesifik berdasarkan ID
router.delete('/cashflow/:id', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const cashflowId = req.params.id;

  const { error } = await supabase
    .from('monthly_cashflow')
    .delete()
    .eq('id', cashflowId)
    .eq('user_id', userId);

  if (error) {
    return res.status(500).json({
      error: 'Gagal menghapus baris riwayat arus kas.',
      details: error.message,
    });
  }

  res.json({ success: true, message: 'Baris riwayat berhasil dihapus.' });
});

// =======================================================================
// ENDPOINT MANAJEMEN ASET
// =======================================================================

// Endpoint untuk mengambil data portofolio aset & metrik risiko simulasi
router.get('/assets', requireAuth, async (req, res) => {
  const userId = req.user.id;

  const { data: assets, error } = await supabase
    .from('user_assets')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error dari Supabase:', error);
    return res
      .status(500)
      .json({ error: 'Gagal memuat rincian aset.', details: error.message });
  }

  res.json({
    success: true,
    assets: assets || [],
    risk_metrics: {
      overall_risk: 'Medium',
      volatility_index: 0.38,
      sharpe_ratio: 1.14,
      max_drawdown: -6.2,
      beta: 0.82,
    },
  });
});

// Endpoint untuk menambahkan aset baru ke dalam portofolio pengguna
router.post('/assets', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { asset_category, value, return_ytd, performance } = req.body;

  if (!asset_category || value === undefined) {
    return res
      .status(400)
      .json({ error: 'Kategori aset dan nilainya wajib diisi.' });
  }

  const { data, error } = await supabase
    .from('user_assets')
    .insert([
      {
        user_id: userId,
        asset_category,
        value,
        return_ytd: return_ytd || 0,
        performance: performance || 'In Line',
        last_updated: new Date().toISOString(),
      },
    ])
    .select();

  if (error) {
    return res.status(500).json({
      error: 'Terjadi kegagalan saat menyimpan data aset baru.',
      details: error.message,
    });
  }

  res.status(201).json({
    success: true,
    message: 'Kategori aset berhasil ditambahkan ke portofolio.',
    asset: data,
  });
});

// Endpoint untuk memperbarui (UPDATE) data aset di dalam portofolio
router.put('/assets/:id', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const assetId = req.params.id;
  const { asset_category, value, return_ytd, performance } = req.body;

  const { data, error } = await supabase
    .from('user_assets')
    .update({
      asset_category,
      value,
      return_ytd,
      performance,
      last_updated: new Date().toISOString(),
    })
    .eq('id', assetId)
    .eq('user_id', userId)
    .select();

  if (error) {
    return res.status(500).json({
      error: 'Gagal memperbarui rincian aset.',
      details: error.message,
    });
  }

  res.json({
    success: true,
    message: 'Data aset berhasil diperbarui.',
    asset: data,
  });
});

// Endpoint untuk menghapus (DELETE) data aset dari portofolio
router.delete('/assets/:id', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const assetId = req.params.id;

  const { error } = await supabase
    .from('user_assets')
    .delete()
    .eq('id', assetId)
    .eq('user_id', userId);

  if (error) {
    return res.status(500).json({
      error: 'Gagal menghapus aset dari portofolio.',
      details: error.message,
    });
  }

  res.json({ success: true, message: 'Data aset berhasil dihapus.' });
});

// =======================================================================
// ENDPOINT FINANCIAL TARGETS
// =======================================================================

// Mengambil seluruh daftar target keuangan pengguna
router.get('/targets', requireAuth, async (req, res) => {
  const userId = req.user.id;

  const { data, error } = await supabase
    .from('user_targets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    return res.status(500).json({
      error: 'Gagal memuat daftar target keuangan.',
      details: error.message,
    });
  }

  res.json({ success: true, targets: data || [] });
});

// Menambahkan target keuangan baru (Contoh: Dana Darurat, Tabungan Properti)
router.post('/targets', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { target_name, target_amount, current_progress } = req.body;

  if (!target_name || !target_amount) {
    return res
      .status(400)
      .json({ error: 'Nama target dan nominal wajib diisi.' });
  }

  const { data, error } = await supabase
    .from('user_targets')
    .insert([
      {
        user_id: userId,
        target_name,
        target_amount,
        current_progress: current_progress || 0,
      },
    ])
    .select();

  if (error) {
    return res
      .status(500)
      .json({ error: 'Gagal menyimpan target baru.', details: error.message });
  }

  res.status(201).json({
    success: true,
    message: 'Data target berhasil ditambahkan.',
    target: data,
  });
});

// Memperbarui data target (Mengubah nama, nominal target, atau perkembangan tabungan)
router.put('/targets/:id', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const targetId = req.params.id;
  const { target_name, target_amount, current_progress } = req.body;

  const { data, error } = await supabase
    .from('user_targets')
    .update({
      target_name,
      target_amount,
      current_progress,
      updated_at: new Date().toISOString(),
    })
    .eq('id', targetId)
    .eq('user_id', userId)
    .select();

  if (error) {
    return res.status(500).json({
      error: 'Gagal memperbarui progress target.',
      details: error.message,
    });
  }

  res.json({
    success: true,
    message: 'Progress target berhasil diperbarui.',
    target: data,
  });
});

// Menghapus data target keuangan dari database
router.delete('/targets/:id', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const targetId = req.params.id;

  const { error } = await supabase
    .from('user_targets')
    .delete()
    .eq('id', targetId)
    .eq('user_id', userId);

  if (error) {
    return res
      .status(500)
      .json({ error: 'Gagal menghapus target.', details: error.message });
  }

  res.json({ success: true, message: 'Data target berhasil dihapus.' });
});

export default router;
