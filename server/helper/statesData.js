const {
  stateLookup,
} = require('../cache/geographyCache');

const getLocationData = (locationName) => {
  if (!locationName) {
    console.error('No state name provided');
    return null;
  }

  const normalizedName = locationName
    .trim()
    .toLowerCase();

  const stateData =
    stateLookup[normalizedName];

  if (!stateData) {
    console.error(
      `No state boundary found for: ${locationName}`
    );

    return null;
  }

  return stateData;
};

module.exports = getLocationData;