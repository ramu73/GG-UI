/**
 * Partner Ledger Database & API Service
 * 
 * Strictly Database Persistence:
 * - NO localStorage usage!
 * - Saves Partners, Capital Investments, Shared Expenses, and Settlements directly in DB.
 * - Handles API failures gracefully by throwing structured DatabaseException with full diagnostics.
 */

export class DatabaseException extends Error {
  constructor({ action, message, status, endpoint, technicalDetails }) {
    super(message);
    this.name = 'DatabaseException';
    this.action = action; // e.g. "Fetch Partners", "Save Partner", "Add Expense", "Clear Transactions"
    this.status = status || 'NETWORK_ERROR';
    this.endpoint = endpoint;
    this.technicalDetails = technicalDetails || '';
    this.timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
}

// In local dev through Vite proxy, '/api/partners' routes to FastAPI backend on port 8000
const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api/partners`
  : '/api/partners';

async function parseErrorResponse(res, defaultMsg) {
  try {
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      if (data && data.detail) {
        return typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
      }
      if (data && data.message) return data.message;
    } catch (_) {
      if (text && text.trim()) return text.trim().slice(0, 300);
    }
  } catch (_) {}
  return `${defaultMsg} (HTTP ${res.status} ${res.statusText || ''})`.trim();
}

/**
 * Fetch all partners from Database
 */
export async function fetchPartnersFromDb() {
  const endpoint = API_BASE_URL;
  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!res.ok) {
      const errorMsg = await parseErrorResponse(res, 'Could not retrieve partners');
      throw new DatabaseException({
        action: 'Fetch Partners from Database',
        message: 'Could not retrieve partners from the database.',
        status: res.status,
        endpoint,
        technicalDetails: errorMsg
      });
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    if (err instanceof DatabaseException) throw err;
    throw new DatabaseException({
      action: 'Fetch Partners from Database',
      message: 'Database server unreachable or network failure. Make sure the backend service is running.',
      status: 'CONNECTION_REFUSED',
      endpoint,
      technicalDetails: err.message || 'Failed to fetch (Network connection error).'
    });
  }
}

/**
 * Add a new partner to Database
 */
export async function createPartnerInDb(partnerData) {
  const endpoint = API_BASE_URL;
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(partnerData)
    });

    if (!res.ok) {
      const errorMsg = await parseErrorResponse(res, 'Failed to create partner');
      throw new DatabaseException({
        action: 'Save Partner to Database',
        message: `Failed to insert partner "${partnerData.name}" into the database.`,
        status: res.status,
        endpoint,
        technicalDetails: errorMsg
      });
    }

    return await res.json();
  } catch (err) {
    if (err instanceof DatabaseException) throw err;
    throw new DatabaseException({
      action: 'Save Partner to Database',
      message: 'Database connection failed while creating partner.',
      status: 'CONNECTION_REFUSED',
      endpoint,
      technicalDetails: err.message || 'Network error.'
    });
  }
}

/**
 * Update existing partner in Database
 */
export async function updatePartnerInDb(partnerId, updateData) {
  const endpoint = `${API_BASE_URL}/${partnerId}`;
  try {
    const res = await fetch(endpoint, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    if (!res.ok) {
      const errorMsg = await parseErrorResponse(res, 'Failed to update partner');
      throw new DatabaseException({
        action: 'Update Partner in Database',
        message: `Could not update partner with ID ${partnerId}.`,
        status: res.status,
        endpoint,
        technicalDetails: errorMsg
      });
    }

    return await res.json();
  } catch (err) {
    if (err instanceof DatabaseException) throw err;
    throw new DatabaseException({
      action: 'Update Partner in Database',
      message: 'Database connection failed while updating partner profile.',
      status: 'CONNECTION_REFUSED',
      endpoint,
      technicalDetails: err.message || 'Network error.'
    });
  }
}

/**
 * Delete partner from Database
 */
export async function deletePartnerFromDb(partnerId) {
  const endpoint = `${API_BASE_URL}/${partnerId}`;
  try {
    const res = await fetch(endpoint, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' }
    });

    if (!res.ok) {
      const errorMsg = await parseErrorResponse(res, 'Failed to delete partner');
      throw new DatabaseException({
        action: 'Delete Partner from Database',
        message: `Could not delete partner with ID ${partnerId}.`,
        status: res.status,
        endpoint,
        technicalDetails: errorMsg
      });
    }

    return await res.json();
  } catch (err) {
    if (err instanceof DatabaseException) throw err;
    throw new DatabaseException({
      action: 'Delete Partner from Database',
      message: 'Database connection failed while deleting partner.',
      status: 'CONNECTION_REFUSED',
      endpoint,
      technicalDetails: err.message || 'Network error.'
    });
  }
}

/**
 * Fetch all transactions from Database
 */
export async function fetchTransactionsFromDb() {
  const endpoint = `${API_BASE_URL}/transactions`;
  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!res.ok) {
      const errorMsg = await parseErrorResponse(res, 'Could not load transactions');
      throw new DatabaseException({
        action: 'Fetch Transactions from Database',
        message: 'Could not load ledger transactions from the database.',
        status: res.status,
        endpoint,
        technicalDetails: errorMsg
      });
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    if (err instanceof DatabaseException) throw err;
    throw new DatabaseException({
      action: 'Fetch Transactions from Database',
      message: 'Failed to connect to the database to retrieve transactions.',
      status: 'CONNECTION_REFUSED',
      endpoint,
      technicalDetails: err.message || 'Network error.'
    });
  }
}

/**
 * Create transaction in Database
 */
export async function createTransactionInDb(transactionData) {
  const endpoint = `${API_BASE_URL}/transactions`;
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(transactionData)
    });

    if (!res.ok) {
      const errorMsg = await parseErrorResponse(res, 'Could not save transaction');
      throw new DatabaseException({
        action: 'Save Transaction to Database',
        message: `Could not save transaction "${transactionData.title}" to the database.`,
        status: res.status,
        endpoint,
        technicalDetails: errorMsg
      });
    }

    return await res.json();
  } catch (err) {
    if (err instanceof DatabaseException) throw err;
    throw new DatabaseException({
      action: 'Save Transaction to Database',
      message: 'Database connection failed while saving transaction.',
      status: 'CONNECTION_REFUSED',
      endpoint,
      technicalDetails: err.message || 'Network error.'
    });
  }
}

/**
 * Delete transaction from Database
 */
export async function deleteTransactionFromDb(transactionId) {
  const endpoint = `${API_BASE_URL}/transactions/${transactionId}`;
  try {
    const res = await fetch(endpoint, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' }
    });

    if (!res.ok) {
      const errorMsg = await parseErrorResponse(res, 'Could not delete transaction');
      throw new DatabaseException({
        action: 'Delete Transaction from Database',
        message: `Could not delete transaction ${transactionId} from the database.`,
        status: res.status,
        endpoint,
        technicalDetails: errorMsg
      });
    }

    return await res.json();
  } catch (err) {
    if (err instanceof DatabaseException) throw err;
    throw new DatabaseException({
      action: 'Delete Transaction from Database',
      message: 'Database connection failed while deleting transaction.',
      status: 'CONNECTION_REFUSED',
      endpoint,
      technicalDetails: err.message || 'Network error.'
    });
  }
}

/**
 * Clear all transactions from Database
 */
export async function clearAllTransactionsFromDb() {
  const endpoint = `${API_BASE_URL}/transactions`;
  try {
    const res = await fetch(endpoint, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' }
    });

    if (!res.ok) {
      const errorMsg = await parseErrorResponse(res, 'Could not clear transactions');
      throw new DatabaseException({
        action: 'Clear Transactions in Database',
        message: 'Could not clear transactions from the database.',
        status: res.status,
        endpoint,
        technicalDetails: errorMsg
      });
    }

    return await res.json();
  } catch (err) {
    if (err instanceof DatabaseException) throw err;
    throw new DatabaseException({
      action: 'Clear Transactions in Database',
      message: 'Database connection failed while clearing transactions.',
      status: 'CONNECTION_REFUSED',
      endpoint,
      technicalDetails: err.message || 'Network error.'
    });
  }
}
