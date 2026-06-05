import { calculateRoundedValue, HEATMAP_GRID_SIZE } from "./heatmapUtils";

export const buildSoibExportData = (data) =>
  (data || []).map(item => ({
    commonName:
      item.indiaChecklistCommonName,

    scientificName:
      item.indiaChecklistScientificName,

    frequencyOfReporting:
      parseFloat(item.percentage) < 1
        ? "<1%"
        : item.percentage,

    latestReportYear:
      item.observationDate
        ? Number(item.observationDate.split("-")[2])
        : null,

    checklistId:
      item.samplingEventIdentifier,

    checklistUrl:
      `https://ebird.org/checklist/${item.samplingEventIdentifier}`
  }));


  export const buildIucnExportData = (data) =>
  (data || []).map(item => ({
    commonName:
      item.indiaChecklistCommonName,

    scientificName:
      item.indiaChecklistScientificName,
    
    iucnStatus:item.region,

    frequencyOfReporting:
      parseFloat(item.percentage) < 1
        ? "<1%"
        : item.percentage,

    latestReportYear:
      item.observationDate
        ? Number(item.observationDate.split("-")[2])
        : null,

    checklistId:
      item.samplingEventIdentifier,

    checklistUrl:
      `https://ebird.org/checklist/${item.samplingEventIdentifier}`
  }));

  export const buildEndemicExportData = (data) =>
  (data || []).map(item => ({
    commonName:
      item.indiaChecklistCommonName,

    scientificName:
      item.indiaChecklistScientificName,

    region:item.region,

    frequencyOfReporting:
      parseFloat(item.percentage) < 1
        ? "<1%"
        : item.percentage,

    latestReportYear:
      item.observationDate
        ? Number(item.observationDate.split("-")[2])
        : null,

    checklistId:
      item.samplingEventIdentifier,

    checklistUrl:
      `https://ebird.org/checklist/${item.samplingEventIdentifier}`
  }));

  export const buildWaterbirdExportData = (data) =>
  (data || []).map(item => ({
    commonName:
      item.indiaChecklistCommonName,

    scientificName:
      item.indiaChecklistScientificName,
    
    highestCount:`${item.highestCongregation} (${item.maxObservationCount}%)`,

    onePercentBiogeographicPopulation:item.onePercentBiogeographicPopulation,

    latestReportYear:
      item.observationDate
        ? Number(item.observationDate.split("-")[2])
        : null,

    checklistId:
      item.samplingEventIdentifier,

    checklistUrl:
      `https://ebird.org/checklist/${item.samplingEventIdentifier}`
  }));

  export const buildCompleteListExportData = (data) =>
  (data || []).map(item => ({
    commonName:
      item.indiaChecklistCommonName,

    scientificName:
      item.indiaChecklistScientificName,
    
    soibPriority:item.soibConcernStatus,

    iucnStatus:item.iucnCategory,

    endemicRegion:item.endemicRegion,

    wlpaSchedule:item.wpaSchedule

  }));

  /* Heatmap geojson */
  
  export const buildHeatmapGeojson = (
  completeListOfSpeciesGi
) => {
    const locationMap = {};

completeListOfSpeciesGi.forEach(entry => {

  const lat =
    calculateRoundedValue(
      entry.latitude
    );

  const lng =
    calculateRoundedValue(
      entry.longitude
    );

  const key =
    `${lat}X${lng}`;

  if (!locationMap[key]) {
    locationMap[key] = new Set();
  }

  locationMap[key].add(
    entry.groupIdentifier
  );
});

const gridCounts = {};

Object.entries(locationMap)
  .forEach(([key, gids]) => {

    gridCounts[key] = gids.size;

});

const maxCount =
  Math.max(
    ...Object.values(gridCounts)
  );

  const features = [];

Object.entries(gridCounts)
  .forEach(([gridId, count]) => {

    const [latStr, lngStr] =
      gridId.split("X");

    const lat = Number(latStr);
    const lng = Number(lngStr);

    const centroidLat = lat + HEATMAP_GRID_SIZE / 2;
    const centroidLng = lng + HEATMAP_GRID_SIZE / 2;

    const normalizedPercentage =
      Math.ceil(
        (count * 100) /
        maxCount
      );

    const heatmapClass =
    normalizedPercentage >= 70
        ? ">=70"
        : normalizedPercentage >= 30
        ? "30-69"
        : normalizedPercentage >= 10
        ? "10-29"
        : normalizedPercentage >= 3
        ? "3-9"
        : normalizedPercentage >= 1
        ? "1-2"
        : "0";
    
    const fillColor =
    normalizedPercentage >= 70
        ? "#562377"
        : normalizedPercentage >= 30
        ? "#3949ab"
        : normalizedPercentage >= 10
        ? "#5c6bc0"
        : normalizedPercentage >= 3
        ? "#7986cb"
        : normalizedPercentage >= 1
        ? "#c5cae9"
        : "#ffffff";

    features.push({
      type: "Feature",

      properties: {
        gridId,

        uniqueGroupIdentifiers: count,

        normalizedPercentage,

        heatmapClass,
        
        fillColor,

        centroidLat,

        centroidLng,
        
        gridOriginLat: lat,
        
        gridOriginLng: lng
        
        },

      geometry: {
        type: "Polygon",

        coordinates: [[
          [lng, lat],
          [lng, lat + 0.045],
          [lng + 0.045, lat + 0.045],
          [lng + 0.045, lat],
          [lng, lat]
        ]]
      }
    });

});

return {
  type: "FeatureCollection",

  metadata: {
    gridSystem:
      "MYNA_0.045_degree_grid",

    maxGridCount:
      maxCount
  },

  features
};
}