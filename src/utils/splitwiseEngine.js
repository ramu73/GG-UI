/**
 * 3-Partner Splitwise & Investment Calculation Engine
 * Handles Capital Investments, Shared Expenses, Equal/Custom Splits,
 * Net Balances, and Optimal Debt Simplification ("Who Owes Whom").
 */

export const DEFAULT_PARTNERS = [];

export const EXPENSE_CATEGORIES = [
  { id: 'seeds', label: 'Spawn & Seeds', icon: '🌱', color: '#16a34a' },
  { id: 'substrate', label: 'Substrate & Compost', icon: '🌾', color: '#ca8a04' },
  { id: 'electricity', label: 'Electricity & Power', icon: '⚡', color: '#eab308' },
  { id: 'labor', label: 'Labor & Field Wages', icon: '👷', color: '#ea580c' },
  { id: 'logistics', label: 'Logistics & Fuel', icon: '🚚', color: '#0284c7' },
  { id: 'packaging', label: 'Packaging & Trays', icon: '📦', color: '#7c3aed' },
  { id: 'maintenance', label: 'Facility Maintenance', icon: '🔧', color: '#64748b' },
  { id: 'marketing', label: 'Sales & Marketing', icon: '📢', color: '#ec4899' },
  { id: 'misc', label: 'Miscellaneous', icon: '📝', color: '#475569' }
];

export const INVESTMENT_CATEGORIES = [
  { id: 'seed_capital', label: 'Initial Seed Capital', icon: '🏦' },
  { id: 'farm_shed', label: 'Growing Shed & Construction', icon: '🏗️' },
  { id: 'climate_control', label: 'AC & Climate Machinery', icon: '❄️' },
  { id: 'racks_infra', label: 'Racks & Infrastructure', icon: '🪜' },
  { id: 'working_capital', label: 'Working Capital Reserve', icon: '💼' },
  { id: 'vehicle', label: 'Delivery Vehicle / Van', icon: '🚐' }
];

/**
 * Calculates net balances, who owes whom, and summary metrics for partners
 */
