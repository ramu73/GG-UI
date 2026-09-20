import React, { useState } from 'react';
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
import { TRANSLATIONS } from './data/translations';
import './App.css';

function App() {
  const [currentLang, setCurrentLang] = useState('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isKnowMoreOpen, setIsKnowMoreOpen] = useState(false);
  const [currentView, setCurrentView] = useState('storefront'); // 'storefront' | 'intelligence' | 'survey'

  // WhatsApp Business number (configured with standard placeholder as agreed)
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
      setCurrentView('storefront');
    }
    setTimeout(() => {
      const elem = document.getElementById('products');
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="app-wrapper">
      {/* 1. Header & Navigation */}
      <Navbar
        currentLang={currentLang}
        onLangChange={setCurrentLang}
        translations={t}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenWhatsApp={handleOpenWhatsApp}
        onSelectCategory={handleSelectCategory}
        currentView={currentView}
        onSwitchView={setCurrentView}
      />

      <main>
        {currentView === 'storefront' ? (
          <>
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
          </>
        ) : (
          /* Agri-Market Survey & Geo-Sourcing Intelligence Module */
          <MarketIntelligenceHub
            initialTab={currentView === 'survey' ? 'survey' : 'analytics'}
            onBackToStorefront={() => setCurrentView('storefront')}
          />
        )}
      </main>

      {/* 8. Comprehensive Footer with Regional Delivery Info */}
      <Footer
        onOpenWhatsApp={handleOpenWhatsApp}
        whatsappNumber={WHATSAPP_NUMBER}
        onSwitchView={setCurrentView}
      />

      {/* 9. Floating Chatbot Widget (Matches Sketch: "CHAT BOT" Floating Button) */}
      <ChatBotWidget whatsappNumber={WHATSAPP_NUMBER} />

      {/* 10. Know More Transparency Modal */}
      <KnowMoreModal
        isOpen={isKnowMoreOpen}
        onClose={() => setIsKnowMoreOpen(false)}
        onOpenWhatsApp={handleOpenWhatsApp}
      />
    </div>
  );
}

export default App;
