import { useState } from 'react';
import './settings.css';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');

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
                <div className="profile-avatar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div className="profile-info">
                  <span className="profile-name">Crazy Killer</span>
                  <span className="profile-email">crazykiller@email.com</span>
                  <button className="change-photo-btn">Ganti foto profil ↗</button>
                </div>
              </div>

              <div className="settings-form-grid">
                <div className="settings-form-group">
                  <label className="settings-label">Full Name</label>
                  <input type="text" className="settings-input" defaultValue="Crazy Killer" />
                </div>
                <div className="settings-form-group">
                  <label className="settings-label">Username</label>
                  <input type="text" className="settings-input" defaultValue="crazykiller" />
                </div>
                <div className="settings-form-group">
                  <label className="settings-label">Email</label>
                  <input type="email" className="settings-input" defaultValue="crazykiller@email.com" />
                </div>
                <div className="settings-form-group">
                  <label className="settings-label">Phone Number</label>
                  <input type="text" className="settings-input" defaultValue="+62 812 3456 7890" />
                </div>
              </div>

              <div className="settings-actions">
                <button className="btn-save">Save Change</button>
                <button className="btn-cancel">Cancel</button>
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
                    <span className="toggle-title">Two-factor authentication (2FA)</span>
                    <span className="toggle-desc">OTP verification every time you log in from a new device</span>
                  </div>
                  <div className="toggle-switch"></div>
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

                <div className="flex flex-col gap-4 max-w-lg">
                  <div className="settings-form-group">
                    <label className="settings-label">Old password</label>
                    <input type="password" className="settings-input" placeholder="Enter your old password" />
                  </div>
                  <div className="settings-form-group">
                    <label className="settings-label">New password</label>
                    <input type="password" className="settings-input" placeholder="At least 8 characters, a combination of letters and numbers" />
                  </div>
                  <div className="settings-form-group">
                    <label className="settings-label">Confirm new password</label>
                    <input type="password" className="settings-input" placeholder="Re-enter your new password" />
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2">
                    <button className="btn-save" style={{backgroundColor: '#4396b5'}}>Update your password</button>
                    <span className="text-xs text-slate-400">Last updated: 3 months ago</span>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default SettingsPage;
