import axios from 'axios';
import { supabase } from '../../config/supabase.js';

const API_URL = 'https://vestlytics.onrender.com/api';

// Membuat instance Axios untuk konfigurasi default secara global
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menyisipkan token autentikasi secara otomatis pada setiap permintaan (request)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vestlytics_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Data tiruan (mock) telah dikosongkan agar pengguna baru tidak melihat data default
const MOCK_DATA = {
  profile: {
    monthly_income: 0,
    monthly_expenses: 0,
    emergency_fund: 0,
    total_debt: 0,
    monthly_debt_payment: 0,
    net_worth: 0,
  },
  assets: [], // Dikosongkan untuk pengguna baru
  cashflow: [], // Dikosongkan untuk pengguna baru
  targets: [], // Dikosongkan untuk pengguna baru
  availableStocks: [
    { ticker: 'BBCA', name: 'Bank Central Asia', sector: 'Finance' },
    { ticker: 'BBRI', name: 'Bank Rakyat Indonesia', sector: 'Finance' },
    { ticker: 'TLKM', name: 'Telkom Indonesia', sector: 'Technology' },
    { ticker: 'ASII', name: 'Astra International', sector: 'Consumer' },
    { ticker: 'GOTO', name: 'GoTo Gojek Tokopedia', sector: 'Technology' },
  ],
  insights: [
    {
      id: Date.now(),
      type: 'FINANCIAL INSIGHT',
      title: 'Analisis Kesehatan Finansial (Fallback)',
      description:
        'Server AI sedang sibuk. Pastikan pengeluaran Anda tidak melebihi pemasukan dan selalu sediakan dana darurat yang cukup.',
      tags: ['System Fallback', 'Status: Offline'],
      timestamp: new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    },
  ],
};

