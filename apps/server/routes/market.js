import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Inisialisasi koneksi Supabase (Pastikan environment variables sudah di-set)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY; 
const supabase = createClient(supabaseUrl, supabaseKey);

// 1. ENDPOINT: GET DATA FEED SAHAM (Menyediakan data market umum, default: BBCA)
router.get('/feed', async (req, res) => {
  const defaultTicker = 'BBCA';

  try {
    // Mengambil 15 baris data terakhir dari tabel market_data untuk ticker default
    const { data, error } = await supabase
      .from('market_data')
      .select('Date, Close, Volume, Ticker')
      // Menggunakan fungsi ilike untuk mencocokkan format ticker (misal: 'BBCA' atau 'BBCA.JK')
      .ilike('Ticker', `${defaultTicker}%`)
      .order('Date', { ascending: false })
      .limit(15);

    if (error) throw error;

    // Format ulang struktur data agar sesuai dengan kebutuhan frontend
    const formattedData = data
      .map((row) => ({
        date: row.Date,
        price: parseFloat(row.Close || 0),
        volume: parseInt(row.Volume || 0, 10),
      }))
      .reverse(); // Reverse array agar data terurut dari tanggal terlama ke terbaru untuk chart

    res.json({
      success: true,
      market_data: formattedData,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Gagal mengambil data feed dari database.',
      details: error.message,
    });
  }
});

// 2. ENDPOINT: GET RAW DATASET (Mengambil data mentah untuk keperluan riset analitik)
router.get('/ds-research', async (req, res) => {
  try {
    // Membatasi jumlah data yang ditarik untuk mencegah overload pada server
    const { data, error } = await supabase
      .from('market_data')
      .select('*')
      .limit(5000);

    if (error) throw error;

    res.json({
      success: true,
      total_records: data.length,
      research_data: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan saat melakukan query dataset analitik.',
      details: error.message,
    });
  }
});

// 3. ENDPOINT: GET ANALISIS PASAR & GRAFIK (Kombinasi data historis DB dan simulasi insight AI)
router.get('/analysis/:ticker', async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();

  try {
    // Mengambil seluruh riwayat harga berdasarkan ticker yang direquest
    const { data, error } = await supabase
      .from('market_data')
      .select('Date, Close, Ticker')
      .ilike('Ticker', `${ticker}%`)
      .order('Date', { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      return res
        .status(404)
        .json({
          error: `Data historis untuk saham ${ticker} tidak ditemukan.`,
        });
    }

    const chartData = data.map((row) => ({
      date: row.Date,
      price: parseFloat(row.Close || 0),
    }));

    // Mengambil harga penutupan terakhir sebagai harga saat ini (current price)
    const currentPrice = chartData[chartData.length - 1].price;

    // Menggabungkan data historis asli dengan mock-up prediksi AI untuk frontend
    const marketAnalysisData = {
      ticker: ticker,
      current_price: currentPrice,
      chart_historical: chartData,
      prediction_breakdown: {
        short_term_1d: { price: currentPrice * 1.01, change_pct: 0.74 },
        short_term_7d: { price: currentPrice * 1.02, change_pct: 2.43 },
        long_term_1m: { price: currentPrice * 1.04, change_pct: 4.76 },
        long_term_6m: { price: currentPrice * 0.96, change_pct: -3.7 },
      },
      ai_insight: {
        text: `${ticker} is showing short-term bullish momentum based on recent trading volume. Watch for key support levels.`,
        tags: ['Bullish ST', 'Hold / Accumulation'],
      },
    };

    res.json({ success: true, data: marketAnalysisData });
  } catch (error) {
    res.status(500).json({
      error: 'Gagal mengekstrak data grafik dari database.',
      details: error.message,
    });
  }
});

// 4. ENDPOINT: GET DAFTAR SAHAM (Menyediakan list saham untuk fitur dropdown/pencarian di frontend)
router.get('/available-stocks', async (req, res) => {
  try {
    // Mengambil data dari SQL View 'unique_tickers' untuk menghindari limit row 
    // dan menghasilkan query yang jauh lebih efisien dibandingkan query langsung ke tabel utama
    const { data, error } = await supabase
      .from('unique_tickers')
      .select('Ticker');

    if (error) throw error;

    // Menggunakan Map untuk memastikan tidak ada duplikasi data saham pada response
    const uniqueStocks = new Map();

    data.forEach(row => {
      // Menghilangkan format '.JK' agar nama emiten lebih bersih saat ditampilkan di UI
      const cleanTicker = row.Ticker ? row.Ticker.replace('.JK', '').toUpperCase() : null;

      if (cleanTicker && !uniqueStocks.has(cleanTicker)) {
        // Melakukan generate data simulasi (harga dan persentase) untuk kebutuhan visual dummy
        const simulatedPrice = Math.floor(Math.random() * 8000) + 2000;
        const simulatedChange = (Math.random() * 5 - 2).toFixed(1);

        uniqueStocks.set(cleanTicker, {
          ticker: cleanTicker,
          price: simulatedPrice,
          change_pct: parseFloat(simulatedChange),
        });
      }
    });

    res.json({
      success: true,
      stocks: Array.from(uniqueStocks.values()),
    });
  } catch (error) {
    res.status(500).json({
      error: 'Terjadi kesalahan sistem saat mengambil data ketersediaan saham.',
      details: error.message,
    });
  }
});

export default router;
