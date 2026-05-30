const {
  districtLookup,
} = require('../cache/geographyCache');

const getDistrictLocationData = (
  locationName,
  stateName
) => {

  if (!locationName) {
    console.error('No district name provided');
    return null;
  }

  if (!stateName) {
    console.error('No state name provided');
    return null;
  }

  const normalizedDistrict =
    locationName
      .trim()
      .toLowerCase();

  const normalizedState =
    stateName
      .trim()
      .toLowerCase();

  const cacheKey =
    `${normalizedState}|${normalizedDistrict}`;

  const districtJsonData =
    districtLookup[cacheKey];

  if (!districtJsonData) {

    console.error(
      `No district boundary found for: ${stateName} -> ${locationName}`
    );

    return null;
  }

  return districtJsonData;
};

module.exports = getDistrictLocationData;