import React, { useState } from 'react';
import { X, Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/OAuthAccountModal.css';

export default function OAuthAccountModal({
  isOpen,
  provider = 'google', // 'google' | 'facebook'
  onClose,
  isAdminPortal = false
}) {
  const { loginWithGoogle, loginWithFacebook } = useAuth();

  const [accountEmail, setAccountEmail] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const isGoogle = provider === 'google';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanEmail = (accountEmail || '').trim();
    if (!cleanEmail) {
      setErrorMessage(isGoogle ? 'Please enter your Google email address.' : 'Please enter your Facebook email or phone.');
      return;
    }

    if (isGoogle && !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid Google Account email (e.g. user@gmail.com).');
      return;
    }

    try {
      if (isGoogle) {
        await loginWithGoogle({
          customAccount: {
            email: cleanEmail,
            password: accountPassword
          },
          demoType: isAdminPortal ? 'admin' : 'user'
        });
      } else {
        await loginWithFacebook({
          customAccount: {
            email: cleanEmail,
            password: accountPassword
          },
          demoType: isAdminPortal ? 'admin' : 'user'
        });
      }
      onClose();
    } catch (err) {
      setErrorMessage('Authentication could not be completed. Please try again.');
    }
  };

  return (
    <div className="oauth-dialog-overlay" onClick={onClose}>
      <div
        className={`oauth-dialog-card ${isGoogle ? 'google-mode' : 'facebook-mode'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="oauth-dialog-header">
          <button className="oauth-dialog-close" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>

          <div className="oauth-dialog-logo">
            {isGoogle ? (
              <svg width="40" height="40" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.37 7.33 24 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.63 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
              </svg>
            ) : (
              <svg width="40" height="40" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            )}
          </div>

          <h3 className="oauth-dialog-title">
            {isGoogle ? 'Sign in with Google' : 'Log in with Facebook'}
          </h3>
          <p className="oauth-dialog-subtitle">
            {isGoogle
              ? 'Enter your Google account details to continue to Godavari Grown'
              : 'Enter your Facebook account details to connect'}
          </p>
        </div>

        {/* Body */}
        <div className="oauth-dialog-body">
          {errorMessage && (
            <div className="admin-error-msg" style={{ marginBottom: '14px' }}>
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="oauth-dialog-form">
            <div className="oauth-input-group">
              <label htmlFor="oauth-account-email">
                {isGoogle ? 'Google Email or phone' : 'Mobile number or email address'}
              </label>
              <div className="oauth-input-wrapper">
                <input
                  id="oauth-account-email"
                  type="text"
                  placeholder={isGoogle ? 'name@gmail.com' : 'name@example.com or phone'}
                  value={accountEmail}
                  onChange={(e) => setAccountEmail(e.target.value)}
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="oauth-input-group">
              <label htmlFor="oauth-account-pass">
                {isGoogle ? 'Google Account password' : 'Facebook password'}
              </label>
              <div className="oauth-input-wrapper">
                <input
                  id="oauth-account-pass"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={accountPassword}
                  onChange={(e) => setAccountPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="oauth-pass-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password view"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="oauth-privacy-notice">
              {isGoogle ? (
                <span>
                  To continue, Google will share your verified name, email address, and profile picture with Godavari Grown.
                </span>
              ) : (
                <span>
                  Godavari Grown will receive your name, profile picture, and email address in accordance with Facebook's privacy terms.
                </span>
              )}
            </div>

            <div className="oauth-dialog-actions">
              <button
                type="button"
                className="btn-oauth-cancel"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`btn-oauth-submit ${isGoogle ? 'google' : 'facebook'}`}
              >
                {isGoogle ? 'Next' : 'Log In'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
