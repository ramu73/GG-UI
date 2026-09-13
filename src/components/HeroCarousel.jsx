import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, Award, ShieldCheck, Tag, ArrowRight } from 'lucide-react';
import { HERO_SLIDES } from '../data/slides';
import '../styles/HeroCarousel.css';

export default function HeroCarousel({ onOpenWhatsApp, onKnowMoreClick }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Minimum swipe distance in px
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  // Auto slide advance every 6.5 seconds
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  return (
    <section
      className="hero-carousel-section"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="container">
        <div className="carousel-container">
          {/* Arrow Left matching sketch < */}
          <button
            className="carousel-nav-btn carousel-nav-prev"
            onClick={handlePrev}
            aria-label="Previous Slide"
          >
            <ChevronLeft size={28} />
          </button>

          {/* Arrow Right matching sketch > */}
          <button
            className="carousel-nav-btn carousel-nav-next"
            onClick={handleNext}
            aria-label="Next Slide"
          >
            <ChevronRight size={28} />
          </button>

          {/* Slides */}
          {HERO_SLIDES.map((slide, index) => {
            const isActive = index === currentSlide;
            const tagClass =
              slide.accent === 'amber'
                ? 'tag-amber'
                : slide.accent === 'gold'
                ? 'tag-gold'
                : '';

            return (
              <div
                key={slide.id}
                className={`carousel-slide ${isActive ? 'active' : ''}`}
                aria-hidden={!isActive}
              >
                {/* Background image & gradient */}
                <div
                  className="slide-bg"
                  style={{ backgroundImage: `url(${slide.image})` }}
                />
                <div className="slide-overlay" />

                {/* Content */}
                <div className="slide-content">
                  <div className={`slide-tag ${tagClass}`}>
                    {slide.tag}
                  </div>

                  <h1 className="slide-title">{slide.title}</h1>
                  <p className="slide-subtitle">{slide.subtitle}</p>

                  {/* Badges on certifications slide */}
                  {slide.badges && (
                    <div className="slide-badges-grid">
                      {slide.badges.map((b, i) => (
                        <div key={i} className="slide-badge-card">
                          <div className="slide-badge-name">✓ {b.name}</div>
                          <div className="slide-badge-desc">{b.desc}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Highlights chips */}
                  {slide.highlights && (
                    <div className="slide-highlights">
                      {slide.highlights.map((h, i) => (
                        <span key={i} className="highlight-chip">
                          <CheckCircle2 size={16} color="#86efac" />
                          <span>{h}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                    {slide.ctaAction === 'whatsapp' ? (
                      <button className="btn-whatsapp" onClick={onOpenWhatsApp}>
                        <span>{slide.ctaText}</span>
                        <ArrowRight size={17} />
                      </button>
                    ) : slide.ctaAction === 'about' ? (
                      <button className="btn-primary" onClick={onKnowMoreClick}>
                        <span>{slide.ctaText}</span>
                        <ArrowRight size={17} />
                      </button>
                    ) : (
                      <a href={`#${slide.ctaAction}`} className="btn-primary">
                        <span>{slide.ctaText}</span>
                        <ArrowRight size={17} />
                      </a>
                    )}

                    <a href="#products" className="btn-secondary" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
                      Browse Catalog
                    </a>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Dots Indicators */}
          <div className="carousel-indicators">
            {HERO_SLIDES.map((_, index) => (
              <button
                key={index}
                className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
