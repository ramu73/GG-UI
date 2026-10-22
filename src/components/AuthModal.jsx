import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight,
  LogIn,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  GOOGLE_CLIENT_ID, 
  FACEBOOK_APP_ID, 
  loadGoogleScript, 
  loadFacebookScript 
} from '../utils/oauthService';
import OAuthAccountModal from './OAuthAccountModal';
import '../styles/AuthModal.css';

export default function AuthModal() {
  const { 
    authModal, 
    closeAuthModal, 
    loginWithCredentials,
    loginWithGoogle, 
    loginWithFacebook 
  } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [oauthModal, setOauthModal] = useState({ isOpen: false, provider: 'google' });

  const googleBtnRef = useRef(null);

  // Initialize official Google Identity Services button if Client ID exists
  useEffect(() => {
    if (!authModal.isOpen) return;

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
        .catch(err => {
          console.warn('Google Identity Services load error:', err);
        });
    }

    if (FACEBOOK_APP_ID) {
      loadFacebookScript().catch(err => {
        console.warn('Facebook SDK load error:', err);
      });
    }
  }, [authModal.isOpen]);

  if (!authModal.isOpen) return null;

  const handleCredentialsSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    const res = loginWithCredentials(username, password, { isForAdmin: false });
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
              await loginWithGoogle({
                credential: null,
                customAccount: {
                  email: info.email,
                  name: info.name
                },
                isForAdmin: false
              });
            }
          }
        });
        tokenClient.requestAccessToken();
      } else {
        // Prompt for Google account details
        setOauthModal({ isOpen: true, provider: 'google' });
      }
    } catch (err) {
      console.error('Google login error:', err);
      setErrorMessage('Google Authentication was not completed. Please try again.');
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
            window.FB.api('/me', { fields: 'id,name,email,picture.type(large)' }, (userData) => {
              loginWithFacebook({ fbUser: userData, isForAdmin: false });
            });
          } else {
            setErrorMessage('Facebook login cancelled.');
          }
        }, { scope: 'public_profile,email' });
      } else {
        // Prompt for Facebook account details
        setOauthModal({ isOpen: true, provider: 'facebook' });
      }
    } catch (err) {
      console.error('Facebook login error:', err);
      setErrorMessage('Facebook Authentication encountered an error.');
    } finally {
      setIsLoading(false);
    }
  };

  const isSurveyReason = authModal.reason === 'admin_survey' || authModal.reason === 'admin_analytics';

  return (
    <div className="auth-modal-overlay" onClick={() => closeAuthModal(true)}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="auth-modal-header">
          <div>
            <div className="auth-brand-badge">
              <span>🍄 Godavari Grown</span>
              <span>•</span>
              <span>{isSurveyReason ? 'Admin Portal' : 'Account Login'}</span>
            </div>
            <h2 className="auth-modal-title">
              {isSurveyReason ? 'Admin Login Required' : 'Welcome to Godavari Grown'}
            </h2>
            <p className="auth-modal-subtitle">
              {isSurveyReason 
                ? 'Sign in to access confidential ground vendor surveys & sourcing matrices.'
                : 'Enter your credentials to access your account or connect via social login.'}
            </p>
          </div>
          <button 
            className="auth-modal-close" 
            onClick={() => closeAuthModal(true)} 
            aria-label="Close Modal"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Survey Protected Banner */}
        {isSurveyReason && (
          <div className="auth-admin-alert">
            <ShieldCheck size={20} style={{ flexShrink: 0, marginTop: '2px', color: '#b45309' }} />
            <div>
              <strong>Protected Operational Zone</strong>
              <span>
                Field Market Survey intake and regional geo-sourcing matrices are restricted to authorized administrators.
              </span>
            </div>
          </div>
        )}

        {/* Modal Body: Username & Password on top, down to Facebook & Google OAuth */}
        <div className="auth-modal-body">
          {errorMessage && (
            <div className="admin-error-msg" style={{ marginBottom: '14px' }}>
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Username & Password Form */}
          <form onSubmit={handleCredentialsSubmit} className="credentials-login-form">
            <div className="auth-form-field">
              <label htmlFor="auth-username-input">Username or Email</label>
              <div className="auth-input-container">
                <User size={18} className="auth-field-icon" />
                <input
                  id="auth-username-input"
                  type="text"
                  placeholder="admin or name@example.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="auth-form-field">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label htmlFor="auth-password-input">Password</label>
                <a 
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("To retrieve admin credentials, contact farm ops: admin@godavarigrown.com");
                  }}
                  style={{ fontSize: '0.78rem', color: 'var(--primary-600)', textDecoration: 'none', fontWeight: 600 }}
                >
                  Forgot password?
                </a>
              </div>
              <div className="auth-input-container">
                <Lock size={18} className="auth-field-icon" />
                <input
                  id="auth-password-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="auth-pass-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="auth-form-meta-row">
              <label className="auth-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember this device for 30 days</span>
              </label>
            </div>

            <button type="submit" className="btn-auth-primary">
              <LogIn size={16} />
              <span>Sign In</span>
              <ArrowRight size={15} style={{ marginLeft: 'auto' }} />
            </button>
          </form>

          {/* 2. Divider down to OAuth login */}
          <div className="oauth-divider">
            <span>Or continue with OAuth</span>
          </div>

          {/* 3. Facebook and Google OAuth Login Buttons */}
          <div className="oauth-buttons-stack">
            {/* Google OAuth Button */}
            {GOOGLE_CLIENT_ID ? (
              <div ref={googleBtnRef} style={{ display: 'flex', justifyContent: 'center', minHeight: '44px' }}></div>
            ) : (
              <button
                type="button"
                className="btn-oauth google"
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

            {/* Facebook OAuth Button */}
            <button
              type="button"
              className="btn-oauth facebook"
              onClick={handleFacebookClick}
              disabled={isLoading}
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Continue with Facebook</span>
            </button>
          </div>

          {/* Continue as Guest */}
          <div style={{ textAlign: 'center', marginTop: '18px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
            <button
              type="button"
              className="btn-guest-browse"
              onClick={() => closeAuthModal(true)}
            >
              Continue to storefront as Guest →
            </button>
          </div>
        </div>
      </div>

      {/* Account Details Prompt Modal for OAuth */}
      <OAuthAccountModal
        isOpen={oauthModal.isOpen}
        provider={oauthModal.provider}
        onClose={() => setOauthModal({ isOpen: false, provider: 'google' })}
        isAdminPortal={false}
      />
    </div>
  );
}
