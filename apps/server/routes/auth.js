import express from 'express';
import { supabase } from '../config/supabase.js';

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

export default router;
