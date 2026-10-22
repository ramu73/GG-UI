/**
 * Godavari Grown — OAuth & Authentication Service
 * Supports Google Identity Services (GIS), Meta Facebook Login SDK, and Admin Passcode Validation.
 */

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
export const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID || '';
export const ADMIN_PASSCODE = import.meta.env.VITE_ADMIN_PASSCODE || 'godavari2026';
export const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || 'admin@godavarigrown.com,survey.admin@godavarigrown.com')
  .toLowerCase()
  .split(',')
  .map(e => e.trim())
  .filter(Boolean);

/**
 * Decodes a Google JWT id_token without external dependencies
 */
export function decodeJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('Failed to decode JWT:', err);
    return null;
  }
}

/**
 * Checks if a given email is designated as an administrator
 */
export function isEmailAdmin(email) {
  if (!email) return false;
  const clean = email.toLowerCase().trim();
  return (
    ADMIN_EMAILS.includes(clean) ||
    clean.endsWith('@godavarigrown.com') ||
    clean.startsWith('admin@') ||
    clean.startsWith('survey.admin@') ||
    clean === 'admin'
  );
}

/**
 * Validates the admin master key / passcode
 */
export function verifyAdminPasscode(enteredPasscode) {
  if (!enteredPasscode) return false;
  return enteredPasscode.trim() === ADMIN_PASSCODE.trim();
}

/**
 * Asynchronously loads the Google Identity Services SDK
 */
let googleScriptPromise = null;
export function loadGoogleScript() {
  if (googleScriptPromise) return googleScriptPromise;
  googleScriptPromise = new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.google?.accounts) {
      resolve(window.google);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = (err) => reject(new Error('Failed to load Google Identity Services SDK'));
    document.head.appendChild(script);
  });
  return googleScriptPromise;
}

/**
 * Asynchronously loads the Facebook JavaScript SDK
 */
let facebookScriptPromise = null;
export function loadFacebookScript() {
  if (facebookScriptPromise) return facebookScriptPromise;
  facebookScriptPromise = new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.FB) {
      resolve(window.FB);
      return;
    }
    window.fbAsyncInit = function () {
      if (FACEBOOK_APP_ID) {
        window.FB.init({
          appId: FACEBOOK_APP_ID,
          cookie: true,
          xfbml: true,
          version: 'v21.0'
        });
      }
      resolve(window.FB);
    };

    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error('Failed to load Facebook SDK'));
    document.head.appendChild(script);
  });
  return facebookScriptPromise;
}

/**
 * Pre-configured realistic demo profiles for instant development and testing
 */
export const DEMO_PROFILES = {
  googleAdmin: {
    id: 'google-usr-901',
    name: 'R. Satyanarayana (Admin)',
    email: 'admin@godavarigrown.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    provider: 'google',
    role: 'admin',
    title: 'Lead Agri-Intelligence Director'
  },
  googleUser: {
    id: 'google-usr-902',
    name: 'Ananya Sharma',
    email: 'ananya.sharma@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    provider: 'google',
    role: 'user',
    title: 'Storefront Customer'
  },
  facebookAdmin: {
    id: 'fb-usr-801',
    name: 'Suresh Varma (Admin)',
    email: 'survey.admin@godavarigrown.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    provider: 'facebook',
    role: 'admin',
    title: 'Godavari Basin Operations Head'
  },
  facebookUser: {
    id: 'fb-usr-802',
    name: 'K. Rajesh Chowdary',
    email: 'rajesh.chowdary@fbuser.in',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    provider: 'facebook',
    role: 'user',
    title: 'Regional Restaurant Buyer'
  },
  directAdmin: {
    id: 'admin-master-001',
    name: 'Master Field Administrator',
    email: 'ops@godavarigrown.com',
    avatar: '',
    provider: 'admin',
    role: 'admin',
    title: 'Executive Admin & Field Coordinator'
  }
};
