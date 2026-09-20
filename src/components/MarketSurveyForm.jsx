import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  Store, 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight,
  RefreshCw,
  Sparkles 
} from 'lucide-react';
import { submitSurvey, computeMonthlyVolume } from '../data/surveyService';

const GODAVARI_TOWNS = [
  { name: "Kakinada", district: "East Godavari", pincode: "533001" },
  { name: "Rajahmundry", district: "East Godavari", pincode: "533101" },
  { name: "Bhimavaram", district: "West Godavari", pincode: "534201" },
  { name: "Eluru", district: "West Godavari", pincode: "534001" },
  { name: "Tanuku", district: "West Godavari", pincode: "534211" },
  { name: "Tadepalligudem", district: "West Godavari", pincode: "534101" },
  { name: "Palakollu", district: "West Godavari", pincode: "534260" },
  { name: "Amalapuram", district: "East Godavari", pincode: "533201" },
  { name: "Samalkota", district: "East Godavari", pincode: "533440" },
  { name: "Vijayawada", district: "Krishna", pincode: "520001" },
  { name: "Visakhapatnam", district: "Visakhapatnam", pincode: "530002" },
  { name: "Guntur", district: "Guntur", pincode: "522002" }
];

const COMMON_SOURCES = [
  { name: "Bangalore Wholesale Mandi", distance: 680 },
  { name: "Hyderabad Wholesale Market", distance: 420 },
  { name: "Vijayawada Wholesale Hub", distance: 150 },
  { name: "Ooty / Nilgiris Cold Supply", distance: 820 },
  { name: "Nashik / Pune Mandi", distance: 950 },
  { name: "Local Small Cultivators / Farms", distance: 30 },
  { name: "Local Intermediary / Commission Agent", distance: 60 },
  { name: "Other / Direct Interstate Truck", distance: 500 }
];

const PRODUCT_SUGGESTIONS = [
  "White Button Mushroom",
  "Milky Mushroom (Calocybe)",
  "Oyster Mushroom (Pleurotus)",
  "Broccoli (Green)",
  "Bell Pepper (Capsicum Red/Yellow)",
  "English Cucumber / Hydroponics",
  "Dragon Fruit",
  "Microgreens & Herbs",
  "Organic Sweet Corn",
  "Button Mushroom Spawn"
];

const PAIN_POINTS_OPTIONS = [
  "Transit Spoilage & Browning (10-20%)",
  "High Freight & Cold-Chain Costs",
  "Frequent Stockouts & Delays",
  "Middleman Margin Cut",
  "Lack of Freshness / Stale Taste",
  "Inconsistent Sizing & Grading"
];

