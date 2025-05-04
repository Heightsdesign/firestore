# api/zip_cache.py
import json, sqlite3, threading, time, os
from pathlib import Path

CACHE_TTL  = 30 * 24 * 3600
_LOCK      = threading.Lock()
_DB_PATH   = Path(__file__).resolve().parent / "places_cache.sqlite"

DB = sqlite3.connect(_DB_PATH, check_same_thread=False)
DB.execute("""CREATE TABLE IF NOT EXISTS zip_analysis_cache (
                zip_code     TEXT PRIMARY KEY,
                json_result  TEXT NOT NULL,
                created_at   INTEGER NOT NULL
             )""")
DB.execute("CREATE INDEX IF NOT EXISTS idx_zip_age ON zip_analysis_cache(created_at)")
DB.commit()

def load_zip(zip_code: str, ttl: int = CACHE_TTL):
    now = int(time.time())
    with _LOCK:
        row = DB.execute(
            "SELECT json_result, created_at FROM zip_analysis_cache WHERE zip_code=?",
            (zip_code,)
        ).fetchone()
    if row and now - row[1] < ttl:
        return json.loads(row[0])
    return None

def save_zip(zip_code: str, payload: dict):
    blob = json.dumps(payload); now = int(time.time())
    with _LOCK:
        DB.execute("INSERT OR REPLACE INTO zip_analysis_cache VALUES (?,?,?)",
                   (zip_code, blob, now))
        DB.commit()
