# Geography Hierarchy JSON Generator

## Purpose

This script generates the `geographyHierarchy.json` used by the MYNA frontend UI.

The generated JSON contains:

- State list
- District hierarchy
- Localities / eBird hotspots
- Runtime configuration dates
- Prefix search index for faster locality lookup

This JSON is loaded by the frontend Geography dropdowns when MYNA launches.

The `dataEndDate` entered while running the script is also used as the default **End Date** in the MYNA UI.

---

# Usage

```bash
node generate_geographyHierarchy.js YYYY-MM-DD

Example:
node generate_geographyHierarchy.js 2026-03-31

Requirements

You must have:

Node.js installed
PostgreSQL access to the latest LIVE MYNA database
.env file available in the same folder as the script

The .env should be the same as the server .env.

Example:
DB_HOST=...
DB_PORT=5432
DB_NAME=ebd
DB_USER=...
DB_PASSWORD=...

What the script does

The script:

Connects to the latest LIVE database
Queries hotspot geography from the LOCATION table
Generates:
states
districts
localities
runtime config
prefix index
Writes:
geographyHierarchy.json
Frontend Usage

For local/test environment:

Copy the generated JSON into:

client/public/config/

For Azure production deployment:

Copy the generated JSON into:

/var/www/build/

The frontend automatically loads this file during startup.

Integration with Monthly DB Refresh

The included batch file:

run.bat

should be appended/integrated into:

db/refresh_myna.bat

This monthly refresh batch is used after updating MYNA with the latest eBird month-end database.

Recommended flow:

Refresh latest DB
    ↓
Refresh merge views
    ↓
Generate geographyHierarchy.json
    ↓
Copy JSON to frontend build

This ensures:

Frontend geography always matches LIVE DB
Latest hotspots/localities are available
End-date in UI matches latest eBird update
Output JSON Structure

Example:

{
  "dataEndDate": "2026-03-31",
  "defaultStartDate": "1900-01-01",
  "generatedAt": "2026-05-24T10:00:00.000Z",

  "statesList": [...],

  "district": [...],

  "prefixIndex": {...}
}

Notes

The JSON is validated before writing.
Localities are pre-sorted for frontend performance.
Report names in MYNA are auto-generated from:
uploaded filenames
state/district/locality selections
polygons