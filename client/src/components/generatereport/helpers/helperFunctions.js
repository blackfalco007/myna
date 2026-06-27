import mixpanel from "mixpanel-browser";
export const recordVisit = () => {
  if (!localStorage.getItem("visited")) {
    localStorage.setItem("visited", true);
    createTrack("visit");
  }
};
export const createTrackMiddlewareForPdfGenerate = (reciever) => {
  const condition = reciever.slice(0, -1) + "P";
  createTrack(condition);
};
export const createTrack = (reciever) => {
  let emit = "";
  switch (reciever) {
    case "visit":
      emit = "Unique Visit";
      break;
    case "polygonR":
      emit = "Report generated with Polygon";
      break;
    case "kmlR":
      emit = "Report generated with Kml";
      break;
    case "zipR":
      emit = "Report generated with Shape File";
      break;
    case "jsonR":
      emit = "Report generated with Geojson";
      break;
    case "districtR":
      emit = "Report generated with Geography(District)";
      break;
    case "localityR":
      emit = "Report generated with Geography(Locality)";
      break;
    case "polygonP":
      emit = "Pdf downloaded with Polygon";
      break;
    case "kmlP":
      emit = "Pdf downloaded with Kml";
      break;
    case "zipP":
      emit = "Pdf downloaded with Shape File";
      break;
    case "jsonP":
      emit = "Pdf downloaded with Geojson";
      break;
    case "districtP":
      emit = "Pdf downloaded with Geography(District)";
      break;
    case "localityP":
      emit = "Pdf downloaded with Geography(Locality)";
      break;
    default:
      break;
  }
  mixpanel.track(emit);
};
export const calculateCentroid = (points) => {
  const totalPoints = points.length;

  // Calculate sum of X and Y coordinates
  const sum = points.reduce(
    (acc, point) => {
      return [acc[0] + point[0], acc[1] + point[1]];
    },
    [0, 0]
  );

  // Calculate average X and Y coordinates
  const avgX = sum[0] / totalPoints;
  const avgY = sum[1] / totalPoints;
  return [avgY, avgX];
};
export const calculateZoom = (points) => {
  // Calculate sum of X and Y coordinates
  const max = points.reduce(
    (acc, point) => {
      return [Math.max(acc[0], point[0]), Math.max(acc[1], point[1])];
    },
    [0, 0]
  );

  const min = points.reduce(
    (acc, point) => {
      return [Math.min(acc[0], point[0]), Math.min(acc[1], point[1])];
    },
    [Infinity, Infinity]
  );
  const maxDifferenceDegree = Math.max(max[0] - min[0], max[1] - min[1]);
  const maxDifferenceKms = maxDifferenceDegree * 111;

  let requiredZoom = 12;
  maxDifferenceKms <= 1 && (requiredZoom = 16);
  maxDifferenceKms > 1 && maxDifferenceKms < 10 && (requiredZoom = 13);
  maxDifferenceKms >= 10 && maxDifferenceKms < 60 && (requiredZoom = 11);
  maxDifferenceKms >= 60 && maxDifferenceKms < 200 && (requiredZoom = 9);
  maxDifferenceKms >= 200 && maxDifferenceKms < 300 && (requiredZoom = 8);
  maxDifferenceKms >= 300 && (requiredZoom = 7);

  // Calculate average X and Y coordinates

  return requiredZoom;
};




 export const getPolygonCenter = (polygon, google) => {
  // debugger;
  if (polygon && polygon.length > 0 && google) {
    const bounds = new google.maps.LatLngBounds();

    const flattenPolygon = (polygon) => {
      const result = [];

      const flatten = (parts) => {
        parts.forEach((part) => {
          if (Array.isArray(part[0])) {
            flatten(part); 
          } else {
            result.push(part); 
          }
        });
      };

      flatten(polygon);
      return result;
    };
 
    const flattenedPolygon = flattenPolygon(polygon);

    flattenedPolygon.forEach((point) => {
      if (isFinite(point.lat) && isFinite(point.lng)) {
        bounds.extend(new google.maps.LatLng(point.lat, point.lng));
      }
    });

    const center = bounds.getCenter();

    const centerLat = center.lat();
    const centerLng = center.lng();

    if (isNaN(centerLat) || isNaN(centerLng)) {
      const totalPoints = flattenedPolygon.length;
      const latSum = flattenedPolygon.reduce((sum, point) => sum + point.lat, 0);
      const lngSum = flattenedPolygon.reduce((sum, point) => sum + point.lng, 0);
      const manualCenter = {
        lat: latSum / totalPoints,
        lng: lngSum / totalPoints,
      };
      return manualCenter;
    }
    return { lat: centerLat, lng: centerLng };
  }

  return { lat: 25.21, lng: 79.32 }; 
};

