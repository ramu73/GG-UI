import os
import sqlite3
import json
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any

# Ensure storage directory exists
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)
DB_PATH = os.path.join(DATA_DIR, "godavari_partners.db")

def get_connection():
    """Returns a SQLite connection with dict row factory."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes tables for partners and transactions."""
    with get_connection() as conn:
        cursor = conn.cursor()
        
        # 1. Partners Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS partners (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT DEFAULT '',
                phone TEXT DEFAULT '',
                color TEXT DEFAULT '#10b981',
                initial_equity_target REAL DEFAULT 33.33,
                created_at TEXT NOT NULL
            )
        """)
        
        # 2. Transactions Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS partner_transactions (
                id TEXT PRIMARY KEY,
                type TEXT NOT NULL,
                date TEXT NOT NULL,
                title TEXT NOT NULL,
                amount REAL NOT NULL,
                paid_by TEXT DEFAULT '',
                payer_id TEXT DEFAULT '',
                receiver_id TEXT DEFAULT '',
                category TEXT DEFAULT '',
                split_mode TEXT DEFAULT 'equal',
                participant_ids TEXT DEFAULT '[]',
                splits_json TEXT DEFAULT '{}',
                notes TEXT DEFAULT '',
                created_at TEXT NOT NULL
            )
        """)
        conn.commit()

# Run initialization
init_db()

# ==================== PARTNER OPERATIONS ====================

def get_all_partners() -> List[Dict[str, Any]]:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM partners ORDER BY created_at ASC")
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

def get_partner_by_id(partner_id: str) -> Optional[Dict[str, Any]]:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM partners WHERE id = ?", (partner_id,))
        row = cursor.fetchone()
        return dict(row) if row else None

def add_partner(data: Dict[str, Any]) -> Dict[str, Any]:
    partner_id = data.get("id") or f"p-{uuid.uuid4().hex[:6]}"
    now = datetime.utcnow().isoformat() + "Z"
    
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO partners (id, name, email, phone, color, initial_equity_target, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            partner_id,
            data.get("name", "").strip(),
            data.get("email", "").strip(),
            data.get("phone", "").strip(),
            data.get("color") or "#10b981",
            float(data.get("initial_equity_target") or 33.33),
            now
        ))
        conn.commit()
    
    return get_partner_by_id(partner_id)

def update_partner(partner_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    existing = get_partner_by_id(partner_id)
    if not existing:
        return None
    
    new_name = data.get("name") if data.get("name") is not None else existing["name"]
    new_email = data.get("email") if data.get("email") is not None else existing["email"]
    new_phone = data.get("phone") if data.get("phone") is not None else existing["phone"]
    new_color = data.get("color") if data.get("color") is not None else existing["color"]
    new_target = data.get("initial_equity_target") if data.get("initial_equity_target") is not None else existing["initial_equity_target"]

    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE partners 
            SET name = ?, email = ?, phone = ?, color = ?, initial_equity_target = ?
            WHERE id = ?
        """, (new_name, new_email, new_phone, new_color, float(new_target), partner_id))
        conn.commit()
        
    return get_partner_by_id(partner_id)

def delete_partner(partner_id: str) -> bool:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM partners WHERE id = ?", (partner_id,))
        conn.commit()
        return cursor.rowcount > 0

# ==================== TRANSACTION OPERATIONS ====================

def get_all_transactions() -> List[Dict[str, Any]]:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM partner_transactions ORDER BY date DESC, created_at DESC")
        rows = cursor.fetchall()
        
        result = []
        for r in rows:
            d = dict(r)
            # Parse JSON fields
            try:
                d["participantIds"] = json.loads(d.get("participant_ids") or "[]")
            except Exception:
                d["participantIds"] = []
                
            try:
                d["splits"] = json.loads(d.get("splits_json") or "{}")
            except Exception:
                d["splits"] = {}
                
            # Rename snake_case to camelCase for frontend contract
            d["paidBy"] = d.pop("paid_by", "")
            d["payerId"] = d.pop("payer_id", "")
            d["receiverId"] = d.pop("receiver_id", "")
            d["splitMode"] = d.pop("split_mode", "equal")
            d.pop("participant_ids", None)
            d.pop("splits_json", None)
            result.append(d)
            
        return result

def add_transaction(data: Dict[str, Any]) -> Dict[str, Any]:
    tx_id = data.get("id") or f"tx-{int(datetime.utcnow().timestamp() * 1000)}"
    now = datetime.utcnow().isoformat() + "Z"
    
    participant_ids_json = json.dumps(data.get("participantIds") or [])
    splits_json = json.dumps(data.get("splits") or {})
    
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO partner_transactions (
                id, type, date, title, amount, paid_by, payer_id, receiver_id,
                category, split_mode, participant_ids, splits_json, notes, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            tx_id,
            data.get("type", "expense"),
            data.get("date", datetime.utcnow().strftime("%Y-%m-%d")),
            data.get("title", "").strip(),
            float(data.get("amount") or 0),
            data.get("paidBy", ""),
            data.get("payerId", ""),
            data.get("receiverId", ""),
            data.get("category", ""),
            data.get("splitMode", "equal"),
            participant_ids_json,
            splits_json,
            data.get("notes", ""),
            now
        ))
        conn.commit()
        
    return {
        "id": tx_id,
        "type": data.get("type"),
        "date": data.get("date"),
        "title": data.get("title"),
        "amount": float(data.get("amount") or 0),
        "paidBy": data.get("paidBy", ""),
        "payerId": data.get("payerId", ""),
        "receiverId": data.get("receiverId", ""),
        "category": data.get("category", ""),
        "splitMode": data.get("splitMode", "equal"),
        "participantIds": data.get("participantIds") or [],
        "splits": data.get("splits") or {},
        "notes": data.get("notes", ""),
        "created_at": now
    }

def delete_transaction(tx_id: str) -> bool:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM partner_transactions WHERE id = ?", (tx_id,))
        conn.commit()
        return cursor.rowcount > 0

def clear_all_transactions() -> int:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM partner_transactions")
        deleted_count = cursor.rowcount
        conn.commit()
        return deleted_count
