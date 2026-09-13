import React from 'react';
import { Sprout, ShieldCheck, Clock, ArrowRight, Award } from 'lucide-react';
import '../styles/AboutSection.css';

export default function AboutSection({ translations, onKnowMoreClick }) {
  return (
    <section id="about" className="about-section">
      <div className="container">
        <div className="about-grid">
          {/* Left Card: Hand-drawn "ABOUT US" + "Know more" */}
          <div className="about-card">
            <span className="about-tag">About Godavari Grown</span>
            <h2 className="about-title">
              Pioneering Sustainable Mycology in the Fertile Godavari Basin
            </h2>

            <p className="about-description">
              Born amidst the lush agricultural delta of Andhra Pradesh, <strong>Godavari Grown</strong> unites modern climate-controlled vertical cultivation with natural organic substrates. We transform locally sourced organic paddy straw and coconut coir into high-yield, nutrient-dense gourmet and medicinal mushrooms without a single chemical spray.
            </p>

            {/* 3 Pillars */}
            <div className="about-pillars">
              <div className="pillar-item">
                <div className="pillar-icon-box">
                  <Clock size={20} />
                </div>
                <div>
                  <div className="pillar-title">Harvested Dawn to Doorstep in 24 Hours</div>
                  <div className="pillar-desc">
                    Daily fresh dispatch across East & West Godavari districts ensures unmatched crispness and culinary flavor.
                  </div>
                </div>
              </div>

              <div className="pillar-item">
                <div className="pillar-icon-box">
                  <Sprout size={20} />
                </div>
                <div>
                  <div className="pillar-title">100% Organic & Chemical-Free Substrate</div>
                  <div className="pillar-desc">
                    Steam-sterilized agricultural straw, pure ultrasonic humidity, and zero chemical preservatives.
                  </div>
                </div>
              </div>

              <div className="pillar-item">
                <div className="pillar-icon-box">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <div className="pillar-title">Cleanroom Inoculation & Pure Spawn</div>
                  <div className="pillar-desc">
                    Cultivated under HEPA laminar airflow hoods ensuring 99.9% biological purity and zero mold contamination.
                  </div>
                </div>
              </div>
            </div>

            {/* "Know more" Button matching sketch */}
            <button className="btn-primary" onClick={onKnowMoreClick}>
              <span>{translations.knowMore}</span>
              <ArrowRight size={17} />
            </button>
          </div>

          {/* Right: Hand-drawn "IMAGE related to GG" */}
          <div className="about-image-wrapper">
            <img
              src="/assets/farm_hero.jpg"
              alt="Godavari Grown Climate Controlled Mushroom Farm"
              className="about-main-img"
              loading="lazy"
            />

            {/* Floating Purity Badge */}
            <div className="floating-purity-badge">
              <Award size={18} color="#fde68a" />
              <span>100% Lab Tested & Certified Purity</span>
            </div>

            {/* Floating Metric Badge */}
            <div className="floating-stat-badge">
              <div className="floating-stat-num">24h</div>
              <div className="floating-stat-label">
                Harvest to Table<br />Freshness Guarantee
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
