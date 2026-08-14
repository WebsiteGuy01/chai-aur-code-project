from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import sqlite3
import os
from contextlib import asynccontextmanager

# Database setup
DB_DIR = "/root/gdg-chai-aur-code/backend"
DB_PATH = os.path.join(DB_DIR, "outages.db")

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
    # Startup
    init_db()
    yield
    # Shutdown (if needed)

app = FastAPI(title="PowerStatus PK API", description="Real-time load-shedding transparency for Pakistan", lifespan=lifespan)

# CORS middleware for frontend-backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Pydantic models for request/response validation
class Outage(BaseModel):
    id: Optional[int] = None
    location: str
    status: str  # "outage", "normal", "warning"
    timestamp: Optional[datetime] = None

class ReportRequest(BaseModel):
    location: str
    status: str

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "connected"}

# GET /status - Retrieve all outage records
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

# POST /report - Submit new outage report
@app.post("/report")
def report_outage(report: ReportRequest):
    if report.status not in ["outage", "normal", "warning"]:
        raise HTTPException(status_code=400, detail="Invalid status. Must be 'outage', 'normal', or 'warning'")
    
    # Use UTC timestamp with Z suffix for proper timezone handling
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
    
    # Return timestamp in consistent format with Z suffix
    return {"id": new_id, "location": report.location, "status": report.status, "timestamp": datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S') + 'Z'}
