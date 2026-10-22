import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  ChevronDown, 
  Globe, 
  Menu, 
  X, 
  Sparkles, 
  MessageCircle, 
  User, 
  LogIn, 
  LogOut, 
  ShieldCheck, 
  Lock 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

export default function Navbar({
  currentLang,
  onLangChange,
  translations,
  searchQuery,
  onSearchChange,
  onOpenWhatsApp,
  onSelectCategory,
  currentView = 'storefront',
  onSwitchView
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userMenuRef = useRef(null);

  const { user, isAdmin, openAuthModal, logout } = useAuth();

  // Close user dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="main-navbar">
      {/* Top Announcement Bar */}
      <div className="top-announcement-bar">
        <span>{translations.topBanner}</span>
        <span className="highlight">Launch Offer: 20% OFF</span>
      </div>

      <div className="nav-container">
        {/* Brand Logo */}
        <a 
          href="#" 
          className="brand-logo"
          onClick={(e) => {
            e.preventDefault();
            if (onSwitchView) onSwitchView('storefront');
          }}
        >
          <div className="brand-icon-wrapper">
            <span style={{ fontSize: '1.4rem' }}>🍄</span>
          </div>
          <div className="brand-text-block">
            <span className="brand-name">GODAVARI GROWN</span>
            <span className="brand-badge">Pure Organic Basin Farm</span>
          </div>
        </a>

        {/* Search Bar */}
        <div className="search-wrapper">
          <div className="search-input-box">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder={translations.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchQuery && (
              <button
                className="clear-search-btn"
                onClick={() => onSearchChange('')}
                title="Clear Search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className={`nav-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <a href="#about" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
            {translations.navAbout}
          </a>

          {/* Products Dropdown */}
          <div className="nav-dropdown-wrapper">
            <a href="#products" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
              {translations.navProducts}
              <ChevronDown size={15} />
            </a>
            <div className="dropdown-menu">
              <a
                href="#products"
                className="dropdown-item"
                onClick={() => {
                  onSelectCategory('fresh');
                  setMobileMenuOpen(false);
                }}
              >
                <span className="dropdown-item-title">Fresh Culinary Harvest</span>
                <span className="dropdown-item-sub">Milky, Oyster & Button (24h Express)</span>
              </a>
              <a
                href="#products"
                className="dropdown-item"
                onClick={() => {
                  onSelectCategory('kits');
                  setMobileMenuOpen(false);
                }}
              >
                <span className="dropdown-item-title">DIY Grow Kits & Spawn</span>
                <span className="dropdown-item-sub">Grow at home in 10 days</span>
              </a>
              <a
                href="#products"
                className="dropdown-item"
                onClick={() => {
                  onSelectCategory('medicinal');
                  setMobileMenuOpen(false);
                }}
              >
                <span className="dropdown-item-title">Medicinal Superfoods</span>
                <span className="dropdown-item-sub">Lion's Mane & Cordyceps Extracts</span>
              </a>
              <a
                href="#products"
                className="dropdown-item"
                onClick={() => {
                  onSelectCategory('value-added');
                  setMobileMenuOpen(false);
                }}
              >
                <span className="dropdown-item-title">Dried Flakes & Pantry</span>
                <span className="dropdown-item-sub">6 Months Shelf Life & Seasoning</span>
              </a>
            </div>
          </div>

          <a href="#certifications" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
            {translations.navCertifications}
          </a>

          <a href="#b2b" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
            {translations.navB2B}
          </a>

          <a href="#contact" className="nav-link" onClick={() => {
            if (onSwitchView) onSwitchView('storefront');
            setMobileMenuOpen(false);
          }}>
            {translations.navContact}
          </a>

          {/* Admin Portal Gateway (Only visible to verified Admins, hidden from public) */}
          {isAdmin && (
            <button
              type="button"
              className="nav-link-intel-btn"
              onClick={() => {
                if (onSwitchView) {
                  onSwitchView(currentView === 'storefront' ? 'admin' : 'storefront');
                }
                setMobileMenuOpen(false);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: currentView !== 'storefront' ? 'var(--primary-700)' : 'var(--primary-100)',
                color: currentView !== 'storefront' ? '#ffffff' : 'var(--primary-800)',
                border: '1px solid var(--primary-400)',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: currentView !== 'storefront' ? '0 2px 8px rgba(27, 77, 50, 0.3)' : 'none'
              }}
              title="Admin Portal & Regional Market Intelligence"
            >
              <span>🌾 {currentView !== 'storefront' ? 'Storefront View' : 'Admin Portal'}</span>
              <span style={{ fontSize: '0.66rem', background: '#d97706', color: '#fff', padding: '1px 6px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 800 }}>
                ADMIN
              </span>
            </button>
          )}

          {/* Language Switcher */}
          <div className="lang-selector-box">
            <Globe size={16} color="var(--primary-700)" />
            <select
              value={currentLang}
              onChange={(e) => onLangChange(e.target.value)}
              aria-label="Language Selector"
            >
              <option value="en">English</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="hi">हिंदी (Hindi)</option>
            </select>
          </div>

          {/* Quick WhatsApp Order Action */}
          <button
            className="btn-whatsapp"
            onClick={onOpenWhatsApp}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            <MessageCircle size={16} />
            <span>WhatsApp</span>
          </button>

          {/* OAuth & User Profile Menu */}
          {user ? (
            <div className="nav-user-profile-wrapper" ref={userMenuRef}>
              <button
                type="button"
                className="nav-user-pill"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                aria-expanded={userDropdownOpen}
                title="Account Menu"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="nav-user-avatar" />
                ) : (
                  <div className="nav-user-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="nav-user-info-text">
                  <span className="nav-user-name">{user.name.split(' ')[0]}</span>
                  <span className={`nav-user-role-badge ${user.role}`}>
                    {user.role === 'admin' ? '⭐ Admin' : 'Customer'}
                  </span>
                </div>
                <ChevronDown size={14} color="var(--text-light)" />
              </button>

              {userDropdownOpen && (
                <div className="user-dropdown-menu">
                  <div className="user-dropdown-header">
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--primary-900)' }}>
                      {user.name}
                    </div>
                    <div className="user-dropdown-email">{user.email || 'No email associated'}</div>
                    <div className="user-dropdown-provider">
                      <span>Via {user.provider?.toUpperCase()}</span>
                      <span>•</span>
                      <span style={{ color: user.role === 'admin' ? '#d97706' : 'inherit', fontWeight: 700 }}>
                        {user.role === 'admin' ? 'Administrator' : 'Standard'}
                      </span>
                    </div>
                  </div>

                  {user.role === 'admin' ? (
                    <>
                      <button
                        type="button"
                        className="user-dropdown-item"
                        onClick={() => {
                          if (onSwitchView) onSwitchView('survey');
                          setUserDropdownOpen(false);
                          setMobileMenuOpen(false);
                        }}
                      >
                        <span>📝 Field Survey Intake Form</span>
                      </button>
                      <button
                        type="button"
                        className="user-dropdown-item"
                        onClick={() => {
                          if (onSwitchView) onSwitchView('intelligence');
                          setUserDropdownOpen(false);
                          setMobileMenuOpen(false);
                        }}
                      >
                        <span>📊 Geo-Sourcing Intelligence</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="user-dropdown-item"
                      onClick={() => {
                        openAuthModal({ reason: 'admin_survey', targetView: 'survey' });
                        setUserDropdownOpen(false);
                        setMobileMenuOpen(false);
                      }}
                      style={{ color: '#d97706', fontWeight: 600 }}
                    >
                      <Lock size={14} />
                      <span>Unlock Admin Privileges</span>
                    </button>
                  )}

                  <button
                    type="button"
                    className="user-dropdown-item"
                    onClick={() => {
                      if (onSwitchView) onSwitchView('storefront');
                      setUserDropdownOpen(false);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <span>🍄 View Public Storefront</span>
                  </button>

                  <button
                    type="button"
                    className="user-dropdown-item logout"
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              className="nav-login-btn"
              onClick={() => {
                if (onSwitchView) onSwitchView('login');
                else openAuthModal({ reason: 'general' });
                setMobileMenuOpen(false);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#ffffff',
                color: 'var(--primary-800)',
                border: '1.5px solid var(--border-light)',
                padding: '7px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: 'var(--shadow-sm)'
              }}
              title="Sign in with Google, Facebook, or Admin Key"
            >
              <User size={15} />
              <span>Sign In</span>
            </button>
          )}
        </nav>

        {/* Mobile menu toggle */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Search Bar */}
      <div className="mobile-search-bar">
        <div className="search-input-box">
          <Search className="search-icon" size={16} />
          <input
            type="text"
            placeholder={translations.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              className="clear-search-btn"
              onClick={() => onSearchChange('')}
              title="Clear Search"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
