import { supabase } from '../config/supabase.js';

// Middleware untuk memverifikasi keabsahan token JWT dari antarmuka pengguna
export const requireAuth = async (req, res, next) => {
  // Mengekstrak token dari header permintaan
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res
      .status(401)
      .json({ error: 'Akses ditolak. Token autentikasi tidak ditemukan.' });
  }

  // Memverifikasi token melalui layanan Supabase Auth
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res
      .status(401)
      .json({ error: 'Autentikasi gagal. Token tidak valid.' });
  }

  // Menyisipkan data pengguna ke dalam objek request
  req.user = user;
  next();
};
