const geographyHierarchy = require(
  '../client/public/config/geographyHierarchy.json'
);

const districtData = require(
  '../server/files/district_new.json'
);

const normalize = (s) =>
  s
    ?.normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const geoDistricts = new Set();
const polygonDistricts = new Set();

//
// BUILD geographyHierarchy DISTRICTS
//
for (const stateObj of geographyHierarchy.district) {

  for (const districtObj of stateObj.districts) {

    if (districtObj.district) {

      geoDistricts.add(
        normalize(districtObj.district)
      );
    }
  }
}

//
// BUILD polygon DISTRICTS
//
for (const feature of districtData.features) {

  const districtName =
    feature.properties?.DISTRIC;

  const countyName =
    feature.properties?.COUNTY;

  if (districtName) {

    polygonDistricts.add(
      normalize(districtName)
    );
  }

  if (countyName) {

    polygonDistricts.add(
      normalize(countyName)
    );
  }
}

//
// DEBUG
//
console.log(
  "geoDistricts has nicobar:",
  geoDistricts.has("nicobar")
);

console.log(
  "polygonDistricts has nicobar:",
  polygonDistricts.has("nicobar")
);

console.log(
  "Polygon matches:",
  [...polygonDistricts]
    .filter(x => x.includes("nicobar"))
);

console.log(
  "Hierarchy matches:",
  [...geoDistricts]
    .filter(x => x.includes("nicobar"))
);

//
// DISTRICTS IN UI BUT MISSING POLYGONS
//
const missing = [];

for (const district of geoDistricts) {

  if (!polygonDistricts.has(district)) {
    missing.push(district);
  }
}

console.log('\n');
console.log(
  'Districts selectable in UI but missing polygons:'
);

console.log(missing);

console.log(
  `Total missing polygons: ${missing.length}`
);

//
// POLYGONS AVAILABLE BUT NOT IN UI
//
const extraPolygons = [];

for (const district of polygonDistricts) {

  if (!geoDistricts.has(district)) {
    extraPolygons.push(district);
  }
}

console.log('\n');

console.log(
  'Polygon boundaries available but not selectable in UI:'
);

console.log(extraPolygons);

console.log(
  `Total extra polygon boundaries: ${extraPolygons.length}`
);