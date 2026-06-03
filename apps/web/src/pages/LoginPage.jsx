import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Logo } from '../components/Logo';
import { UserFinancialContext } from '../context/UserFinancialContext';
import { api } from '../services/api';

const LoginPage = () => {
  // Inisialisasi state untuk form login
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  // Mengambil fungsi pembaruan state dari context
  const { updateFinancialData, updateUserProfile } =
    useContext(UserFinancialContext);

  // Fungsi untuk menangani proses login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    let loginSuccess = false;
    try {
      // Melakukan panggilan API untuk autentikasi
      await api.login(email, password, rememberMe);
      loginSuccess = true;
    } catch (err) {
      setError(
        err.message || 'Login gagal. Silakan periksa kembali kredensial Anda.',
      );
      setIsLoading(false);
      return;
    }

    if (loginSuccess) {
      try {
        // Mengambil data metrik portofolio keuangan
        const profileRes = await api.getProfile();
        if (profileRes && profileRes.success) {
          const p = profileRes.profile_data;
          const isCompleted = p.monthly_income > 0 && p.monthly_expenses > 0;
          updateFinancialData({
            monthlyIncome: p.monthly_income ?? '',
            monthlyExpenses: p.monthly_expenses ?? '',
            emergencyFund: p.emergency_fund ?? '',
            totalDebt: p.total_debt ?? '',
            monthlyDebtPayment: p.monthly_debt_payment ?? '',
            isProfileCompleted: isCompleted,
          });
        }

        // Mengambil data profil autentikasi pengguna agar data nama sinkron (menghilangkan hardcode)
        const userRes = await api.getMe();
        if (userRes && userRes.success && userRes.user) {
          updateUserProfile({
            fullName: userRes.user.full_name,
            username: userRes.user.username,
            email: userRes.user.email,
            phoneNumber: userRes.user.phone_number,
            avatarUrl: userRes.user.avatar_url,
          });
        }
      } catch (profileErr) {
        console.error('Gagal memuat detail profil pengguna:', profileErr);
      }

      // Mengarahkan pengguna ke halaman dashboard setelah sinkronisasi selesai
      navigate('/dashboard');
      setIsLoading(false);
    }
  };

  return (
    <div className='h-screen flex bg-slate-50 font-sans overflow-hidden animate-fade-in'>
      {/* Panel Kiri - Branding & Informasi */}
      <div className='hidden md:flex flex-col w-1/2 bg-[#0d1117] relative overflow-hidden text-white p-12 lg:p-20 justify-center animate-blur-in'>
        {/* Bentuk Latar Belakang Abstrak */}
        <div className='absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-900/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3'></div>
        <div className='absolute bottom-0 left-0 w-[50rem] h-[50rem] bg-purple-900/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4'></div>

        <div className='relative z-10'>
          <div className='flex items-center gap-3 mb-16'>
            <Logo />
            <span className='text-3xl font-semibold tracking-wider'>
              VESTLYTICS
            </span>
          </div>

          <div className='inline-block bg-[#0891b2]/20 border border-[#0891b2]/30 text-cyan-400 px-4 py-1.5 rounded-full text-sm font-medium mb-6'>
            • Welcome Back
          </div>
          <h1 className='text-4xl lg:text-5xl font-bold leading-tight mb-6'>
            Log in to your <span className='text-cyan-400'>dashboard</span>
          </h1>
          <p className='text-slate-400 text-lg max-w-md mb-12'>
            Access your AI-powered portfolio insights and continue your smarter
            investment journey.
          </p>
        </div>
      </div>

      {/* Panel Kanan - Formulir Login */}
      <div className='flex-1 flex flex-col h-full overflow-y-auto bg-slate-50'>
        {/* Navigasi Atas */}
        <div className='w-full p-6 flex justify-end items-center gap-6 text-sm font-medium text-slate-600'>
          <Link to='/' className='hover:text-slate-900 transition-colors'>
            Vestlytics
          </Link>
          <Link
            to='/register'
            className='bg-[#0ea5e9] hover:bg-sky-500 text-white px-5 py-2 rounded-full transition-colors'
          >
            Sign Up
          </Link>
        </div>

        <div className='flex-1 flex items-center justify-center p-6 sm:px-12 py-4'>
          <div className='w-full max-w-lg bg-white rounded-2xl p-8 sm:p-10 shadow-[0_0_40px_rgba(0,0,0,0.05)] animate-scale-pop'>
            <h2 className='text-2xl font-bold text-slate-900 mb-2'>
              Welcome back
            </h2>
            <p className='text-slate-500 text-sm mb-8'>
              Don't have an account?{' '}
              <Link
                to='/register'
                className='text-cyan-500 font-semibold hover:text-cyan-600'
              >
                Create one here
              </Link>
            </p>

            <form onSubmit={handleLogin} className='space-y-5'>
              {/* Input Email */}
              <div>
                <label className='block text-sm font-semibold text-slate-800 mb-1.5'>
                  Email address <span className='text-red-500'>*</span>
                </label>
                <input
                  type='email'
                  placeholder='you@example.com'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-colors placeholder:text-slate-400'
                  required
                />
              </div>

              {/* Input Kata Sandi */}
              <div>
                <div className='flex justify-between items-center mb-1.5'>
                  <label className='block text-sm font-semibold text-slate-800'>
                    Password <span className='text-red-500'>*</span>
                  </label>
                  <Link
                    to='/forgot-password'
                    className='text-xs text-cyan-500 hover:text-cyan-600 font-semibold transition-colors'
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className='relative'>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder='Enter your password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className='w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-colors placeholder:text-slate-400 pr-10'
                    required
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600'
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Opsi Ingat Saya */}
              <div className='flex items-start gap-2 pt-1'>
                <input
                  type='checkbox'
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className='mt-1 w-4 h-4 rounded border-slate-300 text-cyan-500 focus:ring-cyan-500'
                />
                <span className='text-sm text-slate-600'>
                  Keep me signed in
                </span>
              </div>

              {/* Pesan Kesalahan */}
              {error && (
                <div className='text-red-500 text-sm font-medium mt-2 bg-red-50 border border-red-100 rounded-lg p-2 text-center animate-fade-in'>
                  {error}
                </div>
              )}

              {/* Tombol Kirim */}
              <button
                type='submit'
                disabled={isLoading}
                className='w-full bg-[#0ea5e9] hover:bg-sky-500 text-white font-medium py-2.5 rounded-lg transition-colors mt-2 flex items-center justify-center gap-2'
              >
                {isLoading ? (
                  <>
                    <Loader2 className='animate-spin' size={18} />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Bagian Bawah (Footer) */}
        <div className='w-full flex justify-between items-center px-8 py-6 text-xs text-slate-500 border-t border-slate-100'>
          <span>Copyright 2026 © CC26-PSU313</span>
          <span className='font-bold tracking-widest text-slate-800'>
            VEST<span className='font-light'>LYTICS</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
