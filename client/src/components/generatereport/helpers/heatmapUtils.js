export const HEATMAP_GRID_SIZE = 0.045;

export const calculateRoundedValue = (value) => {
  const result =
    Math.round(value / HEATMAP_GRID_SIZE) *
    HEATMAP_GRID_SIZE;

  return parseFloat(
    result.toFixed(3)
  );
};