import React from 'react';
import { MapPin, Phone, Mail, Clock, MessageCircle, Heart } from 'lucide-react';
import '../styles/Footer.css';

export default function Footer({ onOpenWhatsApp, whatsappNumber = "+919876543210", onSwitchView }) {
  return (
    <footer id="contact" className="main-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Col 1: Brand & Bio */}
          <div className="footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ fontSize: '1.6rem' }}>🍄</span>
              <h3 style={{ margin: 0 }}>GODAVARI GROWN</h3>
            </div>
            <p>
              Cultivating the finest organic culinary and medicinal mushrooms in the Godavari delta. Harvested at dawn, delivered in 24 hours with pure ecological integrity.
            </p>
            <button className="btn-whatsapp" onClick={onOpenWhatsApp} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <MessageCircle size={15} />
              <span>Direct WhatsApp Desk</span>
            </button>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="footer-title">Navigation</h4>
            <ul className="footer-links-list">
              <li className="footer-link-item"><a href="#about">About Our Farm</a></li>
              <li className="footer-link-item"><a href="#products">Mushroom Catalog</a></li>
              <li className="footer-link-item"><a href="#certifications">Food Safety & Certifications</a></li>
              <li className="footer-link-item"><a href="#b2b">Wholesale / HoReCa Supply</a></li>
              {onSwitchView && (
                <>
                  <li className="footer-link-item">
                    <a 
                      href="#survey" 
                      onClick={(e) => { e.preventDefault(); onSwitchView('survey'); }}
                      style={{ color: 'var(--accent-amber)', fontWeight: 600 }}
                    >
                      📝 Field Survey Form
                    </a>
                  </li>
                  <li className="footer-link-item">
                    <a 
                      href="#intel" 
                      onClick={(e) => { e.preventDefault(); onSwitchView('intelligence'); }}
                      style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}
                    >
                      📊 Geo-Sourcing Intelligence
                    </a>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Col 3: Delivery Districts */}
          <div>
            <h4 className="footer-title">Delivery Regions</h4>
            <ul className="footer-links-list">
              <li className="footer-link-item"><a href="#products">⚡ East Godavari (Kakinada / Rajahmundry)</a></li>
              <li className="footer-link-item"><a href="#products">⚡ West Godavari (Eluru / Bhimavaram)</a></li>
              <li className="footer-link-item"><a href="#products">⚡ Tanuku, Palakollu, Amalapuram</a></li>
              <li className="footer-link-item"><a href="#products">📦 Pan-India Courier (Grow Kits & Extracts)</a></li>
              <li className="footer-link-item"><a href="#b2b">🏨 AP & Telangana Hotel Distribution</a></li>
            </ul>
          </div>

          {/* Col 4: Contact Details */}
          <div>
            <h4 className="footer-title">Farm & Dispatch Hub</h4>
            <div className="footer-contact-item">
              <MapPin size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>Godavari Grown Organic Agro Park, NH-16 Corridor, East Godavari District, Andhra Pradesh 533001</span>
            </div>
            <div className="footer-contact-item">
              <Phone size={18} style={{ flexShrink: 0 }} />
              <span>{whatsappNumber} (Order & Inquiries)</span>
            </div>
            <div className="footer-contact-item">
              <Mail size={18} style={{ flexShrink: 0 }} />
              <span>contact@godavarigrown.com</span>
            </div>
            <div className="footer-contact-item">
              <Clock size={18} style={{ flexShrink: 0 }} />
              <span>Harvest Time: 5:00 AM Daily | Dispatch: 8:00 AM – 7:00 PM</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} Godavari Grown (GG). All Rights Reserved. Pure Organic Agri-Tech.
          </div>
          <div style={{ display: 'flex', gap: '18px' }}>
            <span>FSSAI Lic. Verified</span>
            <span>100% Pesticide Free</span>
            <span>Made with sustainable paddy straw in Godavari</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
