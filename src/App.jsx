import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroCarousel from './components/HeroCarousel';
import AboutSection from './components/AboutSection';
import ProductCatalog from './components/ProductCatalog';
import HealthRecipes from './components/HealthRecipes';
import Certifications from './components/Certifications';
import B2BSection from './components/B2BSection';
import Footer from './components/Footer';
import ChatBotWidget from './components/ChatBotWidget';
import KnowMoreModal from './components/KnowMoreModal';
import MarketIntelligenceHub from './components/MarketIntelligenceHub';
import LoginPage from './components/LoginPage';
import AuthModal from './components/AuthModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TRANSLATIONS } from './data/translations';
import { Sparkles } from 'lucide-react';
import './App.css';

/**
 * Derives initial active view from the browser URL path or hash
 */
function getViewFromUrl() {
  if (typeof window === 'undefined') return 'storefront';
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();

  if (path.startsWith('/admin') || hash.startsWith('#admin')) {
    return 'admin';
  }
  if (path.startsWith('/login') || hash.startsWith('#login')) {
    return 'login';
  }
  return 'storefront';
}

function MainAppContent({ currentView, onSwitchView }) {
  const [currentLang, setCurrentLang] = useState('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isKnowMoreOpen, setIsKnowMoreOpen] = useState(false);

  const { isAdmin, authNotification } = useAuth();

  // WhatsApp Business number
  const WHATSAPP_NUMBER = "+919876543210";

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const handleOpenWhatsApp = () => {
    const text = encodeURIComponent(
      "Hello Godavari Grown! 🍄 I would like to inquire about fresh mushroom harvest delivery in East/West Godavari and your launch discounts."
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  const handleSelectCategory = (cat) => {
    setActiveCategory(cat);
    if (currentView !== 'storefront') {
      onSwitchView('storefront');
    }
    setTimeout(() => {
      const elem = document.getElementById('products');
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // 1. Dedicated Customer Login Page (URL: /login)
  if (currentView === 'login') {
    return (
      <div className="app-wrapper">
        <LoginPage 
          isAdminPortal={false}
          onBackToStorefront={() => onSwitchView('storefront')} 
        />
        {authNotification && (
          <div className="auth-toast-notification">
            <Sparkles size={16} color="#86efac" />
            <span>{authNotification.message}</span>
          </div>
        )}
      </div>
    );
  }

  // 2. Dedicated Administrator Portal (URL: /admin)
  if (currentView === 'admin' || currentView === 'survey' || currentView === 'intelligence') {
    return (
      <div className="app-wrapper">
        {isAdmin ? (
          <MarketIntelligenceHub
            initialTab={currentView === 'survey' ? 'survey' : 'analytics'}
            onBackToStorefront={() => onSwitchView('storefront')}
          />
        ) : (
          <LoginPage 
            isAdminPortal={true}
            onBackToStorefront={() => onSwitchView('storefront')} 
          />
        )}
        {authNotification && (
          <div className="auth-toast-notification">
            <Sparkles size={16} color="#86efac" />
            <span>{authNotification.message}</span>
          </div>
        )}
      </div>
    );
  }

  // 3. Public Customer Storefront (URL: /)
  return (
    <div className="app-wrapper">
      {/* 1. Header & Navigation (Clean customer view with no admin survey links) */}
      <Navbar
        currentLang={currentLang}
        onLangChange={setCurrentLang}
        translations={t}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenWhatsApp={handleOpenWhatsApp}
        onSelectCategory={handleSelectCategory}
        currentView={currentView}
        onSwitchView={onSwitchView}
      />

      <main>
        {/* 2. Hero Carousel */}
        <HeroCarousel
          onOpenWhatsApp={handleOpenWhatsApp}
          onKnowMoreClick={() => setIsKnowMoreOpen(true)}
        />

        {/* 3. About Us & Farm Imagery */}
        <AboutSection
          translations={t}
          onKnowMoreClick={() => setIsKnowMoreOpen(true)}
        />

        {/* 4. Filterable Product Catalog with Variant Pricing & WhatsApp checkout */}
        <ProductCatalog
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          searchQuery={searchQuery}
          translations={t}
          whatsappNumber={WHATSAPP_NUMBER}
        />

        {/* 5. Health Benefits & South Indian / Godavari Culinary Recipes */}
        <HealthRecipes />

        {/* 6. Certifications, Lab Testing & Industry Recognitions */}
        <Certifications />

        {/* 7. Wholesale B2B & Restaurant Supply Inquiries */}
        <B2BSection whatsappNumber={WHATSAPP_NUMBER} />
      </main>

      {/* 8. Comprehensive Footer with Regional Delivery Info */}
      <Footer
        onOpenWhatsApp={handleOpenWhatsApp}
        whatsappNumber={WHATSAPP_NUMBER}
        onSwitchView={onSwitchView}
      />

      {/* 9. Floating Chatbot Widget */}
      <ChatBotWidget whatsappNumber={WHATSAPP_NUMBER} />

      {/* 10. Know More Transparency Modal */}
      <KnowMoreModal
        isOpen={isKnowMoreOpen}
        onClose={() => setIsKnowMoreOpen(false)}
        onOpenWhatsApp={handleOpenWhatsApp}
      />

      {/* 11. Global Quick Auth Modal */}
      <AuthModal />

      {/* 12. Floating Toast Notification */}
      {authNotification && (
        <div className="auth-toast-notification">
          <Sparkles size={16} color="#86efac" />
          <span>{authNotification.message}</span>
        </div>
      )}
    </div>
  );
}

function App() {
  const [currentView, setCurrentView] = useState(() => {
    return getViewFromUrl();
  });

  // URL Synchronization
  const handleSwitchView = (newView) => {
    let targetPath = '/';
    if (newView === 'admin' || newView === 'survey' || newView === 'intelligence') {
      targetPath = '/admin';
    } else if (newView === 'login') {
      targetPath = '/login';
    } else {
      targetPath = '/';
    }

    if (window.location.pathname !== targetPath) {
      window.history.pushState({ view: newView }, '', targetPath);
    }
    setCurrentView(newView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const v = getViewFromUrl();
      setCurrentView(v);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <AuthProvider onNavigateView={handleSwitchView}>
      <MainAppContent currentView={currentView} onSwitchView={handleSwitchView} />
    </AuthProvider>
  );
}

export default App;
