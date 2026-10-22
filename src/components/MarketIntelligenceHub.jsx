import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  MapPin, 
  PlusCircle, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck,
  TrendingUp,
  UserCheck,
  LogOut,
  Users
} from 'lucide-react';
import MarketSurveyForm from './MarketSurveyForm';
import MarketIntelligenceDashboard from './MarketIntelligenceDashboard';
import PartnerSplitwiseHub from './PartnerSplitwiseHub';
import { getLocalSurveys, clearAllSurveys, resetToBenchmarkSurveys, IS_DEMO_DATA_ENABLED } from '../data/surveyService';
import { useAuth } from '../context/AuthContext';
import '../styles/MarketIntelligence.css';

export default function MarketIntelligenceHub({ onBackToStorefront, initialTab = 'analytics' }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'analytics' | 'survey' | 'splitwise'
  const [surveys, setSurveys] = useState([]);
  const { user, isAdmin, logout } = useAuth();

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
      {/* Admin Session Status Ribbon */}
      <div style={{
        background: '#123522',
        color: '#e2f5ec',
        padding: '6px 24px',
        fontSize: '0.78rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={14} color="#86efac" />
          <span>
            Admin Session Active: <strong>{user?.name || 'Administrator'}</strong>
            {user?.email && ` (${user.email})`}
          </span>
          <span style={{
            background: '#d97706',
            color: '#fff',
            fontSize: '0.66rem',
            padding: '1px 6px',
            borderRadius: '4px',
            fontWeight: 700,
            textTransform: 'uppercase'
          }}>
            Via {user?.provider || 'Auth'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            type="button"
            onClick={onBackToStorefront}
            style={{
              background: 'none',
              border: 'none',
              color: '#86efac',
              cursor: 'pointer',
              fontSize: '0.76rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            Storefront View
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={logout}
            style={{
              background: 'none',
              border: 'none',
              color: '#fca5a5',
              cursor: 'pointer',
              fontSize: '0.76rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <LogOut size={12} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Top Banner Header */}
      <header className="intel-header-banner">
        <div className="intel-header-container">
          <div className="intel-title-block">
            <div className="intel-badge-live">
              <span className="live-pulse-dot"></span>
              <span>Godavari Regional Agri-Intelligence • Admin Portal</span>
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

            <button
              className={`btn-tab-switch ${activeTab === 'splitwise' ? 'active' : 'inactive'}`}
              onClick={() => setActiveTab('splitwise')}
            >
              <Users size={16} />
              <span>3-Partner Splitwise & Capital</span>
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
        {activeTab === 'analytics' && (
          <MarketIntelligenceDashboard 
            surveys={surveys}
            onOpenSurveyForm={() => setActiveTab('survey')}
            onClearAllSurveys={handleClearAll}
            onResetDemoSurveys={handleResetDemo}
          />
        )}
        {activeTab === 'survey' && (
          <MarketSurveyForm 
            onSurveySubmitted={handleSurveySubmitted}
            onViewAnalytics={() => setActiveTab('analytics')}
          />
        )}
        {activeTab === 'splitwise' && (
          <PartnerSplitwiseHub />
        )}
      </main>
    </div>
  );
}
