# Hugging Face Spaces App
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import sqlite3
import os
from contextlib import asynccontextmanager

# Database setup - Hugging Face provides DATA directory
DATA_DIR = os.environ.get("HF_DATA_DIR", "/data")
os.makedirs(DATA_DIR, exist_ok=True)
DB_PATH = os.path.join(DATA_DIR, "outages.db")

# Database initialization
def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS outages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            location TEXT NOT NULL,
            status TEXT NOT NULL,
            timestamp DATETIME DEFAULT (datetime('now', 'utc'))
        )
    ''')
    conn.commit()
    conn.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(title="PowerStatus PK API", lifespan=lifespan)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

class ReportRequest(BaseModel):
    location: str
    status: str

@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "connected"}

@app.get("/status")
def get_status():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM outages ORDER BY timestamp DESC")
    rows = cursor.fetchall()
    conn.close()
    
    outages = []
    for row in rows:
        outages.append({
            "id": row["id"],
            "location": row["location"],
            "status": row["status"],
            "timestamp": row["timestamp"]
        })
    return {"outages": outages}

@app.post("/report")
def report_outage(report: ReportRequest):
    if report.status not in ["outage", "normal", "warning"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    now_utc = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S') + 'Z'
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO outages (location, status, timestamp) VALUES (?, ?, ?)",
        (report.location, report.status, now_utc)
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    
    return {"id": new_id, "location": report.location, "status": report.status, "timestamp": now_utc}
