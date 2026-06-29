 //workingggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg
/* global google */
 import React, { useEffect, useState, useMemo} from 'react';
 import { Map, Marker,Polygon, GoogleApiWrapper,InfoWindow } from 'google-maps-react';
 import { useSelector } from 'react-redux';
 import * as turf from '@turf/turf';
 import { calculateRoundedValue, HEATMAP_GRID_SIZE, getHeatmapStyle } from "./generatereport/helpers/heatmapUtils";
 
 const center = { lat: 21.1458, lng: 79.0882 };
 
 // const HeatMap = (props) => {
   const HeatMap = (data) => {
   const [gridBounds, setGridBounds] = useState({ latMin: 0, latMax: 0, lngMin: 0, lngMax: 0 });
   const [groupIdentifierCount, setGroupIdentifierCount] = useState({}); 
   const completeListOfSpeciesGi = useSelector(state => state?.UserReducer?.completeListOfSpeciesGi);
   const [values,setValues] = useState([]);
   const [maxValue,setMaxValue] = useState(null);
   const [hoveredCoords, setHoveredCoords] = useState(null); 
   const [uniqueIdentifiersCount, setUniqueIdentifiersCount] = useState({});
   const [props, setProps] = useState({ paths: [] });
   const [polyCount, setPolyCount] = useState(null);
   const [newBufferdata,setNewBufferdata] = useState(null);
   const [mapIdle, setMapIdle] = useState(false);
   const roundToTwoDecimals = (num) => Math.round(num * 1000) / 1000;

  
   useEffect(()=>{
     data.setPolygonsCount(polyCount);
   },[polyCount])
   useEffect(() => {
     if (polyCount !== null && (!maxValue || mapIdle)) {
       data.onHeatmapReady?.({ polygonCount: polyCount });
     }
   }, [polyCount, maxValue, mapIdle, data.onHeatmapReady]);

  //  console.log("uniqueIdentifiersCount",uniqueIdentifiersCount)

 useEffect(() => {
   const locationMap = {};
   const locationMap2 = [];
 
   completeListOfSpeciesGi.forEach(entry => {
    if (typeof entry.latitude === 'number' && typeof entry.longitude === 'number') { 
     const lat = calculateRoundedValue(entry.latitude);
     const long = calculateRoundedValue(entry.longitude);
     locationMap2.push({ lat, lng: long });
 
     const latLongKey = `${lat}X${long}`;
     if (!locationMap[latLongKey]) {
       locationMap[latLongKey] = new Set();
     }
     locationMap[latLongKey].add(entry.groupIdentifier);
    } 
   });
 
   if (JSON.stringify(props.paths) !== JSON.stringify(locationMap2)) {
     setProps({ paths: locationMap2 });
   }
 
   const result = {};
   for (const [latLong, groupIds] of Object.entries(locationMap)) {
     result[latLong] = groupIds.size;
   }
 
   if (JSON.stringify(uniqueIdentifiersCount) !== JSON.stringify(result)) {
     setUniqueIdentifiersCount(result);
   }
 }, [completeListOfSpeciesGi]);
 
 
 useEffect(() => {
   const values = Object.values(uniqueIdentifiersCount);
 
   if (values.length > 0) { 
     const maxValue = Math.max(...values);
 
     if (maxValue > 0) { 
       setMaxValue(maxValue);
       data.sethighestNumber(maxValue);
     }
     setValues(values);
   }
 }, [uniqueIdentifiersCount]);
 

useEffect(() => {
 let minLat = Infinity, maxLat = -Infinity;
 let minLng = Infinity, maxLng = -Infinity;

 if (data.paths && Array.isArray(data.paths)) {
   data.paths.flat().forEach(({ lat, lng }) => {
     if (lat < minLat) minLat = lat;
     if (lat > maxLat) maxLat = lat;
     if (lng < minLng) minLng = lng;
     if (lng > maxLng) maxLng = lng;
   });
 }

}, [data.paths, gridBounds]);


 useEffect(() => {    
 
  if (!Array.isArray(data.paths) || data.paths.length === 0) return;

   const flattenArray = (arr) => 
       arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flattenArray(val) : val), []);
 
   const flattenedPaths = flattenArray(data.paths);

   if (flattenedPaths.length === 0) return; // Prevent empty array errors

  //  const latitudes = flattenedPaths.map(p => p.lat).filter(Boolean);
  //  const longitudes = flattenedPaths.map(p => p.lng).filter(Boolean);

  const latitudes = flattenedPaths.map(p => p.lat).filter(x => typeof x === 'number' && !isNaN(x));
const longitudes = flattenedPaths.map(p => p.lng).filter(x => typeof x === 'number' && !isNaN(x));


  if (latitudes.length === 0 || longitudes.length === 0) return;

  const latMin = Math.min(...latitudes);
  const latMax = Math.max(...latitudes);
  const lngMin = Math.min(...longitudes);
  const lngMax = Math.max(...longitudes);

  setGridBounds({ latMin, latMax, lngMin, lngMax });
}, [data.paths]);

 
 
   
   let dynamicStepSize = 5; 

    if(data.area <= 100){
      dynamicStepSize = Math.max(
        (gridBounds.latMax - gridBounds.latMin) / 10,
        (gridBounds.lngMax - gridBounds.lngMin) / 10
      );
    }

