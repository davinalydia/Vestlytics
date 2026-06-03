import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Modal } from '../components/Modal';
import { UserFinancialContext } from '../context/UserFinancialContext';
import { api } from '../services/api';

// Komponen fungsional untuk menampilkan konten Syarat dan Ketentuan (Terms of Service)
const TermsOfServiceContent = () => (
  <>
    <h3>General Nature of the Platform</h3>
    <p>
      Welcome to Vestlytics. Vestlytics is an AI-powered Investment Portfolio
      Analyzer and financial health tracker designed specifically as an
      educational Decision Support System. By using our service, you agree that
      Vestlytics is built to bridge the gap between market trends and personal
      financial awareness to help you build a healthy financial foundation
      before investing.
    </p>

    <h3>No Financial Advice or Broker Integration</h3>
    <p>
      Vestlytics is not a financial advisor. The platform utilizes Deep Learning
      models (LSTM/GRU) to analyze historical data and predict stock trends.
      Vestlytics does not support direct integration with stock broker systems,
      and we do not execute live transactions on your behalf. You are solely
      responsible for any investment decisions you make.
    </p>

    <h3>Simulations and Predictive Analytics</h3>
    <p>
      Features such as the Strategy Lab provide "What If" simulations based on
      parameters you input, including Expected Annual Return, Risk Level, and
      Monthly DCA (Dollar Cost Averaging) contributions. Projections shown for
      Bull Market, Base Case, and Bear Market scenarios are estimates intended
      for educational planning and do not guarantee future market performance.
    </p>
  </>
);

// Komponen fungsional untuk menampilkan konten Kebijakan Privasi (Privacy Policy)
const PrivacyPolicyContent = () => (
  <>
    <h3>Information We Collect</h3>
    <p>
      To provide you with highly personalized AI insights, Vestlytics collects
      information during the 3-Step Onboarding process and ongoing application
      use. The data we collect includes: Basic Information (First name, last
      name, email address, and phone number), Financial Profile (Monthly income,
      monthly expenses, total debt, and the amount of your saved emergency
      fund), Portfolio Data (Your current asset allocations across market
      instruments).
    </p>

    <h3>How We Use Your Data</h3>
    <p>
      Your financial data is never used to judge you, but rather to evaluate
      your "Financial Awareness". We process your data through our Integrated
      Cashflow Engine to calculate your Financial Health Score, Net Savings
      Rate, and your specific Risk Match. This allows our AI Consultant to
      generate context-aware advice tailored exclusively to your wallet's health
      and risk capacity.
    </p>
    <p>
      Vestlytics applies strict risk management strategies, including the use of
      local data storage practices to ensure environment consistency and secure
      data handling.
    </p>

    <h3>Data Sharing and Third Parties</h3>
    <p>
      Vestlytics operates independently as an educational decision-support tool.
      Because direct execution of market trades falls explicitly out of our
      project scope, we do not link your account to, nor do we share your
      personal financial data with, third-party live brokers or trading
      platforms.
    </p>
  </>
);

