import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  User, 
  ArrowLeft, 
  Sparkles, 
  KeyRound, 
  Eye, 
  EyeOff, 
  AlertCircle,
  LogIn,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/AuthModal.css';

export default function AdminGatekeeper({ onBackToStorefront, requestedView = 'survey' }) {
  const { 
    user, 
    isAdmin, 
    loginWithCredentials,
    loginWithGoogle, 
    loginWithFacebook, 
    elevateToAdmin 
  } = useAuth();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('godavari2026');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleCredentialsSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (user && !isAdmin) {
      // User is logged in as standard user, elevate them
      const res = elevateToAdmin(password);
      if (!res.success) {
        setError(res.error);
      }
    } else {
      // Not logged in, log in with credentials
      const res = loginWithCredentials(username, password);
      if (!res.success) {
        setError(res.error);
      }
    }
  };

  return (
    <div className="gatekeeper-wrapper">
      <div className="gatekeeper-shield-icon">
        <ShieldAlert size={36} />
      </div>

      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fef3c7', color: '#92400e', padding: '3px 12px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '12px' }}>
        <span>🔒 Restricted Operational Matrix</span>
      </div>

      <h1 className="gatekeeper-title">
        Administrator Login Required
      </h1>

      <p className="gatekeeper-desc">
        The <strong>Godavari Regional Agri-Market Survey & Geo-Sourcing Matrix</strong> contains confidential ground vendor intelligence, commercial buying rates, and supply arbitrage routes. Access is strictly limited to authorized administrators.
      </p>

      {user && !isAdmin && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '12px', margin: '0 auto 20px auto', maxWidth: '420px', fontSize: '0.85rem', color: '#166534' }}>
          Signed in as <strong>{user.name}</strong> ({user.email}). Standard customer accounts do not have permission to view internal market surveys. Enter your admin password below to unlock survey access.
        </div>
      )}

      {error && (
        <div className="admin-error-msg" style={{ maxWidth: '380px', margin: '0 auto 16px auto' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="gatekeeper-actions">
        {/* Username & Password Form */}
        <form onSubmit={handleCredentialsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          {(!user || isAdmin) && (
            <div className="auth-form-field" style={{ textAlign: 'left' }}>
              <label htmlFor="gatekeeper-username">Username or Email</label>
              <div className="auth-input-container">
                <User size={18} className="auth-field-icon" />
                <input
                  id="gatekeeper-username"
                  type="text"
                  placeholder="Username (e.g. admin)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="auth-form-field" style={{ textAlign: 'left' }}>
            <label htmlFor="gatekeeper-password">Password</label>
            <div className="auth-input-container">
              <Lock size={18} className="auth-field-icon" />
              <input
                id="gatekeeper-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '-4px' }}>
            <span>Default: <code>admin</code> / <code>godavari2026</code></span>
          </div>

          <button type="submit" className="btn-auth-primary" style={{ width: '100%' }}>
            <LogIn size={16} />
            <span>{user ? 'Elevate to Admin' : 'Sign In as Administrator'}</span>
            <ArrowRight size={15} style={{ marginLeft: 'auto' }} />
          </button>
        </form>

        <div className="oauth-divider" style={{ margin: '16px 0 12px 0' }}>
          <span>Or Continue with OAuth</span>
        </div>

        {/* Down below: Google & Facebook OAuth buttons */}
        <button
          type="button"
          className="btn-oauth google"
          onClick={() => loginWithGoogle({ demoType: 'admin' })}
          style={{ width: '100%' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.37 7.33 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.63 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
          <span>Sign In with Google (Admin)</span>
        </button>

        <button
          type="button"
          className="btn-oauth facebook"
          onClick={() => loginWithFacebook({ demoType: 'admin' })}
          style={{ width: '100%' }}
        >
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span>Sign In with Facebook (Admin)</span>
        </button>

        <button
          type="button"
          onClick={onBackToStorefront}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '0.88rem',
            fontWeight: 600,
            cursor: 'pointer',
            marginTop: '8px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <ArrowLeft size={15} />
          <span>Return to Storefront</span>
        </button>
      </div>
    </div>
  );
}