const isPointInPolygon = (point, polygon) => {
  if (!polygon || polygon.length === 0) return false;

  const x = point.lng, y = point.lat;

  // Ensure polygon is fully flattened
  const isInsideSinglePolygon = (singlePolygon) => {
    let isInside = false;
    for (let i = 0, j = singlePolygon.length - 1; i < singlePolygon.length; j = i++) {
      const xi = singlePolygon[i].lng, yi = singlePolygon[i].lat;
      const xj = singlePolygon[j].lng, yj = singlePolygon[j].lat;

      const intersect = ((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) isInside = !isInside;
    }
    return isInside;
  };

  if (Array.isArray(polygon[0])) {
    return polygon.some(subPolygon => isInsideSinglePolygon(subPolygon));
  }

  return isInsideSinglePolygon(polygon);
};
const LoadingContainer = (props) => <div>Fancy loading container!</div>;


const clipPolygonToBoundary = (square, polygonBoundary) => {
  const clippedPolygon = [];

  for (let i = 0; i < square.length; i++) {
    const currentPoint = square[i];
    const nextPoint = square[(i + 1) % square.length];

    const isCurrentInside = isPointInPolygon(currentPoint, polygonBoundary);
    const isNextInside = isPointInPolygon(nextPoint, polygonBoundary);

    if (isCurrentInside) {
      clippedPolygon.push(currentPoint);
    }

    if (isCurrentInside !== isNextInside) {
      const intersection = getIntersectionPoint(
          currentPoint,
          nextPoint,
          polygonBoundary
        );

        if (intersection) {
          clippedPolygon.push(intersection);
        }
      }
    }

  // Remove consecutive duplicate points
  const uniquePoints = clippedPolygon.filter((point, index, arr) => {
    if (index === 0) return true;

    return !(
      point.lat === arr[index - 1].lat &&
      point.lng === arr[index - 1].lng
    );
  });

  // Need at least 3 vertices
  if (uniquePoints.length < 3) {
    return [];
  }

  // Close the polygon if not already closed
  const first = uniquePoints[0];
  const last = uniquePoints[uniquePoints.length - 1];

  if (
    first.lat !== last.lat ||
    first.lng !== last.lng
  ) {
    uniquePoints.push({
      lat: first.lat,
      lng: first.lng
    });
  }

  return uniquePoints;
};



const getIntersectionPoint = (p1, p2, polygon) => {
  for (let i = 0; i < polygon.length; i++) {
    const pA = polygon[i];
    const pB = polygon[(i + 1) % polygon.length];
    const intersection = lineIntersection(p1, p2, pA, pB);
    if (intersection) return intersection;
  }
  return null;
};

const lineIntersection = (A, B, C, D) => {
  const denominator = (A.lng - B.lng) * (C.lat - D.lat) - (A.lat - B.lat) * (C.lng - D.lng);

  if (denominator === 0) return null;

  const t = ((A.lng - C.lng) * (C.lat - D.lat) - (A.lat - C.lat) * (C.lng - D.lng)) / denominator;
  const u = ((A.lng - C.lng) * (A.lat - B.lat) - (A.lat - C.lat) * (A.lng - B.lng)) / denominator;

  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return { lat: A.lat + t * (B.lat - A.lat), lng: A.lng + t * (B.lng - A.lng) };
  }

  return null;
};


const pointInBoundary = (lat, lng, boundaryFeatures) => {
  const point = turf.point([lng, lat]);

  for (const boundaryFeature of boundaryFeatures) {
    if (turf.booleanPointInPolygon(point, boundaryFeature)) {
      return true;
    }
  }

  return false;
};

