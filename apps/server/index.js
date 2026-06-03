import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Mengimpor semua modul rute API yang telah dibuat
import portfolioRoutes from './routes/portfolio.js';
import marketRoutes from './routes/market.js';
import consultantRoutes from './routes/dummyInsight.js';
import labRoutes from './routes/lab.js';
import authRoutes from './routes/auth.js';

// Memuat konfigurasi environment
dotenv.config();

const app = express();

// Mengaktifkan CORS dan parsing JSON
app.use(cors());
app.use(express.json());

// Rute dasar untuk pengujian status server
app.get('/', (req, res) => {
  res.send('Server Vestlytics API beroperasi dengan normal.');
});

// Mendaftarkan seluruh modul rute ke dalam instance Express
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/consultant', consultantRoutes);
app.use('/api/lab', labRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

// Menjalankan server Express
app.listen(PORT, () => {
  console.log(`Server Express berjalan pada port ${PORT}`);
});
