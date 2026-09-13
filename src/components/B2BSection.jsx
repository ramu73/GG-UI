import React, { useState } from 'react';
import { CheckCircle2, Building2, Send, MessageCircle } from 'lucide-react';
import '../styles/B2BSection.css';

export default function B2BSection({ whatsappNumber = "+919876543210" }) {
  const [formData, setFormData] = useState({
    businessName: '',
    contactPerson: '',
    phone: '',
    variety: 'Fresh Milky Mushrooms',
    volume: '10 - 25 kg / week',
    location: 'East Godavari (Kakinada / Rajahmundry)'
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Format a direct WhatsApp lead message
    const msg = encodeURIComponent(
      `Hello Godavari Grown Team!\nI would like to request Wholesale / B2B Pricing:\n- Business: ${formData.businessName}\n- Contact: ${formData.contactPerson} (${formData.phone})\n- Variety: ${formData.variety}\n- Volume Required: ${formData.volume}\n- Location: ${formData.location}`
    );
    window.open(`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${msg}`, '_blank');
  };

  return (
    <section id="b2b" className="b2b-section">
      <div className="container">
        <div className="b2b-wrapper">
          {/* Left Column: Value Prop for Restaurants & Supermarkets */}
          <div className="b2b-info-col">
            <div>
              <span className="b2b-tag">Commercial & HoReCa Supply</span>
              <h2>Wholesale Partner with Godavari Grown</h2>
              <p>
                We supply top hotels, restaurants, biryani kitchens, and supermarkets across Andhra Pradesh with consistent, cleanroom-grade mushrooms at competitive wholesale tiers.
              </p>

              <ul className="b2b-benefit-list">
                <li className="b2b-benefit-item">
                  <CheckCircle2 size={18} color="#86efac" />
                  <span>Guaranteed daily morning harvest delivery slot</span>
                </li>
                <li className="b2b-benefit-item">
                  <CheckCircle2 size={18} color="#86efac" />
                  <span>Tiered wholesale rates with up to 35% discount</span>
                </li>
                <li className="b2b-benefit-item">
                  <CheckCircle2 size={18} color="#86efac" />
                  <span>5kg, 10kg & 25kg commercial cold-crate packaging</span>
                </li>
                <li className="b2b-benefit-item">
                  <CheckCircle2 size={18} color="#86efac" />
                  <span>Consistent size grading & zero moisture spoilage</span>
                </li>
              </ul>
            </div>

            <div style={{ marginTop: '20px' }}>
              <div style={{ fontSize: '0.82rem', color: '#86efac', marginBottom: '4px' }}>
                Quick Commercial Hotline:
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff' }}>
                +91 98765 43210
              </div>
            </div>
          </div>

          {/* Right Column: Wholesale Inquiry Form */}
          <div className="b2b-form-col">
            <h3 style={{ fontSize: '1.4rem', color: 'var(--primary-900)', marginBottom: '8px' }}>
              Request Wholesale Rates & Sampling Crate
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Fill in your commercial requirements below and our farm dispatch team will connect within 2 hours.
            </p>

            <form className="b2b-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Business / Hotel / Store Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Grand Godavari Hotel"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Contact Person & Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh (+91 98765...)"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Mushroom Variety Required</label>
                  <select
                    value={formData.variety}
                    onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                  >
                    <option value="Fresh Milky Mushrooms">Fresh Milky Mushrooms (Calocybe)</option>
                    <option value="Fresh Pearl Oyster Mushrooms">Fresh Pearl Oyster Mushrooms</option>
                    <option value="White Button Mushrooms">White Button Mushrooms</option>
                    <option value="Dehydrated Oyster Flakes">Sun-Dried Oyster Flakes (Bulk)</option>
                    <option value="Commercial Grain Spawn">Commercial Lab Grain Spawn (F1)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Estimated Weekly Volume</label>
                  <select
                    value={formData.volume}
                    onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                  >
                    <option value="5 - 10 kg / week">5 - 10 kg / week (Trial)</option>
                    <option value="10 - 25 kg / week">10 - 25 kg / week</option>
                    <option value="25 - 50 kg / week">25 - 50 kg / week</option>
                    <option value="50+ kg / week (Commercial)">50+ kg / week (Enterprise Tier)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Delivery City / District</label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                >
                  <option value="East Godavari (Kakinada / Rajahmundry / Amalapuram)">
                    East Godavari (Kakinada / Rajahmundry / Amalapuram)
                  </option>
                  <option value="West Godavari (Eluru / Bhimavaram / Tanuku / Palakollu)">
                    West Godavari (Eluru / Bhimavaram / Tanuku / Palakollu)
                  </option>
                  <option value="Visakhapatnam (Vizag)">Visakhapatnam (Vizag)</option>
                  <option value="Vijayawada / Guntur">Vijayawada / Guntur</option>
                  <option value="Hyderabad / Other Region">Hyderabad / Other Pan-India Region</option>
                </select>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '6px' }}>
                <Send size={16} />
                <span>Submit Inquiry & Open WhatsApp Summary</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