const generateGrid = useMemo(() => {
    try {
      const polygons = [];

      if (!maxValue || Object.keys(uniqueIdentifiersCount).length === 0) {
        setPolyCount(0);
        return [];
      }

      const polygonsToClipAgainst = Array.isArray(data.paths?.[0])
        ? data.paths
        : data.paths
          ? [data.paths]
          : [];

      const boundaryFeatures = polygonsToClipAgainst
        .map(poly => {
          const coords = poly
            .map(p => [
              typeof p.lng === 'function' ? p.lng() : p.lng,
              typeof p.lat === 'function' ? p.lat() : p.lat
            ])
            .filter(([lng, lat]) => Number.isFinite(lng) && Number.isFinite(lat));

          if (coords.length < 3) return null;

          if (
            coords[0][0] !== coords[coords.length - 1][0] ||
            coords[0][1] !== coords[coords.length - 1][1]
          ) {
            coords.push([...coords[0]]);
          }

          const lngs = coords.map(([lng]) => lng);
          const lats = coords.map(([, lat]) => lat);

          return {
            feature: turf.polygon([coords]),
            bbox: {
              minLng: Math.min(...lngs),
              maxLng: Math.max(...lngs),
              minLat: Math.min(...lats),
              maxLat: Math.max(...lats)
            }
          };
        })
        .filter(Boolean);

      Object.entries(uniqueIdentifiersCount).forEach(([latLngKey, hotspot], polygonCount) => {
        const [latStr, lngStr] = latLngKey.split("X");
        const lat = Number(latStr);
        const lng = Number(lngStr);

        if (
          !Number.isFinite(lat) ||
          !Number.isFinite(lng) ||
          !Number.isFinite(hotspot)
        ) {
          return;
        }

        const normalizedHotspot = Math.ceil((hotspot * 100) / (maxValue || 1));
        if (normalizedHotspot <= 0) {
          return;
        }

        const nextLat = lat + HEATMAP_GRID_SIZE;
        const nextLng = lng + HEATMAP_GRID_SIZE;
        const polygonCoords = [
          { lat, lng },
          { lat: nextLat, lng },
          { lat: nextLat, lng: nextLng },
          { lat, lng: nextLng },
          { lat, lng }
        ];

        let polygonPaths = [polygonCoords];

        if (boundaryFeatures.length > 0) {
          const candidateBoundaries = boundaryFeatures.filter(({ bbox }) =>
            bbox.minLng <= nextLng &&
            bbox.maxLng >= lng &&
            bbox.minLat <= nextLat &&
            bbox.maxLat >= lat
          );

          if (candidateBoundaries.length === 0) {
            return;
          }

          const allCornersInside = polygonCoords.slice(0, 4).every(coord =>
            candidateBoundaries.some(({ feature }) =>
              turf.booleanPointInPolygon(turf.point([coord.lng, coord.lat]), feature)
            )
          );

          if (!allCornersInside) {
            const squareFeature = turf.polygon([[
              [lng, lat],
              [nextLng, lat],
              [nextLng, nextLat],
              [lng, nextLat],
              [lng, lat]
            ]]);

            const clippedPaths = [];

            candidateBoundaries.forEach(({ feature }) => {
              const clipped = turf.intersect(
                turf.featureCollection([
                  squareFeature,
                  feature
                ])
              );

              if (!clipped) return;

              if (clipped.geometry.type === "Polygon") {
                clippedPaths.push(
                  clipped.geometry.coordinates[0].map(
                    ([lng, lat]) => ({ lat, lng })
                  )
                );
              } else if (clipped.geometry.type === "MultiPolygon") {
                clipped.geometry.coordinates.forEach(poly => {
                  clippedPaths.push(
                    poly[0].map(
                      ([lng, lat]) => ({ lat, lng })
                    )
                  );
                });
              }
            });

            if (clippedPaths.length === 0) {
              return;
            }

            polygonPaths = clippedPaths;
          }
        }

        const { color, fillOpacity } = getHeatmapStyle(normalizedHotspot);

        polygonPaths.forEach((path, pathIndex) => {
          polygons.push(
            <Polygon
              key={`${latLngKey}-${polygonCount}-${pathIndex}-${normalizedHotspot}`}
              paths={path}
              strokeColor="#666666"
              strokeWeight={0.15}
              strokeOpacity={0.3}
              fillColor={color}
              fillOpacity={fillOpacity}
              onMouseover={() => {
                setHoveredCoords({
                  percentage: normalizedHotspot,
                  gridId: latLngKey
                });
              }}
              onMouseout={() => {
                setHoveredCoords(null);
              }}
              zIndex={10000}
            />
          );
        });
      });

      setPolyCount(polygons.length);
      return polygons;
    } catch (error) {
    }
   }, [uniqueIdentifiersCount, maxValue, data.paths]);

     const [showInfoWindow, setShowInfoWindow] = useState(false);
     const [activeMarker, setActiveMarker] = useState(null);
     const handleMarkerClick = (marker) => {
      setActiveMarker(marker);
      setShowInfoWindow(true);
    };

    // console.log("data.bufferData",data.bufferData);
    // console.log("data.mapBoundary",data.mapBoundary)

     useEffect(() => {
        if (!data.bufferData) return;
      
        let coordinates;
      
        // Case 1: FeatureCollection
        if (data.bufferData.type === 'FeatureCollection') {
          coordinates = data.bufferData?.features?.[0]?.geometry?.coordinates?.[0];
        }
      
        // Case 2: Single Feature
        else if (data.bufferData.type === 'Feature') {
          coordinates = data.bufferData?.geometry?.coordinates?.[0];
        }
      
        // Only continue if coordinates are found
        if (coordinates) {
          const latLngArray = coordinates.map(coordPair => ({
            lng: coordPair[0],
            lat: coordPair[1],
          }));
          setNewBufferdata(latLngArray);
        }
      }, [props.bufferData]);
       
      // console.log("newBufferdata",newBufferdata)

      function normalizeBoundaryCoords(boundaryArray) {
        if (!Array.isArray(boundaryArray) || boundaryArray?.length === 0) return [];
      
        const isLatLngObject =
          typeof boundaryArray[0].lat === 'function' &&
          typeof boundaryArray[0].lng === 'function';
      
        return boundaryArray.map(point => {
          if (isLatLngObject) {
            return {
              lat: point.lat(),
              lng: point.lng()
            };
          }
      
          // Still check if it's already a plain object (fallback)
          return {
            lat: typeof point.lat === 'function' ? point.lat() : point.lat ?? point.latitude,
            lng: typeof point.lng === 'function' ? point.lng() : point.lng ?? point.longitude
          };
        });
      }

      function normalizeBoundaryCoords2(boundaryArray) {
        if (!Array.isArray(boundaryArray) || boundaryArray.length === 0) return [];
      
        return boundaryArray.map(point => {
          // Handle Google Maps LatLng object
          if (typeof point.lat === 'function' && typeof point.lng === 'function') {
            return {
              lat: point.lat(),
              lng: point.lng()
            };
          }
      
          // Handle object with lat/lng or latitude/longitude
          if (typeof point === 'object' && !Array.isArray(point)) {
            return {
              lat: typeof point.lat === 'function' ? point.lat() : point.lat ?? point.latitude,
              lng: typeof point.lng === 'function' ? point.lng() : point.lng ?? point.longitude
            };
          }
      
          // Handle array: [lng, lat] or [lat, lng] — assume [lng, lat] and convert to object
          if (Array.isArray(point) && point.length === 2) {
            return {
              lat: point[1],
              lng: point[0]
            };
          }
      
          // Fallback in case of invalid format
          return { lat: undefined, lng: undefined };
        });
      }
      //  console.log("data.newPolygon",data.newPolygon)



       function interpolateCoordinates(originalCoords, segmentsPerEdge = 10) {
        const interpolated = [];
      
        for (let i = 0; i < originalCoords.length - 1; i++) {
          const start = originalCoords[i];
          const end = originalCoords[i + 1];
      
          for (let j = 0; j < segmentsPerEdge; j++) {
            const lat = start.lat + ((end.lat - start.lat) * j) / segmentsPerEdge;
            const lng = start.lng + ((end.lng - start.lng) * j) / segmentsPerEdge;
            interpolated.push({ lat, lng });
          }
        }
      
        // Optional: close the loop
        interpolated.push(originalCoords[0]);
      
        return interpolated;
      }
      
      

      const convertLeafletPolygonToGeoJSON = (leafletPolygon) => {
        // console.log("leafletPolygon",leafletPolygon)
        const latlngs = leafletPolygon?.layer?._latlngs[0]; // Assuming it's a single polygon
      
        const coordinates = latlngs?.map((latlng) => [latlng.lng, latlng.lat]);
      
        // Make sure the polygon is closed (first point == last point)
        if (coordinates?.length && (coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
                                   coordinates[0][1] !== coordinates[coordinates.length - 1][1])) {
          coordinates.push(coordinates[0]);
        }
      
        return {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [coordinates],
          },
          properties: {},
        };
      };
      
        const createBuffer = (geojson, radius, units = 'kilometers') => {
        const data =  convertLeafletPolygonToGeoJSON(geojson);
        const coordData = normalizeBoundaryCoords2(data.geometry.coordinates[0]);
        return coordData;
        };

     

      function getArea(coords) {
        if(coords.length>0 || coords.length != null){
          let area = 0;
          for (let i = 0, len = coords.length; i < len - 1; i++) {
            area += (coords[i].lng * coords[i + 1].lat) - (coords[i + 1].lng * coords[i].lat);
          }
          return area / 2;
        }
      }
      
      function ensureClockwise(coords) {
        if(coords.length>0 || coords.length != null){
        return getArea(coords) > 0 ? coords : [...coords].reverse();
        }
      }
      
      function ensureCounterClockwise(coords) {
        if(coords.length>0 || coords.length != null){
        return getArea(coords) < 0 ? coords : [...coords].reverse();
        }
      }
    return (
     
 <div className="relative map-container flex justify-between items-start h-[70vh] w-[91vw] md:w-[70vw] lg:w-[70vw] xlg:w-[70vw] md:ml-0 lg:ml-0">
 
      
        
       { gridBounds.latMin && gridBounds.lngMax && gridBounds.latMax && gridBounds.lngMin && maxValue &&
       <Map
         google={data.google}
          // onReady={!data.mapZoomOut &&  data.onMapReady}
          onReady={(mapProps, map) => {
            setMapIdle(false);
            if (data.bufferData) {
              map.data.addGeoJson(data.bufferData);
              map.data.setStyle({
                // fillColor: '#4F9BC0',
                fillOpacity: 0,
                // strokeWeight: 0,
                strokeColor: '#4F9BC0'
              });
            }
            const bounds = new mapProps.google.maps.LatLngBounds();

  if (Array.isArray(data.mapBoundary?.[0])) {

    data.mapBoundary.forEach(poly => {
      poly.forEach(pt => bounds.extend(pt));
    });

  } else {

    data.mapBoundary.forEach(pt => bounds.extend(pt));

  }

  map.fitBounds(bounds, 30);

  map.addListener("idle", () => {
    setMapIdle(true);
  });
            // if (data.orgPolyCoords) {
            //   map.data.addGeoJson(data.orgPolyCoords); // if orgPolyCoords is valid GeoJSON
            // }
        
            //if (data.onMapReady && !data.mapZoomOut) {
              //data.onMapReady(mapProps, map);
            //}
          }}
         style={{
           height: "70vh",
           width: window.innerWidth >758 ? '70vw' : '91vw',
         }}
         zoomControl={true}
         mapTypeControl={true}
         scaleControl={true}
         scaleControlOptions={{
          position: data.google.maps.ControlPosition.TOP_RIGHT
        }}
         streetViewControl={false}
         panControl={false}
         rotateControl={false}
       >

            {data.mapBoundary && (
             <Polygon
               paths={data.mapBoundary}
               strokeColor="#0000FF"
               strokeOpacity={.5}
               strokeWeight={2.5}
               fillColor="#c5cae9" 
               fillOpacity={0}
             />
           )}
         {generateGrid}
          
       </Map>
       
       }

        {hoveredCoords && (
            <div
              className="absolute top-3 right-3 bg-white rounded-md shadow-lg px-3 py-2 z-50 pointer-events-none"
            >
              <div className="text-lg font-bold leading-none">
                {hoveredCoords.percentage}%
              </div>

              <div className="text-[10px] text-gray-600 mt-1">
                Grid {hoveredCoords.gridId}
              </div>
            </div>
          )}   


     </div>
   );
 }
 const LoadingContainer = (props) => <div>Fancy loading container!</div>;
 
 
 export default GoogleApiWrapper({
   apiKey: 'AIzaSyDhVAmY9KJ7SggfZqNrDrD_S3i6t7Nz1ig',
 })(HeatMap);
   
