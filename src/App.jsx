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
import { TRANSLATIONS } from './data/translations';
import './App.css';

function App() {
  const [currentLang, setCurrentLang] = useState('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isKnowMoreOpen, setIsKnowMoreOpen] = useState(false);

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
    const elem = document.getElementById('products');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="app-wrapper">
      {/* 1. Header & Navigation (Matches Sketch: Logo, Search, About, Products [v], Contact, Language) */}
      <Navbar
        currentLang={currentLang}
        onLangChange={setCurrentLang}
        translations={t}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenWhatsApp={handleOpenWhatsApp}
        onSelectCategory={handleSelectCategory}
      />

      <main>
        {/* 2. Hero Carousel (Matches Sketch: < Banner with farm, certs, awards, offers >) */}
        <HeroCarousel
          onOpenWhatsApp={handleOpenWhatsApp}
          onKnowMoreClick={() => setIsKnowMoreOpen(true)}
        />

        {/* 3. About Us & Farm Imagery (Matches Sketch: ABOUT US + Know More + GG Image) */}
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
