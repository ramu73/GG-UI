import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  GOOGLE_CLIENT_ID, 
  FACEBOOK_APP_ID, 
  loadGoogleScript, 
  loadFacebookScript 
} from '../utils/oauthService';
import OAuthAccountModal from './OAuthAccountModal';
import '../styles/LoginPage.css';

export default function LoginPage({ onBackToStorefront, isAdminPortal = false }) {
  const { 
    loginWithCredentials, 
    loginWithGoogle, 
    loginWithFacebook 
  } = useAuth();

  // Default credentials: Admin credentials are pre-filled by default. Customer fields start blank.
  const [username, setUsername] = useState(isAdminPortal ? 'admin' : '');
  const [password, setPassword] = useState(isAdminPortal ? 'godavari2026' : '');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [oauthModal, setOauthModal] = useState({ isOpen: false, provider: 'google' });

  useEffect(() => {
    if (isAdminPortal) {
      setUsername('admin');
      setPassword('godavari2026');
    } else {
      setUsername('');
      setPassword('');
    }
  }, [isAdminPortal]);

  const googleBtnRef = useRef(null);

  // Initialize official Google Identity Services if client ID is configured
  useEffect(() => {
    if (GOOGLE_CLIENT_ID) {
      loadGoogleScript()
        .then(google => {
          if (google?.accounts?.id && googleBtnRef.current) {
            google.accounts.id.initialize({
              client_id: GOOGLE_CLIENT_ID,
              callback: (response) => {
                loginWithGoogle({ credential: response.credential });
              }
            });
            google.accounts.id.renderButton(googleBtnRef.current, {
              theme: 'outline',
              size: 'large',
              width: 380,
              text: 'continue_with'
            });
          }
        })
        .catch(err => console.warn('Google Identity Services load error:', err));
    }

    if (FACEBOOK_APP_ID) {
      loadFacebookScript().catch(err => console.warn('Facebook SDK load error:', err));
    }
  }, []);

  const handleCredentialsSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    const res = loginWithCredentials(username, password, { isForAdmin: isAdminPortal });
    if (!res.success) {
      setErrorMessage(res.error);
    }
  };

  const handleGoogleClick = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      if (GOOGLE_CLIENT_ID && window.google?.accounts?.oauth2) {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'email profile openid',
          callback: async (tokenResp) => {
            if (tokenResp.access_token) {
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResp.access_token}` }
              });
              const info = await res.json();
              const authRes = await loginWithGoogle({
                credential: null,
                customAccount: {
                  email: info.email,
                  name: info.name
                },
                isForAdmin: isAdminPortal
              });
              if (authRes && authRes.success === false) {
                setErrorMessage(authRes.error);
              }
            }
          }
        });
        tokenClient.requestAccessToken();
      } else {
        // Open Google Account dialog to ask for Google account details
        setOauthModal({ isOpen: true, provider: 'google' });
      }
    } catch (err) {
      console.error('Google login error:', err);
      setErrorMessage('Google Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookClick = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      if (FACEBOOK_APP_ID && window.FB) {
        window.FB.login((response) => {
          if (response.authResponse) {
            window.FB.api('/me', { fields: 'id,name,email,picture.type(large)' }, async (userData) => {
              const authRes = await loginWithFacebook({ fbUser: userData, isForAdmin: isAdminPortal });
              if (authRes && authRes.success === false) {
                setErrorMessage(authRes.error);
              }
            });
          } else {
            setErrorMessage('Facebook login was cancelled.');
          }
        }, { scope: 'public_profile,email' });
      } else {
        // Open Facebook Account dialog to ask for Facebook account details
        setOauthModal({ isOpen: true, provider: 'facebook' });
      }
    } catch (err) {
      console.error('Facebook login error:', err);
      setErrorMessage('Facebook login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      {/* 1. Left Showcase Panel (Farm Visuals & Social Proof) */}
      <div className="login-showcase-panel">
        <div className="login-showcase-overlay"></div>

        <div className="login-showcase-content">
          {/* Top Brand Bar */}
          <div className="showcase-brand-header">
            <a href="#" className="showcase-brand-logo" onClick={onBackToStorefront}>
              <div className="showcase-brand-icon">
                <span>🍄</span>
              </div>
              <div>
                <div className="showcase-brand-name">GODAVARI GROWN</div>
                <div className="showcase-brand-tagline">Pure Organic Basin Farm</div>
              </div>
            </a>

            <div className="showcase-status-badge">
              <span className="showcase-pulse-dot"></span>
              <span>{isAdminPortal ? 'Admin Gateway' : 'Farm Operations Active'}</span>
            </div>
          </div>

          {/* Middle Story & Metrics */}
          <div className="showcase-narrative">
            <span className="showcase-tag">
              {isAdminPortal ? 'Administrative Operations' : 'Regional Agri-Tech Network'}
            </span>
            <h1 className="showcase-title">
              Cultivating Purity in the <span>Godavari Basin</span>
            </h1>
            <p className="showcase-description">
              {isAdminPortal
                ? 'Internal ground vendor survey intake, commercial price tracking, and interstate sourcing flow matrix across East and West Godavari.'
                : 'Fresh organic mushroom harvests delivered at dawn in 24 hours across East & West Godavari, with certified zero-pesticide purity.'}
            </p>

            <div className="showcase-metrics-grid">
              <div className="showcase-metric-card">
                <div className="showcase-metric-val">450+ Kg</div>
                <div className="showcase-metric-label">Daily Basin Harvest</div>
              </div>
              <div className="showcase-metric-card">
                <div className="showcase-metric-val">24h Express</div>
                <div className="showcase-metric-label">Dawn-to-Kitchen Delivery</div>
              </div>
              <div className="showcase-metric-card">
                <div className="showcase-metric-val">100% Purity</div>
                <div className="showcase-metric-label">Chemical-Free Certified</div>
              </div>
            </div>
          </div>

          {/* Bottom Endorsement Box */}
          <div className="showcase-endorsement">
            <div>
              <div className="endorsement-text">
                "Direct farm-to-kitchen harvest delivery with guaranteed fresh daily batches across East & West Godavari."
              </div>
              <span className="endorsement-author">
                — Chef Murthy, Executive Chef, Godavari Grand Hotels
              </span>
            </div>
            <Award size={28} color="#fde68a" style={{ flexShrink: 0 }} />
          </div>
        </div>
      </div>

      {/* 2. Right Authentication Form Panel */}
      <div className="login-form-panel">
        {/* Top bar with back to storefront action */}
        <div className="login-form-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>🌿</span>
            <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--primary-800)' }}>
              {isAdminPortal ? 'Admin Portal' : 'Customer Account'}
            </span>
          </div>

          <button 
            type="button" 
            className="login-guest-link"
            onClick={onBackToStorefront}
          >
            <span>Return to Storefront</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Center Main Form */}
        <div className="login-form-wrapper">
          <div className="login-form-header">
            <h2>{isAdminPortal ? 'Administrator Portal' : 'Welcome back'}</h2>
            <p>
              {isAdminPortal
                ? 'Internal operations & field survey intake. Default administrator credentials have been inserted below.'
                : 'Enter your credentials or connect via social login to access your orders and express delivery.'}
            </p>
          </div>

          {/* Admin Protected Notice (Only on /admin) */}
          {isAdminPortal && (
            <div className="realtime-alert-admin">
              <ShieldCheck size={22} style={{ flexShrink: 0, marginTop: '2px', color: '#b45309' }} />
              <div>
                <strong>Restricted Operational Access</strong>
                <span>
                  Default administrator credentials are pre-configured below. External SSO (Google / Facebook) and account registration are disabled.
                </span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="admin-error-msg" style={{ marginBottom: '16px' }}>
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Credentials Form (For Admin: prefilled default credentials. For Customer: blank inputs) */}
          <form onSubmit={handleCredentialsSubmit} className="realtime-auth-form">
            <div className="realtime-field">
              <label htmlFor="login-username" className="realtime-label">
                {isAdminPortal ? 'Administrator Username' : 'Username or Email'}
              </label>
              <div className="realtime-input-box">
                <User size={18} className="realtime-input-icon" />
                <input
                  id="login-username"
                  type="text"
                  className="realtime-input"
                  placeholder={isAdminPortal ? 'admin' : 'name@example.com or username'}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="realtime-field">
              <div className="realtime-label-row">
                <label htmlFor="login-password" className="realtime-label">
                  {isAdminPortal ? 'Administrator Access Key / Password' : 'Password'}
                </label>
                {!isAdminPortal && (
                  <a 
                    href="#forgot" 
                    className="realtime-forgot-link"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("To recover credentials, please contact: support@godavarigrown.in");
                    }}
                  >
                    Forgot password?
                  </a>
                )}
              </div>
              <div className="realtime-input-box">
                <Lock size={18} className="realtime-input-icon" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="realtime-input"
                  placeholder={isAdminPortal ? 'godavari2026' : 'Enter password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="realtime-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password view"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="realtime-options-row">
              <label className="realtime-remember-checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember this device for 30 days</span>
              </label>
            </div>

            <button type="submit" className="btn-realtime-submit" disabled={isLoading}>
              <span>{isAdminPortal ? 'Sign In as Administrator' : 'Sign In to Account'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Under the form: Admin has NO Google/Facebook or registration. Customers have Google/FB OAuth */}
          {isAdminPortal ? (
            <div style={{ marginTop: '22px', textAlign: 'center', fontSize: '0.80rem', color: '#64748b', lineHeight: 1.5 }}>
              <span>🔒 Admin access is restricted to default operational credentials. Sign in with Google, Facebook, and external credential creation are strictly disabled.</span>
            </div>
          ) : (
            <>
              {/* Divider */}
              <div className="realtime-divider">
                <span>Or continue with OAuth</span>
              </div>

              {/* Down Below: Google & Facebook OAuth for Customers */}
              <div className="realtime-oauth-stack">
                {GOOGLE_CLIENT_ID ? (
                  <div ref={googleBtnRef} style={{ display: 'flex', justifyContent: 'center' }}></div>
                ) : (
                  <button
                    type="button"
                    className="btn-sso-google"
                    onClick={handleGoogleClick}
                    disabled={isLoading}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.37 7.33 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.63 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                )}

                <button
                  type="button"
                  className="btn-sso-facebook"
                  onClick={handleFacebookClick}
                  disabled={isLoading}
                >
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Continue with Facebook</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer Security Badges */}
        <div className="login-form-footer">
          <div className="security-badge-item">
            <Lock size={13} color="#16a34a" />
            <span>256-bit SSL Encrypted</span>
          </div>
          <div className="security-badge-item">
            <span>FSSAI Lic. #10123000000000</span>
          </div>
          <div>
            <span>© {new Date().getFullYear()} Godavari Grown</span>
          </div>
        </div>
      </div>

      {/* Google / Facebook Account Details Input Modal (Customers only) */}
      <OAuthAccountModal 
        isOpen={oauthModal.isOpen}
        provider={oauthModal.provider}
        onClose={() => setOauthModal({ isOpen: false, provider: 'google' })}
        isAdminPortal={false}
      />
    </div>
  );
}
