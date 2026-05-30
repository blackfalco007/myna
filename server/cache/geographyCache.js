const fs = require('fs');
const path = require('path');

const districtsFilePath = path.join(
  __dirname,
  '..',
  'files',
  'district_new.json'
);

const statesFilePath = path.join(
  __dirname,
  '..',
  'files',
  'states.json'
);

console.log('Loading geography boundaries into memory...');

const districtGeoJson = JSON.parse(
  fs.readFileSync(districtsFilePath, 'utf-8')
);

const stateGeoJson = JSON.parse(
  fs.readFileSync(statesFilePath, 'utf-8')
);

console.log('Building district lookup maps...');

const districtLookup = {};
const districtCountyLookup = {};

for (const feature of districtGeoJson.features) {
  const districtName = feature.properties?.DISTRIC
    ?.trim()
    .toLowerCase();

  const countyName = feature.properties?.COUNTY
    ?.trim()
    .toLowerCase();

  if (districtName) {
    districtLookup[districtName] = feature;
  }

  if (countyName) {
    districtCountyLookup[countyName] = feature;
  }
}

console.log('Building state lookup map...');

const stateLookup = {};

for (const feature of stateGeoJson.features) {
  const stateName = feature.properties?.STATE_NAME
    ?.trim()
    .toLowerCase();

  if (stateName) {
    stateLookup[stateName] = feature;
  }
}

module.exports = {
  districtLookup,
  districtCountyLookup,
  stateLookup,
  districtGeoJson,
  stateGeoJson,
};