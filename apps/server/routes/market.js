import express from 'express';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

const router = express.Router();

// Set path buat baca file dataset CSV dari folder ai-research
const csvFilePath = path.join(
  process.cwd(),
  '..',
  '..',
  'ai-research',
  'data',
  'stock_data',
  'lq45_clean_dataset.csv',
);

// 1. ENDPOINT: GET DATA FEED SAHAM (Buat umpan market umum pake data BBCA)
router.get('/feed', (req, res) => {
  const feedData = [];

  // Cek file CSV-nya ada apa nggak
  if (!fs.existsSync(csvFilePath)) {
    return res.status(404).json({ error: 'Dataset LQ45 tidak ditemukan.' });
  }

  // Ticker default buat nampilin feed market
  const defaultTicker = 'BBCA';

  // Baca dan proses file CSV per baris
  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row) => {
      // Tangkep nama ticker dan hapus format '.JK' dari Yahoo Finance
      const rawTicker = row.Ticker || row.ticker || row.Symbol;
      const cleanTicker = rawTicker
        ? rawTicker.replace('.JK', '').toUpperCase()
        : '';

      // Kalo tickernya match sama BBCA, masukin ke array
      if (cleanTicker === defaultTicker) {
        feedData.push({
          date: row.Date || row.date,
          price: parseFloat(row.Close || row.close || 0),
          volume: parseFloat(row.Volume || row.volume || 0),
        });
      }
    })
    .on('end', () => {
      // Ambil 15 data terakhir aja biar chart frontend ga kepanjangan
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

// 2. ENDPOINT: GET RAW DATASET (Convert CSV mentah ke JSON buat research)
router.get('/ds-research', (req, res) => {
  const results = [];

  if (!fs.existsSync(csvFilePath)) {
    return res.status(404).json({
      success: false,
      error: 'File dataset tidak ditemukan di server.',
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
        error: 'Terjadi error saat membaca aliran data CSV.',
        details: error.message,
      }),
    );
});

// 3. ENDPOINT: GET ANALISIS PASAR & GRAFIK (Gabungan historis CSV + dummy AI)
router.get('/analysis/:ticker', (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  const chartData = [];

  if (!fs.existsSync(csvFilePath)) {
    return res.status(404).json({ error: 'Dataset LQ45 tidak ditemukan.' });
  }

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row) => {
      // Bersihin ticker dari embel-embel '.JK' biar gampang dicocokin
      const rawTicker = row.Ticker || row.ticker || row.Symbol;
      const cleanTicker = rawTicker
        ? rawTicker.replace('.JK', '').toUpperCase()
        : '';

      // Filter baris data sesuai ticker yang diminta dari URL params
      if (cleanTicker === ticker) {
        chartData.push({
          date: row.Date || row.date,
          price: parseFloat(row.Close || row.close || 0),
        });
      }
    })
    .on('end', () => {
      // Ambil harga terakhir buat dijadiin current price
      const currentPrice =
        chartData.length > 0 ? chartData[chartData.length - 1].price : 9450;

      // Racik data historis asli sama prediksi AI dummy buat frontend
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

// 4. ENDPOINT: GET DAFTAR SAHAM (Buat list dropdown/modal search di frontend)
router.get('/available-stocks', (req, res) => {
  // Pake Map biar list sahamnya ga duplikat
  const uniqueStocks = new Map();

  if (!fs.existsSync(csvFilePath)) {
    return res.status(404).json({ error: 'File dataset tidak ditemukan.' });
  }

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row) => {
      // Tangkep ticker dan buang format '.JK' biar UI keliatan rapi
      const rawTicker = row.Ticker || row.ticker || row.Symbol;
      const cleanTicker = rawTicker
        ? rawTicker.replace('.JK', '').toUpperCase()
        : null;

      if (cleanTicker && !uniqueStocks.has(cleanTicker)) {
        // Bikin harga & persentase random buat dummy UI
        const simulatedPrice = Math.floor(Math.random() * 8000) + 2000;
        const simulatedChange = (Math.random() * 5 - 2).toFixed(1);

        uniqueStocks.set(cleanTicker, {
          ticker: cleanTicker,
          price: simulatedPrice,
          change_pct: parseFloat(simulatedChange),
        });
      }
    })
    .on('end', () => {
      // Ubah Map jadi Array biasa sebelum dikirim ke client
      res.json({
        success: true,
        stocks: Array.from(uniqueStocks.values()),
      });
    })
    .on('error', (error) => {
      res.status(500).json({
        error: 'Terjadi error saat mengambil ketersediaan saham.',
        details: error.message,
      });
    });
});

export default router;
