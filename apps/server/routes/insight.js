import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// ENDPOINT: MENGHASILKAN LOG INSIGHT AI (Dummy MLOps Output)
router.get('/insights', requireAuth, (req, res) => {
  // Simulasi respons yang nantinya akan digantikan oleh inferensi model NLP
  const dummyInsights = [
    {
      id: 1,
      type: 'PORTFOLIO OVERVIEW',
      title: 'Portfolio value increased 8.42% — solid performance',
      description:
        'Current value: Rp 8,426,120, with an equivalent invested value. Portfolio score: 7.8/10, with a "Good" risk match. This month\'s performance is above the average for the Indonesian stock market benchmark.',
      tags: ['Score 7.8/10', '+8.42% MoM'],
      timestamp: 'Today, 08:00',
    },
    {
      id: 2,
      type: 'RISK SIGNAL',
      title: 'Volatilitas tinggi terdeteksi pada segmen Stocks',
      description:
        'Stocks (14.2% portofolio) menunjukkan penurunan 24h dan 7d negatif. Sinyal HOLD dikeluarkan. Disarankan tidak menambah posisi hingga tren membaik. Pertimbangkan shift parsial ke Money Market.',
      tags: ['HOLD — Stocks', 'Volatilitas Tinggi'],
      timestamp: 'Today, 08:05',
    },
    {
      id: 3,
      type: 'BUY SIGNAL',
      title: 'Assets 2, 4, and 6 are worth accumulating — BUY signal active',
      description:
        'All three assets have shown a consistent increase of +5.4% over the past 7 days. Momentum is positive and trading volume is on the rise. The AI recommends gradual accumulation with an allocation of 14-30% based on your risk profile.',
      tags: ['BUY — Asset 2', 'BUY — Asset 4', 'BUY — Asset 6'],
      timestamp: 'Today, 08:12',
    },
  ];

  res.json({
    success: true,
    data: dummyInsights,
  });
});

export default router;
