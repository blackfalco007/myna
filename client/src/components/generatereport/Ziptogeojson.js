import React from "react";
import { GeoJSON, useMap } from "react-leaflet";
import { toast } from "react-toastify";
import {
  calculateCentroid,
  calculateZoom,
} from "./helpers/helperFunctions";
import {  getAreaOfPolygon } from "geolib";

function  Ziptogeojson(props) {
  let featureCollection=null
  try {
    const map = useMap();
    if (props.isZoomRequired) {
      map.invalidateSize();
      const bounds = [];

props.data?.features?.forEach(feature => {

  const geometry = feature.geometry;

  if (geometry?.type === "Polygon") {

    geometry.coordinates.forEach(ring => {
      ring.forEach(coord => {
        bounds.push([coord[1], coord[0]]);
      });
    });

  } else if (geometry?.type === "MultiPolygon") {

    geometry.coordinates.forEach(poly => {
      poly.forEach(ring => {
        ring.forEach(coord => {
          bounds.push([coord[1], coord[0]]);
        });
      });
    });

  }

});

if (bounds.length > 0) {

  const area =
    getAreaOfPolygon(bounds.map(([lat, lng]) => ({
      latitude: lat,
      longitude: lng
    }))) / 1000000;

  props.setArea(area);

  
  if (area > 50000) {
    return toast.error(
      "Selected Area should be less than 50,000 Square Kilometers"
    );
  }

  if (bounds.length > 0) {
  map.flyToBounds(bounds);
  }
}
      props.setIsZoomRequired(false);
    }

    // if (props.editedData) {
    //   const coordinates = [props.editedData.map((point) => [point.lng, point.lat])];

    //   const feature = {
    //     type: "Feature",
    //     properties: {},
    //     geometry: {
    //       type: "Polygon",
    //       coordinates: coordinates,
    //     },
    //   };

    //    featureCollection = {
    //     type: "FeatureCollection",
    //     features: [feature],
    //   }
    // } 
    if (props.editedData) {
      // Handle edited data coordinates
      let editedCoordinates;

      if (props.editedData[0].type === 'Polygon') {
        editedCoordinates = [props.editedData.map((point) => [point.lng, point.lat])];
      } else if (props.editedData[0].type === 'MultiPolygon') {
        editedCoordinates = [props.editedData[0][0].map((point) => [point.lng, point.lat])];
      }

      const feature = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Polygon", // Assuming it's a Polygon type after edit
          coordinates: editedCoordinates,
        },
      };

      featureCollection = {
        type: "FeatureCollection",
        features: [feature],
      };
    }


    return (
      <GeoJSON
        data={featureCollection || props.data}
        editable={!props.onReport}
        onEachFeature={(feature, layer) => {
          layer.pm.enable({
            allowSelfIntersection: false,
          });
          layer.on("pm:remove", props.onDelete);
          layer.on("pm:edit", (e) => {
            props.handleEdit(e);
          });
        }}
      />
    );
  } catch (error) {
    props.toast.error("format Not Supported ??????????????/");
    return props.setData(null);
  }
}

export default Ziptogeojson;
