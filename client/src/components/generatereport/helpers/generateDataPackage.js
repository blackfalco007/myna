import JSZip from "jszip";
import { saveAs } from "file-saver";
import { buildReadme } from "./readmePackage";

export const handleDownloadDataPackage = async ({
   reportId,
   reportJson,
   metadataJson,
   boundaryGeojson,
   heatmapGeojson,
   hotspotsGeojson,

   completeListOfSpeciesCsv,
   completeListOfSpeciesJson,

   getDataForIucnRedListTableCsv,
   getDataForIucnRedListTableJson,
   
   getDataForEndemicSpeciesTableCsv,
   getDataForEndemicSpeciesTableJson,
   
   getSoibConcernStatusCsv,
   getSoibConcernStatusJson,
   
   getDataForWaterbirdCongregationCsv,
   getDataForWaterbirdCongregationJson,

   getSeasonalChartData,
   allYearsCount,
   getMostCommonSpeciesData,
   getEffortDetails
}) => {

    const zip = new JSZip();

    zip.file(
    "report.json",
    JSON.stringify(reportJson, null, 2)
    );

    zip.file(
    "metadata.json",
    JSON.stringify(metadataJson, null, 2)
    );

    zip.file(
    "boundary.geojson",
    JSON.stringify(boundaryGeojson, null, 2)
    );

    zip.file(
    "hotspots.geojson",
    JSON.stringify(hotspotsGeojson, null, 2)
    );

    zip.file(
    "heatmap.geojson",
    JSON.stringify(heatmapGeojson, null, 2)
    );

    zip.file(
    "complete_species.csv",
    completeListOfSpeciesCsv
    );

    zip.file(
    "complete_species.json",
    JSON.stringify(completeListOfSpeciesJson, null, 2)
    );

    zip.file(
    "iucn_redlist_species.csv",
    getDataForIucnRedListTableCsv
    );

    zip.file(
    "iucn_redlist_species.json",
    JSON.stringify(getDataForIucnRedListTableJson, null, 2)
    );

    zip.file(
    "endemic_species.csv",
    getDataForEndemicSpeciesTableCsv
    );

    zip.file(
    "endemic_species.json",
    JSON.stringify(getDataForEndemicSpeciesTableJson, null, 2)
    );

    zip.file(
    "soib_priority_species.csv",
    getSoibConcernStatusCsv
    );

    
    zip.file(
    "soib_priority_species.json",
    JSON.stringify(getSoibConcernStatusJson, null, 2)
    );

    zip.file(
    "waterbird_congregations.csv",
    getDataForWaterbirdCongregationCsv
    );

    zip.file(
    "waterbird_congregations.json",
    JSON.stringify(getDataForWaterbirdCongregationJson, null, 2)
    );

    zip.file(
    "seasonality.json",
    JSON.stringify(getSeasonalChartData, null, 2)
    );

    zip.file(
    "species_accumulation.json",
    JSON.stringify(allYearsCount, null, 2)
    );

    zip.file(
    "most_common_speciesData.json",
    JSON.stringify(getMostCommonSpeciesData, null, 2)
    );

    zip.file(
    "effort_summary.json",
    JSON.stringify(getEffortDetails, null, 2)
    );

    zip.file(
    "README.md",
    buildReadme()
    );

    const blob =
    await zip.generateAsync({
        type: "blob"
    });

    saveAs(
    blob,
    `${reportId}_DataPackage.zip`
    );
    }

