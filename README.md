# PowerStatus PK

Real-time load-shedding transparency for Pakistan.

## Quick Start

### 1. Start Backend Server

```bash
cd backend
python3 main.py
```

The API will be available at `http://127.0.0.1:8000`

**Endpoints:**
- `GET /health` - Health check
- `GET /status` - Get all outage reports
- `POST /report` - Submit new outage report

**Request body for POST /report:**
```json
{
  "location": "Lahore Sector 5",
  "status": "outage"
}
```
Status values: `outage`, `normal`, `warning`

### 2. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

The dashboard will be available at `http://localhost:5173`

## Features

- **Live Dashboard** - Real-time outage status display
- **Auto-refresh** - Updates every 5 seconds
- **Report Submission** - Submit current power status
- **Mobile Responsive** - Works on all devices

## Project Structure

```
gdg-chai-aur-code/
├── backend/
│   ├── main.py          # FastAPI server
│   ├── requirements.txt # Dependencies
│   └── outages.db       # SQLite database
└── frontend/
    ├── src/
    │   ├── App.tsx      # Main React component
    │   ├── App.css      # Styling
    │   └── main.tsx     # Entry point
    └── dist/            # Production build
```
