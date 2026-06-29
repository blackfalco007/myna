# Changelog

## Unreleased

### Added
- Support for multiple disjoint polygon drawing, different geojson type of files ("Polygon" and nested lat/long in "MultiPolygon"). This helps support Ramsar/IBA files which were tested. buildSpatialFilter.js on the server does that.
- In the myna/scripts - generate_conservation_layers.js script picks up iba_india.geojson and ramsar_india.geojson (which have all the 153/65 odd regions clubbed together in one) and creates a folder "output/<iba> or <ramsar>/geojson/x.geojson" files which will be used individually in MYNA

### Changed
- kml, shape, latitude in the server uses the helpers in buildSpatialFilter to query the various polygons.
- reportEXportTransforms exports the heatmap geojson from a common heatmapUtils.js for the grid colors, legend and geojson
- Map/Satellite view introduced.
- HeatMap.js - added a top right window to show percentage and grid on hovering on a grid. No longer a box moving with tooltip and obstructing the view.
- **NEW CHANGE**
- Locality propogated to Report title, PDF, reportID, bibTex, Apa and to the jsons i.e Data download has it now (metadata schema changed)
- Smoother hotspot hovering and info-window on right (just as heatmap)

### Fixed
- smooth completeListofSpecies table flow.
- report.js has the ugly lower grey band and vertical right band removed. Scale introduced. 
- generatePdf.js had an issue when html2canvas of the hotspot map. Solved. 
- heatmap - now beautiful clipping and proper labeling. "0" no longer need to be shown. Grid lines not needed.
- Freeze on Chandigarh loading 
- **NEW FIX**
- Scrolling of report at the time of pdf generation is fixed.
- Complete Species table had horizontal scroll fixed.
- Title bar text / date / region misalignments fixed.