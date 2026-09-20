/**
 * Godavari Grown — Market Survey & Geo-Intelligence Service
 * Handles field survey ingestion, local persistence, real-time analytics aggregation, and API syncing.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api/surveys`
  : (import.meta.env.DEV ? 'http://localhost:8000/api/surveys' : '/api/surveys');

const STORAGE_KEY = 'gg_market_surveys_data';

// Initial regional benchmark datasets (Godavari Basin, Krishna, and Vizag trading corridors)
export const INITIAL_BENCHMARK_SURVEYS = [
  {
    id: "SRV-GOD-001",
    timestamp: "2026-09-15T09:30:00Z",
    vendor_name: "Sri Lakshmi Wholesale Vegetables & Produce",
    vendor_type: "Wholesaler",
    contact_person: "R. Satyanarayana",
    phone: "+91 98480 12345",
    destination_area: "Kakinada",
    district: "East Godavari",
    pincode: "533001",
    gps_lat: 16.9891,
    gps_lng: 82.2475,
    product_category: "Mushrooms",
    product_name: "White Button Mushroom",
    selling_volume_kg: 45.0,
    frequency: "Daily",
    monthly_volume_kg: 1350.0,
    source_location: "Bangalore Wholesale Mandi",
    source_distance_km: 680,
    buying_price_per_kg: 175.0,
    selling_price_per_kg: 230.0,
    pain_points: ["Transit Spoilage (10-15%)", "Price Volatility", "2-Day Delivery Lag"],
    notes: "Retailers complain about browning mushrooms due to overnight non-AC road transit from Karnataka."
  },
  {
    id: "SRV-GOD-002",
    timestamp: "2026-09-15T11:15:00Z",
    vendor_name: "Godavari Grand Banquet & Kitchens",
    vendor_type: "Restaurant/HORECA",
    contact_person: "Chef Murthy",
    phone: "+91 99890 54321",
    destination_area: "Rajahmundry",
    district: "East Godavari",
    pincode: "533101",
    gps_lat: 17.0005,
    gps_lng: 81.8040,
    product_category: "Mushrooms",
    product_name: "Milky Mushroom (Calocybe)",
    selling_volume_kg: 25.0,
    frequency: "Daily",
    monthly_volume_kg: 750.0,
    source_location: "Hyderabad Wholesale Market",
    source_distance_km: 430,
    buying_price_per_kg: 190.0,
    selling_price_per_kg: 260.0,
    pain_points: ["Irregular Supply", "High Freight Charges"],
    notes: "Great demand for Indian curries and biryanis; local stock runs out by afternoon."
  },
  {
    id: "SRV-GOD-003",
    timestamp: "2026-09-16T14:20:00Z",
    vendor_name: "Fresh Basket Gourmet Store",
    vendor_type: "Supermarket",
    contact_person: "K. Srinivas",
    phone: "+91 97011 88990",
    destination_area: "Bhimavaram",
    district: "West Godavari",
    pincode: "534201",
    gps_lat: 16.5449,
    gps_lng: 81.5212,
    product_category: "Exotic Veggies",
    product_name: "Broccoli (Green)",
    selling_volume_kg: 30.0,
    frequency: "Daily",
    monthly_volume_kg: 900.0,
    source_location: "Bangalore Wholesale Mandi",
    source_distance_km: 640,
    buying_price_per_kg: 140.0,
    selling_price_per_kg: 210.0,
    pain_points: ["High Freight Cost", "Yellowing heads during transit"],
    notes: "Aqua farm owners and doctors in Bhimavaram are regular buyers of health greens."
  },
  {
    id: "SRV-GOD-004",
    timestamp: "2026-09-16T16:45:00Z",
    vendor_name: "Delta Agri Mart",
    vendor_type: "Retailer",
    contact_person: "V. Prasad",
    phone: "+91 94401 22334",
    destination_area: "Eluru",
    district: "West Godavari",
    pincode: "534001",
    gps_lat: 16.7107,
    gps_lng: 81.0952,
    product_category: "Exotic Veggies",
    product_name: "Bell Pepper (Red/Yellow)",
    selling_volume_kg: 20.0,
    frequency: "Daily",
    monthly_volume_kg: 600.0,
    source_location: "Hyderabad Mandi",
    source_distance_km: 340,
    buying_price_per_kg: 160.0,
    selling_price_per_kg: 240.0,
    pain_points: ["Frequent Stockouts", "Middleman Margin Markups"],
    notes: "Ordered through Vijayawada intermediary who charges ₹25/kg commission."
  },
  {
    id: "SRV-GOD-005",
    timestamp: "2026-09-17T10:00:00Z",
    vendor_name: "Annapurna Hotel Caterers",
    vendor_type: "Restaurant/HORECA",
    contact_person: "Ch. Venkat",
    phone: "+91 93930 77112",
    destination_area: "Vijayawada",
    district: "Krishna",
    pincode: "520001",
    gps_lat: 16.5062,
    gps_lng: 80.6480,
    product_category: "Mushrooms",
    product_name: "Oyster Mushroom (Pleurotus)",
    selling_volume_kg: 50.0,
    frequency: "Daily",
    monthly_volume_kg: 1500.0,
    source_location: "Local Small Farms (Intermittent)",
    source_distance_km: 45,
    buying_price_per_kg: 160.0,
    selling_price_per_kg: 220.0,
    pain_points: ["Inconsistent Daily Supply", "Lack of Certified Quality"],
    notes: "Needs guaranteed 50kg/day fresh harvest with FSSAI certificate for catering contracts."
  },
  {
    id: "SRV-GOD-006",
    timestamp: "2026-09-17T15:30:00Z",
    vendor_name: "Vizag Urban Greens Superstore",
    vendor_type: "Supermarket",
    contact_person: "S. Anita",
    phone: "+91 91000 66554",
    destination_area: "Visakhapatnam",
    district: "Visakhapatnam",
    pincode: "530002",
    gps_lat: 17.6868,
    gps_lng: 83.2185,
    product_category: "Mushrooms",
    product_name: "White Button Mushroom",
    selling_volume_kg: 80.0,
    frequency: "Daily",
    monthly_volume_kg: 2400.0,
    source_location: "Ooty / Bengaluru Cold Logistics",
    source_distance_km: 850,
    buying_price_per_kg: 185.0,
    selling_price_per_kg: 250.0,
    pain_points: ["High Carbon Footprint", "Refrigeration breakdown damages stock"],
    notes: "Looking for regional Godavari farm supplier with same-day express dispatch."
  },
  {
    id: "SRV-GOD-007",
    timestamp: "2026-09-18T12:00:00Z",
    vendor_name: "Konaseema Organic Store",
    vendor_type: "Retailer",
    contact_person: "M. Subba Rao",
    phone: "+91 98855 44321",
    destination_area: "Amalapuram",
    district: "East Godavari",
    pincode: "533201",
    gps_lat: 16.5787,
    gps_lng: 82.0061,
    product_category: "Fruits",
    product_name: "Dragon Fruit (Red Flesh)",
    selling_volume_kg: 15.0,
    frequency: "Daily",
    monthly_volume_kg: 450.0,
    source_location: "Hyderabad Fruit Mandi",
    source_distance_km: 490,
    buying_price_per_kg: 130.0,
    selling_price_per_kg: 190.0,
    pain_points: ["Bruising in Transit", "High Transport Cost"],
    notes: "Willing to source locally grown organic fruits directly from Godavari cultivators."
  }
];

// Environment Variable: Set VITE_ENABLE_DEMO_DATA=true to load demo data.
// In production deployment (or when VITE_ENABLE_DEMO_DATA is 'false' / unset), the app starts with a blank database (0 surveys).
export const IS_DEMO_DATA_ENABLED = import.meta.env.VITE_ENABLE_DEMO_DATA === 'true';

export function getLocalSurveys() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data === null) {
      const initial = IS_DEMO_DATA_ENABLED ? INITIAL_BENCHMARK_SURVEYS : [];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  } catch (err) {
    console.warn("Storage access error, using fallback surveys:", err);
    return IS_DEMO_DATA_ENABLED ? INITIAL_BENCHMARK_SURVEYS : [];
  }
}

export function clearAllSurveys() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    return [];
  } catch (err) {
    console.error("Failed to clear surveys:", err);
    return [];
  }
}

export function resetToBenchmarkSurveys() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BENCHMARK_SURVEYS));
    return INITIAL_BENCHMARK_SURVEYS;
  } catch (err) {
    console.error("Failed to reset surveys:", err);
    return INITIAL_BENCHMARK_SURVEYS;
  }
}

export function saveLocalSurveys(surveys) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(surveys));
  } catch (err) {
    console.error("Failed to save to localStorage:", err);
  }
}

export function computeMonthlyVolume(volume, frequency) {
  const num = parseFloat(volume) || 0;
  const freq = (frequency || '').toLowerCase();
  if (freq.includes('daily')) return Math.round(num * 30 * 10) / 10;
  if (freq.includes('weekly')) return Math.round(num * 4.33 * 10) / 10;
  return Math.round(num * 10) / 10;
}

export async function submitSurvey(surveyData) {
  const monthlyVol = computeMonthlyVolume(surveyData.selling_volume_kg, surveyData.frequency);
  const newSurvey = {
    ...surveyData,
    id: `SRV-GG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    timestamp: new Date().toISOString(),
    monthly_volume_kg: monthlyVol,
    selling_volume_kg: parseFloat(surveyData.selling_volume_kg) || 0,
    buying_price_per_kg: parseFloat(surveyData.buying_price_per_kg) || 0,
    selling_price_per_kg: parseFloat(surveyData.selling_price_per_kg) || (parseFloat(surveyData.buying_price_per_kg) * 1.3),
    source_distance_km: parseInt(surveyData.source_distance_km, 10) || 0
  };

  // Try API submission
  try {
    const resp = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSurvey)
    });
    if (resp.ok) {
      const saved = await resp.json();
      const local = getLocalSurveys();
      saveLocalSurveys([saved, ...local]);
      return saved;
    }
  } catch (err) {
    console.warn("FastAPI backend unreachable, saved locally in browser:", err);
  }

  // Fallback to local storage
  const current = getLocalSurveys();
  const updated = [newSurvey, ...current];
  saveLocalSurveys(updated);
  return newSurvey;
}

export function computeAnalytics(surveys) {
  const totalSurveys = surveys.length;
  const totalMonthlyDemandKg = surveys.reduce((acc, s) => acc + (s.monthly_volume_kg || 0), 0);
  
  const totalAnnualValueInr = surveys.reduce((acc, s) => {
    const rate = s.selling_price_per_kg || s.buying_price_per_kg || 100;
    return acc + (s.monthly_volume_kg || 0) * rate * 12;
  }, 0);

  const externalVolume = surveys
    .filter(s => (s.source_distance_km || 0) > 100)
    .reduce((acc, s) => acc + (s.monthly_volume_kg || 0), 0);

  const externalDependencyPercentage = totalMonthlyDemandKg > 0
    ? Math.round((externalVolume / totalMonthlyDemandKg) * 100 * 10) / 10
    : 0;

  // Area Demand Aggregation
  const areaMap = {};
  surveys.forEach(s => {
    const area = s.destination_area || 'Other';
    const dist = s.district || 'General';
    const vol = s.monthly_volume_kg || 0;
    const prod = s.product_name || 'Unknown';
    const src = s.source_location || 'Unknown';

    if (!areaMap[area]) {
      areaMap[area] = {
        area,
        district: dist,
        total_monthly_kg: 0,
        products: {},
        sources: new Set()
      };
    }
    areaMap[area].total_monthly_kg += vol;
    areaMap[area].products[prod] = (areaMap[area].products[prod] || 0) + vol;
    areaMap[area].sources.add(src);
  });

  const areaDemands = Object.values(areaMap).map(a => {
    const sortedProds = Object.entries(a.products)
      .map(([name, volume_kg]) => ({ name, volume_kg: Math.round(volume_kg * 10) / 10 }))
      .sort((x, y) => y.volume_kg - x.volume_kg);

    return {
      area: a.area,
      district: a.district,
      total_monthly_kg: Math.round(a.total_monthly_kg * 10) / 10,
      top_products: sortedProds,
      top_sources: Array.from(a.sources).slice(0, 4)
    };
  }).sort((a, b) => b.total_monthly_kg - a.total_monthly_kg);

  // Supply Flow Routes (Origin -> Destination)
  const routesMap = {};
  surveys.forEach(s => {
    const key = `${s.source_location}__${s.destination_area}__${s.product_name}`;
    if (!routesMap[key]) {
      routesMap[key] = {
        source_location: s.source_location,
        destination_area: s.destination_area,
        product_name: s.product_name,
        monthly_volume_kg: 0,
        prices: [],
        distance_km: s.source_distance_km || 0
      };
    }
    routesMap[key].monthly_volume_kg += (s.monthly_volume_kg || 0);
    if (s.buying_price_per_kg) {
      routesMap[key].prices.push(s.buying_price_per_kg);
    }
  });

  const supplyRoutes = Object.values(routesMap).map(r => {
    const avgPrice = r.prices.length > 0
      ? Math.round((r.prices.reduce((a, b) => a + b, 0) / r.prices.length) * 10) / 10
      : 0;
    const dist = r.distance_km;
    const transitRisk = dist >= 500
      ? 'Severe Transit Lag (>500 km, Spoilage Risk)'
      : (dist >= 200 ? 'Moderate Transit Delay (200-500 km)' : 'Local / Minimal Lag');

    return {
      ...r,
      monthly_volume_kg: Math.round(r.monthly_volume_kg * 10) / 10,
      avg_buying_price: avgPrice,
      transit_risk: transitRisk
    };
  }).sort((a, b) => b.monthly_volume_kg - a.monthly_volume_kg);

  // High Opportunity Local Displacement Arbitrage
  const highOpportunityGaps = supplyRoutes
    .filter(r => r.distance_km >= 200)
    .map(r => {
      const estimatedLocalCost = Math.round(r.avg_buying_price * 0.75);
      const savingsPerKg = Math.round(r.avg_buying_price - estimatedLocalCost);
      const monthlySavingsInr = Math.round(savingsPerKg * r.monthly_volume_kg);
      return {
        product_name: r.product_name,
        destination_area: r.destination_area,
        current_source: r.source_location,
        distance_km: r.distance_km,
        monthly_volume_kg: r.monthly_volume_kg,
        current_buying_price: r.avg_buying_price,
        potential_local_supply_price: estimatedLocalCost,
        potential_monthly_savings_inr: monthlySavingsInr,
        urgency: r.distance_km > 600 ? "🔥 Critical Sourcing Bottleneck" : "⚡ High Local Margin Gap"
      };
    })
    .sort((a, b) => b.potential_monthly_savings_inr - a.potential_monthly_savings_inr);

  return {
    total_surveys: totalSurveys,
    total_monthly_demand_kg: Math.round(totalMonthlyDemandKg * 10) / 10,
    total_annual_value_inr: Math.round(totalAnnualValueInr),
    external_dependency_percentage: externalDependencyPercentage,
    area_demands: areaDemands,
    supply_routes: supplyRoutes,
    high_opportunity_gaps: highOpportunityGaps
  };
}

export function exportSurveysToCSV(surveys) {
  const headers = [
    "Survey ID",
    "Timestamp",
    "Vendor Name",
    "Vendor Type",
    "Contact Person",
    "Phone",
    "Destination Area",
    "District",
    "Product Category",
    "Product Name",
    "Selling Volume (kg)",
    "Frequency",
    "Calculated Monthly (kg)",
    "Source Location",
    "Source Distance (km)",
    "Buying Price (INR/kg)",
    "Selling Price (INR/kg)",
    "Pain Points",
    "Notes"
  ];

  const rows = surveys.map(s => [
    `"${s.id || ''}"`,
    `"${s.timestamp || ''}"`,
    `"${(s.vendor_name || '').replace(/"/g, '""')}"`,
    `"${s.vendor_type || ''}"`,
    `"${(s.contact_person || '').replace(/"/g, '""')}"`,
    `"${s.phone || ''}"`,
    `"${s.destination_area || ''}"`,
    `"${s.district || ''}"`,
    `"${s.product_category || ''}"`,
    `"${s.product_name || ''}"`,
    s.selling_volume_kg || 0,
    `"${s.frequency || ''}"`,
    s.monthly_volume_kg || 0,
    `"${(s.source_location || '').replace(/"/g, '""')}"`,
    s.source_distance_km || 0,
    s.buying_price_per_kg || 0,
    s.selling_price_per_kg || 0,
    `"${(s.pain_points || []).join('; ')}"`,
    `"${(s.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `godavari_grown_market_survey_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
