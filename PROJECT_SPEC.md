# Project: PowerStatus PK
Solving the challenge of real-time load-shedding transparency in Pakistan.

## 1. Tech Stack (Optimized for Speed)
*   **Backend:** Python (FastAPI) - Lightweight, fast async capabilities.
*   **Database:** SQLite - No-config, single-file storage for rapid MVP iteration.
*   **Frontend:** React (Vite) - Highly productive SPA framework.
*   **Styling:** Vanilla CSS - No external dependencies to slow down initial setup.

## 2. Core Architecture
A lightweight Client-Server architecture:
*   **Server:** FastAPI backend providing a RESTful API.
*   **Database:** SQLite instance managing neighborhood data and crowd-sourced outage reports.
*   **Client:** React-based dashboard, consuming API data and providing a form for users to report current status.

## 3. MVP Micro-Tasks (Sequential)
1.  **Backend Foundation:** Setup FastAPI project, define SQLite model for `outages` (location, status, timestamp), and implement `GET /status` and `POST /report` endpoints.
2.  **UI Core:** Develop a basic React frontend with a dashboard layout to display outage status and a simple form for users to submit reports.
3.  **Integration & Delivery:** Connect UI to API, implement simple polling for real-time updates, and ensure the UI is mobile-responsive for field use.
