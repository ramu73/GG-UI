import React from 'react';
import { ShieldCheck, Award, CheckCircle, Leaf, Sparkles, Heart } from 'lucide-react';
import '../styles/Certifications.css';

export default function Certifications() {
  const certifications = [
    {
      title: "FSSAI Licensed Facility",
      sub: "Full compliance with Food Safety and Standards Authority of India (FSSAI) benchmarks for organic cultivation and hygienic handling.",
      icon: <ShieldCheck size={26} />,
      theme: "green"
    },
    {
      title: "100% Chemical-Free Substrate",
      sub: "Steam-sterilized paddy straw and agricultural coir without pesticide sprays, formaldehyde, or heavy-metal chemical washes.",
      icon: <Leaf size={26} />,
      theme: "green"
    },
    {
      title: "AP AgTech Innovation Award",
      sub: "Honored as Coastal Andhra's Leading Sustainable Mushroom Enterprise for rural farmer empowerment and circular agriculture.",
      icon: <Award size={26} />,
      theme: "gold"
    },
    {
      title: "HEPA 99.9% Cleanroom Lab",
      sub: "First-generation spawn production and mycelium inoculation carried out under hospital-grade sterile laminar airflow.",
      icon: <Sparkles size={26} />,
      theme: "gold"
    }
  ];

  return (
    <section id="certifications" className="certifications-section">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Trust & Quality Assurance</span>
          <h2>Certified Purity & Industry Recognitions</h2>
          <p>
            We take pride in setting the highest hygiene, safety, and environmental benchmarks in mushroom cultivation across Southern India.
          </p>
        </div>

        {/* Certifications Grid */}
        <div className="certs-grid">
          {certifications.map((item, idx) => (
            <div key={idx} className="cert-card">
              <div
                className={`cert-icon-box ${
                  item.theme === 'gold' ? 'cert-icon-gold' : 'cert-icon-green'
                }`}
              >
                {item.icon}
              </div>
              <h3 className="cert-title">{item.title}</h3>
              <p className="cert-sub">{item.sub}</p>
            </div>
          ))}
        </div>

        {/* Trust Stats Strip */}
        <div className="trust-stats-strip">
          <div className="trust-stat-item">
            <div className="trust-stat-val">24h</div>
            <div className="trust-stat-label">Harvest-to-Kitchen Delivery</div>
          </div>
          <div className="trust-stat-item">
            <div className="trust-stat-val">0.0%</div>
            <div className="trust-stat-label">Chemical Residue or Preservatives</div>
          </div>
          <div className="trust-stat-item">
            <div className="trust-stat-val">50+</div>
            <div className="trust-stat-label">Partner Hotels, Chefs & Stores</div>
          </div>
          <div className="trust-stat-item">
            <div className="trust-stat-val">100%</div>
            <div className="trust-stat-label">Recyclable Eco-Packaging</div>
          </div>
        </div>
      </div>
    </section>
  );
}
