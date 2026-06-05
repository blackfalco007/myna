export const buildReadme = () => `
# MYNA Data Package

Thank you for using MYNA (Mapping and Yielding National Avifauna).

This package contains machine-readable versions of the report and supporting spatial data.

FILES INCLUDED
--------------

report.json
  Complete machine-readable representation of the MYNA report.

metadata.json
  Report metadata, citations, methodology and technical details.

boundary.geojson
  Geographic boundary used for report generation.

heatmap.geojson
  Grid-based representation of birding effort using complete checklist groups.

hotspots.geojson
  Important birding hotspots identified within the report area.

complete_species.csv
complete_species.json
  Complete species list.

soib_priority_species.csv
soib_priority_species.json
  State of India's Birds conservation priority species.

iucn_redlist_species.csv
iucn_redlist_species.json
  IUCN Red List species.

endemic_species.csv
endemic_species.json
  Endemic species.

waterbird_congregations.csv
waterbird_congregations.json
  Waterbird congregation records.

GETTING STARTED
---------------

For GIS users:
  Open boundary.geojson, heatmap.geojson and hotspots.geojson in QGIS.

For data users:
  Start with report.json and metadata.json.

TECHNICAL NOTES
---------------

Coordinate Reference System:
  EPSG:4326 (WGS84)

Heatmap grids are generated using the MYNA grid system.

For complete metadata, citations and methodology,
please refer to metadata.json.

ABOUT MYNA
----------

MYNA helps users explore bird diversity, conservation
priority species, birding effort and hotspots across India.

https://myna.stateofindiasbirds.in

Generated using MYNA.
`;