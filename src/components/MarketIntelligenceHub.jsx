import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  MapPin, 
  PlusCircle, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import MarketSurveyForm from './MarketSurveyForm';
import MarketIntelligenceDashboard from './MarketIntelligenceDashboard';
import { getLocalSurveys, clearAllSurveys, resetToBenchmarkSurveys, IS_DEMO_DATA_ENABLED } from '../data/surveyService';
import '../styles/MarketIntelligence.css';

export default function MarketIntelligenceHub({ onBackToStorefront, initialTab = 'analytics' }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'analytics' | 'survey'
  const [surveys, setSurveys] = useState([]);

  useEffect(() => {
    // Load local initial / saved surveys
    const loaded = getLocalSurveys();
    setSurveys(loaded);
  }, []);

  const handleSurveySubmitted = (newSurvey) => {
    setSurveys(prev => [newSurvey, ...prev]);
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all survey records? This will leave your dashboard completely clean for real field data.")) {
      const empty = clearAllSurveys();
      setSurveys(empty);
    }
  };

  const handleResetDemo = () => {
    const demo = resetToBenchmarkSurveys();
    setSurveys(demo);
  };

  return (
    <div className="intel-hub-wrapper">
      {/* Top Banner Header */}
      <header className="intel-header-banner">
        <div className="intel-header-container">
          <div className="intel-title-block">
            <div className="intel-badge-live">
              <span className="live-pulse-dot"></span>
              <span>Godavari Regional Agri-Intelligence</span>
            </div>
            <h1>
              <span>🌾 Market Survey & Geo-Sourcing Matrix</span>
            </h1>
            <p>
              Tracking ground sales volume, area consumption requirements, and interstate supply flows across East/West Godavari, Krishna, and Visakhapatnam trading corridors.
            </p>
          </div>

          <div className="intel-top-actions">
            <button
              className={`btn-tab-switch ${activeTab === 'analytics' ? 'active' : 'inactive'}`}
              onClick={() => setActiveTab('analytics')}
            >
              <BarChart3 size={16} />
              <span>Geo-Analytics & Sourcing Flows</span>
            </button>

            <button
              className={`btn-tab-switch ${activeTab === 'survey' ? 'active' : 'inactive'}`}
              onClick={() => setActiveTab('survey')}
            >
              <PlusCircle size={16} />
              <span>Field Survey Intake</span>
            </button>

            <button className="btn-back-store" onClick={onBackToStorefront}>
              <ArrowLeft size={15} />
              <span>Back to Storefront</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="intel-content-container">
        {activeTab === 'analytics' ? (
          <MarketIntelligenceDashboard 
            surveys={surveys}
            onOpenSurveyForm={() => setActiveTab('survey')}
            onClearAllSurveys={handleClearAll}
            onResetDemoSurveys={handleResetDemo}
          />
        ) : (
          <MarketSurveyForm 
            onSurveySubmitted={handleSurveySubmitted}
            onViewAnalytics={() => setActiveTab('analytics')}
          />
        )}
      </main>
    </div>
  );
}
