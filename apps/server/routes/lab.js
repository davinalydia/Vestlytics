import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// ENDPOINT: MENJALANKAN SIMULASI STRATEGI (API Simulasi untuk UI user)
router.post('/simulate', requireAuth, (req, res) => {
  // Menangkap muatan data (payload) dari form input user
  const {
    asset,
    initial_investment, 
    start_date,
    end_date,
    expected_return,
    volatility,
    monthly_dca,
  } = req.body;

  // Default value untuk kalkulasi grafik simulasi apabila masukan kosong
  const baseValue = parseFloat(initial_investment) || 8426120;
  const dca = parseFloat(monthly_dca) || 1200000;

  // Fungsi penghasil data grafik simulasi (Akan digantikan dengan output model AI)
  const generateChartData = () => {
    return [
      { month: 'Jun 24', base: baseValue, bull: baseValue, bear: baseValue },
      {
        month: 'Dec 24',
        base: baseValue + dca * 6 * 1.05,
        bull: baseValue + dca * 6 * 1.15,
        bear: baseValue + dca * 6 * 0.95,
      },
      {
        month: 'Jun 25',
        base: baseValue + dca * 12 * 1.1,
        bull: baseValue + dca * 12 * 1.3,
        bear: baseValue + dca * 12 * 0.85,
      },
      {
        month: 'Dec 25',
        base: baseValue + dca * 18 * 1.15,
        bull: baseValue + dca * 18 * 1.45,
        bear: baseValue + dca * 18 * 0.8,
      },
      {
        month: 'Jun 26',
        base: baseValue + dca * 24 * 1.2,
        bull: baseValue + dca * 24 * 1.6,
        bear: baseValue + dca * 24 * 0.75,
      },
    ];
  };

  // Mengirimkan respons terstruktur untuk divisualisasikan oleh UI Client
  res.json({
    success: true,
    summary: {
      portfolio_value: 42190000,
      total_return_pct: 13.3,
      risk_score: 5.5,
      risk_match: 'Medium',
    },
    scenarios: {
      bull: { return_pct: 26.3, final_value: 47020000 },
      base: { return_pct: 13.3, final_value: 42190000 },
      bear: { return_pct: -11.5, final_value: 32950000 },
    },
    chart_data: generateChartData(),
    insight_text:
      'Portfolio value of Rp 42.19M represents a +13.3% total return. Risk profile: Medium (5.5/10). ⚠️ Net savings rate 37.9% is below the 40% target - review monthly expenses to improve readiness. Emergency fund covers 6.0 months — investment-ready. DCA of 1.20M/month compounds growth steadily. Asset allocation reflects a secure liquidity strategy optimal for current market conditions.',
  });
});

export default router;
