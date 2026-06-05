# 🚀 Vestlytics - AI-Powered Financial & Portfolio Consultant

Fenomena investasi di kalangan generasi muda saat ini meningkat pesat, namun seringkali didorong oleh faktor FOMO (*Fear of Missing Out*) dan tren media sosial tanpa pemahaman fundamental yang kuat. Banyak investor muda terjun ke pasar modal tanpa kesiapan finansial dasar seperti dana darurat. 

Project kami hadir sebagai solusi *painkiller* untuk meningkatkan literasi keuangan melalui fitur **Financial Health Checker** dan **AI-based Portfolio Analyzer**. Sistem ini menganalisis kesiapan investasi pengguna dan memberikan insight mendalam terhadap portofolio saham mereka menggunakan data historis tanpa memberikan rekomendasi beli/jual secara langsung.

---

## ✨ Key Features

- 📊 **Financial Health Checker:** Evaluasi otomatis rasio tabungan, rasio utang, dan kesiapan dana darurat dengan AI Insight.
- 💸 **Cashflow & Asset Management:** Lacak pemasukan, pengeluaran bulanan, dan kelola portofolio investasi Anda dalam satu *dashboard*.
- 🎯 **Financial Target Tracker:** Tetapkan dan pantau tujuan keuangan masa depan (misal: Beli Rumah, Dana Pensiun) menggunakan *smart templates*.
- 📈 **Market Analysis & AI Forecasting:** Analisis performa saham pilihan menggunakan model prediksi Deep Learning LSTM dan visualisasi grafik historis.
- 🔐 **Secure Authentication:** Sistem login dan register aman berbasis *Supabase Auth*.

---

## 🛠️ Tech Stack

**Frontend:**
- React.js (Vite)
- Recharts (Data Visualization)
- Lucide React (Icons)
- CSS (Custom Styling & Dashboard Layouts)

**Backend:**
- Node.js & Express.js
- RESTful API Architecture

**Database & Auth:**
- Supabase (PostgreSQL & Authentication)

---

## 📋 Prerequisites

Sebelum menjalankan proyek ini di *local environment*, pastikan Anda telah menginstal:
- [Node.js](https://nodejs.org/) (Versi 16.x atau lebih baru)
- npm (Node Package Manager)

---

## ⚙️ Konfigurasi Environment Variables (.env)

Proyek ini membutuhkan kredensial Supabase untuk dapat berjalan.
1. Buat file `.env` di direktori Frontend (`apps/web`) dan Backend (`apps/server`).
2. Tambahkan URL dan Anon Key dari proyek Supabase Anda. 
*(Silakan merujuk pada file `.env.example` yang ada di masing-masing direktori jika tersedia).*

```env
# Contoh isi file .env
VITE_SUPABASE_URL=(https://your-project-id.supabase.co)
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Cara Menjalankan Poject (Local) 

1. Install Dependencies
Buka terminal di root directory proyek Anda, lalu jalankan perintah ini untuk menginstal seluruh package yang dibutuhkan (baik untuk Frontend maupun Backend):
`npm install`

2. Menjalankan Backend (Server)
Buka terminal baru, pastikan Anda berada di root directory, lalu jalankan server backend:
`npm run dev:server`
(Secara default, Backend API akan berjalan di http://localhost:5000)

3. Menjalankan Frontend (Web)
Buka tab terminal satu lagi, lalu jalankan client frontend:
`npm run dev:web`
(Secara default, Frontend Vite akan berjalan di http://localhost:5173)

## Alamat web deployment
[Web Vestlytics](vestlytics-web.netlify.app)

---

## 🤖 Model AI (Untuk Fitur AI)
Anda dapat mengunduh seluruh berkas model yang diperlukan untuk menjalankan fitur prediksi finansial melalui tautan Google Drive di bawah ini:

👉 [Unduh Berkas Model AI Vestlytics di Sini](https://drive.google.com/drive/folders/1D4kVdj5-rA6sLgOBFUXs9O5OUPm-deGi?usp=drive_link)
