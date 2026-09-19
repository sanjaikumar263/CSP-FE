import { useState } from 'react';
import { useShop } from '../context/ShopContext';
import './CustomerAuthModal.css';

export default function CustomerAuthModal() {
  const {
    isAuthModalOpen,
    authNotice,
    authTab,
    setAuthTab,
    closeAuthModal,
    customerLogin,
    customerRegister
  } = useShop();

  // Login Form State
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!loginId.trim()) {
      setLoginError('Please enter your email address or mobile number.');
      return;
    }
    if (!loginPassword) {
      setLoginError('Please enter your password.');
      return;
    }

    setLoginLoading(true);
    const res = await customerLogin(loginId, loginPassword);
    setLoginLoading(false);

    if (!res.success) {
      setLoginError(res.message);
    } else {
      setLoginId('');
      setLoginPassword('');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim()) {
      setRegError('Please enter your full name.');
      return;
    }
    if (!regEmail.trim() && !regMobile.trim()) {
      setRegError('Please provide either an email address or a mobile number.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setRegError('Password must be at least 6 characters long.');
      return;
    }

    setRegLoading(true);
    const res = await customerRegister(regName, regEmail, regMobile, regPassword);
    setRegLoading(false);

    if (!res.success) {
      setRegError(res.message);
    } else {
      setRegName('');
      setRegEmail('');
      setRegMobile('');
      setRegPassword('');
    }
  };

  return (
    <div className="cust-modal-overlay" onClick={closeAuthModal}>
      <div className="cust-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="cust-modal-close" onClick={closeAuthModal} aria-label="Close modal">
          ✕
        </button>

        {/* Brand Top Decor */}
        <div className="cust-modal-brand-header">
          <span className="brand-crest">❖</span>
          <h2 className="cust-brand-title">Chennai Silk Palace</h2>
          <p className="cust-brand-sub">Pure Silk Heritage & Luxury Traditions</p>
        </div>

        {/* Notice Banner (If triggered by Add to Cart) */}
        {authNotice && (
          <div className="cust-auth-notice-bar">
            <span className="notice-icon">🛒</span>
            <span>{authNotice}</span>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="cust-modal-tabs">
          <button
            className={`cust-tab-btn ${authTab === 'login' ? 'active' : ''}`}
            onClick={() => { setAuthTab('login'); setLoginError(''); setRegError(''); }}
          >
            SIGN IN
          </button>
          <button
            className={`cust-tab-btn ${authTab === 'register' ? 'active' : ''}`}
            onClick={() => { setAuthTab('register'); setLoginError(''); setRegError(''); }}
          >
            CREATE ACCOUNT
          </button>
        </div>

        {/* SIGN IN FORM */}
        {authTab === 'login' && (
          <form className="cust-auth-form" onSubmit={handleLoginSubmit}>
            {loginError && <div className="cust-error-banner">⚠️ {loginError}</div>}

            <div className="cust-input-group">
              <label htmlFor="cust-login-id">
                Mobile Number or Email Address <span className="req">*</span>
              </label>
              <input
                id="cust-login-id"
                type="text"
                className="cust-input"
                placeholder="e.g. 0123456789 or name@example.com"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="cust-input-group">
              <label htmlFor="cust-login-pass">
                Password <span className="req">*</span>
              </label>
              <input
                id="cust-login-pass"
                type="password"
                className="cust-input"
                placeholder="Enter password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="cust-submit-btn" disabled={loginLoading}>
              {loginLoading ? 'Signing In...' : 'SIGN IN →'}
            </button>

            <div className="cust-form-footer">
              <span>Don't have an account? </span>
              <button
                type="button"
                className="switch-link-btn"
                onClick={() => { setAuthTab('register'); setLoginError(''); }}
              >
                Create one now
              </button>
            </div>
          </form>
        )}

        {/* CREATE ACCOUNT FORM */}
        {authTab === 'register' && (
          <form className="cust-auth-form" onSubmit={handleRegisterSubmit}>
            {regError && <div className="cust-error-banner">⚠️ {regError}</div>}

            <div className="cust-input-group">
              <label htmlFor="cust-reg-name">
                Full Name <span className="req">*</span>
              </label>
              <input
                id="cust-reg-name"
                type="text"
                className="cust-input"
                placeholder="e.g. Priya Sundaram"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                required
              />
            </div>

            <div className="cust-grid-2">
              <div className="cust-input-group">
                <label htmlFor="cust-reg-mobile">Mobile Number</label>
                <input
                  id="cust-reg-mobile"
                  type="tel"
                  className="cust-input"
                  placeholder="e.g. 0123456789"
                  value={regMobile}
                  onChange={(e) => setRegMobile(e.target.value)}
                />
              </div>

              <div className="cust-input-group">
                <label htmlFor="cust-reg-email">Email Address</label>
                <input
                  id="cust-reg-email"
                  type="email"
                  className="cust-input"
                  placeholder="name@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="cust-input-group">
              <label htmlFor="cust-reg-pass">
                Create Password <span className="req">*</span>
              </label>
              <input
                id="cust-reg-pass"
                type="password"
                className="cust-input"
                placeholder="At least 6 characters"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button type="submit" className="cust-submit-btn" disabled={regLoading}>
              {regLoading ? 'Creating Account...' : 'CREATE ACCOUNT →'}
            </button>

            <div className="cust-form-footer">
              <span>Already registered? </span>
              <button
                type="button"
                className="switch-link-btn"
                onClick={() => { setAuthTab('login'); setRegError(''); }}
              >
                Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
