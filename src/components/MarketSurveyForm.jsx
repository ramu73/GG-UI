import React, { useState, useMemo } from 'react';
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
  Sparkles,
  Plus,
  Trash2
} from 'lucide-react';
import { submitSurvey, computeMonthlyVolume } from '../data/surveyService';

const deriveCategory = (productName) => {
  const name = (productName || '').toLowerCase();
  if (name.includes('mushroom') || name.includes('spawn') || name.includes('calocybe') || name.includes('pleurotus')) {
    return 'Mushrooms';
  }
  if (name.includes('broccoli') || name.includes('bell pepper') || name.includes('capsicum') || name.includes('zucchini')) {
    return 'Exotic Veggies';
  }
  if (name.includes('dragon fruit') || name.includes('berry') || name.includes('papaya')) {
    return 'Fruits';
  }
  if (name.includes('cucumber') || name.includes('hydroponic') || name.includes('microgreen') || name.includes('herb')) {
    return 'Hydroponics';
  }
  if (name.includes('corn') || name.includes('tomato') || name.includes('onion') || name.includes('potato')) {
    return 'Common Veggies';
  }
  return 'Mushrooms';
};

const REGIONAL_TOWNS = [
  // 1. East Godavari, Kakinada & Konaseema (Sorted Alphabetically A-Z)
  { name: "Amalapuram", district: "Dr. B.R. Ambedkar Konaseema", pincode: "533201", region: "🌾 East Godavari & Konaseema" },
  { name: "Anaparthi", district: "East Godavari", pincode: "533342", region: "🌾 East Godavari & Konaseema" },
  { name: "Kakinada", district: "Kakinada / East Godavari", pincode: "533001", region: "🌾 East Godavari & Konaseema" },
  { name: "Kothapeta", district: "Dr. B.R. Ambedkar Konaseema", pincode: "533223", region: "🌾 East Godavari & Konaseema" },
  { name: "Mandapeta", district: "Dr. B.R. Ambedkar Konaseema", pincode: "533308", region: "🌾 East Godavari & Konaseema" },
  { name: "Mummidivaram", district: "Dr. B.R. Ambedkar Konaseema", pincode: "533216", region: "🌾 East Godavari & Konaseema" },
  { name: "Peddapuram", district: "Kakinada", pincode: "533437", region: "🌾 East Godavari & Konaseema" },
  { name: "Pithapuram", district: "Kakinada", pincode: "533450", region: "🌾 East Godavari & Konaseema" },
  { name: "Rajahmundry", district: "East Godavari", pincode: "533101", region: "🌾 East Godavari & Konaseema" },
  { name: "Ramachandrapuram", district: "Dr. B.R. Ambedkar Konaseema", pincode: "533255", region: "🌾 East Godavari & Konaseema" },
  { name: "Ravulapalem", district: "Dr. B.R. Ambedkar Konaseema", pincode: "533238", region: "🌾 East Godavari & Konaseema" },
  { name: "Razole", district: "Dr. B.R. Ambedkar Konaseema", pincode: "533242", region: "🌾 East Godavari & Konaseema" },
  { name: "Samalkota", district: "Kakinada", pincode: "533440", region: "🌾 East Godavari & Konaseema" },
  { name: "Tuni", district: "Kakinada", pincode: "533401", region: "🌾 East Godavari & Konaseema" },
  { name: "Yanam", district: "Puducherry Enclave", pincode: "533464", region: "🌾 East Godavari & Konaseema" },

  // 2. West Godavari & Eluru (Sorted Alphabetically A-Z)
  { name: "Akividu", district: "West Godavari", pincode: "534235", region: "🌿 West Godavari & Eluru" },
  { name: "Attili", district: "West Godavari", pincode: "534134", region: "🌿 West Godavari & Eluru" },
  { name: "Bhimavaram", district: "West Godavari", pincode: "534201", region: "🌿 West Godavari & Eluru" },
  { name: "Chintalapudi", district: "Eluru", pincode: "534460", region: "🌿 West Godavari & Eluru" },
  { name: "Eluru", district: "Eluru", pincode: "534001", region: "🌿 West Godavari & Eluru" },
  { name: "Jangareddygudem", district: "Eluru", pincode: "534447", region: "🌿 West Godavari & Eluru" },
  { name: "Kovvur", district: "East Godavari", pincode: "534350", region: "🌿 West Godavari & Eluru" },
  { name: "Narsapur", district: "West Godavari", pincode: "534275", region: "🌿 West Godavari & Eluru" },
  { name: "Nidadavole", district: "East Godavari", pincode: "534301", region: "🌿 West Godavari & Eluru" },
  { name: "Palakollu", district: "West Godavari", pincode: "534260", region: "🌿 West Godavari & Eluru" },
  { name: "Tadepalligudem", district: "West Godavari", pincode: "534101", region: "🌿 West Godavari & Eluru" },
  { name: "Tanuku", district: "West Godavari", pincode: "534211", region: "🌿 West Godavari & Eluru" },

  // 3. Rest of Andhra Pradesh Hubs (Sorted Alphabetically A-Z)
  { name: "Anantapur", district: "Anantapur", pincode: "515001", region: "🏙️ Andhra Pradesh Cities" },
  { name: "Chittoor", district: "Chittoor", pincode: "517001", region: "🏙️ Andhra Pradesh Cities" },
  { name: "Gudivada", district: "Krishna", pincode: "521301", region: "🏙️ Andhra Pradesh Cities" },
  { name: "Guntur", district: "Guntur", pincode: "522002", region: "🏙️ Andhra Pradesh Cities" },
  { name: "Hindupur", district: "Sri Sathya Sai", pincode: "515201", region: "🏙️ Andhra Pradesh Cities" },
  { name: "Kadapa", district: "YSR Kadapa", pincode: "516001", region: "🏙️ Andhra Pradesh Cities" },
  { name: "Kurnool", district: "Kurnool", pincode: "518001", region: "🏙️ Andhra Pradesh Cities" },
  { name: "Machilipatnam", district: "Krishna", pincode: "521001", region: "🏙️ Andhra Pradesh Cities" },
  { name: "Madanapalle", district: "Annamayya", pincode: "517325", region: "🏙️ Andhra Pradesh Cities" },
  { name: "Mangalagiri", district: "Guntur", pincode: "522503", region: "🏙️ Andhra Pradesh Cities" },
  { name: "Nandyal", district: "Nandyal", pincode: "518501", region: "🏙️ Andhra Pradesh Cities" },
  { name: "Nellore", district: "SPSR Nellore", pincode: "524001", region: "🏙️ Andhra Pradesh Cities" },
  { name: "Ongole", district: "Prakasam", pincode: "523001", region: "🏙️ Andhra Pradesh Cities" },
  { name: "Proddatur", district: "YSR Kadapa", pincode: "516360", region: "🏙️ Andhra Pradesh Cities" },
  { name: "Srikakulam", district: "Srikakulam", pincode: "532001", region: "🏙️ Andhra Pradesh Cities" },
  { name: "Tenali", district: "Guntur", pincode: "522201", region: "🏙️ Andhra Pradesh Cities" },
  { name: "Tirupati", district: "Tirupati", pincode: "517501", region: "🏙️ Andhra Pradesh Cities" },
  { name: "Vijayawada", district: "NTR / Krishna", pincode: "520001", region: "🏙️ Andhra Pradesh Cities" },
  { name: "Visakhapatnam (Vizag)", district: "Visakhapatnam", pincode: "530002", region: "🏙️ Andhra Pradesh Cities" },
  { name: "Vizianagaram", district: "Vizianagaram", pincode: "535002", region: "🏙️ Andhra Pradesh Cities" },

  // 4. Telangana Hubs (Sorted Alphabetically A-Z)
  { name: "Hyderabad", district: "Hyderabad", pincode: "500001", region: "🌆 Telangana Hubs" },
  { name: "Karimnagar", district: "Karimnagar", pincode: "505001", region: "🌆 Telangana Hubs" },
  { name: "Khammam", district: "Khammam", pincode: "507001", region: "🌆 Telangana Hubs" },
  { name: "Mahbubnagar", district: "Mahbubnagar", pincode: "509001", region: "🌆 Telangana Hubs" },
  { name: "Nalgonda", district: "Nalgonda", pincode: "508001", region: "🌆 Telangana Hubs" },
  { name: "Nizamabad", district: "Nizamabad", pincode: "503001", region: "🌆 Telangana Hubs" },
  { name: "Ramagundam", district: "Peddapalli", pincode: "505208", region: "🌆 Telangana Hubs" },
  { name: "Secunderabad", district: "Hyderabad", pincode: "500003", region: "🌆 Telangana Hubs" },
  { name: "Siddipet", district: "Siddipet", pincode: "502103", region: "🌆 Telangana Hubs" },
  { name: "Suryapet", district: "Suryapet", pincode: "508213", region: "🌆 Telangana Hubs" },
  { name: "Warangal", district: "Warangal", pincode: "506001", region: "🌆 Telangana Hubs" },

  // 5. Other Major Corridors (Sorted Alphabetically A-Z)
  { name: "Bengaluru (Bangalore)", district: "Bengaluru Urban", pincode: "560001", region: "🗺️ Other Major Corridors" },
  { name: "Bhubaneswar", district: "Khordha", pincode: "751001", region: "🗺️ Other Major Corridors" },
  { name: "Chennai", district: "Chennai", pincode: "600001", region: "🗺️ Other Major Corridors" },
  { name: "Mumbai", district: "Mumbai", pincode: "400001", region: "🗺️ Other Major Corridors" }
];

