import os
import sqlite3
import json
import uuid
import tempfile
import urllib.request
import urllib.parse
from datetime import datetime
from typing import List, Optional, Dict, Any

# ==================== CONFIGURATION & SUPABASE ====================

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://nqbokydddszqwzckuokr.supabase.co").rstrip("/")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "sb_publishable_RKUoivjb34NmSuy176C0ag_8yKu8DOz")
USE_SUPABASE = bool(SUPABASE_URL and SUPABASE_KEY)

def _supabase_request(endpoint: str, method: str = "GET", body: Any = None, prefer: Optional[str] = None) -> Optional[Any]:
    """
    Executes a direct HTTPS REST request to Supabase PostgREST.
    Returns parsed JSON if successful, or None on failure (triggering SQLite fallback).
    """
    if not USE_SUPABASE:
        return None

    url = f"{SUPABASE_URL}/rest/v1/{endpoint.lstrip('/')}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    if prefer:
        headers["Prefer"] = prefer

    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req, timeout=10) as res:
            res_body = res.read().decode("utf-8")
            if res_body and res_body.strip():
                return json.loads(res_body)
            return []
    except Exception as e:
        print(f"Notice: Supabase call to '{endpoint}' failed ({e}). Falling back to local SQLite.")
        return None

# ==================== SQLITE LOCAL FALLBACK ====================

_in_memory_conn = None

def get_db_path() -> str:
    """Determines writable SQLite path for local fallback."""
    env_path = os.environ.get("SQLITE_DB_PATH")
    if env_path:
        return env_path

    if os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME"):
        return os.path.join(tempfile.gettempdir(), "godavari_partners.db")

    try:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        data_dir = os.path.join(base_dir, "data")
        os.makedirs(data_dir, exist_ok=True)
        return os.path.join(data_dir, "godavari_partners.db")
    except Exception:
        return os.path.join(tempfile.gettempdir(), "godavari_partners.db")

def _execute_schema_creation(conn: sqlite3.Connection):
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
    global _in_memory_conn
    db_path = get_db_path()
    try:
        conn = sqlite3.connect(db_path, timeout=10)
        conn.row_factory = sqlite3.Row
        _execute_schema_creation(conn)
        return conn
    except Exception as e:
        if _in_memory_conn is None:
            _in_memory_conn = sqlite3.connect(":memory:", check_same_thread=False)
            _in_memory_conn.row_factory = sqlite3.Row
            _execute_schema_creation(_in_memory_conn)
        return _in_memory_conn

# Initialize local schema safely
try:
    with get_connection() as _init_c:
        pass
except Exception as _init_err:
    pass

# ==================== TRANSACTION DATA NORMALIZATION ====================

def _format_tx(d: Dict[str, Any]) -> Dict[str, Any]:
    """Ensures consistent camelCase output for transactions."""
    item = dict(d)
    p_ids = item.get("participant_ids") if item.get("participant_ids") is not None else item.get("participantIds", [])
    if isinstance(p_ids, str):
        try:
            p_ids = json.loads(p_ids)
        except Exception:
            p_ids = []
    item["participantIds"] = p_ids or []

    splits = item.get("splits_json") if item.get("splits_json") is not None else item.get("splits", {})
    if isinstance(splits, str):
        try:
            splits = json.loads(splits)
        except Exception:
            splits = {}
    item["splits"] = splits or {}

    item["paidBy"] = item.pop("paid_by", item.get("paidBy", ""))
    item["payerId"] = item.pop("payer_id", item.get("payerId", ""))
    item["receiverId"] = item.pop("receiver_id", item.get("receiverId", ""))
    item["splitMode"] = item.pop("split_mode", item.get("splitMode", "equal"))
    item.pop("participant_ids", None)
    item.pop("splits_json", None)
    return item

# ==================== PARTNER OPERATIONS ====================

