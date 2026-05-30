const {
  districtLookup,
  districtCountyLookup,
} = require('../cache/geographyCache');

const getDistrictLocationData = (locationName) => {
  if (!locationName) {
    console.error('No district name provided');
    return null;
  }

  const normalizedName = locationName
    .trim()
    .toLowerCase();

  let districtJsonData =
    districtLookup[normalizedName];

  if (!districtJsonData) {
    districtJsonData =
      districtCountyLookup[normalizedName];
  }

  if (!districtJsonData) {
    console.error(
      `No district boundary found for: ${locationName}`
    );

    return null;
  }

  return districtJsonData;
};

module.exports = getDistrictLocationData;