import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  MapPin, 
  Truck, 
  TrendingUp, 
  AlertCircle, 
  Download, 
  PlusCircle, 
  Search, 
  Filter, 
  Layers, 
  Zap, 
  ArrowRight,
  RefreshCw,
  Building2,
  Calendar,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { computeAnalytics, exportSurveysToCSV } from '../data/surveyService';

export default function MarketIntelligenceDashboard({ 
  surveys, 
  onOpenSurveyForm,
  onClearAllSurveys,
  onResetDemoSurveys
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArea, setSelectedArea] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered surveys
  const filteredSurveys = useMemo(() => {
    return surveys.filter(s => {
      const matchCat = selectedCategory === 'all' || (s.product_category || '').toLowerCase() === selectedCategory.toLowerCase();
      const matchArea = selectedArea === 'all' || (s.destination_area || '').toLowerCase() === selectedArea.toLowerCase();
      const matchSearch = !searchQuery.trim() || 
        (s.vendor_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.product_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.destination_area || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.source_location || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchArea && matchSearch;
    });
  }, [surveys, selectedCategory, selectedArea, searchQuery]);

  // Compute live analytics based on currently filtered surveys
  const analytics = useMemo(() => {
    return computeAnalytics(filteredSurveys);
  }, [filteredSurveys]);

  // Unique categories and areas for filters
  const categories = useMemo(() => {
    const set = new Set(surveys.map(s => s.product_category).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [surveys]);

  const areas = useMemo(() => {
    const set = new Set(surveys.map(s => s.destination_area).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [surveys]);

  // Maximum monthly demand among areas for the progress bar calculation
  const maxAreaKg = useMemo(() => {
    if (!analytics.area_demands.length) return 1;
    return Math.max(...analytics.area_demands.map(a => a.total_monthly_kg));
  }, [analytics]);

  return (
    <div className="intel-dashboard-view">
      {/* 1. Top Executive KPI Cards */}
      <div className="kpi-grid">
        {/* KPI 1: Total Demand Requirement */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Analyzed Demand Volume</span>
            <div className="kpi-icon-pill" style={{ background: '#e0f2fe', color: '#0369a1' }}>
              <Layers size={20} />
            </div>
          </div>
          <div className="kpi-value">{analytics.total_monthly_demand_kg.toLocaleString()} <span style={{ fontSize: '1rem', fontWeight: 500 }}>kg/mo</span></div>
          <div className="kpi-footer">
            <Zap size={14} color="#10b981" />
            <span>~{Math.round(analytics.total_monthly_demand_kg / 30).toLocaleString()} kg/day across surveyed hubs</span>
          </div>
        </div>

        {/* KPI 2: Annualized Market Value */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Annualized Turnover</span>
            <div className="kpi-icon-pill" style={{ background: '#fef3c7', color: '#b45309' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="kpi-value">₹{(analytics.total_annual_value_inr / 100000).toFixed(1)} <span style={{ fontSize: '1rem', fontWeight: 500 }}>Lakhs/yr</span></div>
          <div className="kpi-footer">
            <span>Based on current ground purchase rates</span>
          </div>
        </div>

        {/* KPI 3: External Supply Dependency */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">External Inflow Dependency</span>
            <div className="kpi-icon-pill" style={{ background: '#fee2e2', color: '#b91c1c' }}>
              <Truck size={20} />
            </div>
          </div>
          <div className="kpi-value">{analytics.external_dependency_percentage}%</div>
          <div className="kpi-footer" style={{ color: analytics.external_dependency_percentage > 50 ? '#b91c1c' : '#15803d' }}>
            <AlertCircle size={14} />
            <span>{analytics.external_dependency_percentage > 50 ? 'Heavy reliance on distant interstate mandis' : 'Strong local presence'}</span>
          </div>
        </div>

        {/* KPI 4: Prime Arbitrage Opportunities */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Displacement Opportunities</span>
            <div className="kpi-icon-pill" style={{ background: '#dcfce7', color: '#15803d' }}>
              <Zap size={20} />
            </div>
          </div>
          <div className="kpi-value">{analytics.high_opportunity_gaps.length} <span style={{ fontSize: '1rem', fontWeight: 500 }}>High Gaps</span></div>
          <div className="kpi-footer">
            <span>Potential for same-day local farm replacement</span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Filter & Action Bar */}
      <div className="survey-filter-bar">
        <div className="filter-pills-group">
          {categories.map(cat => (
            <button
              key={cat}
              className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            className="form-select"
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.84rem' }}
          >
            <option value="all">All Areas / Towns</option>
            {areas.filter(a => a !== 'all').map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          <button className="btn-export-csv" onClick={() => exportSurveysToCSV(filteredSurveys)} title="Download Excel/CSV Report">
            <Download size={15} />
            <span>Export CSV</span>
          </button>

          {surveys.length > 0 && onClearAllSurveys && (
            <button 
              className="btn-export-csv" 
              onClick={onClearAllSurveys} 
              title="Clear all demo/sample surveys to start with a blank database"
              style={{ color: '#b91c1c', borderColor: '#fca5a5' }}
            >
              <Trash2 size={15} color="#b91c1c" />
              <span>Clear Data</span>
            </button>
          )}

          {surveys.length === 0 && onResetDemoSurveys && (
            <button 
              className="btn-export-csv" 
              onClick={onResetDemoSurveys} 
              title="Load benchmark sample data for testing"
              style={{ color: 'var(--primary-700)', borderColor: 'var(--primary-400)' }}
            >
              <RotateCcw size={15} color="var(--primary-600)" />
              <span>Load Demo Data</span>
            </button>
          )}

          <button 
            className="btn-tab-switch active" 
            onClick={onOpenSurveyForm}
            style={{ padding: '8px 14px', fontSize: '0.84rem', background: 'var(--primary-700)', color: '#ffffff' }}
          >
            <PlusCircle size={15} />
            <span>Add Ground Survey</span>
          </button>
        </div>
      </div>

      {/* 3. Two-Column Dashboard: Area Demand Breakdown & Supply Inflows */}
      <div className="dashboard-grid-2col">
        {/* Left: Area-wise Demand Aggregation */}
        <div className="intel-panel">
          <div className="panel-title-bar">
            <div>
              <h3 className="panel-title">
                <MapPin size={20} color="var(--primary-600)" />
                <span>Geographic Demand Breakdown (Area Requirements)</span>
              </h3>
              <p className="panel-subtitle">Total kilograms required per month grouped by consumer town/city</p>
            </div>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-700)' }}>
              {analytics.area_demands.length} Towns Mapped
            </span>
          </div>

          <div className="area-demand-list">
            {analytics.area_demands.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>No surveys match current filters.</p>
            ) : (
              analytics.area_demands.map(area => {
                const percentage = Math.round((area.total_monthly_kg / maxAreaKg) * 100);
                return (
                  <div key={area.area} className="area-demand-card">
                    <div className="area-demand-top">
                      <div className="area-name-wrap">
                        <span className="area-name">{area.area}</span>
                        <span className="district-tag">{area.district}</span>
                      </div>
                      <span className="area-total-vol">
                        {area.total_monthly_kg.toLocaleString()} <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>kg/mo</span>
                      </span>
                    </div>

                    {/* Progress Bar of Relative Volume */}
                    <div className="demand-progress-bar-bg">
                      <div className="demand-progress-fill" style={{ width: `${percentage}%` }}></div>
                    </div>

                    {/* Product Demand Chips */}
                    <div className="area-breakdown-tags">
                      {area.top_products.map(p => (
                        <span key={p.name} className="product-vol-chip">
                          <strong>{p.name}:</strong> {p.volume_kg} kg
                        </span>
                      ))}
                    </div>

                    {/* Where it is currently sourced from */}
                    <div className="area-sources-flow">
                      <Truck size={13} />
                      <span><strong>Currently Sourced From:</strong> {area.top_sources.join(', ') || 'Various'}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Supply Route Inflow Tracker (Origin -> Destination) */}
        <div className="intel-panel">
          <div className="panel-title-bar">
            <div>
              <h3 className="panel-title">
                <Truck size={20} color="var(--primary-600)" />
                <span>Supply Route Inflow Tracker (Where it comes from)</span>
              </h3>
              <p className="panel-subtitle">Origin source, transit distances, and external supply risks</p>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="supply-routes-table">
              <thead>
                <tr>
                  <th>Origin ➔ Destination</th>
                  <th>Product</th>
                  <th>Monthly Vol</th>
                  <th>Avg Sourced Rate</th>
                  <th>Transit Vulnerability</th>
                </tr>
              </thead>
              <tbody>
                {analytics.supply_routes.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                      No route flows recorded.
                    </td>
                  </tr>
                ) : (
                  analytics.supply_routes.map((route, idx) => (
                    <tr key={`${route.source_location}-${route.destination_area}-${idx}`}>
                      <td>
                        <div className="route-flow-cell">
                          <span style={{ color: 'var(--text-muted)' }}>{route.source_location.replace('Wholesale Mandi', '').replace('Wholesale Market', '')}</span>
                          <span className="route-arrow">➔</span>
                          <span style={{ color: 'var(--primary-900)' }}>{route.destination_area}</span>
                        </div>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-light)' }}>
                          ~{route.distance_km} km road transit
                        </span>
                      </td>
                      <td>
                        <strong>{route.product_name}</strong>
                      </td>
                      <td>
                        {route.monthly_volume_kg.toLocaleString()} kg
                      </td>
                      <td>
                        ₹{route.avg_buying_price}/kg
                      </td>
                      <td>
                        <span className={`risk-badge ${route.distance_km >= 500 ? 'severe' : (route.distance_km >= 200 ? 'moderate' : 'local')}`}>
                          {route.transit_risk}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. High-Opportunity Local Arbitrage Cards */}
      <div className="intel-panel" style={{ marginBottom: '28px' }}>
        <div className="panel-title-bar">
          <div>
            <h3 className="panel-title">
              <Zap size={20} color="var(--accent-amber)" />
              <span>High-Opportunity Local Supply Arbitrage Gaps</span>
            </h3>
            <p className="panel-subtitle">
              High-demand products with heavy transit lag (&gt;200 km). Godavari Grown can supply these locally within 24 hours with superior freshness and pricing advantages.
            </p>
          </div>
        </div>

        <div className="opportunity-grid">
          {analytics.high_opportunity_gaps.slice(0, 4).map((opp, idx) => (
            <div key={idx} className="opp-card">
              <div className="opp-urgency-badge">{opp.urgency}</div>
              <div className="opp-product-title">{opp.product_name}</div>
              
              <div className="opp-details-row">
                <span>Target Consumption Market:</span>
                <strong>{opp.destination_area}</strong>
              </div>

              <div className="opp-details-row">
                <span>Current Distant Sourcing:</span>
                <span>{opp.current_source} (~{opp.distance_km} km)</span>
              </div>

              <div className="opp-details-row">
                <span>Current Monthly Demand:</span>
                <strong>{opp.monthly_volume_kg.toLocaleString()} kg/mo</strong>
              </div>

              <div className="opp-details-row">
                <span>Current Vendor Sourcing Rate:</span>
                <span>₹{opp.current_buying_price}/kg</span>
              </div>

              <div className="opp-saving-highlight">
                <div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--primary-800)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
                    Est. Local Cost Arbitrage
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Target Local Price: ₹{opp.potential_local_supply_price}/kg
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--primary-800)', display: 'block' }}>Monthly Market Savings</span>
                  <span className="opp-saving-amount">₹{opp.potential_monthly_savings_inr.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Complete Searchable Survey Log */}
      <div className="intel-panel">
        <div className="panel-title-bar">
          <div>
            <h3 className="panel-title">
              <Building2 size={20} color="var(--primary-600)" />
              <span>Ground Survey Logs ({filteredSurveys.length} submissions)</span>
            </h3>
            <p className="panel-subtitle">Audit trail of all field surveys collected from vendors, supermarkets, and restaurants</p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div className="search-input-box" style={{ width: '240px', padding: '6px 12px' }}>
              <Search size={14} className="search-icon" />
              <input
                type="text"
                placeholder="Search vendor, produce..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ fontSize: '0.82rem' }}
              />
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="supply-routes-table">
            <thead>
              <tr>
                <th>ID / Date</th>
                <th>Vendor / Business</th>
                <th>Type</th>
                <th>Consumption Area</th>
                <th>Produce / Item</th>
                <th>Volume (kg/mo)</th>
                <th>Current Sourcing Location</th>
                <th>Buying Rate</th>
                <th>Pain Points</th>
              </tr>
            </thead>
            <tbody>
              {filteredSurveys.map(s => (
                <tr key={s.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--primary-700)' }}>{s.id}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-light)' }}>
                      {s.timestamp ? new Date(s.timestamp).toLocaleDateString() : 'Recent'}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{s.vendor_name}</div>
                    {s.contact_person && (
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        {s.contact_person} {s.phone ? `(${s.phone})` : ''}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="district-tag">{s.vendor_type}</span>
                  </td>
                  <td>
                    <strong>{s.destination_area}</strong>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{s.district}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{s.product_name}</span>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{s.product_category}</div>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--primary-900)' }}>
                      {(s.monthly_volume_kg || 0).toLocaleString()} kg
                    </strong>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {s.selling_volume_kg} kg/{s.frequency?.toLowerCase() || 'day'}
                    </div>
                  </td>
                  <td>
                    <div>{s.source_location}</div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>~{s.source_distance_km || 0} km away</span>
                  </td>
                  <td>
                    <strong>₹{s.buying_price_per_kg}/kg</strong>
                    {s.selling_price_per_kg && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Sells: ₹{s.selling_price_per_kg}/kg
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxWidth: '200px' }}>
                      {(s.pain_points || []).slice(0, 2).map((pp, i) => (
                        <span key={i} style={{ fontSize: '0.72rem', background: '#fee2e2', color: '#991b1b', padding: '2px 6px', borderRadius: '4px' }}>
                          {pp}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
