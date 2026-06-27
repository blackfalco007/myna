export const HEATMAP_GRID_SIZE = 0.045;

export const calculateRoundedValue = (value) => {
  const result =
    Math.round(value / HEATMAP_GRID_SIZE) *
    HEATMAP_GRID_SIZE;

  return parseFloat(
    result.toFixed(3)
  );
};

// Heatmap classes used by the UI, GeoJSON export and legend.

export const HEATMAP_CLASSES = [
  {
    min: 70,
    label: ">= 70",
    color: "#562377",
    fillOpacity: 0.7
  },
  {
    min: 30,
    label: "30 - 69",
    color: "#3949ab",
    fillOpacity: 0.7
  },
  {
    min: 10,
    label: "10 - 29",
    color: "#5c6bc0",
    fillOpacity: 0.7
  },
  {
    min: 3,
    label: "3 - 9",
    color: "#7986cb",
    fillOpacity: 0.7
  },
  {
    min: 1,
    label: "1 - 2",
    color: "#c5cae9",
    fillOpacity: 0.7
  }
];

export const getHeatmapStyle = (percentage) => {
  const match = HEATMAP_CLASSES.find(c => percentage >= c.min);

  return (
    match || {
      label: "0",
      color: "#ffffff",
      fillOpacity: 0
    }
  );
};