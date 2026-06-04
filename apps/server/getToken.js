import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Menghubungkan ke layanan klien Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
);

const getMyToken = async () => {
  // Mengatur kredensial surel dan kata sandi untuk keperluan pengujian
  const email = 'argy.tester@gmail.com';
  const password = 'PasswordSuperAman123!';

  console.log('Mencoba melakukan autentikasi masuk...');

  // Memulai proses masuk dengan kata sandi
  let { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // Apabila terjadi kegagalan karena akun belum terdaftar, sistem akan melakukan pendaftaran otomatis
  if (error) {
    console.log(
      'Akun belum terdaftar. Sistem sedang memproses pendaftaran otomatis...',
    );
    const signUpResponse = await supabase.auth.signUp({ email, password });
    data = signUpResponse.data;
  }

  if (data?.session?.access_token) {
    console.log('\n✅ BERHASIL! Berikut adalah token akses Anda:');
    console.log('====================================');
    console.log(data.session.access_token);
    console.log('====================================');
    console.log(
      '\n🔥 Silakan salin token di atas dan masukkan pada tab Headers > Authorization di Thunder Client',
    );
  } else {
    console.log(
      'Gagal mendapatkan token akses. Harap periksa kembali koneksi internet atau konfigurasi berkas .env Anda.',
    );
  }
};

getMyToken();
