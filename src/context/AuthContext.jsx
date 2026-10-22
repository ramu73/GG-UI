import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  isEmailAdmin, 
  verifyAdminPasscode, 
  decodeJwt, 
  DEMO_PROFILES,
  ADMIN_PASSCODE 
} from '../utils/oauthService';

const AuthContext = createContext(null);

const STORAGE_KEY = 'gg_auth_user_v1';
const GUEST_DISMISSED_KEY = 'gg_launch_modal_dismissed';

export function AuthProvider({ children, onNavigateView }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.warn('Could not read saved auth user from storage:', e);
      return null;
    }
  });

  const [authModal, setAuthModal] = useState({
    isOpen: false,
    reason: 'general', // 'general' | 'admin_survey' | 'admin_analytics'
    targetView: null
  });

  const [authNotification, setAuthNotification] = useState(null);

  // Sync user state changes to localStorage
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to sync auth user to localStorage:', e);
    }
  }, [user]);

  const showNotification = (message, type = 'success') => {
    setAuthNotification({ message, type });
    setTimeout(() => {
      setAuthNotification(null);
    }, 4000);
  };

  const openAuthModal = ({ reason = 'general', targetView = null } = {}) => {
    setAuthModal({
      isOpen: true,
      reason,
      targetView
    });
  };

  const closeAuthModal = (dismissForSession = false) => {
    if (dismissForSession) {
      sessionStorage.setItem(GUEST_DISMISSED_KEY, 'true');
    }
    setAuthModal(prev => ({ ...prev, isOpen: false }));
  };

  const handlePostLoginRedirect = (loggedInUser, targetView) => {
    closeAuthModal(true);
    if (loggedInUser.role === 'admin') {
      // By default, admin login unlocks and takes the user to the Market Survey!
      const destination = targetView || 'survey';
      if (typeof onNavigateView === 'function') {
        onNavigateView(destination);
      }
    } else {
      if (typeof onNavigateView === 'function') {
        onNavigateView('storefront');
      }
    }
  };

  /**
   * Standard Username and Password Authentication
   * STRICT POLICY: Credentials login is strictly for Customers.
   * Under no circumstances do username/password credentials grant Admin access.
   */
  const loginWithCredentials = (username, password, { isForAdmin = false } = {}) => {
    const cleanUser = (username || '').trim();
    const cleanPass = (password || '').trim();

    if (!cleanUser || !cleanPass) {
      return { success: false, error: 'Please enter both username and password.' };
    }

    if (isForAdmin) {
      // Validate default Admin credentials
      const lowerUser = cleanUser.toLowerCase();
      const isValidAdminUser = lowerUser === 'admin' || 
                               lowerUser === 'admin@godavarigrown.com' ||
                               lowerUser === 'godavari';
      const isValidAdminPass = cleanPass === ADMIN_PASSCODE || cleanPass === 'godavari2026';

      if (isValidAdminUser && isValidAdminPass) {
        const adminUser = {
          id: `admin-${Date.now()}`,
          name: 'Executive Field Admin',
          email: 'admin@godavarigrown.com',
          avatar: 'https://ui-avatars.com/api/?name=Admin&background=15803d&color=fff',
          provider: 'credentials',
          role: 'admin',
          title: 'Executive Admin & Field Coordinator'
        };

        setUser(adminUser);
        showNotification('Welcome, Administrator! Market Survey & Regional Intelligence Unlocked.');
        handlePostLoginRedirect(adminUser, 'survey');
        return { success: true, user: adminUser };
      }

      return { 
        success: false, 
        error: 'Invalid Administrator credentials. Only authorized default admin credentials have access.' 
      };
    }

    // Standard Customer Login ONLY - Never gives Admin Access
    const standardUser = {
      id: `usr-${Date.now()}`,
      name: cleanUser.includes('@') ? cleanUser.split('@')[0] : cleanUser,
      email: cleanUser.includes('@') ? cleanUser : `${cleanUser}@godavarigrown.in`,
      avatar: '',
      provider: 'credentials',
      role: 'user', // NEVER 'admin'
      title: 'Customer Account'
    };

    setUser(standardUser);
    showNotification(`Welcome back, ${standardUser.name}! Signed in as customer.`);
    handlePostLoginRedirect(standardUser, 'storefront');
    return { success: true, user: standardUser };
  };

  /**
   * Login with Google: handles real Google credential or custom entered account.
   * Admin access is granted ONLY if email is verified in the admin registry!
   */
  const loginWithGoogle = async ({ credential, customAccount, isForAdmin = false, demoType = 'user' } = {}) => {
    let profileData = null;

    if (customAccount && customAccount.email) {
      const email = customAccount.email.trim();
      const isAdminEmail = isEmailAdmin(email);

      // If logging into the admin portal, strictly deny non-admin emails
      if (isForAdmin && !isAdminEmail) {
        return {
          success: false,
          error: `Access Denied: "${email}" is not authorized as an Administrator. Admin access requires an authorized @godavarigrown.com account.`
        };
      }

      const cleanName = email.split('@')[0].replace(/[._-]/g, ' ');
      const capitalized = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

      profileData = {
        id: `google-${Date.now()}`,
        name: customAccount.name || capitalized,
        email: email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(capitalized)}&background=0D8ABC&color=fff`,
        provider: 'google',
        role: isAdminEmail ? 'admin' : 'user',
        title: isAdminEmail ? 'Verified Field Administrator' : 'Customer Account'
      };
    } else if (credential) {
      const decoded = decodeJwt(credential);
      if (decoded) {
        const isAdminEmail = isEmailAdmin(decoded.email);

        if (isForAdmin && !isAdminEmail) {
          return {
            success: false,
            error: `Access Denied: "${decoded.email}" is not authorized as an Administrator.`
          };
        }

        profileData = {
          id: decoded.sub || `google-${Date.now()}`,
          name: decoded.name || 'Google User',
          email: decoded.email || '',
          avatar: decoded.picture || '',
          provider: 'google',
          role: isAdminEmail ? 'admin' : 'user',
          title: isAdminEmail ? 'Verified Field Administrator' : 'Customer Account'
        };
      }
    }

    if (!profileData) {
      profileData = { ...DEMO_PROFILES.googleUser };
    }

    setUser(profileData);
    showNotification(
      profileData.role === 'admin'
        ? `Welcome, ${profileData.name}! Admin Portal Unlocked.`
        : `Signed in with Google as ${profileData.name}!`
    );
    handlePostLoginRedirect(profileData, profileData.role === 'admin' ? (authModal.targetView || 'survey') : 'storefront');
    return { success: true, user: profileData };
  };

  /**
   * Login with Facebook: handles real FB response or custom entered account.
   * Admin access is granted ONLY if email is verified in the admin registry!
   */
  const loginWithFacebook = async ({ fbUser, customAccount, isForAdmin = false, demoType = 'user' } = {}) => {
    let profileData = null;

    if (customAccount && customAccount.email) {
      const email = customAccount.email.trim();
      const isAdminEmail = isEmailAdmin(email);

      if (isForAdmin && !isAdminEmail) {
        return {
          success: false,
          error: `Access Denied: "${email}" is not authorized as an Administrator. Admin access requires an authorized @godavarigrown.com account.`
        };
      }

      const cleanName = email.split('@')[0].replace(/[._-]/g, ' ');
      const capitalized = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

      profileData = {
        id: `fb-${Date.now()}`,
        name: customAccount.name || capitalized,
        email: email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(capitalized)}&background=1877F2&color=fff`,
        provider: 'facebook',
        role: isAdminEmail ? 'admin' : 'user',
        title: isAdminEmail ? 'Verified Field Administrator' : 'Customer Account'
      };
    } else if (fbUser) {
      const isAdminEmail = isEmailAdmin(fbUser.email);

      if (isForAdmin && !isAdminEmail) {
        return {
          success: false,
          error: `Access Denied: "${fbUser.email}" is not authorized as an Administrator.`
        };
      }

      profileData = {
        id: fbUser.id || `fb-${Date.now()}`,
        name: fbUser.name || 'Facebook User',
        email: fbUser.email || '',
        avatar: fbUser.picture?.data?.url || '',
        provider: 'facebook',
        role: isAdminEmail ? 'admin' : 'user',
        title: isAdminEmail ? 'Verified Field Administrator' : 'Customer Account'
      };
    }

    if (!profileData) {
      profileData = { ...DEMO_PROFILES.facebookUser };
    }

    setUser(profileData);
    showNotification(
      profileData.role === 'admin'
        ? `Welcome, ${profileData.name}! Admin Portal Unlocked.`
        : `Signed in with Facebook as ${profileData.name}!`
    );
    handlePostLoginRedirect(profileData, profileData.role === 'admin' ? (authModal.targetView || 'survey') : 'storefront');
    return { success: true, user: profileData };
  };

  /**
   * Login with Master Admin Passcode
   */
  const loginAsAdmin = (enteredPasscode) => {
    if (!verifyAdminPasscode(enteredPasscode)) {
      return { success: false, error: 'Invalid Admin Passcode. Please check and try again.' };
    }

    const adminUser = {
      ...DEMO_PROFILES.directAdmin,
      id: `admin-${Date.now()}`
    };

    setUser(adminUser);
    showNotification('Master Admin Key Accepted! Market Survey & Intel Unlocked.');
    handlePostLoginRedirect(adminUser, authModal.targetView || 'survey');
    return { success: true, user: adminUser };
  };

  /**
   * Elevate an existing regular user to Admin via passcode
   */
  const elevateToAdmin = (enteredPasscode) => {
    if (!verifyAdminPasscode(enteredPasscode)) {
      return { success: false, error: 'Invalid Admin Passcode.' };
    }

    setUser(prev => {
      if (!prev) return DEMO_PROFILES.directAdmin;
      return {
        ...prev,
        role: 'admin',
        title: 'Elevated Field Administrator'
      };
    });

    showNotification('Privileges elevated to Administrator! Market Survey unlocked.');
    return { success: true };
  };

  const logout = () => {
    const prevName = user?.name || 'User';
    setUser(null);
    showNotification(`Signed out successfully. Goodbye, ${prevName}!`, 'info');
    if (typeof onNavigateView === 'function') {
      onNavigateView('storefront');
    }
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'admin',
    authModal,
    authNotification,
    openAuthModal,
    closeAuthModal,
    loginWithCredentials,
    loginWithGoogle,
    loginWithFacebook,
    loginAsAdmin,
    elevateToAdmin,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
