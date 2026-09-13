import React from 'react';
import { X, CheckCircle2, MapPin, Sparkles, Shield, HeartHandshake, PhoneCall } from 'lucide-react';
import '../styles/Modal.css';

export default function KnowMoreModal({ isOpen, onClose, onOpenWhatsApp }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="modal-close-btn"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="modal-header">
          <span className="badge-pill badge-green" style={{ marginBottom: '10px' }}>
            🌿 Farm Transparency & Standards
          </span>
          <h2 className="modal-title">
            The Godavari Grown Farm Blueprint
          </h2>
          <p className="modal-subtitle">
            Rooted in the agricultural heart of Andhra Pradesh, bridging ecological balance with precision mycology.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="modal-grid-pillars">
          <div className="modal-pillar-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <MapPin size={18} color="var(--primary-700)" />
              <strong style={{ color: 'var(--primary-900)' }}>Basin Location & Logistics</strong>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
              Strategically positioned along the Godavari delta highway corridor, connecting Kakinada, Rajahmundry, Eluru, and Bhimavaram within 90 minutes.
            </p>
          </div>

          <div className="modal-pillar-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Shield size={18} color="var(--primary-700)" />
              <strong style={{ color: 'var(--primary-900)' }}>Thermal Steam Sterilization</strong>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
              Every batch of local paddy straw is steam-sterilized at 85°C for 4 hours. No chemical fumigants, formaldehyde, or bleach ever touches our substrate.
            </p>
          </div>

          <div className="modal-pillar-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Sparkles size={18} color="var(--primary-700)" />
              <strong style={{ color: 'var(--primary-900)' }}>Ultrasonic Cold-Misting</strong>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
              Industrial ultrasonic mist makers generate 5-micron water droplets, keeping ambient relative humidity at 88–92% without wetting the mushroom caps.
            </p>
          </div>

          <div className="modal-pillar-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <HeartHandshake size={18} color="var(--primary-700)" />
              <strong style={{ color: 'var(--primary-900)' }}>Local Farmer Support</strong>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
              We purchase post-harvest paddy straw directly from local smallholders at fair prices, stopping stubble burning and generating circular village revenue.
            </p>
          </div>
        </div>

        {/* Certified Benchmark Highlights */}
        <div className="modal-benchmarks-box">
          <h4 style={{ color: 'var(--primary-800)', marginBottom: '10px' }}>
            Laboratory Benchmarks & Purity Guarantee:
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: 'var(--primary-900)' }}>
              <CheckCircle2 size={16} color="var(--primary-600)" />
              <span>Heavy Metals (Lead, Cadmium, Mercury, Arsenic): <strong>Below Detectable Limit (BDL)</strong></span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: 'var(--primary-900)' }}>
              <CheckCircle2 size={16} color="var(--primary-600)" />
              <span>Chemical Pesticides & Insecticides: <strong>0.00% Zero Synthetic Residue</strong></span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: 'var(--primary-900)' }}>
              <CheckCircle2 size={16} color="var(--primary-600)" />
              <span>Packaging: <strong>Anti-fog, micro-perforated food-grade recyclable punnets</strong></span>
            </li>
          </ul>
        </div>

        {/* Modal CTAs */}
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Close Window
          </button>
          <button className="btn-whatsapp" onClick={onOpenWhatsApp}>
            <PhoneCall size={16} />
            <span>Chat with Farm Team on WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}
