const fs = require("fs");
const path = require("path");

const processLayer = (
  sourceFile,
  outputFolder,
  idField,
  nameField,
  areaField
) => {

  const data = JSON.parse(
    fs.readFileSync(sourceFile, "utf8")
  );

  const metadata = [];

  const geojsonDir = path.join(
    outputFolder,
    "geojson"
  );

  fs.mkdirSync(
    geojsonDir,
    { recursive: true }
  );

  const grouped = {};

  for (const feature of data.features) {

    const props = feature.properties;

    const id = props[idField];

    if (!grouped[id]) {
      grouped[id] = {
        properties: props,
        features: []
      };
    }

    grouped[id].features.push(feature);
  }

  for (const id of Object.keys(grouped)) {

    const group = grouped[id];

    const props = group.properties;

    metadata.push({
      id,
      name: props[nameField],
      areaKm2: props[areaField]
    });

    const featureCollection = {
      type: "FeatureCollection",
      features: group.features
    };

    fs.writeFileSync(
      path.join(
        geojsonDir,
        `${id}.geojson`
      ),
      JSON.stringify(
        featureCollection,
        null,
        2
      )
    );
  }

  fs.writeFileSync(
    path.join(
      outputFolder,
      "metadata.json"
    ),
    JSON.stringify(
      metadata,
      null,
      2
    )
  );

  console.log(
    `Generated ${metadata.length} items`
  );
};

processLayer(
  "./iba_india.geojson",
  "./output/iba",
  "SitRecID",
  "NatName",
  "SitAreaKm2"
);

processLayer(
  "./ramsar_india.geojson",
  "./output/ramsar",
  "ramsarid",
  "officialna",
  "area_off"
);