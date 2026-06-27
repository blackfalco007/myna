const { Sequelize } = require("sequelize");

const buildSpatialFilter = (
  geojson
) => {

  if (
    !geojson ||
    !geojson.features ||
    geojson.features.length === 0
  ) {
    throw new Error(
      "Invalid GeoJSON"
    );
  }

  const geometries =
    geojson.features.map(
      feature => feature.geometry
    );

  let geometry;

  if (geometries.length === 1) {

    geometry =
      geometries[0];

  } else {

    geometry = {
      type:
        "GeometryCollection",
      geometries
    };

  }

  
  return Sequelize.where(
    Sequelize.fn(
      "ST_Within",

      Sequelize.fn(
        "ST_SetSRID",

        Sequelize.fn(
          "ST_MakePoint",

          Sequelize.col(
            "longitude"
          ),

          Sequelize.col(
            "latitude"
          )
        ),

        4326
      ),

      Sequelize.fn(
        "ST_SetSRID",

        Sequelize.fn(
          "ST_GeomFromGeoJSON",

          JSON.stringify(
            geometry
          )
        ),

        4326
      )
    ),

    true
  );
};

module.exports =
  buildSpatialFilter;