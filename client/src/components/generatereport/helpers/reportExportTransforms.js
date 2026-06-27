import { calculateRoundedValue, HEATMAP_GRID_SIZE, getHeatmapStyle } from "./heatmapUtils";

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

     if (
      !Array.isArray(
        completeListOfSpeciesGi
      )
    ) {

      
      return {
        type: "FeatureCollection",
        features: []
      };
    }

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

    const style = getHeatmapStyle(normalizedPercentage);

    features.push({
      type: "Feature",

      properties: {
        gridId,

        uniqueGroupIdentifiers: count,

        normalizedPercentage,

        heatmapClass: style.label,
        
        fillColor: style.color,

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