export const api = {
  // ==========================================
  // AUTENTIKASI & PENGGUNA
  // ==========================================

  // Fungsi untuk memproses masuk (login) pengguna
  async login(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      localStorage.setItem('vestlytics_token', data.session.access_token);

      const fullName = data.user?.user_metadata?.full_name || 'Guest';
      const mockProfile = {
        id: data.user.id,
        email: data.user.email,
        full_name: fullName,
        username: fullName.split(' ')[0],
        phone_number: '',
        avatar_url: '',
      };
      localStorage.setItem('vestlytics_user_me', JSON.stringify(mockProfile));

      return { success: true, message: 'Berhasil masuk', user: data.user };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      console.error('Terjadi kesalahan saat login:', errorMessage);
      throw new Error(errorMessage, { cause: err });
    }
  },

  // Fungsi untuk mendaftarkan pengguna baru beserta nama lengkap
  async register(email, password, fullName) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) throw error;

      const mockProfile = {
        id: data.user.id,
        email,
        full_name: fullName,
        username: fullName.split(' ')[0],
        phone_number: '',
        avatar_url: '',
      };
      localStorage.setItem('vestlytics_user_me', JSON.stringify(mockProfile));

      return { success: true, message: 'Berhasil mendaftar', user: data.user };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      console.error('Terjadi kesalahan saat mendaftar:', errorMessage);
      throw new Error(errorMessage, { cause: err });
    }
  },

  // Fungsi untuk memproses keluar (logout) dan membersihkan data sesi lokal
  async logout() {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('vestlytics_token');
      localStorage.removeItem('vestlytics_user_me');
      localStorage.removeItem('vestlytics_profile'); // Menghapus cache profil finansial
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      console.error('Gagal memproses logout:', errorMessage);
      throw new Error(errorMessage, { cause: err });
    }
  },

  // Fungsi untuk mengambil data identitas pengguna saat ini
  async getMe() {
    try {
      const res = await apiClient.get('/auth/me');
      const localProfile = JSON.parse(
        localStorage.getItem('vestlytics_user_me') || '{}',
      );
      if (
        res.data &&
        res.data.user &&
        !res.data.user.full_name &&
        localProfile.full_name
      ) {
        res.data.user.full_name = localProfile.full_name;
      }
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      console.warn('API getMe gagal, menggunakan data lokal:', errorMessage);

      const localProfile = localStorage.getItem('vestlytics_user_me');
      if (localProfile) {
        return {
          success: true,
          isFallback: true,
          error: errorMessage,
          cause: err,
          user: JSON.parse(localProfile),
        };
      }
      return {
        success: true,
        isFallback: true,
        error: errorMessage,
        cause: err,
        user: {
          id: 'mock-1',
          email: 'guest@email.com',
          full_name: 'Guest',
          username: 'guest',
          phone_number: '',
          avatar_url: '',
        },
      };
    }
  },

  // Fungsi untuk memperbarui informasi profil pengguna
  async updateProfile(payload) {
    try {
      const res = await apiClient.put('/auth/update-profile', payload);
      localStorage.setItem('vestlytics_user_me', JSON.stringify(res.data.user));
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      console.error('Gagal memperbarui profil pengguna:', errorMessage);
      throw new Error(errorMessage, { cause: err });
    }
  },

  // Fungsi untuk mengubah kata sandi
  async changePassword(oldPassword, newPassword) {
    try {
      const res = await apiClient.put('/auth/change-password', {
        oldPassword,
        newPassword,
      });
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      console.error('Gagal mengubah kata sandi:', errorMessage);
      throw new Error(errorMessage, { cause: err });
    }
  },

  // ==========================================
  // PROFIL KEUANGAN & ARUS KAS
  // ==========================================

  // Fungsi untuk mengambil profil keuangan
  async getProfile() {
    try {
      const res = await apiClient.get('/portfolio/profile');
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      console.warn('Gagal memuat profil keuangan:', errorMessage);
      return {
        success: true,
        isFallback: true,
        error: errorMessage,
        cause: err,
        profile_data: MOCK_DATA.profile,
        metrics: { health_score: 72 },
      };
    }
  },

  // Fungsi untuk menyimpan (POST) profil keuangan
  async saveProfile(payload) {
    try {
      const res = await apiClient.post('/portfolio/profile', payload);
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      console.error('Gagal menyimpan profil keuangan:', errorMessage);
      throw new Error(errorMessage, { cause: err });
    }
  },

  // Fungsi untuk mengambil riwayat arus kas bulanan
  async getCashflow() {
    try {
      const res = await apiClient.get('/portfolio/cashflow');
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      console.warn('Gagal memuat riwayat arus kas:', errorMessage);
      return {
        success: true,
        isFallback: true,
        error: errorMessage,
        cause: err,
        history: [],
      };
    }
  },

  // Fungsi untuk menghapus 1 baris riwayat arus kas secara spesifik (DELETE)
  async deleteCashflow(id) {
    try {
      const res = await apiClient.delete(`/portfolio/cashflow/${id}`);
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      console.error(`Gagal menghapus arus kas dengan ID ${id}:`, errorMessage);
      throw new Error(errorMessage, { cause: err });
    }
  },

  // Fungsi untuk mereset atau menghapus seluruh riwayat arus kas pengguna (DELETE)
  async resetCashflow() {
    try {
      const res = await apiClient.delete('/portfolio/cashflow/reset/all');
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      console.error('Gagal mereset riwayat arus kas:', errorMessage);
      throw new Error(errorMessage, { cause: err });
    }
  },

  // ==========================================
  // MANAJEMEN ASET (CRUD)
  // ==========================================

  // Fungsi untuk mengambil daftar aset
  async getAssets() {
    try {
      const res = await apiClient.get('/portfolio/assets');
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      console.warn('Gagal memuat daftar aset:', errorMessage);
      return {
        success: true,
        isFallback: true,
        error: errorMessage,
        cause: err,
        assets: MOCK_DATA.assets,
      };
    }
  },

  // Fungsi untuk menambahkan (POST) aset baru
  async saveAsset(payload) {
    try {
      const res = await apiClient.post('/portfolio/assets', payload);
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      console.error('Gagal menyimpan data aset:', errorMessage);
      throw new Error(errorMessage, { cause: err });
    }
  },

  // Fungsi untuk memperbarui (PUT) aset yang sudah ada
  async updateAsset(id, payload) {
    try {
      const res = await apiClient.put(`/portfolio/assets/${id}`, payload);
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      console.error(`Gagal memperbarui aset dengan ID ${id}:`, errorMessage);
      throw new Error(errorMessage, { cause: err });
    }
  },

  // Fungsi untuk menghapus (DELETE) aset
  async deleteAsset(id) {
    try {
      const res = await apiClient.delete(`/portfolio/assets/${id}`);
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      console.error(`Gagal menghapus aset dengan ID ${id}:`, errorMessage);
      throw new Error(errorMessage, { cause: err });
    }
  },

  // ==========================================
  // TARGET KEUANGAN (CRUD)
  // ==========================================

  // Fungsi untuk mengambil seluruh daftar target keuangan
  async getTargets() {
    try {
      const res = await apiClient.get('/portfolio/targets');
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      console.warn('Gagal memuat daftar target keuangan:', errorMessage);
      return {
        success: true,
        isFallback: true,
        error: errorMessage,
        cause: err,
        targets: MOCK_DATA.targets,
      };
    }
  },

  // Fungsi untuk menambahkan (POST) target keuangan baru
  async saveTarget(payload) {
    try {
      const res = await apiClient.post('/portfolio/targets', payload);
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      console.error('Gagal menyimpan target baru:', errorMessage);
      throw new Error(errorMessage, { cause: err });
    }
  },

  // Fungsi untuk memperbarui (PUT) progress atau data target
  async updateTarget(id, payload) {
    try {
      const res = await apiClient.put(`/portfolio/targets/${id}`, payload);
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      console.error(`Gagal memperbarui target dengan ID ${id}:`, errorMessage);
      throw new Error(errorMessage, { cause: err });
    }
  },

  // Fungsi untuk menghapus (DELETE) target keuangan
  async deleteTarget(id) {
    try {
      const res = await apiClient.delete(`/portfolio/targets/${id}`);
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      console.error(`Gagal menghapus target dengan ID ${id}:`, errorMessage);
      throw new Error(errorMessage, { cause: err });
    }
  },

  // ==========================================
  // PASAR & KONSULTAN AI
  // ==========================================

  // Fungsi untuk mengambil daftar saham yang tersedia
  async getAvailableStocks() {
    try {
      const res = await apiClient.get('/market/available-stocks');
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      console.warn('Gagal memuat daftar saham:', errorMessage);
      return {
        success: true,
        isFallback: true,
        error: errorMessage,
        cause: err,
        stocks: MOCK_DATA.availableStocks,
      };
    }
  },

  // Fungsi untuk mendapatkan analisis pasar untuk satu aset/saham spesifik
  async getMarketAnalysis(ticker) {
    try {
      const res = await apiClient.get(`/market/analysis/${ticker}`);
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      console.warn(
        `Gagal memuat analisis pasar untuk ${ticker}:`,
        errorMessage,
      );

      return {
        success: true,
        isFallback: true,
        error: errorMessage,
        cause: err,
        data: {
          ticker,
          current_price: 10000,
          prediction_breakdown: {
            short_term_1d: { price: 10100, change_pct: 1.0 },
            short_term_7d: { price: 10200, change_pct: 2.0 },
            long_term_1m: { price: 10500, change_pct: 5.0 },
            long_term_6m: { price: 9500, change_pct: -5.0 },
          },
          ai_insight: {
            text: 'Simulasi analisis lokal karena server tidak merespons.',
            tags: ['Simulasi'],
          },
        },
      };
    }
  },

  // Fungsi untuk mengambil wawasan AI dari Konsultan Portofolio
  async getInsights() {
    try {
      const res = await apiClient.get('/consultant/insights');
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      console.warn('Gagal memuat wawasan AI:', errorMessage);
      return {
        success: true,
        isFallback: true,
        error: errorMessage,
        cause: err,
        data: MOCK_DATA.insights,
      };
    }
  },
};

export default api;
