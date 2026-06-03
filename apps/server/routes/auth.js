import express from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// ENDPOINT: PENDAFTARAN PENGGUNA BARU
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan kata sandi wajib diisi.' });
  }

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return res
      .status(400)
      .json({ error: 'Pendaftaran gagal.', details: error.message });
  }
  res.status(201).json({ message: 'Pendaftaran berhasil.', data });
});

// ENDPOINT: AUTENTIKASI MASUK SISTEM
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan kata sandi wajib diisi.' });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return res
      .status(401)
      .json({ error: 'Kredensial tidak valid.', details: error.message });
  }
  res.json({
    message: 'Autentikasi berhasil.',
    token: data.session.access_token,
    user: data.user,
  });
});

// ENDPOINT: AMBIL PROFIL PENGGUNA
router.get('/me', requireAuth, async (req, res) => {
  const user = req.user;
  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || '',
      username: user.user_metadata?.username || '',
      phone_number: user.user_metadata?.phone_number || '',
      avatar_url: user.user_metadata?.avatar_url || ''
    }
  });
});

// ENDPOINT: UPDATE METADATA PROFIL PENGGUNA
router.put('/update-profile', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { full_name, username, phone_number, avatar_url } = req.body;

  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: {
      full_name,
      username,
      phone_number,
      avatar_url
    }
  });

  if (error) {
    return res.status(400).json({ error: 'Gagal memperbarui profil.', details: error.message });
  }

  res.json({
    success: true,
    message: 'Profil berhasil diperbarui.',
    user: {
      id: data.user.id,
      email: data.user.email,
      full_name: data.user.user_metadata?.full_name || '',
      username: data.user.user_metadata?.username || '',
      phone_number: data.user.user_metadata?.phone_number || '',
      avatar_url: data.user.user_metadata?.avatar_url || ''
    }
  });
});

// ENDPOINT: UPDATE PASSWORD PENGGUNA
router.put('/change-password', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const email = req.user.email;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Kata sandi lama dan baru wajib diisi.' });
  }

  // Verifikasi kata sandi lama
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email,
    password: oldPassword,
  });

  if (verifyError) {
    return res.status(400).json({ error: 'Kata sandi lama tidak valid.' });
  }

  // Update kata sandi baru
  const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
    password: newPassword,
  });

  if (updateError) {
    return res.status(400).json({ error: 'Gagal memperbarui kata sandi.', details: updateError.message });
  }

  res.json({
    success: true,
    message: 'Kata sandi berhasil diperbarui.'
  });
});

export default router;
