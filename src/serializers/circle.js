export function parseCircle(feature) {
  const { geometry, properties } = feature;
  const buffers = { points: flattenPoints(geometry) };

  return { properties, buffers };
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
