import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  PlusCircle, 
  ArrowRight, 
  ArrowLeftRight, 
  TrendingUp, 
  Wallet, 
  Receipt, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Download, 
  Edit3, 
  X,
  PieChart,
  ShieldCheck,
  CreditCard,
  RefreshCw,
  UserPlus,
  Database,
  AlertTriangle
} from 'lucide-react';
import { 
  calculateSplitwiseSummary, 
  formatINR, 
  EXPENSE_CATEGORIES, 
  INVESTMENT_CATEGORIES,
  DEFAULT_PARTNERS 
} from '../utils/splitwiseEngine';
import { 
  fetchPartnersFromDb,
  createPartnerInDb,
  updatePartnerInDb,
  deletePartnerFromDb,
  fetchTransactionsFromDb,
  createTransactionInDb,
  deleteTransactionFromDb,
  clearAllTransactionsFromDb,
  DatabaseException
} from '../data/partnerLedgerService';
import '../styles/PartnerSplitwise.css';

export default function PartnerSplitwiseHub() {
  const [partners, setPartners] = useState([]);
  const [transactions, setTransactions] = useState([]);
  
  // Loading & Database Exception states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [dbError, setDbError] = useState(null);

  // Filter state
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'expense' | 'investment' | 'settlement'
  const [memberFilter, setMemberFilter] = useState('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('expense'); // 'expense' | 'investment' | 'settlement'
  const [isEditPartnersOpen, setIsEditPartnersOpen] = useState(false);
  const [isAddingNewPartner, setIsAddingNewPartner] = useState(false);

  // Form states for Add Transaction
  const [formTitle, setFormTitle] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formPaidBy, setFormPaidBy] = useState('');
  const [formCategory, setFormCategory] = useState('seeds');
  const [formNotes, setFormNotes] = useState('');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formReceiverId, setFormReceiverId] = useState('');

  // Partner edit names state
  const [partnerNames, setPartnerNames] = useState({});
  const [partnerPhones, setPartnerPhones] = useState({});

  // New Partner form state
  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPartnerPhone, setNewPartnerPhone] = useState('');

  // 1. Load data from Database
  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    setDbError(null);
    try {
      const [partnersData, transactionsData] = await Promise.all([
        fetchPartnersFromDb(),
        fetchTransactionsFromDb()
      ]);

      setPartners(partnersData);
      setTransactions(transactionsData);

      // Default paidBy / receiverId
      if (partnersData.length > 0) {
        setFormPaidBy(prev => prev || partnersData[0].id);
        if (partnersData.length > 1) {
          setFormReceiverId(prev => prev || partnersData[1].id);
        }
      }
    } catch (err) {
      console.error('Database connection error:', err);
      setDbError({
        action: err.action || 'Database Connection / Sync',
        message: err.message || 'Unable to connect to the database service.',
        status: err.status || 'NETWORK_DOWN',
        endpoint: err.endpoint || '/api/partners',
        technicalDetails: err.technicalDetails || (err.stack ? String(err.stack) : 'Failed to reach database API endpoint.'),
        timestamp: err.timestamp || new Date().toLocaleTimeString('en-IN')
      });
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Splitwise calculations
  const summary = calculateSplitwiseSummary(partners, transactions);

  // Quick Init 3 Default Partners if database is brand new (0 partners)
  const handleQuickInitPartners = async () => {
    setIsSaving(true);
    setDbError(null);
    try {
      const createdPartners = [];
      for (const def of DEFAULT_PARTNERS) {
        const res = await createPartnerInDb({
          id: def.id,
          name: def.name,
          email: def.email,
          phone: def.phone,
          color: def.color,
          initial_equity_target: def.initialEquityTarget
        });
        createdPartners.push(res);
      }
      setPartners(createdPartners);
      if (createdPartners.length > 0) {
        setFormPaidBy(createdPartners[0].id);
        if (createdPartners.length > 1) {
          setFormReceiverId(createdPartners[1].id);
        }
      }
    } catch (err) {
      setDbError({
        action: 'Initialize Partner Profiles in DB',
        message: err.message || 'Failed to save default partners to database.',
        status: err.status || '500',
        endpoint: err.endpoint || '/api/partners',
        technicalDetails: err.technicalDetails || String(err),
        timestamp: new Date().toLocaleTimeString('en-IN')
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Add a brand new partner to DB
  const handleCreateNewPartner = async (e) => {
    e.preventDefault();
    if (!newPartnerName.trim()) {
      alert('Please enter a partner name.');
      return;
    }

    setIsSaving(true);
    setDbError(null);
    try {
      const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'];
      const nextColor = colors[partners.length % colors.length];

      const created = await createPartnerInDb({
        name: newPartnerName.trim(),
        phone: newPartnerPhone.trim(),
        color: nextColor,
        initial_equity_target: 33.33
      });

      setPartners(prev => [...prev, created]);
      setNewPartnerName('');
      setNewPartnerPhone('');
      setIsAddingNewPartner(false);
    } catch (err) {
      setDbError({
        action: 'Create Partner in DB',
        message: err.message || 'Could not insert new partner into database.',
        status: err.status || 'ERROR',
        endpoint: err.endpoint || '/api/partners',
        technicalDetails: err.technicalDetails || String(err),
        timestamp: new Date().toLocaleTimeString('en-IN')
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Update existing partner names & phones in DB
  const handleSavePartnerNames = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setDbError(null);

    try {
      const updatedList = [];
      for (const p of partners) {
        const nextName = (partnerNames[p.id] !== undefined ? partnerNames[p.id] : p.name).trim();
        const nextPhone = (partnerPhones[p.id] !== undefined ? partnerPhones[p.id] : (p.phone || '')).trim();

        if (nextName !== p.name || nextPhone !== p.phone) {
          const updated = await updatePartnerInDb(p.id, { name: nextName, phone: nextPhone });
          updatedList.push(updated);
        } else {
          updatedList.push(p);
        }
      }

      setPartners(updatedList);
      setIsEditPartnersOpen(false);
    } catch (err) {
      setDbError({
        action: 'Update Partners in DB',
        message: err.message || 'Failed to update partner details in database.',
        status: err.status || 'ERROR',
        endpoint: err.endpoint || '/api/partners',
        technicalDetails: err.technicalDetails || String(err),
        timestamp: new Date().toLocaleTimeString('en-IN')
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete a partner from DB
  const handleDeletePartner = async (partnerId) => {
    // Check if partner has transactions
    const hasTx = transactions.some(t => t.paidBy === partnerId || t.payerId === partnerId || t.receiverId === partnerId);
    if (hasTx) {
      alert('Cannot delete this partner because they have associated transactions in the ledger. Delete or reassign their transactions first.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this partner from the database?')) {
      return;
    }

    setIsSaving(true);
    setDbError(null);
    try {
      await deletePartnerFromDb(partnerId);
      setPartners(prev => prev.filter(p => p.id !== partnerId));
    } catch (err) {
      setDbError({
        action: 'Delete Partner from DB',
        message: err.message || 'Failed to remove partner from database.',
        status: err.status || 'ERROR',
        endpoint: err.endpoint || `/api/partners/${partnerId}`,
        technicalDetails: err.technicalDetails || String(err),
        timestamp: new Date().toLocaleTimeString('en-IN')
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Open modal pre-configured for Settle Up
  const handleOpenSettleUp = (debt) => {
    setModalType('settlement');
    setFormTitle(`Settlement to ${debt.toName}`);
    setFormAmount(debt.amount.toString());
    setFormPaidBy(debt.fromId);
    setFormReceiverId(debt.toId);
    setFormNotes(`Debt clearance settlement: ${debt.fromName} paid ${debt.toName}`);
    setIsModalOpen(true);
  };

  // Open general Add Modal
  const handleOpenAddModal = (type = 'expense') => {
    if (partners.length === 0) {
      alert('Please add at least one partner before recording expenses or investments.');
      setIsEditPartnersOpen(true);
      return;
    }

    setModalType(type);
    setFormTitle('');
    setFormAmount('');
    setFormPaidBy(partners[0]?.id || '');
    setFormReceiverId(partners.length > 1 ? partners[1]?.id : partners[0]?.id || '');
    setFormCategory(type === 'investment' ? 'seed_capital' : 'seeds');
    setFormNotes('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  // Submit Transaction to Database
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const amountVal = parseFloat(formAmount);
    if (!amountVal || amountVal <= 0) {
      alert('Please enter a valid amount greater than 0.');
      return;
    }

    if (modalType === 'settlement' && formPaidBy === formReceiverId) {
      alert('Payer and receiver cannot be the same partner.');
      return;
    }

    setIsSaving(true);
    setDbError(null);

    const newTx = {
      id: `tx-${Date.now()}`,
      type: modalType,
      date: formDate || new Date().toISOString().split('T')[0],
      title: formTitle.trim() || (modalType === 'investment' ? 'Capital Investment' : modalType === 'settlement' ? 'Settlement Payment' : 'Operational Expense'),
      amount: amountVal,
      paidBy: formPaidBy,
      notes: formNotes.trim()
    };

    if (modalType === 'investment') {
      newTx.category = formCategory;
    } else if (modalType === 'expense') {
      newTx.category = formCategory;
      newTx.splitMode = 'equal';
      newTx.participantIds = partners.map(p => p.id); // Split among all partners equally
    } else if (modalType === 'settlement') {
      newTx.payerId = formPaidBy;
      newTx.receiverId = formReceiverId;
    }

    try {
      const savedTx = await createTransactionInDb(newTx);
      setTransactions(prev => [savedTx, ...prev]);
      setIsModalOpen(false);
    } catch (err) {
      setDbError({
        action: 'Save Transaction to Database',
        message: err.message || 'Failed to save transaction to database.',
        status: err.status || '500',
        endpoint: err.endpoint || '/api/partners/transactions',
        technicalDetails: err.technicalDetails || String(err),
        timestamp: new Date().toLocaleTimeString('en-IN')
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete transaction from Database
  const handleDeleteTx = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction from the database? Balances will be recalculated.')) {
      return;
    }

    setIsSaving(true);
    setDbError(null);
    try {
      await deleteTransactionFromDb(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setDbError({
        action: 'Delete Transaction from Database',
        message: err.message || 'Failed to delete transaction from database.',
        status: err.status || '500',
        endpoint: err.endpoint || `/api/partners/transactions/${id}`,
        technicalDetails: err.technicalDetails || String(err),
        timestamp: new Date().toLocaleTimeString('en-IN')
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Clear all transactions in Database
  const handleClearAll = async () => {
    if (!window.confirm('Clear all transactions in the database? This permanently removes all investment, expense, and settlement records.')) {
      return;
    }

    setIsSaving(true);
    setDbError(null);
    try {
      await clearAllTransactionsFromDb();
      setTransactions([]);
    } catch (err) {
      setDbError({
        action: 'Clear Database Transactions',
        message: err.message || 'Failed to clear transactions from database.',
        status: err.status || '500',
        endpoint: err.endpoint || '/api/partners/transactions',
        technicalDetails: err.technicalDetails || String(err),
        timestamp: new Date().toLocaleTimeString('en-IN')
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      alert('No transactions to export.');
      return;
    }

    const headers = ['Transaction ID', 'Date', 'Type', 'Title', 'Amount (INR)', 'Paid By', 'Receiver (if settlement)', 'Category', 'Notes'];
    const rows = transactions.map(t => {
      const payer = partners.find(p => p.id === (t.paidBy || t.payerId))?.name || t.paidBy;
      const receiver = t.receiverId ? (partners.find(p => p.id === t.receiverId)?.name || t.receiverId) : '-';
      return [
        t.id,
        t.date,
        t.type,
        `"${t.title.replace(/"/g, '""')}"`,
        t.amount,
        `"${payer}"`,
        `"${receiver}"`,
        t.category || '-',
        `"${(t.notes || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Godavari_Partners_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    if (activeFilter !== 'all' && t.type !== activeFilter) return false;
    if (memberFilter !== 'all') {
      const isPayer = t.paidBy === memberFilter || t.payerId === memberFilter;
      const isReceiver = t.receiverId === memberFilter;
      const isParticipant = t.participantIds && t.participantIds.includes(memberFilter);
      if (!isPayer && !isReceiver && !isParticipant) return false;
    }
    return true;
  });

  return (
    <div className="partner-hub-container">
      {/* Top Database Status & Persistence Notice */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '8px 16px',
        fontSize: '0.82rem',
        color: '#475569'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={15} color="#15803d" />
          <span>
            Storage Mode: <strong>Persistent SQLite Database</strong> (<code>backend/data/godavari_partners.db</code>)
          </span>
          <span style={{
            background: '#dcfce7',
            color: '#15803d',
            fontSize: '0.7rem',
            padding: '2px 8px',
            borderRadius: '12px',
            fontWeight: 700
          }}>
            Zero LocalStorage
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isSaving && (
            <span style={{ color: '#2563eb', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <RefreshCw size={12} className="spin" />
              <span>Saving to DB...</span>
            </span>
          )}
          <button 
            type="button" 
            onClick={() => {
              setIsRetrying(true);
              loadAllData();
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#15803d',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Refresh from Database"
          >
            <RefreshCw size={12} className={isLoading ? 'spin' : ''} />
            <span>Sync DB</span>
          </button>
        </div>
      </div>

      {/* Database Exception Display Banner */}
      {dbError && (
        <div className="db-exception-card">
          <div className="db-exception-header">
            <div className="db-exception-title">
              <AlertCircle size={22} color="#dc2626" />
              <div>
                <h4>Database Exception: {dbError.action}</h4>
                <span>Timestamp: {dbError.timestamp}</span>
              </div>
            </div>
            <button 
              type="button" 
              className="btn-dismiss-exception"
              onClick={() => setDbError(null)}
              title="Dismiss error"
            >
              <X size={18} />
            </button>
          </div>

          <div className="db-exception-body">
            <p className="db-exception-msg">{dbError.message}</p>
            
            <div className="db-exception-meta">
              <span className="db-error-tag status">Status: {dbError.status}</span>
              <span className="db-error-tag endpoint">Target API: {dbError.endpoint}</span>
            </div>

            {dbError.technicalDetails && (
              <div className="db-exception-details">
                <strong>Exception Diagnostics / Server Response:</strong>
                <code>{dbError.technicalDetails}</code>
              </div>
            )}

            <div className="db-exception-advice">
              💡 <strong>Resolution:</strong> The backend FastAPI service must be running on port 8000. 
              Start the backend with: <code>backend\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000</code>.
            </div>
          </div>

          <div className="db-exception-footer">
            <button 
              type="button" 
              className="btn-retry-db"
              onClick={() => {
                setDbError(null);
                loadAllData();
              }}
            >
              <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
              <span>Retry Database Sync</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. Header & Quick Actions */}
      <div className="partner-hub-header">
        <div className="partner-hub-title-area">
          <h2>
            <span>👥</span> Partner Splitwise & Capital Database
          </h2>
          <p>
            Add partners, record investments & shared operating expenses, and auto-settle debts. All records are saved dynamically into the database with zero localStorage.
          </p>
        </div>

        <div className="partner-hub-action-btns">
          <button 
            type="button" 
            className="btn-add-tx"
            onClick={() => handleOpenAddModal('expense')}
            disabled={partners.length === 0}
            style={partners.length === 0 ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
          >
            <PlusCircle size={18} />
            <span>+ Add Expense / Investment</span>
          </button>

          <button 
            type="button" 
            className="btn-outline-action"
            onClick={() => {
              const nameMap = {};
              const phoneMap = {};
              partners.forEach(p => {
                nameMap[p.id] = p.name;
                phoneMap[p.id] = p.phone || '';
              });
              setPartnerNames(nameMap);
              setPartnerPhones(phoneMap);
              setIsAddingNewPartner(false);
              setIsEditPartnersOpen(true);
            }}
          >
            <Edit3 size={15} />
            <span>Manage Partners ({partners.length})</span>
          </button>

          <button 
            type="button" 
            className="btn-outline-action"
            onClick={handleExportCSV}
            title={transactions.length > 0 ? "Export transactions as CSV spreadsheet" : "No transactions to export"}
            disabled={transactions.length === 0}
            style={transactions.length === 0 ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>

          {transactions.length > 0 && (
            <button 
              type="button" 
              className="btn-outline-action danger"
              onClick={handleClearAll}
              title="Clear all transactions from database"
            >
              <Trash2 size={15} />
              <span>Clear Ledger</span>
            </button>
          )}
        </div>
      </div>

      {/* If partners list is empty in DB, prompt to add partners */}
      {partners.length === 0 && !isLoading && (
        <div className="partner-empty-banner">
          <h4>No Partners Registered in Database</h4>
          <p>
            Add partner names to begin tracking shared farm investments and Splitwise debt settlements.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button 
              type="button" 
              className="btn-add-tx"
              onClick={() => {
                setNewPartnerName('');
                setNewPartnerPhone('');
                setIsAddingNewPartner(true);
                setIsEditPartnersOpen(true);
              }}
            >
              <UserPlus size={16} />
              <span>+ Add Partner Profile</span>
            </button>
            <button 
              type="button" 
              className="btn-outline-action"
              onClick={handleQuickInitPartners}
              disabled={isSaving}
            >
              <span>⚡ Quick-Create 3 Partner Slots</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Top KPI Cards */}
      <div className="partner-stats-grid">
        <div className="partner-stat-card capital">
          <div className="stat-header">
            <span className="stat-label">Total Capital Invested</span>
            <div className="stat-icon-pill">🏦</div>
          </div>
          <div className="stat-value">{formatINR(summary.totalPoolInvested)}</div>
          <span className="stat-subtext">Sum of equity & seed capital pooled</span>
        </div>

        <div className="partner-stat-card expenses">
          <div className="stat-header">
            <span className="stat-label">Total Shared Expenses</span>
            <div className="stat-icon-pill">🧾</div>
          </div>
          <div className="stat-value">{formatINR(summary.totalExpenses)}</div>
          <span className="stat-subtext">
            {partners.length > 0 
              ? `Split equally across ${partners.length} partner${partners.length > 1 ? 's' : ''}` 
              : 'Add partners to calculate splits'}
          </span>
        </div>

        <div className="partner-stat-card cashpool">
          <div className="stat-header">
            <span className="stat-label">Current Cash Reserve</span>
            <div className="stat-icon-pill">💰</div>
          </div>
          <div className="stat-value">{formatINR(summary.cashPoolRemaining)}</div>
          <span className="stat-subtext">Capital invested minus expenses incurred</span>
        </div>

        <div className="partner-stat-card settlements">
          <div className="stat-header">
            <span className="stat-label">Active Settlement Debts</span>
            <div className="stat-icon-pill">⚖️</div>
          </div>
          <div className="stat-value">
            {summary.simplifiedDebts.length > 0 
              ? formatINR(summary.simplifiedDebts.reduce((sum, d) => sum + d.amount, 0))
              : '₹0'}
          </div>
          <span className="stat-subtext">
            {summary.simplifiedDebts.length} pending debt transfer{summary.simplifiedDebts.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* 3. Partner Balance Cards */}
      {partners.length > 0 && (
        <div>
          <div className="partner-cards-section-title">
            <h3>
              <Users size={20} color="#15803d" />
              <span>Partner Contributions & Net Splitwise Status</span>
            </h3>
            <span style={{ fontSize: '0.84rem', color: '#64748b' }}>
              Equal Share = <strong>{formatINR(summary.totalExpenses / (partners.length || 1))}</strong> per partner
            </span>
          </div>

          <div className="partner-cards-grid">
            {summary.partnerStats.map((st) => {
              const p = st.partner;
              const net = Math.round(st.netExpenseBalance);
              const isCreditor = net > 0;
              const isDebtor = net < 0;

              return (
                <div className="partner-card" key={p.id}>
                  <div className="partner-card-header">
                    <div className="partner-avatar-wrap">
                      <div className="partner-avatar-circle" style={{ background: p.color || '#10b981' }}>
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="partner-info">
                        <h4>{p.name}</h4>
                        <span>{p.phone || p.email || 'Partner'}</span>
                      </div>
                    </div>

                    <div className={`partner-status-badge ${isCreditor ? 'owed' : isDebtor ? 'owes' : 'settled'}`}>
                      {isCreditor && `+${formatINR(net)} get back`}
                      {isDebtor && `-${formatINR(Math.abs(net))} owes`}
                      {!isCreditor && !isDebtor && `✓ Settled Up`}
                    </div>
                  </div>

                  {/* Capital Contribution & Equity */}
                  <div className="capital-equity-row">
                    <div className="equity-bar-meta">
                      <span>Capital Invested: <strong>{formatINR(st.totalInvested)}</strong></span>
                      <span><strong>{st.investmentSharePercent}%</strong> Equity</span>
                    </div>
                    <div className="equity-bar-track">
                      <div 
                        className="equity-bar-fill" 
                        style={{ 
                          width: `${Math.min(100, Math.max(5, st.investmentSharePercent))}%`, 
                          background: p.color || '#10b981' 
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Expense Split Details Box */}
                  <div className="partner-breakdown-box">
                    <div className="breakdown-item">
                      <span className="breakdown-label">Paid for Expenses:</span>
                      <span className="breakdown-val">{formatINR(st.totalExpensesPaid)}</span>
                    </div>
                    <div className="breakdown-item">
                      <span className="breakdown-label">Fair Share Borne:</span>
                      <span className="breakdown-val">{formatINR(st.totalShareBorne)}</span>
                    </div>
                    <div className="breakdown-item">
                      <span className="breakdown-label">Debt Settled (Paid):</span>
                      <span className="breakdown-val">{formatINR(st.totalSettlementsPaid)}</span>
                    </div>
                    <div className="breakdown-item">
                      <span className="breakdown-label">Net Balance:</span>
                      <span className={`breakdown-val ${isCreditor ? 'positive' : isDebtor ? 'negative' : ''}`}>
                        {isCreditor ? `+${formatINR(net)}` : isDebtor ? `-${formatINR(Math.abs(net))}` : '₹0'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Splitwise Debt Simplification: Who Owes Whom */}
      <div className="settlement-matrix-card">
        <div className="settlement-card-header">
          <h3>
            <ArrowLeftRight size={20} color="#15803d" />
            <span>Optimal Settlement Transfers ("Who Pays Whom")</span>
          </h3>
          <span style={{ fontSize: '0.84rem', color: '#166534', fontWeight: 600 }}>
            Simplified to minimal transactions
          </span>
        </div>

        {summary.simplifiedDebts.length > 0 ? (
          <div className="debts-list">
            {summary.simplifiedDebts.map((debt, idx) => (
              <div className="debt-transfer-item" key={idx}>
                <div className="debt-actors">
                  <span className="debt-actor payer">{debt.fromName}</span>
                  <span className="debt-arrow">
                    <span>owes</span>
                    <ArrowRight size={16} />
                  </span>
                  <span className="debt-actor receiver">{debt.toName}</span>
                </div>

                <div className="debt-action-area">
                  <span className="debt-amount-pill">{formatINR(debt.amount)}</span>
                  <button 
                    type="button" 
                    className="btn-settle-action"
                    onClick={() => handleOpenSettleUp(debt)}
                  >
                    ✓ Settle Up
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="all-settled-empty">
            <CheckCircle2 size={24} color="#16a34a" />
            <span>
              {transactions.length === 0 
                ? 'Dynamic Database Ready: Add a shared expense or capital investment above to compute Splitwise settlements.' 
                : 'All partners are completely squared up! No debts pending.'}
            </span>
          </div>
        )}
      </div>

      {/* 5. Transactions History & Filter Table */}
      <div className="transactions-panel">
        <div className="transactions-panel-header">
          <h3>
            <Receipt size={20} color="#0f172a" />
            <span>Database Transaction Ledger & Activity Feed</span>
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Filter by Partner */}
            <select 
              value={memberFilter}
              onChange={(e) => setMemberFilter(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: '#334155'
              }}
            >
              <option value="all">All Partners</option>
              {partners.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            {/* Filter Tabs */}
            <div className="tx-filter-tabs">
              <button 
                type="button" 
                className={`tx-filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                All ({transactions.length})
              </button>
              <button 
                type="button" 
                className={`tx-filter-tab ${activeFilter === 'expense' ? 'active' : ''}`}
                onClick={() => setActiveFilter('expense')}
              >
                Expenses
              </button>
              <button 
                type="button" 
                className={`tx-filter-tab ${activeFilter === 'investment' ? 'active' : ''}`}
                onClick={() => setActiveFilter('investment')}
              >
                Capital
              </button>
              <button 
                type="button" 
                className={`tx-filter-tab ${activeFilter === 'settlement' ? 'active' : ''}`}
                onClick={() => setActiveFilter('settlement')}
              >
                Settlements
              </button>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="tx-table-wrap">
          <table className="tx-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Description / Purpose</th>
                <th>Paid By</th>
                <th>Split / Target</th>
                <th>Amount</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map(t => {
                  const payer = partners.find(p => p.id === (t.paidBy || t.payerId))?.name || t.paidBy;
                  const receiver = t.receiverId ? (partners.find(p => p.id === t.receiverId)?.name || t.receiverId) : null;
                  
                  return (
                    <tr key={t.id}>
                      <td style={{ color: '#64748b', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                        {t.date}
                      </td>
                      <td>
                        <span className={`tx-type-badge ${t.type}`}>
                          {t.type === 'investment' && '🏦 Capital'}
                          {t.type === 'expense' && '🧾 Expense'}
                          {t.type === 'settlement' && '⚖️ Settle'}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{t.title}</div>
                        {t.notes && (
                          <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                            {t.notes}
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#1e293b' }}>{payer}</span>
                      </td>
                      <td>
                        {t.type === 'expense' && (
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            Equally ({partners.length > 0 ? formatINR(t.amount / partners.length) : '₹0'} each)
                          </span>
                        )}
                        {t.type === 'investment' && (
                          <span style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 600 }}>
                            To Partnership Pool
                          </span>
                        )}
                        {t.type === 'settlement' && (
                          <span style={{ fontSize: '0.8rem', color: '#7c3aed', fontWeight: 600 }}>
                            Paid directly to {receiver}
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="tx-amount">{formatINR(t.amount)}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          type="button" 
                          className="tx-delete-btn"
                          onClick={() => handleDeleteTx(t.id)}
                          title="Delete transaction from database"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" style={{ padding: '40px 20px', textAlign: 'center' }}>
                    {transactions.length === 0 ? (
                      <div className="tx-empty-state">
                        <div className="tx-empty-icon">📊</div>
                        <h4 className="tx-empty-title">Dynamic Blank Ledger</h4>
                        <p className="tx-empty-desc">
                          No transactions recorded in the database yet. Start logging your actual capital investments, shared farm expenses, or partner settlements to compute live balances.
                        </p>
                        <div className="tx-empty-actions">
                          <button 
                            type="button" 
                            className="btn-add-tx"
                            onClick={() => handleOpenAddModal('expense')}
                            disabled={partners.length === 0}
                            style={partners.length === 0 ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                          >
                            <PlusCircle size={16} />
                            <span>+ Add First Shared Expense</span>
                          </button>
                          <button 
                            type="button" 
                            className="btn-outline-action"
                            onClick={() => handleOpenAddModal('investment')}
                            disabled={partners.length === 0}
                            style={partners.length === 0 ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                          >
                            <span>🏦 + Add Capital Investment</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                        No transactions found matching the selected filter criteria.
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Modal: Add Expense / Investment / Settlement */}
      {isModalOpen && (
        <div className="split-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="split-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="split-modal-header">
              <h3>
                {modalType === 'expense' && '🧾 Add Shared Expense'}
                {modalType === 'investment' && '🏦 Add Capital Investment'}
                {modalType === 'settlement' && '⚖️ Record Debt Settlement'}
              </h3>
              <button 
                type="button" 
                className="split-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Type Switcher */}
            <div className="modal-type-switcher">
              <button 
                type="button" 
                className={`modal-type-btn ${modalType === 'expense' ? 'active' : ''}`}
                onClick={() => setModalType('expense')}
              >
                <span>🧾 Shared Expense</span>
                <small style={{ opacity: 0.8 }}>Split {partners.length} ways</small>
              </button>

              <button 
                type="button" 
                className={`modal-type-btn ${modalType === 'investment' ? 'active' : ''}`}
                onClick={() => setModalType('investment')}
              >
                <span>🏦 Capital Investment</span>
                <small style={{ opacity: 0.8 }}>Add to Pool</small>
              </button>

              <button 
                type="button" 
                className={`modal-type-btn ${modalType === 'settlement' ? 'active' : ''}`}
                onClick={() => setModalType('settlement')}
              >
                <span>⚖️ Debt Settlement</span>
                <small style={{ opacity: 0.8 }}>Pay Partner</small>
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="modal-form-body">
              {/* Title / Description */}
              <div className="modal-field">
                <label>
                  {modalType === 'expense' && 'Expense Description'}
                  {modalType === 'investment' && 'Investment Purpose'}
                  {modalType === 'settlement' && 'Settlement Note'}
                </label>
                <input 
                  type="text"
                  placeholder={
                    modalType === 'expense' ? 'e.g. Substrate bags, Electricity, Labor' :
                    modalType === 'investment' ? 'e.g. Growing shed setup, Air conditioner' :
                    'e.g. Settle up for spawn bill'
                  }
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                />
              </div>

              {/* Amount & Date in 2 columns */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="modal-field">
                  <label>Amount (₹ INR)</label>
                  <input 
                    type="number"
                    step="0.01"
                    placeholder="e.g. 5000"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="modal-field">
                  <label>Date</label>
                  <input 
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Paid By */}
              <div className="modal-field">
                <label>
                  {modalType === 'settlement' ? 'Paid By (Payer)' : 'Who Paid / Contributed?'}
                </label>
                <select 
                  value={formPaidBy}
                  onChange={(e) => setFormPaidBy(e.target.value)}
                >
                  {partners.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* If Settlement: Receiver */}
              {modalType === 'settlement' && (
                <div className="modal-field">
                  <label>Paid To (Receiver)</label>
                  <select 
                    value={formReceiverId}
                    onChange={(e) => setFormReceiverId(e.target.value)}
                  >
                    {partners.filter(p => p.id !== formPaidBy).map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Category (if expense or investment) */}
              {modalType === 'expense' && (
                <div className="modal-field">
                  <label>Expense Category</label>
                  <select 
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                  >
                    {EXPENSE_CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {modalType === 'investment' && (
                <div className="modal-field">
                  <label>Capital Asset Category</label>
                  <select 
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                  >
                    {INVESTMENT_CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Split Notice for Expense */}
              {modalType === 'expense' && partners.length > 0 && (
                <div className="split-summary-notice">
                  <span>
                    💡 This expense of <strong>{formAmount ? formatINR(formAmount) : '₹0'}</strong> will be split <strong>equally {partners.length} ways ({formAmount ? formatINR(parseFloat(formAmount) / partners.length) : '₹0'} each)</strong> among all partners.
                  </span>
                </div>
              )}

              {/* Optional Notes */}
              <div className="modal-field">
                <label>Payment Mode / Reference (Optional)</label>
                <input 
                  type="text"
                  placeholder="e.g. GPay / PhonePe reference # or Cash"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                />
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn-modal-cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-modal-submit" disabled={isSaving}>
                  {isSaving ? 'Saving to Database...' : `Save ${modalType === 'expense' ? 'Expense' : modalType === 'investment' ? 'Investment' : 'Settlement'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Modal: Manage & Add Partners */}
      {isEditPartnersOpen && (
        <div className="split-modal-overlay" onClick={() => setIsEditPartnersOpen(false)}>
          <div className="split-modal-card" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
            <div className="split-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} color="#15803d" />
                <h3>Manage Partner Profiles</h3>
              </div>
              <button 
                type="button" 
                className="split-modal-close"
                onClick={() => setIsEditPartnersOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-form-body">
              <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '0 0 14px 0' }}>
                All partner profiles are saved directly into the database. You can add new partners or update existing contact & UPI information dynamically.
              </p>

              {/* Existing Partners List */}
              <form onSubmit={handleSavePartnerNames}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {partners.map((p, idx) => (
                    <div 
                      key={p.id} 
                      style={{ 
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span 
                            style={{ 
                              width: '12px', 
                              height: '12px', 
                              borderRadius: '50%', 
                              background: p.color || '#10b981',
                              display: 'inline-block' 
                            }}
                          ></span>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                            Partner {idx + 1}
                          </span>
                        </div>
                        <button 
                          type="button" 
                          className="partner-delete-btn"
                          onClick={() => handleDeletePartner(p.id)}
                          title="Delete partner from database"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
                        <div className="modal-field" style={{ margin: 0 }}>
                          <label style={{ fontSize: '0.74rem' }}>Partner Name</label>
                          <input 
                            type="text"
                            value={partnerNames[p.id] !== undefined ? partnerNames[p.id] : p.name}
                            onChange={(e) => setPartnerNames({ ...partnerNames, [p.id]: e.target.value })}
                            placeholder={`Partner ${idx + 1}`}
                            required
                          />
                        </div>
                        <div className="modal-field" style={{ margin: 0 }}>
                          <label style={{ fontSize: '0.74rem' }}>Phone / UPI ID</label>
                          <input 
                            type="text"
                            value={partnerPhones[p.id] !== undefined ? partnerPhones[p.id] : (p.phone || '')}
                            onChange={(e) => setPartnerPhones({ ...partnerPhones, [p.id]: e.target.value })}
                            placeholder="+91 or UPI"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {partners.length > 0 && (
                  <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button type="submit" className="btn-modal-submit" disabled={isSaving}>
                      {isSaving ? 'Updating DB...' : 'Save Profile Changes to DB'}
                    </button>
                  </div>
                )}
              </form>

              {/* Add Partner Section */}
              <div style={{ 
                marginTop: '20px', 
                paddingTop: '16px', 
                borderTop: '1px dashed #cbd5e1' 
              }}>
                {!isAddingNewPartner ? (
                  <button 
                    type="button" 
                    className="btn-outline-action"
                    onClick={() => setIsAddingNewPartner(true)}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <UserPlus size={16} />
                    <span>+ Add New Partner</span>
                  </button>
                ) : (
                  <form onSubmit={handleCreateNewPartner} style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', padding: '14px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#166534', fontWeight: 800 }}>
                      Add New Partner Profile
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
                      <div className="modal-field" style={{ margin: 0 }}>
                        <label style={{ fontSize: '0.74rem' }}>New Partner Name</label>
                        <input 
                          type="text"
                          value={newPartnerName}
                          onChange={(e) => setNewPartnerName(e.target.value)}
                          placeholder="e.g. Ramesh"
                          required
                          autoFocus
                        />
                      </div>
                      <div className="modal-field" style={{ margin: 0 }}>
                        <label style={{ fontSize: '0.74rem' }}>Phone / UPI ID</label>
                        <input 
                          type="text"
                          value={newPartnerPhone}
                          onChange={(e) => setNewPartnerPhone(e.target.value)}
                          placeholder="+91 or UPI ID"
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                      <button 
                        type="button" 
                        className="btn-modal-cancel"
                        onClick={() => setIsAddingNewPartner(false)}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn-modal-submit" disabled={isSaving}>
                        {isSaving ? 'Adding...' : '+ Save New Partner'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
