import express from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Endpoint untuk ambil profil keuangan & hitung skor kesehatan
router.get('/profile', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { data, error } = await supabase
    .from('financial_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116')
    return res
      .status(500)
      .json({ error: 'Gagal memuat profil keuangan pengguna.' });

  const profile = data || {
    monthly_income: 0,
    monthly_expenses: 0,
    total_debt: 0,
  };
  const netSavings = profile.monthly_income - profile.monthly_expenses;
  const savingsRate =
    profile.monthly_income > 0
      ? (netSavings / profile.monthly_income) * 100
      : 0;

  res.json({
    success: true,
    profile_data: profile,
    metrics: {
      net_savings_rate: savingsRate.toFixed(1),
      health_score: savingsRate > 20 ? 72 : 45,
      health_status: 'Good - room to improve',
    },
  });
});

// Endpoint untuk simpan profil keuangan & catat riwayat arus kas
router.post('/profile', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const {
    monthly_income,
    monthly_expenses,
    emergency_fund,
    total_debt,
    monthly_debt_payment,
  } = req.body;

  // 1. Update atau insert data profil utama ke tabel financial_profiles
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

  // 2. Hitung metrik tabungan (savings rate)
  const netSavings = monthly_income - monthly_expenses;
  const savingsRate =
    monthly_income > 0 ? (netSavings / monthly_income) * 100 : 0;

  // 3. Set format bulan saat ini (Contoh: 'May 2026')
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
  const currentMonth = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

  // 4. Simpan riwayat arus kas bulanan ke tabel monthly_cashflow
  const { error: historyError } = await supabase
    .from('monthly_cashflow')
    .insert([
      {
        user_id: userId,
        month_period: currentMonth,
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

// Endpoint untuk ambil data portofolio aset & metrik risiko
router.get('/assets', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { data: assets, error } = await supabase
    .from('user_assets')
    .select('*')
    .eq('user_id', userId);

  // Log error dari Supabase untuk keperluan debugging
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

// Endpoint untuk ambil riwayat arus kas buat tabel di frontend
router.get('/cashflow', requireAuth, async (req, res) => {
  const userId = req.user.id;

  // Ambil data riwayat bulanan, urutkan dari yang terbaru
  const { data, error } = await supabase
    .from('monthly_cashflow')
    .select('month_period, income, expenses, net_savings, savings_rate')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: 'Gagal memuat riwayat arus kas.' });
  }

  res.json({ success: true, history: data });
});

// Endpoint untuk tambah aset baru ke portofolio user
router.post('/assets', requireAuth, async (req, res) => {
  const userId = req.user.id;

  // Terima payload data dari input user
  const { asset_category, value, return_ytd, performance } = req.body;

  // Validasi basic biar data penting tidak kosong
  if (!asset_category || value === undefined) {
    return res
      .status(400)
      .json({ error: 'Kategori aset dan nilainya wajib diisi.' });
  }

  // Insert data aset baru ke tabel user_assets
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
    return res
      .status(500)
      .json({
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
    return res
      .status(500)
      .json({
        error: 'Gagal menghapus aset dari portofolio.',
        details: error.message,
      });
  }

  res.json({ success: true, message: 'Data aset berhasil dihapus.' });
});

// ENDPOINT FINANCIAL TARGETS

// Mengambil seluruh daftar target keuangan pengguna
router.get('/targets', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { data, error } = await supabase
    .from('user_targets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    return res
      .status(500)
      .json({
        error: 'Gagal memuat daftar target keuangan.',
        details: error.message,
      });
  }

  res.json({ success: true, targets: data || [] });
});

// Menambahkan target keuangan baru (Contoh: Dana Darurat, Beli Properti)
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

  res
    .status(201)
    .json({
      success: true,
      message: 'Data target berhasil ditambahkan.',
      target: data,
    });
});

// Memperbarui data target (Mengubah nama, nominal target, atau progress tabungan)
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
    return res
      .status(500)
      .json({
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