const COMMON_SOURCES = [
  { name: "Bangalore Wholesale Mandi", distance: 680 },
  { name: "Direct Interstate Truck / Trader", distance: 500 },
  { name: "Guntur Wholesale Yard", distance: 180 },
  { name: "Hyderabad Wholesale Market", distance: 420 },
  { name: "Local Intermediary / Commission Agent", distance: 60 },
  { name: "Local Small Cultivators / Farms", distance: 30 },
  { name: "Nashik / Pune Mandi", distance: 950 },
  { name: "Ooty / Nilgiris Cold Supply", distance: 820 },
  { name: "Rajahmundry / Kakinada Local Mandi", distance: 40 },
  { name: "Vijayawada Wholesale Hub", distance: 150 },
  { name: "Vizag Wholesale Market", distance: 160 }
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
  "Inconsistent Sizing & Grading",
  "Short Shelf Life (1-2 Days)",
  "Sudden Price Volatility & Spikes",
  "High Minimum Order Quantity (MOQ)",
  "Lack of Organic / Lab Certification"
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
    volume_period: 'Day',
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
  const [selectedTownOption, setSelectedTownOption] = useState('Kakinada');
  const [customTownName, setCustomTownName] = useState('');
  const [townSearchQuery, setTownSearchQuery] = useState('');
  const [selectedSourceOption, setSelectedSourceOption] = useState('Bangalore Wholesale Mandi');
  const [customSourceName, setCustomSourceName] = useState('');
  const [painPointsList, setPainPointsList] = useState(PAIN_POINTS_OPTIONS);
  const [painPointSearchQuery, setPainPointSearchQuery] = useState('');

  // Filter pain points dynamically based on user search query
  const filteredPainPoints = useMemo(() => {
    const q = painPointSearchQuery.trim().toLowerCase();
    if (!q) return painPointsList;
    return painPointsList.filter(p => p.toLowerCase().includes(q));
  }, [painPointsList, painPointSearchQuery]);

  // Filter towns dynamically based on user search query while keeping alphabetical order
  const filteredTowns = useMemo(() => {
    const q = townSearchQuery.trim().toLowerCase();
    if (!q) return REGIONAL_TOWNS;
    return REGIONAL_TOWNS.filter(t => 
      t.name.toLowerCase().includes(q) ||
      t.district.toLowerCase().includes(q) ||
      t.region.toLowerCase().includes(q) ||
      t.pincode.includes(q)
    );
  }, [townSearchQuery]);

  const handleTownChange = (e) => {
    const val = e.target.value;
    setSelectedTownOption(val);

    if (val === 'Other') {
      setFormData(prev => ({
        ...prev,
        destination_area: customTownName.trim() || 'Other'
      }));
    } else {
      const selectedTown = REGIONAL_TOWNS.find(t => t.name === val);
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
          destination_area: val
        }));
      }
    }
  };

  const handleCustomTownChange = (cityName) => {
    setCustomTownName(cityName);
    setFormData(prev => ({
      ...prev,
      destination_area: cityName
    }));
  };

  const handleSourceChange = (e) => {
    const val = e.target.value;
    setSelectedSourceOption(val);

    if (val === 'Other') {
      setFormData(prev => ({
        ...prev,
        source_location: customSourceName.trim() || 'Other Source',
        source_distance_km: 100
      }));
    } else {
      const selectedSource = COMMON_SOURCES.find(s => s.name === val);
      setFormData(prev => ({
        ...prev,
        source_location: val,
        source_distance_km: selectedSource ? selectedSource.distance : prev.source_distance_km
      }));
    }
  };

  const handleCustomSourceChange = (sourceName) => {
    setCustomSourceName(sourceName);
    setFormData(prev => ({
      ...prev,
      source_location: sourceName
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

  const handleAddCustomPainPoint = (text) => {
    const trimmed = (text || '').trim();
    if (!trimmed) return;

    const existing = painPointsList.find(p => p.toLowerCase() === trimmed.toLowerCase());
    const pointToAdd = existing || trimmed;

    if (!existing) {
      setPainPointsList(prev => [trimmed, ...prev]);
    }

    setFormData(prev => {
      if (prev.pain_points.includes(pointToAdd)) return prev;
      return { ...prev, pain_points: [...prev.pain_points, pointToAdd] };
    });

    setPainPointSearchQuery('');
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

  // Handle phone input to allow only numeric digits up to 10 characters
  const handlePhoneChange = (e) => {
    let digits = e.target.value.replace(/\D/g, '');
    // If copied with +91 country code (12 digits), extract the 10-digit mobile number
    if (digits.length === 12 && digits.startsWith('91')) {
      digits = digits.slice(2);
    }
    // Limit strictly to maximum 10 digits
    setFormData(prev => ({ ...prev, phone: digits.slice(0, 10) }));
  };

  // Helper to split comma-separated product names
  const getSelectedProductList = (productNameStr) => {
    if (!productNameStr) return [];
    return productNameStr.split(',').map(s => s.trim()).filter(Boolean);
  };

  // Toggle products when chips are clicked (multi-product selection)
  const handleToggleProductChip = (itemName) => {
    setFormData(prev => {
      const currentList = getSelectedProductList(prev.product_name);
      const existsIndex = currentList.findIndex(p => p.toLowerCase() === itemName.toLowerCase());
      
      let newList;
      if (existsIndex >= 0) {
        newList = currentList.filter((_, idx) => idx !== existsIndex);
      } else {
        newList = [...currentList, itemName];
      }

      const updatedName = newList.join(', ');
      const updatedCategory = newList.length > 0 ? deriveCategory(newList[newList.length - 1]) : prev.product_category;

      return {
        ...prev,
        product_name: updatedName,
        product_category: updatedCategory
      };
    });
  };

  // Calculations for live preview
  const estimatedMonthlyKg = computeMonthlyVolume(formData.selling_volume_kg, formData.frequency, formData.volume_period);
  const buyingPrice = parseFloat(formData.buying_price_per_kg) || 0;
  const sellingPrice = parseFloat(formData.selling_price_per_kg) || (buyingPrice > 0 ? buyingPrice * 1.3 : 0);
  const estimatedMonthlySpend = Math.round(estimatedMonthlyKg * buyingPrice);
  const marginPerKg = Math.round((sellingPrice - buyingPrice) * 10) / 10;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const targetTown = selectedTownOption === 'Other' ? customTownName.trim() : formData.destination_area;
    const targetSource = selectedSourceOption === 'Other' ? customSourceName.trim() : formData.source_location;

    if (!targetTown) {
      alert("Please specify the Destination Town / City name.");
      return;
    }

    if (!targetSource) {
      alert("Please specify where the vendor is buying from (Source Origin).");
      return;
    }

    if (formData.phone && formData.phone.length > 0 && formData.phone.length !== 10) {
      alert("Please enter a valid 10-digit Phone / WhatsApp number.");
      return;
    }

    if (!formData.vendor_name.trim() || !formData.product_name.trim() || !formData.selling_volume_kg || !formData.buying_price_per_kg) {
      alert("Please fill in the Vendor Name, Product Name, Selling Volume, and Buying Price.");
      return;
    }

    const productList = getSelectedProductList(formData.product_name);

    setIsSubmitting(true);
    try {
      const savedResults = [];
      const totalVolume = parseFloat(formData.selling_volume_kg) || 0;
      const volPerItem = productList.length > 1 ? Math.round((totalVolume / productList.length) * 10) / 10 : totalVolume;

      for (const prodName of productList) {
        const submissionData = {
          ...formData,
          destination_area: targetTown,
          source_location: targetSource,
          product_category: deriveCategory(prodName),
          product_name: prodName,
          selling_volume_kg: volPerItem,
          volume_period: formData.volume_period || 'Day',
          buying_price_per_kg: parseFloat(formData.buying_price_per_kg) || 0,
          selling_price_per_kg: parseFloat(formData.selling_price_per_kg) || (parseFloat(formData.buying_price_per_kg) * 1.3)
        };
        const result = await submitSurvey(submissionData);
        savedResults.push(result);
      }

      setSubmittedItem({
        id: savedResults.map(r => r.id).join(', '),
        count: savedResults.length,
        productNames: savedResults.map(r => `${r.product_name} (${r.monthly_volume_kg} kg/mo)`).join(', '),
        destination_area: targetTown,
        total_monthly_volume: savedResults.reduce((acc, r) => acc + (r.monthly_volume_kg || 0), 0)
      });

      if (onSurveySubmitted && savedResults.length > 0) {
        onSurveySubmitted(savedResults[0]);
      }
    } catch (err) {
      console.error("Survey submission failed:", err);
      alert("Submission failed. Saved locally.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForNext = () => {
    setSubmittedItem(null);
    setSelectedTownOption('Kakinada');
    setCustomTownName('');
    setTownSearchQuery('');
    setSelectedSourceOption('Bangalore Wholesale Mandi');
    setCustomSourceName('');
    setPainPointSearchQuery('');
    setFormData(prev => ({
      ...prev,
      vendor_name: '',
      contact_person: '',
      phone: '',
      destination_area: 'Kakinada',
      district: 'Kakinada / East Godavari',
      pincode: '533001',
      product_category: 'Mushrooms',
      product_name: 'Milky Mushroom (Calocybe)',
      selling_volume_kg: '',
      volume_period: 'Day',
      frequency: 'Daily',
      source_location: 'Bangalore Wholesale Mandi',
      source_distance_km: 680,
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
            <strong>
              {submittedItem.count > 1 
                ? `${submittedItem.count} Products Recorded Successfully! [${submittedItem.id}]`
                : `Survey Recorded Successfully! [${submittedItem.id}]`
              }
            </strong>
            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.95 }}>
              Demand for {submittedItem.productNames} in {submittedItem.destination_area} (Total: {submittedItem.total_monthly_volume.toLocaleString()} kg/mo) is now logged in the intelligence matrix.
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
              inputMode="numeric"
              pattern="[0-9]{10}"
              maxLength={10}
              className="form-input"
              placeholder="e.g., 9876543210"
              value={formData.phone}
              onChange={handlePhoneChange}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Destination Town / City *</label>
              {selectedTownOption === 'Other' ? (
                <span style={{ fontSize: '0.78rem', color: 'var(--primary-700)', fontWeight: 600 }}>Custom Town Active</span>
              ) : (
                <span style={{ fontSize: '0.78rem', color: '#6b7280' }}>Alphabetical (A-Z)</span>
              )}
            </div>

            {/* Quick Search on Top */}
            <div style={{ position: 'relative', marginBottom: '8px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="🔍 Search town name (e.g. Amalapuram, Rajahmundry)..."
                value={townSearchQuery}
                onChange={(e) => setTownSearchQuery(e.target.value)}
                style={{ fontSize: '0.88rem', padding: '9px 34px 9px 12px', background: '#f8fafc' }}
              />
              {townSearchQuery && (
                <button
                  type="button"
                  onClick={() => setTownSearchQuery('')}
                  title="Clear search"
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: '#e2e8f0',
                    border: 'none',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#475569',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* If user types search query, show quick select chips or 1-click custom town */}
            {townSearchQuery.trim() && (
              <div style={{ marginBottom: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {filteredTowns.slice(0, 6).map(t => (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => {
                      setSelectedTownOption(t.name);
                      setFormData(prev => ({
                        ...prev,
                        destination_area: t.name,
                        district: t.district,
                        pincode: t.pincode
                      }));
                      setTownSearchQuery('');
                    }}
                    style={{
                      background: selectedTownOption === t.name ? 'var(--primary-700)' : 'var(--primary-50)',
                      color: selectedTownOption === t.name ? '#ffffff' : 'var(--primary-800)',
                      border: '1px solid var(--primary-200)',
                      borderRadius: '16px',
                      padding: '4px 10px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    📍 {t.name}
                  </button>
                ))}
                {filteredTowns.length === 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTownOption('Other');
                      setCustomTownName(townSearchQuery.trim());
                      setFormData(prev => ({ ...prev, destination_area: townSearchQuery.trim() }));
                      setTownSearchQuery('');
                    }}
                    style={{
                      background: '#ecfdf5',
                      color: '#065f46',
                      border: '1px dashed #059669',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      width: '100%',
                      textAlign: 'left'
                    }}
                  >
                    ➕ Use "{townSearchQuery.trim()}" as Custom Town / City
                  </button>
                )}
              </div>
            )}

            <select
              className="form-select"
              value={selectedTownOption}
              onChange={handleTownChange}
            >
              {/* SEARCH & CUSTOM OPTION ON TOP */}
              <option value="Other">🔍 Search / Type Custom Town (Not in list)</option>

              {/* REGIONS AND TOWNS SORTED ALPHABETICALLY */}
              {Object.entries(
                (townSearchQuery.trim() ? filteredTowns : REGIONAL_TOWNS).reduce((acc, town) => {
                  acc[town.region] = acc[town.region] || [];
                  acc[town.region].push(town);
                  return acc;
                }, {})
              ).map(([regionName, towns]) => (
                <optgroup key={regionName} label={regionName}>
                  {towns.slice().sort((a, b) => a.name.localeCompare(b.name)).map((t) => (
                    <option key={t.name} value={t.name}>
                      {t.name} ({t.district})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            {/* Extra input box shown when Other is selected */}
            {selectedTownOption === 'Other' && (
              <div style={{ marginTop: '10px' }}>
                <label className="form-label" style={{ color: 'var(--primary-700)', fontWeight: 700 }}>
                  ✏️ Enter Custom Town / City Name *
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type the town or city name (e.g., Jangareddygudem, Narsapur, etc.)"
                  value={customTownName}
                  onChange={(e) => handleCustomTownChange(e.target.value)}
                  required
                  autoFocus
                  style={{ borderColor: 'var(--primary-600)', background: '#f0fbf5' }}
                />
              </div>
            )}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Specific Product Name *</label>
              {getSelectedProductList(formData.product_name).length > 1 && (
                <span style={{ fontSize: '0.78rem', color: 'var(--primary-700)', fontWeight: 600 }}>
                  {getSelectedProductList(formData.product_name).length} Selected
                </span>
              )}
            </div>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Milky Mushroom (Calocybe), White Button Mushroom"
              value={formData.product_name}
              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div style={{ marginBottom: '16px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
            Quick select popular high-demand items (click to select or add multiple):
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {PRODUCT_SUGGESTIONS.map((item) => {
              const selectedList = getSelectedProductList(formData.product_name);
              const isSelected = selectedList.some(p => p.toLowerCase() === item.toLowerCase());
              return (
                <button
                  key={item}
                  type="button"
                  className="product-vol-chip"
                  onClick={() => handleToggleProductChip(item)}
                  style={{
                    cursor: 'pointer',
                    borderColor: isSelected ? 'var(--primary-600)' : 'var(--border-light)',
                    background: isSelected ? 'var(--primary-100)' : '#ffffff',
                    color: isSelected ? 'var(--primary-800)' : 'var(--text-main)',
                    fontWeight: isSelected ? 700 : 500,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {isSelected ? '✓ ' : '+ '} {item}
                </button>
              );
            })}
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Overall Consumption Quantity *</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="number"
                step="0.5"
                min="0.5"
                className="form-input"
                placeholder="e.g., 30"
                value={formData.selling_volume_kg}
                onChange={(e) => setFormData({ ...formData, selling_volume_kg: e.target.value })}
                required
                style={{ flex: 1.2, minWidth: '0' }}
              />
              <select
                className="form-select"
                value={formData.volume_period || 'Day'}
                onChange={(e) => setFormData({ ...formData, volume_period: e.target.value })}
                style={{ flex: 1, minWidth: '125px', fontWeight: 600 }}
              >
                <option value="Day">/ Day (Daily)</option>
                <option value="Week">/ Week (Weekly)</option>
                <option value="Month">/ Month (Monthly)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Frequency of Requirement</label>
            <select
              className="form-select"
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
            >
              <option value="Daily">Daily Consumption / Sales</option>
              <option value="Alternate Days">Alternate Days (Every 2 Days)</option>
              <option value="Twice a Week">Twice a Week</option>
              <option value="Weekly">Weekly Requirement</option>
              <option value="Monthly">Monthly Requirement</option>
              <option value="On-Demand">On-Demand / Intermittent</option>
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
              value={selectedSourceOption}
              onChange={handleSourceChange}
            >
              <option value="Other">🔍 Search / Type Custom Sourcing Location</option>
              {COMMON_SOURCES.slice().sort((a, b) => a.name.localeCompare(b.name)).map(s => (
                <option key={s.name} value={s.name}>{s.name} (~{s.distance} km)</option>
              ))}
            </select>

            {/* Extra input box shown when Other is selected */}
            {selectedSourceOption === 'Other' && (
              <div style={{ marginTop: '10px' }}>
                <label className="form-label" style={{ color: 'var(--primary-700)', fontWeight: 700 }}>
                  ✏️ Enter Custom Sourcing Origin *
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type sourcing origin (e.g., Kakinada Port Market, Local Rythu Bazaar, Specific Mandi)"
                  value={customSourceName}
                  onChange={(e) => handleCustomSourceChange(e.target.value)}
                  required
                  autoFocus
                  style={{ borderColor: 'var(--primary-600)', background: '#f0fbf5' }}
                />
              </div>
            )}
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

        {/* Sourcing Pain Points with Search & Custom Add */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '4px' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>
              <AlertTriangle size={15} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle', color: '#d97706' }} />
              Vendor Pain Points with Current Source
            </label>
            {formData.pain_points.length > 0 && (
              <span style={{ fontSize: '0.78rem', color: 'var(--primary-700)', fontWeight: 600 }}>
                {formData.pain_points.length} Selected
              </span>
            )}
          </div>

          {/* Quick Search & Custom Add Bar */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                className="form-input"
                placeholder="🔍 Search or type custom pain point..."
                value={painPointSearchQuery}
                onChange={(e) => setPainPointSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomPainPoint(painPointSearchQuery);
                  }
                }}
                style={{ fontSize: '0.88rem', padding: '9px 34px 9px 12px', background: '#f8fafc' }}
              />
              {painPointSearchQuery && (
                <button
                  type="button"
                  onClick={() => setPainPointSearchQuery('')}
                  title="Clear search"
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: '#e2e8f0',
                    border: 'none',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#475569',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => handleAddCustomPainPoint(painPointSearchQuery)}
              disabled={!painPointSearchQuery.trim()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0 16px',
                background: painPointSearchQuery.trim() ? 'var(--primary-700)' : '#e2e8f0',
                color: painPointSearchQuery.trim() ? '#ffffff' : '#94a3b8',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: painPointSearchQuery.trim() ? 'pointer' : 'not-allowed',
                whiteSpace: 'nowrap'
              }}
            >
              <Plus size={15} />
              <span>Add Custom</span>
            </button>
          </div>

          {/* Currently Selected Pain Point Badges */}
          {formData.pain_points.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
              {formData.pain_points.map(point => (
                <span
                  key={point}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: 'var(--primary-100)',
                    color: 'var(--primary-900)',
                    border: '1px solid var(--primary-300)',
                    borderRadius: '16px',
                    padding: '3px 10px',
                    fontSize: '0.78rem',
                    fontWeight: 600
                  }}
                >
                  ✓ {point}
                  <button
                    type="button"
                    onClick={() => handlePainPointToggle(point)}
                    title="Remove point"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary-700)',
                      cursor: 'pointer',
                      padding: '0 2px',
                      fontSize: '11px',
                      lineHeight: 1,
                      fontWeight: 700
                    }}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Pain Points Checkbox Grid */}
          <div className="pain-points-grid">
            {filteredPainPoints.map(point => {
              const isChecked = formData.pain_points.includes(point);
              return (
                <label 
                  key={point} 
                  className="checkbox-label"
                  style={{
                    background: isChecked ? 'var(--primary-50)' : 'var(--bg-subtle)',
                    borderColor: isChecked ? 'var(--primary-300)' : 'transparent',
                    fontWeight: isChecked ? 600 : 400
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handlePainPointToggle(point)}
                  />
                  <span>{point}</span>
                </label>
              );
            })}
          </div>

          {/* Empty search state with 1-click Add Custom button */}
          {filteredPainPoints.length === 0 && painPointSearchQuery.trim() && (
            <div style={{ padding: '14px', background: '#ecfdf5', borderRadius: '8px', border: '1px dashed #059669', marginTop: '8px' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '0.84rem', color: '#065f46' }}>
                No existing pain point matches "<strong>{painPointSearchQuery.trim()}</strong>"
              </p>
              <button
                type="button"
                onClick={() => handleAddCustomPainPoint(painPointSearchQuery)}
                style={{
                  background: 'var(--primary-700)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 14px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Plus size={14} />
                <span>Add "{painPointSearchQuery.trim()}" as Custom Pain Point</span>
              </button>
            </div>
          )}
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