const RegisterPage = () => {
  // Menginisialisasi variabel state untuk menyimpan data formulir pendaftaran
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('tos');

  const navigate = useNavigate();
  const { updateFinancialData, updateUserProfile } =
    useContext(UserFinancialContext);

  // Fungsi untuk memvalidasi apakah kata sandi memenuhi standar keamanan yang ditetapkan
  const validatePasswordRules = (pass) => {
    return (
      pass.length >= 8 &&
      /[A-Z]/.test(pass) &&
      /\d/.test(pass) &&
      /[^A-Za-z0-9]/.test(pass)
    );
  };

  // Fungsi untuk menghitung skor kekuatan kata sandi berdasarkan kriteria tertentu
  const getPasswordStrength = (pass) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/\d/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  // Fungsi utama untuk menangani proses pendaftaran pengguna baru
  const handleRegister = async (e) => {
    e.preventDefault();

    // Melakukan validasi keamanan kata sandi sebelum mengirim data
    if (!validatePasswordRules(password)) {
      setError('Password does not meet all security requirements.');
      return;
    }
    // Melakukan pengecekan kecocokan konfirmasi kata sandi
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // Menggabungkan nama depan dan nama belakang untuk disimpan sebagai nama lengkap (full name)
      const fullName = `${firstName} ${lastName}`.trim();

      // Memanggil fungsi API untuk mendaftarkan akun baru beserta nama lengkapnya
      await api.register(email, password, fullName);

      // Melakukan login otomatis setelah pendaftaran berhasil
      await api.login(email, password);

      // Memperbarui profil pengguna secara langsung di state global (Context) tanpa menunggu fetch dari backend
      updateUserProfile({
        fullName: fullName,
        username: fullName.split(' ')[0].toLowerCase(),
        email: email,
        phoneNumber: phone,
        avatarUrl: '',
      });

      // Menginisialisasi konteks data finansial pengguna ke nilai default kosong
      updateFinancialData({
        monthlyIncome: '',
        monthlyExpenses: '',
        emergencyFund: '',
        totalDebt: '',
        monthlyDebtPayment: '',
        netWorth: '',
        isProfileCompleted: false,
        assetsList: [], // Mengosongkan daftar aset untuk pengguna baru
        financialTargets: [], // Mengosongkan daftar target untuk pengguna baru
        assets: { stocks: '', gold: '', bonds: '', cash: '' },
      });

      // Mengarahkan pengguna ke halaman dashboard utama
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const strengthScore = getPasswordStrength(password);

  // Fungsi untuk menentukan tampilan indikator kekuatan kata sandi secara dinamis
  const getStrengthDisplay = () => {
    if (password.length === 0)
      return {
        text: '',
        color: 'bg-slate-200',
        bars: 0,
        textColor: 'text-slate-400',
      };
    if (strengthScore === 0)
      return {
        text: 'Very weak',
        color: 'bg-red-500',
        bars: 1,
        textColor: 'text-red-500',
      };
    if (strengthScore <= 2)
      return {
        text: 'Weak',
        color: 'bg-yellow-500',
        bars: 2,
        textColor: 'text-yellow-600',
      };
    if (strengthScore === 3)
      return {
        text: 'Strong',
        color: 'bg-green-500',
        bars: 3,
        textColor: 'text-green-600',
      };
    return {
      text: 'Very strong',
      color: 'bg-green-500',
      bars: 4,
      textColor: 'text-green-600',
    };
  };

  const strengthInfo = getStrengthDisplay();

  return (
    <div className='h-screen flex bg-slate-50 font-sans overflow-hidden animate-fade-in'>
      {/* Panel Kiri - Identitas Visual & Informasi Singkat */}
      <div className='hidden md:flex flex-col w-1/2 bg-[#0d1117] relative overflow-hidden text-white p-12 lg:p-20 justify-center animate-blur-in'>
        {/* Ornamen Latar Belakang Abstrak */}
        <div className='absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-900/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3'></div>
        <div className='absolute bottom-0 left-0 w-[50rem] h-[50rem] bg-purple-900/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4'></div>

        {/* Grafis Panah Ke Atas */}
        <div className='absolute bottom-10 right-20 opacity-30 transform rotate-[15deg]'>
          <svg
            width='350'
            height='350'
            viewBox='0 0 100 100'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M50 0L100 50H75V100H25V50H0L50 0Z'
              fill='url(#paint0_linear_reg)'
            />
            <defs>
              <linearGradient
                id='paint0_linear_reg'
                x1='50'
                y1='0'
                x2='50'
                y2='100'
                gradientUnits='userSpaceOnUse'
              >
                <stop stopColor='#6366f1' />
                <stop offset='1' stopColor='#a855f7' stopOpacity='0' />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className='relative z-10'>
          <div className='flex items-center gap-3 mb-16'>
            <Logo />
            <span className='text-3xl font-semibold tracking-wider'>
              VESTLYTICS
            </span>
          </div>

          <h1 className='text-4xl lg:text-5xl font-bold leading-tight mb-6'>
            Start your <span className='text-cyan-400'>smarter</span>
            <br />
            investment journey
          </h1>
          <p className='text-slate-400 text-lg max-w-md mb-12'>
            Creating an account takes less than 2 minutes. You'll be analyzing
            your portfolio with AI before you know it.
          </p>
        </div>
      </div>

      {/* Panel Kanan - Formulir Pendaftaran */}
      <div className='flex-1 flex flex-col h-full overflow-y-auto bg-slate-50'>
        {/* Navigasi Atas */}
        <div className='w-full p-6 flex justify-end items-center gap-6 text-sm font-medium text-slate-600'>
          <Link to='/' className='hover:text-slate-900 transition-colors'>
            Vestlytics
          </Link>
          <Link
            to='/login'
            className='bg-[#0ea5e9] hover:bg-sky-500 text-white px-5 py-2 rounded-full transition-colors'
          >
            Sign In
          </Link>
        </div>

        <div className='flex-1 flex items-center justify-center p-6 sm:px-12 py-4'>
          <div className='w-full max-w-lg bg-white rounded-2xl p-8 sm:p-10 shadow-[0_0_40px_rgba(0,0,0,0.05)] animate-scale-pop'>
            <h2 className='text-2xl font-bold text-slate-900 mb-2'>
              Create your account
            </h2>
            <p className='text-slate-500 text-sm mb-8'>
              Already have an account?{' '}
              <Link
                to='/login'
                className='text-cyan-500 font-semibold hover:text-cyan-600'
              >
                Sign in here
              </Link>
            </p>

            <form onSubmit={handleRegister} className='space-y-5'>
              <div className='grid grid-cols-2 gap-4'>
                {/* Input Nama Depan */}
                <div>
                  <label className='block text-sm font-semibold text-slate-800 mb-1.5'>
                    First name <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    placeholder='Budi'
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className='w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-colors placeholder:text-slate-400'
                    required
                  />
                </div>
                {/* Input Nama Belakang */}
                <div>
                  <label className='block text-sm font-semibold text-slate-800 mb-1.5'>
                    Last name <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    placeholder='Santoso'
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className='w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-colors placeholder:text-slate-400'
                    required
                  />
                </div>
              </div>

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

              {/* Input Nomor Telepon */}
              <div>
                <label className='block text-sm font-semibold text-slate-800 mb-1.5'>
                  Phone number <span className='text-red-500'>*</span>
                </label>
                <div className='flex rounded-lg border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-cyan-500/20 focus-within:border-cyan-500 transition-all'>
                  <div className='bg-slate-100 px-4 py-2.5 text-slate-500 border-r border-slate-200 flex items-center justify-center font-medium text-sm select-none'>
                    +62
                  </div>
                  <input
                    type='tel'
                    placeholder='812 3456 7890'
                    value={phone}
                    onChange={(e) => {
                      let val = e.target.value;
                      // Menghilangkan angka nol di awal nomor jika pengguna memasukkannya
                      val = val.replace(/^0+/, '');
                      setPhone(val);
                    }}
                    className='flex-1 px-4 py-2.5 focus:outline-none placeholder:text-slate-400 text-slate-900 bg-white'
                    required
                  />
                </div>
              </div>

              {/* Input Kata Sandi */}
              <div>
                <label className='block text-sm font-semibold text-slate-800 mb-1.5'>
                  Password <span className='text-red-500'>*</span>
                </label>
                <div className='relative'>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder='Minimum 8 characters'
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

                {/* Indikator Kekuatan Kata Sandi Dinamis */}
                <div className='flex items-center gap-2 mt-3'>
                  {[1, 2, 3, 4].map((index) => (
                    <div
                      key={index}
                      className={`flex-1 h-1.5 rounded-full transition-colors duration-300 ${
                        strengthInfo.bars >= index
                          ? strengthInfo.color
                          : 'bg-slate-200'
                      }`}
                    ></div>
                  ))}
                  <span
                    className={`text-xs font-bold ml-2 w-16 text-right ${strengthInfo.textColor}`}
                  >
                    {strengthInfo.text}
                  </span>
                </div>

                {/* Daftar Persyaratan Kata Sandi */}
                <div className='text-[11px] mt-2 space-y-1 bg-slate-50 p-2 rounded-md border border-slate-100'>
                  <div className='font-semibold text-slate-700 mb-1'>
                    Password Requirements:
                  </div>
                  <div
                    className={`flex items-center gap-1.5 transition-colors duration-200 ${password.length >= 8 ? 'text-green-600 font-medium' : 'text-slate-500'}`}
                  >
                    <span>{password.length >= 8 ? '✓' : '○'}</span>
                    <span>Minimum 8 characters</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 transition-colors duration-200 ${/[A-Z]/.test(password) ? 'text-green-600 font-medium' : 'text-slate-500'}`}
                  >
                    <span>{/[A-Z]/.test(password) ? '✓' : '○'}</span>
                    <span>At least 1 uppercase letter</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 transition-colors duration-200 ${/\d/.test(password) ? 'text-green-600 font-medium' : 'text-slate-500'}`}
                  >
                    <span>{/\d/.test(password) ? '✓' : '○'}</span>
                    <span>At least 1 number</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 transition-colors duration-200 ${/[^A-Za-z0-9]/.test(password) ? 'text-green-600 font-medium' : 'text-slate-500'}`}
                  >
                    <span>{/[^A-Za-z0-9]/.test(password) ? '✓' : '○'}</span>
                    <span>At least 1 special character</span>
                  </div>
                </div>

                {/* Menampilkan pesan kesalahan jika ada */}
                {error && (
                  <p className='text-red-500 text-xs mt-2 font-medium'>
                    {error}
                  </p>
                )}
              </div>

              {/* Input Konfirmasi Kata Sandi */}
              <div>
                <label className='block text-sm font-semibold text-slate-800 mb-1.5'>
                  Confirm password <span className='text-red-500'>*</span>
                </label>
                <div className='relative'>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder='Re-enter your password'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className='w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-colors placeholder:text-slate-400 pr-10'
                    required
                  />
                  <button
                    type='button'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600'
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Persetujuan Syarat dan Kebijakan */}
              <div className='flex items-start gap-2 pt-1'>
                <input
                  type='checkbox'
                  required
                  className='mt-1 w-4 h-4 rounded border-slate-300 text-cyan-500 focus:ring-cyan-500'
                />
                <span className='text-sm text-slate-600'>
                  I agree to Vestlytics{' '}
                  <button
                    type='button'
                    onClick={() => {
                      setModalType('tos');
                      setIsModalOpen(true);
                    }}
                    className='text-cyan-500 hover:text-cyan-600 font-semibold focus:outline-none'
                  >
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button
                    type='button'
                    onClick={() => {
                      setModalType('privacy');
                      setIsModalOpen(true);
                    }}
                    className='text-cyan-500 hover:text-cyan-600 font-semibold focus:outline-none'
                  >
                    Privacy Policy
                  </button>
                </span>
              </div>

              {/* Tombol Kirim Pendaftaran */}
              <button
                type='submit'
                disabled={isLoading}
                className='w-full bg-[#0ea5e9] hover:bg-sky-500 text-white font-medium py-2.5 rounded-lg transition-colors mt-2 flex items-center justify-center gap-2'
              >
                {isLoading ? (
                  <>
                    <Loader2 className='animate-spin' size={18} />
                    Creating account...
                  </>
                ) : (
                  'Create account & continue'
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

      {/* Komponen Modal untuk menampilkan dokumen hukum */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalType === 'tos' ? 'Terms of Service' : 'Privacy Policy'}
      >
        {modalType === 'tos' ? (
          <TermsOfServiceContent />
        ) : (
          <PrivacyPolicyContent />
        )}
      </Modal>
    </div>
  );
};

export default RegisterPage;