export default function MarketSurveyForm({ onSurveySubmitted, onViewAnalytics }) {
  const [formData, setFormData] = useState({
    vendor_name: '',
    vendor_type: 'Retailer',
    contact_person: '',
    phone: '',
    destination_area: 'Kakinada',
    district: 'East Godavari',
    pincode: '533001',
    gps_lat: '',
    gps_lng: '',
    product_category: 'Mushrooms',
    product_name: 'White Button Mushroom',
    selling_volume_kg: '',
    frequency: 'Daily',
    source_location: 'Bangalore Wholesale Mandi',
    source_distance_km: 680,
    buying_price_per_kg: '',
    selling_price_per_kg: '',
    pain_points: ['Transit Spoilage & Browning (10-20%)'],
    notes: ''
  });

  const [isLocating, setIsLocating] = useState(false);
  const [gpsStatus, setGpsStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedItem, setSubmittedItem] = useState(null);

  const handleTownChange = (e) => {
    const selectedTown = GODAVARI_TOWNS.find(t => t.name === e.target.value);
    if (selectedTown) {
      setFormData(prev => ({
        ...prev,
        destination_area: selectedTown.name,
        district: selectedTown.district,
        pincode: selectedTown.pincode
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        destination_area: e.target.value
      }));
    }
  };

  const handleSourceChange = (e) => {
    const selectedSource = COMMON_SOURCES.find(s => s.name === e.target.value);
    setFormData(prev => ({
      ...prev,
      source_location: e.target.value,
      source_distance_km: selectedSource ? selectedSource.distance : prev.source_distance_km
    }));
  };

  const handlePainPointToggle = (point) => {
    setFormData(prev => {
      const exists = prev.pain_points.includes(point);
      const updated = exists 
        ? prev.pain_points.filter(p => p !== point)
        : [...prev.pain_points, point];
      return { ...prev, pain_points: updated };
    });
  };

  const detectGPSLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus({ error: "Geolocation is not supported by your browser" });
      return;
    }
    setIsLocating(true);
    setGpsStatus(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const lat = Math.round(position.coords.latitude * 10000) / 10000;
        const lng = Math.round(position.coords.longitude * 10000) / 10000;
        setFormData(prev => ({
          ...prev,
          gps_lat: lat,
          gps_lng: lng
        }));
        setGpsStatus({ success: `GPS Fixed: ${lat}, ${lng} (Accuracy: ~${Math.round(position.coords.accuracy)}m)` });
      },
      (error) => {
        setIsLocating(false);
        setGpsStatus({ error: `GPS error: ${error.message}. You can still proceed manually.` });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Calculations for live preview
  const estimatedMonthlyKg = computeMonthlyVolume(formData.selling_volume_kg, formData.frequency);
  const buyingPrice = parseFloat(formData.buying_price_per_kg) || 0;
  const sellingPrice = parseFloat(formData.selling_price_per_kg) || (buyingPrice > 0 ? buyingPrice * 1.3 : 0);
  const estimatedMonthlySpend = Math.round(estimatedMonthlyKg * buyingPrice);
  const marginPerKg = Math.round((sellingPrice - buyingPrice) * 10) / 10;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vendor_name.trim() || !formData.product_name.trim() || !formData.selling_volume_kg || !formData.buying_price_per_kg) {
      alert("Please fill in the Vendor Name, Product Name, Selling Volume, and Buying Price.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitSurvey(formData);
      setSubmittedItem(result);
      if (onSurveySubmitted) onSurveySubmitted(result);
    } catch (err) {
      console.error("Survey submission failed:", err);
      alert("Submission failed. Saved locally.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForNext = () => {
    setSubmittedItem(null);
    setFormData(prev => ({
      ...prev,
      vendor_name: '',
      contact_person: '',
      phone: '',
      selling_volume_kg: '',
      buying_price_per_kg: '',
      selling_price_per_kg: '',
      notes: ''
    }));
  };

  return (
    <div className="survey-form-container">
      <div className="survey-form-header">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--primary-100)', color: 'var(--primary-800)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700, marginBottom: '10px' }}>
          <Store size={16} />
          <span>FIELD AGENT GROUND INTAKE</span>
        </div>
        <h2>Market Demand & Sourcing Survey</h2>
        <p>Record ground selling volume, geographic consumption points, and supply origins for any produce or item.</p>
      </div>

      {submittedItem && (
        <div className="survey-success-toast">
          <CheckCircle size={22} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <strong>Survey Recorded Successfully! [{submittedItem.id}]</strong>
            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.95 }}>
              Demand for {submittedItem.product_name} in {submittedItem.destination_area} ({submittedItem.monthly_volume_kg} kg/mo) is now logged in the intelligence matrix.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              type="button" 
              onClick={handleResetForNext}
              style={{ background: '#ffffff', color: '#065f46', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Add Another
            </button>
            <button 
              type="button" 
              onClick={onViewAnalytics}
              style={{ background: '#065f46', color: '#ffffff', border: '1px solid rgba(255,255,255,0.4)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
            >
              View Analytics →
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Section 1: Business & Vendor Identity */}
        <div className="survey-section-title">
          <Store size={18} color="var(--primary-600)" />
          <span>1. Vendor & Buyer Details</span>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Vendor / Store / Restaurant Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Sri Venkateswara Veg Mandi / Grand Hotel"
              value={formData.vendor_name}
              onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Business / Vendor Type</label>
            <select
              className="form-select"
              value={formData.vendor_type}
              onChange={(e) => setFormData({ ...formData, vendor_type: e.target.value })}
            >
              <option value="Retailer">Retailer / Vegetable Stall</option>
              <option value="Supermarket">Supermarket / Gourmet Store</option>
              <option value="Restaurant/HORECA">Restaurant / Hotel / Caterer</option>
              <option value="Wholesaler">Mandi Wholesaler / Distributor</option>
              <option value="Cloud Kitchen">Cloud Kitchen / Mess</option>
              <option value="Consumer Group">Apartment Community / Consumer Group</option>
            </select>
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Contact Person</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., S. Venkata Ramana"
              value={formData.contact_person}
              onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone / WhatsApp Number</label>
            <input
              type="tel"
              className="form-input"
              placeholder="e.g., +91 98765 43210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        </div>

        {/* Section 2: Geographical Consumption Point */}
        <div className="survey-section-title">
          <MapPin size={18} color="var(--primary-600)" />
          <span>2. Geographic Consumption Point</span>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Destination Town / City *</label>
            <select
              className="form-select"
              value={formData.destination_area}
              onChange={handleTownChange}
            >
              {GODAVARI_TOWNS.map(t => (
                <option key={t.name} value={t.name}>{t.name} ({t.district})</option>
              ))}
              <option value="Other">Other Region (Specify)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">District & Pincode</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="District"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                style={{ flex: 1 }}
              />
              <input
                type="text"
                className="form-input"
                placeholder="Pincode"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                style={{ width: '100px' }}
              />
            </div>
          </div>
        </div>

        {/* GPS Auto-Detect Button */}
        <div className="form-group">
          <label className="form-label">Field GPS Geotag (Optional)</label>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-gps-detect"
              onClick={detectGPSLocation}
              disabled={isLocating}
            >
              {isLocating ? <RefreshCw size={14} className="spin" /> : <Navigation size={14} />}
              <span>{isLocating ? "Acquiring Satellite Fix..." : "📍 Detect Current GPS Location"}</span>
            </button>
            {formData.gps_lat && (
              <span style={{ fontSize: '0.84rem', color: 'var(--primary-700)', fontWeight: 600 }}>
                Lat: {formData.gps_lat}, Lng: {formData.gps_lng}
              </span>
            )}
          </div>
          {gpsStatus?.error && (
            <p style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '4px' }}>{gpsStatus.error}</p>
          )}
          {gpsStatus?.success && (
            <p style={{ color: '#16a34a', fontSize: '0.8rem', marginTop: '4px' }}>{gpsStatus.success}</p>
          )}
        </div>

        {/* Section 3: Product & Selling Volume */}
        <div className="survey-section-title">
          <Package size={18} color="var(--primary-600)" />
          <span>3. Product & Sales Volume (Any Produce/Item)</span>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Product Category</label>
            <select
              className="form-select"
              value={formData.product_category}
              onChange={(e) => setFormData({ ...formData, product_category: e.target.value })}
            >
              <option value="Mushrooms">Mushrooms (Culinary & Medicinal)</option>
              <option value="Exotic Veggies">Exotic Vegetables (Broccoli, Bell Pepper, Zucchini)</option>
              <option value="Common Veggies">Common Produce (Tomato, Onion, Potato, Greens)</option>
              <option value="Fruits">Fruits & Berries (Dragon Fruit, Papaya, Strawberries)</option>
              <option value="Hydroponics">Hydroponics & Microgreens</option>
              <option value="Dairy">Organic Dairy & Paneer</option>
              <option value="Grains/Spices">Agro Spices & Grains</option>
              <option value="Other">Other Agro Product</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Specific Product Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. White Button Mushroom, Broccoli, Red Capsicum"
              value={formData.product_name}
              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div style={{ marginBottom: '16px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
            Quick select popular high-demand items:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {PRODUCT_SUGGESTIONS.map((item) => (
              <button
                key={item}
                type="button"
                className="product-vol-chip"
                onClick={() => setFormData({ ...formData, product_name: item })}
                style={{
                  cursor: 'pointer',
                  borderColor: formData.product_name === item ? 'var(--primary-600)' : 'var(--border-light)',
                  background: formData.product_name === item ? 'var(--primary-100)' : '#ffffff',
                  fontWeight: formData.product_name === item ? 700 : 500
                }}
              >
                + {item}
              </button>
            ))}
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Selling / Consumed Volume (in Kilograms) *</label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              className="form-input"
              placeholder="e.g., 30"
              value={formData.selling_volume_kg}
              onChange={(e) => setFormData({ ...formData, selling_volume_kg: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Frequency of Requirement</label>
            <select
              className="form-select"
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
            >
              <option value="Daily">Daily Consumption / Sales</option>
              <option value="Weekly">Weekly Requirement</option>
              <option value="Monthly">Monthly Requirement</option>
            </select>
          </div>
        </div>

        {/* Section 4: Current Sourcing & Pricing Details */}
        <div className="survey-section-title">
          <TrendingUp size={18} color="var(--primary-600)" />
          <span>4. Sourcing Origin, Distance & Pricing</span>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Where is he buying from? (Source Origin) *</label>
            <select
              className="form-select"
              value={formData.source_location}
              onChange={handleSourceChange}
            >
              {COMMON_SOURCES.map(s => (
                <option key={s.name} value={s.name}>{s.name} (~{s.distance} km)</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Approximate Transit Distance (km)</label>
            <input
              type="number"
              className="form-input"
              value={formData.source_distance_km}
              onChange={(e) => setFormData({ ...formData, source_distance_km: e.target.value })}
            />
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Current Buying Price (₹ / kg) *</label>
            <input
              type="number"
              step="1"
              className="form-input"
              placeholder="e.g., 180"
              value={formData.buying_price_per_kg}
              onChange={(e) => setFormData({ ...formData, buying_price_per_kg: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Selling Price to End Consumer (₹ / kg)</label>
            <input
              type="number"
              step="1"
              className="form-input"
              placeholder="e.g., 240 (Optional)"
              value={formData.selling_price_per_kg}
              onChange={(e) => setFormData({ ...formData, selling_price_per_kg: e.target.value })}
            />
          </div>
        </div>

        {/* Sourcing Pain Points */}
        <div className="form-group">
          <label className="form-label">
            <AlertTriangle size={15} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
            Vendor Pain Points with Current Source
          </label>
          <div className="pain-points-grid">
            {PAIN_POINTS_OPTIONS.map(point => (
              <label key={point} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.pain_points.includes(point)}
                  onChange={() => handlePainPointToggle(point)}
                />
                <span>{point}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Field Agent Notes & Observations</label>
          <textarea
            className="form-textarea"
            rows="2"
            placeholder="e.g., Vendor is interested in 24hr direct morning harvest delivery; willing to switch if price is ₹10 less or quality is fresher."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        {/* Live Aggregation Summary Box */}
        {estimatedMonthlyKg > 0 && (
          <div className="calculated-preview-box">
            <div>
              <div className="calc-metric-title">Aggregated Monthly Demand</div>
              <div className="calc-metric-val">{estimatedMonthlyKg.toLocaleString()} kg/mo</div>
            </div>
            <div>
              <div className="calc-metric-title">Monthly Sourcing Turnover</div>
              <div className="calc-metric-val">₹{estimatedMonthlySpend.toLocaleString()}</div>
            </div>
            <div>
              <div className="calc-metric-title">Current Retail Margin</div>
              <div className="calc-metric-val">{marginPerKg > 0 ? `₹${marginPerKg}/kg` : 'N/A'}</div>
            </div>
          </div>
        )}

        <button type="submit" className="btn-submit-survey" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <RefreshCw size={18} className="spin" />
              <span>Saving Ground Data...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>Submit Ground Survey to Intelligence Matrix</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
