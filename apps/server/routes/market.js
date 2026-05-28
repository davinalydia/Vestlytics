import express from 'express';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

const router = express.Router();

// Mengarahkan path membaca file dataset mentah dari luar direktori aplikasi server
const csvFilePath = path.join(
  process.cwd(),
  '..',
  '..',
  'ai-research',
  'data',
  'stock_data',
  'lq45_clean_dataset.csv',
);

// 1. ENDPOINT: PENYEDIA DATA PASAR SAHAM (Data Aktual Berdasarkan CSV LQ45)
router.get('/feed', (req, res) => {
  const feedData = [];

  // Memeriksa ketersediaan file dataset CSV pada direktori
  if (!fs.existsSync(csvFilePath)) {
    return res.status(404).json({ error: 'Dataset LQ45 tidak ditemukan.' });
  }

  // Menetapkan emiten bawaan sebagai representasi umpan pasar umum
  const defaultTicker = 'BBCA';

  // Membaca dan memproses file CSV menggunakan aliran data (stream)
  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row) => {
      const rowTicker = row.ticker || row.Symbol || row.target_asset;

      // Menyaring data khusus untuk emiten bawaan
      if (rowTicker && rowTicker.toUpperCase() === defaultTicker) {
        feedData.push({
          date: row.date || row.Date || row.tanggal,
          price: parseFloat(row.close || row.Close || row.price || 0),
          volume: parseFloat(row.volume || row.Volume || 0), // Mengekstrak data volume apabila tersedia
        });
      }
    })
    .on('end', () => {
      // Mengambil 15 hari perdagangan terakhir agar visualisasi antarmuka tidak terlalu padat
      const recentData = feedData.slice(-15);

      res.json({
        success: true,
        market_data: recentData,
      });
    })
    .on('error', (error) => {
      res.status(500).json({
        error: 'Gagal memproses data CSV untuk feed pasar.',
        details: error.message,
      });
    });
});

// 2. ENDPOINT: KONVERSI DAN DISTRIBUSI DATASET RISET (CSV ke JSON)
router.get('/ds-research', (req, res) => {
  const results = [];
  if (!fs.existsSync(csvFilePath)) {
    return res.status(404).json({
      success: false,
      error:
        'File dataset analitik tidak ditemukan pada direktori yang dituju.',
    });
  }

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () =>
      res.json({
        success: true,
        total_records: results.length,
        research_data: results,
      }),
    )
    .on('error', (error) =>
      res.status(500).json({
        success: false,
        error: 'Terjadi kegagalan pemrosesan aliran data CSV.',
        details: error.message,
      }),
    );
});

// 3. ENDPOINT: ANALISIS PASAR DAN VISUALISASI GRAFIK (Kombinasi Data CSV dan Simulasi AI)
router.get('/analysis/:ticker', (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  const chartData = []; // Array untuk menampung data grafik aktual dari file CSV

  // Memeriksa ketersediaan file dataset
  if (!fs.existsSync(csvFilePath)) {
    return res
      .status(404)
      .json({ error: 'Dataset LQ45 tidak ditemukan di server.' });
  }

  // Membaca file CSV untuk mengekstrak data historis harga
  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row) => {
      // Menyesuaikan 'ticker' dengan nama kolom pada file CSV (contoh: 'Symbol', 'Kode', dll.)
      const rowTicker = row.ticker || row.Symbol || row.target_asset;

      // Menyaring baris data yang sesuai dengan parameter emiten yang diminta oleh client
      if (rowTicker && rowTicker.toUpperCase() === ticker) {
        chartData.push({
          // Menyesuaikan 'date' dan 'close' dengan tajuk (header) pada file CSV
          date: row.date || row.Date || row.tanggal,
          price: parseFloat(row.close || row.Close || row.price || 0),
        });
      }
    })
    .on('end', () => {
      // Mengambil harga terakhir dari grafik historis sebagai harga saat ini
      const currentPrice =
        chartData.length > 0 ? chartData[chartData.length - 1].price : 9450;

      // Menggabungkan data historis asli dengan prediksi AI tersimulasi
      // Ini masih dummy calculation
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
    })
    .on('error', (error) => {
      res.status(500).json({
        error: 'Gagal mengekstrak data grafik dari CSV.',
        details: error.message,
      });
    });
});

// 4. ENDPOINT: MENGAMBIL DAFTAR SAHAM UNTUK MODAL PENCARIAN
router.get('/available-stocks', (req, res) => {
  // Menggunakan struktur Map untuk menyimpan daftar saham unik agar tidak ada duplikasi
  const uniqueStocks = new Map();

  if (!fs.existsSync(csvFilePath)) {
    return res
      .status(404)
      .json({ error: 'File dataset LQ45 tidak ditemukan.' });
  }

  // Membaca dataset CSV untuk mengumpulkan daftar emiten yang tersedia
  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row) => {
      const ticker = row.ticker || row.Symbol || row.target_asset;

      if (ticker && !uniqueStocks.has(ticker)) {
        // Simulasi nominal harga dan persentase perubahan untuk estetika UI frontend
        const simulatedPrice = Math.floor(Math.random() * 8000) + 2000;
        const simulatedChange = (Math.random() * 5 - 2).toFixed(1);

        uniqueStocks.set(ticker, {
          ticker: ticker.toUpperCase(),
          price: simulatedPrice,
          change_pct: parseFloat(simulatedChange),
        });
      }
    })
    .on('end', () => {
      // Mengonversi struktur Map menjadi Array sebelum dikirim kepada client
      res.json({
        success: true,
        stocks: Array.from(uniqueStocks.values()),
      });
    })
    .on('error', (error) => {
      res.status(500).json({
        error: 'Terjadi kesalahan saat memproses data ketersediaan saham.',
        details: error.message,
      });
    });
});

export default router;
