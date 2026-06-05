import express from 'express';
import axios from 'axios';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Mengambil URL Model AI dari environment variable (default: localhost:8000 untuk pengujian lokal)
const AI_SERVER_URL = process.env.AI_SERVER_URL || 'http://localhost:8000';

/**
 * @route   GET /api/consultant/insights
 * @desc    Menghasilkan log insight. Skor dihitung secara manual,
 * teks insight/saran didapat secara dinamis dari Model AI.
 * @access  Private
 */
router.get('/insights', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Mengambil data profil keuangan pengguna langsung dari database (Supabase)
    const { data: profile, error } = await supabase
      .from('financial_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !profile) {
      // Jika profil belum ada, kembalikan array log kosong agar UI tidak error
      return res.json({ success: true, data: [] });
    }

    // 2. Kalkulasi Financial Health Score secara MANUAL (Sinkron dengan algoritma Dashboard)
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

    // 3. Menyiapkan Payload dasar (tanpa data aset) untuk dikirim ke Model AI
    const aiPayload = {
      ticker: 'BBCA', // Default ticker untuk analisis profil holistik
      monthly_income: income,
      monthly_expense_total: expenses,
      emergency_fund: emergency,
      debt_to_income_ratio: income > 0 ? debtPayment / income : 0,
    };

    let aiInsightText = '';
    let aiTags = [];

    // 4. Meminta teks saran dari AI Engine (FastAPI)
    try {
      const aiResponse = await axios.post(
        `${AI_SERVER_URL}/predict`,
        aiPayload,
        {
          timeout: 8000, // Batas waktu tunggu agar frontend tidak mengalami freeze
        },
      );

      // Mengekstrak insight dari respons model
      aiInsightText =
        aiResponse.data.insight_text ||
        aiResponse.data.insight ||
        'Data berhasil dianalisis oleh AI.';
      aiTags = ['AI Generated', `Health Score: ${manualHealthScore}/100`];
    } catch (aiErr) {
      console.warn(
        'Peringatan: AI Engine gagal merespons, menggunakan mode fallback.',
        aiErr.message,
      );

      // 5. Fallback sistem apabila AI gagal dijangkau
      aiInsightText = `Berdasarkan kalkulasi sistem, skor kesehatan finansial Anda adalah ${manualHealthScore}/100. ${
        savingsRate < 40
          ? 'Rasio tabungan Anda berada di bawah batas aman. Disarankan untuk menekan pengeluaran bulanan.'
          : 'Kondisi arus kas Anda sangat baik dan siap untuk melakukan diversifikasi portofolio.'
      }`;
      aiTags = ['System Fallback', `Health Score: ${manualHealthScore}/100`];
    }

    // 6. Format data log insight agar sesuai dengan ekspektasi komponen UI
    const insightsData = [
      {
        id: Date.now(),
        type: 'PORTFOLIO OVERVIEW',
        title: 'Hasil Analisis AI Consultant',
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
    console.error('Kesalahan internal server:', error.message);
    return res
      .status(500)
      .json({ success: false, error: 'Gagal memproses insight portofolio.' });
  }
});

export default router;