def get_all_partners() -> List[Dict[str, Any]]:
    # 1. Try Supabase
    res = _supabase_request("partners?select=*&order=created_at.asc")
    if res is not None:
        return res

    # 2. SQLite Fallback
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM partners ORDER BY created_at ASC")
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

def get_partner_by_id(partner_id: str) -> Optional[Dict[str, Any]]:
    # 1. Try Supabase
    res = _supabase_request(f"partners?id=eq.{urllib.parse.quote(partner_id)}&select=*")
    if res is not None:
        return res[0] if res else None

    # 2. SQLite Fallback
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

    payload = {
        "id": partner_id,
        "name": name,
        "email": email,
        "phone": phone,
        "color": color,
        "initial_equity_target": equity,
        "created_at": now
    }

    # 1. Try Supabase
    res = _supabase_request("partners", method="POST", body=payload, prefer="resolution=merge-duplicates,return=representation")
    if res is not None and res:
        return res[0]

    # 2. SQLite Fallback
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO partners (id, name, email, phone, color, initial_equity_target, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (partner_id, name, email, phone, color, equity, now))
        conn.commit()

    return payload

def update_partner(partner_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    existing = get_partner_by_id(partner_id)
    if not existing:
        data["id"] = partner_id
        return add_partner(data)

    update_payload = {
        "name": data.get("name", existing["name"]),
        "email": data.get("email", existing["email"]),
        "phone": data.get("phone", existing["phone"]),
        "color": data.get("color", existing["color"]),
        "initial_equity_target": float(data.get("initial_equity_target") if data.get("initial_equity_target") is not None else existing["initial_equity_target"])
    }

    # 1. Try Supabase
    res = _supabase_request(
        f"partners?id=eq.{urllib.parse.quote(partner_id)}",
        method="PATCH",
        body=update_payload,
        prefer="return=representation"
    )
    if res is not None and res:
        return res[0]

    # 2. SQLite Fallback
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE partners 
            SET name = ?, email = ?, phone = ?, color = ?, initial_equity_target = ?
            WHERE id = ?
        """, (
            update_payload["name"],
            update_payload["email"],
            update_payload["phone"],
            update_payload["color"],
            update_payload["initial_equity_target"],
            partner_id
        ))
        conn.commit()

    return get_partner_by_id(partner_id)

def delete_partner(partner_id: str) -> bool:
    # 1. Try Supabase
    res = _supabase_request(f"partners?id=eq.{urllib.parse.quote(partner_id)}", method="DELETE")
    
    # Also delete in local SQLite
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM partners WHERE id = ?", (partner_id,))
        conn.commit()
    return True

# ==================== TRANSACTION OPERATIONS ====================

def get_all_transactions() -> List[Dict[str, Any]]:
    # 1. Try Supabase
    res = _supabase_request("partner_transactions?select=*&order=date.desc,created_at.desc")
    if res is not None:
        return [_format_tx(r) for r in res]

    # 2. SQLite Fallback
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM partner_transactions ORDER BY date DESC, created_at DESC")
        rows = cursor.fetchall()
        return [_format_tx(dict(r)) for r in rows]

def get_transaction_by_id(tx_id: str) -> Optional[Dict[str, Any]]:
    # 1. Try Supabase
    res = _supabase_request(f"partner_transactions?id=eq.{urllib.parse.quote(tx_id)}&select=*")
    if res is not None:
        return _format_tx(res[0]) if res else None

    # 2. SQLite Fallback
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM partner_transactions WHERE id = ?", (tx_id,))
        row = cursor.fetchone()
        return _format_tx(dict(row)) if row else None

def add_transaction(data: Dict[str, Any]) -> Dict[str, Any]:
    tx_id = data.get("id") or f"tx-{int(datetime.utcnow().timestamp() * 1000)}"
    now = datetime.utcnow().isoformat() + "Z"

    p_ids = data.get("participantIds") or []
    splits = data.get("splits") or {}

    payload = {
        "id": tx_id,
        "type": data.get("type", "expense"),
        "date": data.get("date", datetime.utcnow().strftime("%Y-%m-%d")),
        "title": (data.get("title") or "").strip(),
        "amount": float(data.get("amount") or 0),
        "paid_by": data.get("paidBy", ""),
        "payer_id": data.get("payerId", ""),
        "receiver_id": data.get("receiverId", ""),
        "category": data.get("category", ""),
        "split_mode": data.get("splitMode", "equal"),
        "participant_ids": p_ids,
        "splits_json": splits,
        "notes": data.get("notes", ""),
        "created_at": now
    }

    # 1. Try Supabase
    res = _supabase_request("partner_transactions", method="POST", body=payload, prefer="return=representation")
    if res is not None and res:
        return _format_tx(res[0])

    # 2. SQLite Fallback
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
            payload["type"],
            payload["date"],
            payload["title"],
            payload["amount"],
            payload["paid_by"],
            payload["payer_id"],
            payload["receiver_id"],
            payload["category"],
            payload["split_mode"],
            json.dumps(p_ids),
            json.dumps(splits),
            payload["notes"],
            now
        ))
        conn.commit()

    return _format_tx(payload)

def update_transaction(tx_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    existing = get_transaction_by_id(tx_id)
    if not existing:
        data["id"] = tx_id
        return add_transaction(data)

    p_ids = data.get("participantIds") if data.get("participantIds") is not None else existing.get("participantIds", [])
    splits = data.get("splits") if data.get("splits") is not None else existing.get("splits", {})

    update_payload = {
        "type": data.get("type", existing.get("type")),
        "date": data.get("date", existing.get("date")),
        "title": (data.get("title") or existing.get("title")).strip(),
        "amount": float(data.get("amount") if data.get("amount") is not None else existing.get("amount")),
        "paid_by": data.get("paidBy", existing.get("paidBy")),
        "payer_id": data.get("payerId", existing.get("payerId")),
        "receiver_id": data.get("receiverId", existing.get("receiverId")),
        "category": data.get("category", existing.get("category")),
        "split_mode": data.get("splitMode", existing.get("splitMode")),
        "participant_ids": p_ids,
        "splits_json": splits,
        "notes": data.get("notes", existing.get("notes"))
    }

    # 1. Try Supabase
    res = _supabase_request(
        f"partner_transactions?id=eq.{urllib.parse.quote(tx_id)}",
        method="PATCH",
        body=update_payload,
        prefer="return=representation"
    )
    if res is not None and res:
        return _format_tx(res[0])

    # 2. SQLite Fallback
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE partner_transactions
            SET type = ?, date = ?, title = ?, amount = ?, paid_by = ?, payer_id = ?, receiver_id = ?,
                category = ?, split_mode = ?, participant_ids = ?, splits_json = ?, notes = ?
            WHERE id = ?
        """, (
            update_payload["type"], update_payload["date"], update_payload["title"], update_payload["amount"],
            update_payload["paid_by"], update_payload["payer_id"], update_payload["receiver_id"],
            update_payload["category"], update_payload["split_mode"], json.dumps(p_ids),
            json.dumps(splits), update_payload["notes"], tx_id
        ))
        conn.commit()

    return get_transaction_by_id(tx_id)

def delete_transaction(tx_id: str) -> bool:
    # 1. Try Supabase
    _supabase_request(f"partner_transactions?id=eq.{urllib.parse.quote(tx_id)}", method="DELETE")
    
    # 2. SQLite
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM partner_transactions WHERE id = ?", (tx_id,))
        conn.commit()
    return True

def clear_all_transactions() -> int:
    # 1. Try Supabase
    _supabase_request("partner_transactions?id=neq.null", method="DELETE")

    # 2. SQLite
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM partner_transactions")
        deleted_count = cursor.rowcount
        conn.commit()
        return deleted_count
