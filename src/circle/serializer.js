export function parseCircle(feature) {
  const points = flattenPoints(feature.geometry);
  if (points) return { points };
}

function flattenPoints(geometry) {
  const { type, coordinates } = geometry;

  switch (type) {
    case "Point":
      return coordinates;
    case "MultiPoint":
      return coordinates.flat();
    default:
      return;
  }
}