export const STATE_CODES = {
  "Andaman and Nicobar Islands": "AN",
  "Andhra Pradesh": "AP",
  "Arunachal Pradesh": "AR",
  "Assam": "AS",
  "Bihar": "BR",
  "Chandigarh": "CH",
  "Chhattisgarh": "CG",
  "Dadra and Nagar Haveli and Daman and Diu": "DN",
  "Delhi": "DL",
  "Goa": "GA",
  "Gujarat": "GJ",
  "Haryana": "HR",
  "Himachal Pradesh": "HP",
  "Jammu and Kashmir": "JK",
  "Jharkhand": "JH",
  "Karnataka": "KA",
  "Kerala": "KL",
  "Ladakh": "LA",
  "Lakshadweep": "LD",
  "Madhya Pradesh": "MP",
  "Maharashtra": "MH",
  "Manipur": "MN",
  "Meghalaya": "ML",
  "Mizoram": "MZ",
  "Nagaland": "NL",
  "Odisha": "OD",
  "Puducherry": "PY",
  "Punjab": "PB",
  "Rajasthan": "RJ",
  "Sikkim": "SK",
  "Tamil Nadu": "TN",
  "Telangana": "TS",
  "Tripura": "TR",
  "Uttar Pradesh": "UP",
  "Uttarakhand": "UK",
  "West Bengal": "WB"
};

export const cleanName = (str) => {

  return str
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map(word =>
      word.charAt(0).toUpperCase() +
      word.slice(1)
    )
    .join("");
};

export const generateDefaultReportName = ({
  uploadedFileName,
  selectedState,
  selectedCounty,
  selectedLocality,
  newPolygon,
  dateSuffix
}) => {

  /* uploaded file */

  if (uploadedFileName) {

    const baseName = uploadedFileName
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9]/g, "_");

    return `${baseName}_${dateSuffix}`
      .slice(0, 35);
  }

  /* polygon */

  if (newPolygon) {

    return `CustomPolygon_${dateSuffix}`;
  }

  /* geography */

  const stateCode =
    STATE_CODES[selectedState] ||
    cleanName(selectedState || "")
      .slice(0, 2)
      .toUpperCase();

  const districtPart =
    cleanName(selectedCounty || "")
      .slice(0, 12);

  const localityPart =
    cleanName(selectedLocality || "");

  /* state only */

  if (selectedState && !selectedCounty) {

    return `${stateCode}_${dateSuffix}`;
  }

  /* state + district */

  if (
    selectedState &&
    selectedCounty &&
    !selectedLocality
  ) {

    return `${stateCode}_${districtPart}_${dateSuffix}`
      .slice(0, 35);
  }

  /* state + district + locality */

  if (
    selectedState &&
    selectedCounty &&
    selectedLocality
  ) {

    const prefix =
      `${stateCode}_${districtPart}_`;

    const suffix =
      `_${dateSuffix}`;

    const maxLocalityLength =
      35 - prefix.length - suffix.length;

    const trimmedLocality =
      localityPart.slice(
        0,
        Math.max(maxLocalityLength, 0)
      );

    return `${prefix}${trimmedLocality}${suffix}`;
  }

  /* fallback */

  return `MYNA_Report_${dateSuffix}`;
};