import { NextRequest, NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db: any = null;

async function getDb() {
  if (!db) {
    db = await open({
      filename: '/tmp/outages.db',
      driver: sqlite3.Database,
    });
    await db.exec(`
      CREATE TABLE IF NOT EXISTS outages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        location TEXT NOT NULL,
        status TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
  return db;
}

export async function GET() {
  try {
    const db = await getDb();
    const outages = await db.all('SELECT * FROM outages ORDER BY timestamp DESC');
    return NextResponse.json({ outages });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { location, status } = await request.json();
    
    if (!location || !status) {
      return NextResponse.json({ error: 'Missing location or status' }, { status: 400 });
    }

    if (!['outage', 'normal', 'warning'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const db = await getDb();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    const result = await db.run(
      'INSERT INTO outages (location, status, timestamp) VALUES (?, ?, ?)',
      location, status, now
    );

    return NextResponse.json({
      id: result.lastID,
      location,
      status,
      timestamp: now + 'Z'
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
