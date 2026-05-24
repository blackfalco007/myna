const fs = require('fs');
require('dotenv').config();
const { Client } = require('pg');

/* =========================================================
   END DATE ARGUMENT
========================================================= */

const dataEndDate = process.argv[2];

if (!dataEndDate) {
  console.error(
    'Usage: node generate_geographyHierarchy.js YYYY-MM-DD'
  );
  process.exit(1);
}

/* =========================================================
   CONFIG
========================================================= */

const OUTPUT_FILE = 'geographyHierarchy.json';

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

/* =========================================================
   SQL
========================================================= */

const QUERY = `
SELECT DISTINCT
    TRIM(l."STATE")    AS state,
    TRIM(l."COUNTY")   AS district,
    TRIM(l."LOCALITY") AS locality
FROM "LOCATION" l
WHERE l."LOCALITY.TYPE" = 'H'
  AND l."STATE" IS NOT NULL
  AND l."COUNTY" IS NOT NULL
  AND l."LOCALITY" IS NOT NULL
  AND TRIM(l."STATE") <> ''
  AND TRIM(l."COUNTY") <> ''
  AND TRIM(l."LOCALITY") <> ''
ORDER BY
    state,
    district,
    locality;
`;

/* =========================================================
   HELPERS
========================================================= */

function clean(x) {
  return String(x)
    .replace(/\r/g, '')
    .replace(/^"+|"+$/g, '')
    .trim();
}

/* =========================================================
   MAIN
========================================================= */

async function main() {

  await client.connect();

  console.log('Connected to PostgreSQL');

  const result = await client.query(QUERY);

  console.log(`Fetched ${result.rows.length} hotspot rows`);

  const data = {};
  const allLocalities = new Set();

  /* ---------- hierarchy ---------- */

  result.rows.forEach(({ state, district, locality }) => {

    const s = clean(state);
    const d = clean(district);
    const l = clean(locality);

    if (!data[s]) data[s] = {};
    if (!data[s][d]) data[s][d] = new Set();

    data[s][d].add(l);

    allLocalities.add(l);
  });

  /* ---------- states ---------- */

  const statesList = Object.keys(data).sort();

  /* ---------- districts ---------- */

  const districtData = statesList.map((state) => {

    const districts = Object.keys(data[state]).sort();

    return {
      state,
      districts: districts.map((d) => ({
        district: d,
        localities: Array.from(data[state][d]).sort()
      }))
    };
  });

  /* ---------- prefix index ---------- */

  const MAX_PREFIX = 4;

  const prefixIndex = {};

  allLocalities.forEach((loc) => {

    const lower = loc.toLowerCase();

    for (
      let len = 1;
      len <= Math.min(MAX_PREFIX, lower.length);
      len++
    ) {

      const prefix = lower.slice(0, len);

      if (!prefixIndex[prefix]) {
        prefixIndex[prefix] = [];
      }

      prefixIndex[prefix].push(loc);
    }
  });

  /* ---------- dedupe ---------- */

  Object.keys(prefixIndex).forEach((key) => {
    prefixIndex[key] = [...new Set(prefixIndex[key])].sort();
  });

  /* ---------- final output ---------- */

  const finalOutput = {

    dataEndDate,

    defaultStartDate: '1900-01-01',

    generatedAt: new Date().toISOString(),

    totalStates: statesList.length,

    totalLocalities: allLocalities.size,

    statesList,

    district: districtData,

    prefixIndex
  };

  /* ---------- validate ---------- */

  const jsonString = JSON.stringify(finalOutput, null, 2);

  JSON.parse(jsonString);

  /* ---------- write ---------- */

  fs.writeFileSync(
    OUTPUT_FILE,
    jsonString,
    'utf-8'
  );

  console.log(`✅ ${OUTPUT_FILE} written`);

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});