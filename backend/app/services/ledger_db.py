import os
import sqlite3
import json
import uuid
import tempfile
from datetime import datetime
from typing import List, Optional, Dict, Any

_in_memory_conn = None

def get_db_path() -> str:
    """
    Determines a guaranteed writable path for SQLite database.
    Compatible with Vercel Serverless, AWS Lambda, Docker, and Local Dev.
    """
    # 1. Explicit environment variable override
    env_path = os.environ.get("SQLITE_DB_PATH")
    if env_path:
        return env_path

    # 2. Vercel & AWS Lambda Serverless environments:
    # On Vercel, the application root (/var/task) is strictly READ-ONLY.
    # The only writable directory is /tmp (tempfile.gettempdir()).
    if os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME"):
        return os.path.join(tempfile.gettempdir(), "godavari_partners.db")

    # 3. Local Development: attempt local data directory first
    try:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        data_dir = os.path.join(base_dir, "data")
        os.makedirs(data_dir, exist_ok=True)
        # Test write permission
        test_file = os.path.join(data_dir, ".perm_test")
        with open(test_file, "w") as f:
            f.write("1")
        os.remove(test_file)
        return os.path.join(data_dir, "godavari_partners.db")
    except Exception:
        # Fallback to system temp folder if local folder is read-only
        return os.path.join(tempfile.gettempdir(), "godavari_partners.db")

def _execute_schema_creation(conn: sqlite3.Connection):
    """Creates tables if they do not exist."""
    cursor = conn.cursor()
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

def get_connection() -> sqlite3.Connection:
    """
    Returns an open SQLite database connection with Row factory.
    Gracefully falls back to shared in-memory database if file I/O fails.
    """
    global _in_memory_conn
    db_path = get_db_path()

    try:
        conn = sqlite3.connect(db_path, timeout=10)
        conn.row_factory = sqlite3.Row
        _execute_schema_creation(conn)
        return conn
    except Exception as e:
        print(f"Warning: Could not connect to SQLite file at '{db_path}': {e}. Using in-memory fallback.")
        if _in_memory_conn is None:
            _in_memory_conn = sqlite3.connect(":memory:", check_same_thread=False)
            _in_memory_conn.row_factory = sqlite3.Row
            _execute_schema_creation(_in_memory_conn)
        return _in_memory_conn

# Initialize schema safely on module load
try:
    with get_connection() as _init_c:
        pass
except Exception as _init_err:
    print(f"Notice: Initial schema check deferred: {_init_err}")

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
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    phone = (data.get("phone") or "").strip()
    color = data.get("color") or "#10b981"
    equity = float(data.get("initial_equity_target") or 33.33)

    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO partners (id, name, email, phone, color, initial_equity_target, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (partner_id, name, email, phone, color, equity, now))
        conn.commit()

    return {
        "id": partner_id,
        "name": name,
        "email": email,
        "phone": phone,
        "color": color,
        "initial_equity_target": equity,
        "created_at": now
    }

def update_partner(partner_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    existing = get_partner_by_id(partner_id)
    if not existing:
        data["id"] = partner_id
        return add_partner(data)

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
            try:
                d["participantIds"] = json.loads(d.get("participant_ids") or "[]")
            except Exception:
                d["participantIds"] = []

            try:
                d["splits"] = json.loads(d.get("splits_json") or "{}")
            except Exception:
                d["splits"] = {}

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
            (data.get("title") or "").strip(),
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

def get_transaction_by_id(tx_id: str) -> Optional[Dict[str, Any]]:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM partner_transactions WHERE id = ?", (tx_id,))
        row = cursor.fetchone()
        if not row:
            return None
        d = dict(row)
        try:
            d["participantIds"] = json.loads(d.get("participant_ids") or "[]")
        except Exception:
            d["participantIds"] = []
        try:
            d["splits"] = json.loads(d.get("splits_json") or "{}")
        except Exception:
            d["splits"] = {}
        d["paidBy"] = d.pop("paid_by", "")
        d["payerId"] = d.pop("payer_id", "")
        d["receiverId"] = d.pop("receiver_id", "")
        d["splitMode"] = d.pop("split_mode", "equal")
        d.pop("participant_ids", None)
        d.pop("splits_json", None)
        return d

def update_transaction(tx_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    existing = get_transaction_by_id(tx_id)
    if not existing:
        # Upsert: add as new transaction if not found
        data["id"] = tx_id
        return add_transaction(data)

    t_type = data.get("type", existing["type"])
    t_date = data.get("date", existing["date"])
    t_title = (data.get("title") or existing["title"]).strip()
    t_amount = float(data.get("amount") if data.get("amount") is not None else existing["amount"])
    t_paid_by = data.get("paidBy", existing["paidBy"])
    t_payer_id = data.get("payerId", existing["payerId"])
    t_receiver_id = data.get("receiverId", existing["receiverId"])
    t_category = data.get("category", existing["category"])
    t_split_mode = data.get("splitMode", existing["splitMode"])
    t_notes = data.get("notes", existing["notes"])

    participant_ids = data.get("participantIds") if data.get("participantIds") is not None else existing["participantIds"]
    splits = data.get("splits") if data.get("splits") is not None else existing["splits"]

    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE partner_transactions
            SET type = ?, date = ?, title = ?, amount = ?, paid_by = ?, payer_id = ?, receiver_id = ?,
                category = ?, split_mode = ?, participant_ids = ?, splits_json = ?, notes = ?
            WHERE id = ?
        """, (
            t_type, t_date, t_title, t_amount, t_paid_by, t_payer_id, t_receiver_id,
            t_category, t_split_mode, json.dumps(participant_ids or []), json.dumps(splits or {}),
            t_notes, tx_id
        ))
        conn.commit()

    return get_transaction_by_id(tx_id)

def delete_transaction(tx_id: str) -> bool:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM partner_transactions WHERE id = ?", (tx_id,))
        conn.commit()
        # Always return True for idempotent deletion
        return True

def clear_all_transactions() -> int:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM partner_transactions")
        deleted_count = cursor.rowcount
        conn.commit()
        return deleted_count