export function calculateSplitwiseSummary(partners, transactions) {
  // 1. Initialize stats per partner
  const stats = {};
  partners.forEach(p => {
    stats[p.id] = {
      partner: p,
      totalInvested: 0,
      totalExpensesPaid: 0,
      totalShareBorne: 0,
      totalSettlementsPaid: 0,
      totalSettlementsReceived: 0,
      netExpenseBalance: 0, // Positive = get back, Negative = owes
      netInvestmentBalance: 0, // Vs equal 1/3 share of total investments
      totalOutflow: 0 // Invested + Expenses Paid + Settlements Paid
    };
  });

  let totalPoolInvested = 0;
  let totalExpenses = 0;
  let totalSettlements = 0;

  // 2. Process all transactions
  transactions.forEach(t => {
    const amt = parseFloat(t.amount) || 0;

    if (t.type === 'investment') {
      totalPoolInvested += amt;
      if (stats[t.paidBy]) {
        stats[t.paidBy].totalInvested += amt;
        stats[t.paidBy].totalOutflow += amt;
      }
    } 
    else if (t.type === 'expense') {
      totalExpenses += amt;
      const isPool = t.paidBy === 'pool' || !t.paidBy;

      // If paid by an individual out of personal pocket (not from pool):
      if (!isPool) {
        // Credit the payer
        if (stats[t.paidBy]) {
          stats[t.paidBy].totalExpensesPaid += amt;
          stats[t.paidBy].totalOutflow += amt;
        }

        // Debit participants according to split
        if (t.splitMode === 'equal' || !t.splits) {
          const participants = t.participantIds && t.participantIds.length > 0 
            ? t.participantIds 
            : partners.map(p => p.id);
          const perPerson = amt / participants.length;

          participants.forEach(pid => {
            if (stats[pid]) {
              stats[pid].totalShareBorne += perPerson;
            }
          });
        } else if (t.splitMode === 'custom' && t.splits) {
          Object.entries(t.splits).forEach(([pid, share]) => {
            if (stats[pid]) {
              stats[pid].totalShareBorne += parseFloat(share) || 0;
            }
          });
        }
      }
    } 
    else if (t.type === 'settlement') {
      totalSettlements += amt;
      if (stats[t.payerId]) {
        stats[t.payerId].totalSettlementsPaid += amt;
        stats[t.payerId].totalOutflow += amt;
      }
      if (stats[t.receiverId]) {
        stats[t.receiverId].totalSettlementsReceived += amt;
      }
    }
  });

  // 3. Compute Net Balances
  // Net Expense Balance = (Expenses Paid + Settlements Paid) - (Fair Share Borne + Settlements Received)
  // Positive (> 0) means the member is OWED money (Credit)
  // Negative (< 0) means the member OWES money (Debt)
  partners.forEach(p => {
    const s = stats[p.id];
    s.netExpenseBalance = (s.totalExpensesPaid + s.totalSettlementsPaid) - (s.totalShareBorne + s.totalSettlementsReceived);
    
    // Equal 1/3 benchmark for Capital Investments
    const equalInvestmentTarget = totalPoolInvested / (partners.length || 1);
    s.netInvestmentBalance = s.totalInvested - equalInvestmentTarget;
    s.investmentSharePercent = totalPoolInvested > 0 
      ? ((s.totalInvested / totalPoolInvested) * 100).toFixed(1) 
      : (100 / partners.length).toFixed(1);

    // Total Overall Net Position (Capital + Out-of-pocket Expenses)
    // Positive (> 0): Contributed more than fair share (Deserves money back to equalize)
    // Negative (< 0): Contributed less than fair share (Must pay to reach equal 1/3)
    s.netTotalBalance = Math.round((s.netExpenseBalance + s.netInvestmentBalance) * 100) / 100;
  });

  // 4. Splitwise Minimal Debt Settlement Algorithm ("Who owes whom to make it 100% equal")
  const simplifiedDebts = computeMinimalDebts(partners, stats, 'netTotalBalance');
  const capitalDebts = computeMinimalDebts(partners, stats, 'netInvestmentBalance');
  const expenseDebts = computeMinimalDebts(partners, stats, 'netExpenseBalance');

  return {
    totalPoolInvested,
    totalExpenses,
    totalSettlements,
    cashPoolRemaining: totalPoolInvested - totalExpenses,
    equalInvestmentTarget: totalPoolInvested / (partners.length || 1),
    partnerStats: Object.values(stats),
    simplifiedDebts,
    capitalDebts,
    expenseDebts
  };
}

/**
 * Greedy minimum cash-flow debt simplification algorithm
 */
function computeMinimalDebts(partners, stats, balanceKey = 'netTotalBalance') {
  // Create working balances for each partner (rounded to 2 decimal places to avoid floating point drift)
  const balances = [];
  partners.forEach(p => {
    const raw = stats[p.id][balanceKey] !== undefined ? stats[p.id][balanceKey] : stats[p.id].netExpenseBalance;
    const net = Math.round(raw * 100) / 100;
    if (Math.abs(net) > 0.05) {
      balances.push({
        id: p.id,
        name: p.name,
        color: p.color,
        amount: net
      });
    }
  });

  const settlements = [];

  // Continue matching largest debtor with largest creditor
  while (balances.length > 1) {
    // Sort ascending: most negative first (biggest debtor), most positive last (biggest creditor)
    balances.sort((a, b) => a.amount - b.amount);

    const debtor = balances[0];
    const creditor = balances[balances.length - 1];

    if (debtor.amount >= -0.05 || creditor.amount <= 0.05) {
      break;
    }

    const settleAmount = Math.min(-debtor.amount, creditor.amount);
    const roundedAmount = Math.round(settleAmount * 100) / 100;

    if (roundedAmount > 0) {
      settlements.push({
        fromId: debtor.id,
        fromName: debtor.name,
        toId: creditor.id,
        toName: creditor.name,
        amount: roundedAmount
      });
    }

    debtor.amount += settleAmount;
    creditor.amount -= settleAmount;

    // Filter out settled participants
    const filtered = balances.filter(b => Math.abs(b.amount) > 0.05);
    balances.length = 0;
    balances.push(...filtered);
  }

  return settlements;
}

/**
 * Format Indian Rupees Currency
 */
export function formatINR(val) {
  const num = Math.round(Number(val) || 0);
  return '₹' + num.toLocaleString('en-IN');
}
