# MYNA

**Mapping Your Neighbourhood Avifauna (MYNA)** is a data exploration tool published by the State of India's Birds (SoIB) partnership to explore the underlying large-scale data used in the SoIB assessments.

The data is based entirely on eBird data downloaded from:
https://ebird.org/region/IN

For the latest MYNA deployment and reporting date, visit:

https://myna.stateofindiasbirds.in/

---

# Repository Structure

```text
client/   -> React frontend
server/   -> Node.js / Express backend
db/       -> SQL scripts and DB utilities
```

---

# Technology Stack

- React
- Node.js
- Express
- PostgreSQL
- Redis
- Docker (recommended for Redis setup)

---

# Development Setup

## Prerequisites

Install:

- Node.js (recommended: Node 24.x)
- npm
- PostgreSQL
- Docker Desktop
- Git

---

# Clone Repository

```bash
git clone https://github.com/blackfalco007/myna
cd myna
```

---

# Environment Variables

## Backend Environment Variables

Copy:

```text
server/.env.example
```

to:

```text
server/.env
```

and fill the required values.

Example:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=
DB_USER=
DB_PASSWORD=

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1

REDIS_ENABLED=true
REDIS_URL=redis://127.0.0.1:6379
```
---

## Frontend Environment Variables

Copy:

```text
client/.env.example
```

to:

```text
client/.env
```

and fill the required values.

---

# Redis Setup

Redis is used for caching and improving report performance.

Install Docker Desktop:

https://www.docker.com/products/docker-desktop/

Run Redis locally:

```bash
docker run --name redis-local --restart unless-stopped -p 6379:6379 -d redis
```

Verify Redis:

```bash
docker ps
```

Stop Redis:

```bash
docker stop redis-local
```

Start Redis again:

```bash
docker start redis-local
```

---

# Backend Setup

```bash
cd server
npm install --legacy-peer-deps
npm install dotenv
npm start
```

Backend typically runs on:

```text
http://localhost:3001
```

---

# Frontend Setup

```bash
cd client
npm install --legacy-peer-deps
npm install dotenv
npm start
```

Frontend typically runs on:

```text
http://localhost:3000
```

---

# Large Data Files

Some large GIS/data files are intentionally not checked into GitHub.

Place required files inside:

```text
server/files/
```

Examples:

- district_new.json
- states.json

These files may need to be obtained separately from project maintainers.

---

# Notes

- `.env` files are intentionally excluded from Git.
- `node_modules/` should not be committed.
- Redis can be disabled locally using:

```env
REDIS_ENABLED=false
```

---

# Versions

# MYNA v3.0

- New baseline code reflecting LIVE server code running as of 16th May 2026
- .env file introduced in backend (server) code to separate DB and AWS access
- Removed confusing defines in the client .env file 
- Redis server/middlewares cacheMiddleware.js rewritten.
- github tagging will be used. baseline-v1/v2/..tags till this tag is able to build cleanly for development.
- In parallel the backend DB on AWS is updated monthly. At the time of this check-in it has been updated with data until Mar 31, 2026.

# MYNA v2.2

Added optimization for mobile phones, tablets and small-screen desktop devices.

- Release 2.2a: Updated MYNA UI and improved responsiveness across devices.
- Release 2.2b: Updated Instructions page UI and responsiveness.
- Release 2.2c: Optimized About page and landing page UI.
- Release 2.2d: Updated “Download PDF” to “Download A4 PDF” in all modes.

---

# MYNA v2.1

Added Heat Map and Accumulated Curve.

- Release 2.1a:
  - Built APIs for yearly Heat Map grid data.
  - Built APIs for yearly accumulated graph data.

- Release 2.1b:
  - Added Heat Map UI.
  - Added Accumulated Curve visualization.
  - Updated About and Instructions pages.
  - Updated PDF report UI to include Heat Map and Accumulated Curve.

---

# MYNA v2.0

Updated database to year 2024.

- Release 2.0a:
  - Updated species categories.
  - Removed outdated 2023 data.
  - Inserted updated data till 31st May 2024.

- Release 2.0b:
  - Added footer to About and Instructions pages.
  - Extended reporting year till 31st May 2024.

---

# MYNA v1.02

Enhanced Mapping Support – Phase 1

- Release 1.02a:
  - Added boundary support in web and reports for polygons/files.
  - Fixed map area calculation differences.
  - Updated fonts to Gandhi Sans.

- Release 1.02b:
  - Added boundaries in reports and PDFs for geography mode.

---

# MYNA v1.01

New tables and reporting enhancements.

- Release 1.1:
  - Added SoIB table.
  - Added backend/frontend testing report.

- Release 1.2:
  - Added year of reporting for Waterbird Congregations.

- Release 1.3:
  - Added year of last report for:
    - IUCN Red List Species
    - Endemic Species

- Release 1.4:
  - Added checklist links to all years.
  - Optimized Species Detail Count APIs.
  - Split APIs into smaller endpoints.
  - Updated Instructions page information.

---

# Troubleshooting

## Redis issues

Verify Docker is running:

```bash
docker ps
```

## Port conflicts

Typical ports:

- Frontend: 3000
- Backend: 5000
- Redis: 6379
- PostgreSQL: 5432

---

# License

Add project license information here.