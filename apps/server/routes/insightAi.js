import express from 'express';
import axios from 'axios';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Menetapkan URL server AI default menggunakan domain Railway untuk environment produksi
const AI_SERVER_URL =
  process.env.AI_SERVER_URL ||
  'https://vestlytics-model-production.up.railway.app';

/**
 * @route   GET /api/consultant/insights
 * @desc    Menghasilkan log wawasan (insight) keuangan. Skor kesehatan dihitung secara internal,
 * sementara teks wawasan dan status didapatkan melalui Model K-Means AI.
 * @access  Private
 */
router.get('/insights', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Mengambil data profil keuangan pengguna secara langsung dari database Supabase
    const { data: profile, error } = await supabase
      .from('financial_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !profile) {
      return res.json({ success: true, data: [] });
    }

    // 2. Melakukan kalkulasi Financial Health Score secara internal berdasarkan metrik keuangan pengguna
    const income = profile.monthly_income || 0;
    const expenses = profile.monthly_expenses || 0;
    const emergency = profile.emergency_fund || 0;
    const debtPayment = profile.monthly_debt_payment || 0;

    const netSavings = income - expenses;
    const savingsRate = income > 0 ? (netSavings / income) * 100 : 0;
    const debtRatio = income > 0 ? (debtPayment / income) * 100 : 0;
    const emergRatio = expenses > 0 ? emergency / expenses : 0;

    const savingsScore = Math.min(35, savingsRate);
    const emergScore = Math.min(35, (emergRatio / 6) * 35);
    const debtScore = Math.max(0, 20 - debtRatio * 0.5);

    const manualHealthScore = Math.round(
      10 + savingsScore + emergScore + debtScore,
    );

    // 3. Menyiapkan payload data yang disesuaikan dengan format endpoint K-Means
    const aiPayload = {
      // Menggunakan nilai netSavings (sisa kas) sebagai proksi untuk modal investasi apabila data portofolio aset belum tersedia
      investment_amount: netSavings > 0 ? netSavings : 0,
      debt_to_income_ratio: income > 0 ? debtPayment / income : 0,
      emergency_fund: emergency,
      monthly_expense_total: expenses,
    };

    let aiInsightText = '';
    let aiTags = [];

    // 4. Meminta hasil analisis dan saran rekomendasi dari AI Engine (FastAPI)
    try {
      // Melakukan permintaan HTTP POST ke endpoint AI untuk mendapatkan financial insight
      const aiResponse = await axios.post(
        `${AI_SERVER_URL}/api/financial-insight`,
        aiPayload,
        {
          timeout: 8000,
        },
      );

      // Mengekstrak wawasan (insight) sesuai dengan struktur respons JSON terbaru dari API AI
      const aiStatus = aiResponse.data.user_status || 'Unverified';
      aiInsightText =
        aiResponse.data.financial_advice_text ||
        'Data berhasil dianalisis oleh AI.';

      // Menyisipkan hasil klasifikasi K-Means ke dalam label tag untuk ditampilkan pada antarmuka pengguna
      aiTags = [
        'AI Consultant',
        `Status: ${aiStatus}`,
        `Health Score: ${manualHealthScore}/100`,
      ];
    } catch (aiErr) {
      console.warn(
        'Peringatan: AI Engine gagal merespons, sistem dialihkan ke mode fallback.',
        aiErr.message,
      );

      // 5. Menerapkan sistem fallback apabila AI Engine mengalami kendala koneksi atau batas waktu (timeout)
      aiInsightText = `Berdasarkan kalkulasi sistem, skor kesehatan finansial Anda adalah ${manualHealthScore}/100. ${
        savingsRate < 40
          ? 'Rasio tabungan Anda berada di bawah batas aman. Disarankan untuk menekan pengeluaran bulanan.'
          : 'Kondisi arus kas Anda sangat baik dan siap untuk melakukan diversifikasi portofolio.'
      }`;
      aiTags = ['System Fallback', `Health Score: ${manualHealthScore}/100`];
    }

    // 6. Memformat data log wawasan agar sesuai dengan struktur yang dibutuhkan oleh komponen UI Frontend
    const insightsData = [
      {
        id: Date.now(),
        type: 'FINANCIAL INSIGHT', // Tipe log disesuaikan agar relevan dengan konteks analisis finansial makro
        title: 'Analisis Kesehatan Finansial (AI)',
        description: aiInsightText,
        tags: aiTags,
        timestamp: new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ];

    return res.status(200).json({
      success: true,
      data: insightsData,
    });
  } catch (error) {
    console.error(
      'Kesalahan internal server pada modul insight:',
      error.message,
    );
    return res
      .status(500)
      .json({ success: false, error: 'Gagal memproses insight portofolio.' });
  }
});

export default router;
