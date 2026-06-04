import { useState, useContext, useEffect, useRef } from 'react';
import { UserFinancialContext } from '../context/UserFinancialContext';
import { api } from '../services/api.js';
import './settings.css';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { userProfile, updateUserProfile, loadingProfile } = useContext(UserFinancialContext);

  // Profile Form States
  const [localFullName, setLocalFullName] = useState('');
  const [localUsername, setLocalUsername] = useState('');
  const [localEmail, setLocalEmail] = useState('');
  const [localPhoneNumber, setLocalPhoneNumber] = useState('');
  const [localAvatar, setLocalAvatar] = useState('');
  const [profileMessage, setProfileMessage] = useState(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const fileInputRef = useRef(null);

  // Security Form States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Sync state with context when loaded
  useEffect(() => {
    if (userProfile) {
      setLocalFullName(userProfile.fullName || '');
      setLocalUsername(userProfile.username || '');
      setLocalEmail(userProfile.email || '');
      setLocalPhoneNumber(userProfile.phoneNumber || '');
      setLocalAvatar(userProfile.avatarUrl || '');
    }
  }, [userProfile]);

  // Handle image selection, compression and base64 encoding
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setProfileMessage({ type: 'error', text: 'Ukuran file gambar maksimal adalah 5MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize canvas to a standard 150x150 size for high performance base64 storage
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 150;
        const MAX_HEIGHT = 150;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setLocalAvatar(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    setProfileMessage(null);
    setIsSavingProfile(true);
    try {
      const res = await api.updateProfile({
        full_name: localFullName,
        username: localUsername,
        phone_number: localPhoneNumber,
        avatar_url: localAvatar
      });

      if (res && res.success) {
        updateUserProfile({
          fullName: localFullName,
          username: localUsername,
          phoneNumber: localPhoneNumber,
          avatarUrl: localAvatar
        });
        setProfileMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
      } else {
        throw new Error(res.error || 'Terjadi kesalahan saat menyimpan profil.');
      }
    } catch (err) {
      setProfileMessage({ type: 'error', text: err.message || 'Gagal memperbarui profil.' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCancelProfile = () => {
    setLocalFullName(userProfile.fullName || '');
    setLocalUsername(userProfile.username || '');
    setLocalPhoneNumber(userProfile.phoneNumber || '');
    setLocalAvatar(userProfile.avatarUrl || '');
    setProfileMessage(null);
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'Kata sandi baru minimal harus 8 karakter.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Konfirmasi kata sandi tidak cocok.' });
      return;
    }

    if (oldPassword === newPassword) {
      setPasswordMessage({ type: 'error', text: 'Kata sandi baru tidak boleh sama dengan kata sandi lama.' });
      return;
    }

    setIsSavingPassword(true);
    try {
      const res = await api.changePassword(oldPassword, newPassword);
      if (res && res.success) {
        setPasswordMessage({ type: 'success', text: 'Kata sandi berhasil diperbarui!' });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        throw new Error(res.error || 'Terjadi kesalahan saat mengganti kata sandi.');
      }
    } catch (err) {
      setPasswordMessage({ type: 'error', text: err.message || 'Gagal memperbarui kata sandi.' });
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in relative min-h-full">
      <div className="settings-container">
        
        {/* Sidebar Tabs */}
        <div className="settings-sidebar">
          <div className="settings-sidebar-label">Account</div>
          <button 
            className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button 
            className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
        </div>

        {/* Content Panel */}
        <div className="settings-panel">
          
          {activeTab === 'profile' && (
            <div className="settings-card animate-fade-in">
              <div className="settings-card-header">
                <h3 className="settings-card-title">Profile information</h3>
                <p className="settings-card-subtitle">Manage your personal information and profile photo</p>
              </div>

              <div className="profile-photo-section">
                <div className="profile-avatar" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {localAvatar ? (
                    <img src={localAvatar} alt="Profile Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 w-12 h-12"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  )}
                </div>
                <div className="profile-info">
                  <span className="profile-name">{localFullName || 'Guest'}</span>
                  <span className="profile-email">{localEmail || 'crazykiller@email.com'}</span>
                  <button 
                    type="button" 
                    className="change-photo-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Ganti foto profil ↗
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handlePhotoChange} 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                  />
                </div>
              </div>

              <div className="settings-form-grid">
                <div className="settings-form-group">
                  <label className="settings-label">Full Name</label>
                  <input 
                    type="text" 
                    className="settings-input" 
                    value={localFullName} 
                    onChange={(e) => setLocalFullName(e.target.value)} 
                  />
                </div>
                <div className="settings-form-group">
                  <label className="settings-label">Username</label>
                  <input 
                    type="text" 
                    className="settings-input" 
                    value={localUsername} 
                    onChange={(e) => setLocalUsername(e.target.value)} 
                  />
                </div>
                <div className="settings-form-group">
                  <label className="settings-label">Email</label>
                  <input 
                    type="email" 
                    className="settings-input" 
                    value={localEmail} 
                    disabled 
                    style={{ opacity: 0.6, cursor: 'not-allowed' }}
                  />
                </div>
                <div className="settings-form-group">
                  <label className="settings-label">Phone Number</label>
                  <input 
                    type="text" 
                    className="settings-input" 
                    value={localPhoneNumber} 
                    onChange={(e) => setLocalPhoneNumber(e.target.value)} 
                  />
                </div>
              </div>

              {profileMessage && (
                <div className={`mt-4 p-3 rounded-lg text-sm font-medium text-center ${
                  profileMessage.type === 'success' 
                    ? 'bg-emerald-50 border border-emerald-100 text-emerald-600' 
                    : 'bg-red-50 border border-red-100 text-red-600'
                }`}>
                  {profileMessage.text}
                </div>
              )}

              <div className="settings-actions">
                <button 
                  className="btn-save" 
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                >
                  {isSavingProfile ? 'Saving...' : 'Save Change'}
                </button>
                <button 
                  className="btn-cancel" 
                  onClick={handleCancelProfile}
                  disabled={isSavingProfile}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="animate-fade-in flex flex-col gap-6">
              
              <div className="settings-card">
                <div className="settings-card-header">
                  <h3 className="settings-card-title">Authentication</h3>
                  <p className="settings-card-subtitle">Manage your login methods and account security</p>
                </div>

                <div className="toggle-row">
                  <div className="toggle-info">
                    <span className="toggle-title">Automatically lock after inactivity</span>
                    <span className="toggle-desc">Automatic logout after 30 minutes of inactivity</span>
                  </div>
                  <div className="toggle-switch"></div>
                </div>
              </div>

              <div className="settings-card">
                <div className="settings-card-header">
                  <h3 className="settings-card-title">Change your password</h3>
                  <p className="settings-card-subtitle">Use a strong and unique password to keep your account secure</p>
                </div>

                <form onSubmit={handleSavePassword} className="flex flex-col gap-4 max-w-lg">
                  <div className="settings-form-group">
                    <label className="settings-label">Old password</label>
                    <input 
                      type="password" 
                      className="settings-input" 
                      placeholder="Enter your old password" 
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="settings-form-group">
                    <label className="settings-label">New password</label>
                    <input 
                      type="password" 
                      className="settings-input" 
                      placeholder="At least 8 characters, a combination of letters and numbers" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="settings-form-group">
                    <label className="settings-label">Confirm new password</label>
                    <input 
                      type="password" 
                      className="settings-input" 
                      placeholder="Re-enter your new password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  {passwordMessage && (
                    <div className={`p-3 rounded-lg text-sm font-medium text-center ${
                      passwordMessage.type === 'success' 
                        ? 'bg-emerald-50 border border-emerald-100 text-emerald-600' 
                        : 'bg-red-50 border border-red-100 text-red-600'
                    }`}>
                      {passwordMessage.text}
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-2">
                    <button 
                      type="submit" 
                      className="btn-save" 
                      style={{ backgroundColor: '#4396b5' }}
                      disabled={isSavingPassword}
                    >
                      {isSavingPassword ? 'Updating...' : 'Update your password'}
                    </button>
                    <span className="text-xs text-slate-400">Last updated: 3 months ago</span>
                  </div>
                </form>

              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default SettingsPage;
