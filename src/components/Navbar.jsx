import React, { useState } from 'react';
import { Search, ChevronDown, Globe, Menu, X, Sparkles, MessageCircle } from 'lucide-react';
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

  return (
    <header className="main-navbar">
      {/* Top Announcement Bar */}
      <div className="top-announcement-bar">
        <span>{translations.topBanner}</span>
        <span className="highlight">Launch Offer: 20% OFF</span>
      </div>

      <div className="nav-container">
        {/* Brand Logo matching sketch "GODAVARI GROWN" */}
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

        {/* Search Bar matching sketch [ Search ... Q ] */}
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

        {/* Navigation Menu matching sketch: ABOUT COMPANY, PRODUCTS [v], CONTACT US, LANGUAGE */}
        <nav className={`nav-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <a href="#about" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
            {translations.navAbout}
          </a>

          {/* Products Dropdown matching sketch PRODUCTS [v] */}
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

          {/* Market Intelligence & Ground Survey Hub Link */}
          <button
            type="button"
            className="nav-link-intel-btn"
            onClick={() => {
              if (onSwitchView) {
                onSwitchView(currentView === 'storefront' ? 'intelligence' : 'storefront');
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
            title="Field Market Survey & Geo-Sourcing Intelligence"
          >
            <span>🌾 {currentView !== 'storefront' ? 'Storefront View' : 'Market Intel & Survey'}</span>
            {currentView === 'storefront' && (
              <span style={{ fontSize: '0.68rem', background: '#d97706', color: '#fff', padding: '1px 5px', borderRadius: '4px', textTransform: 'uppercase' }}>
                Intel
              </span>
            )}
          </button>

          {/* Language Switcher matching sketch LANGUAGE: ENGLISH */}
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

      {/* Mobile Search Bar: Always visible and easily accessible on phones */}
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
