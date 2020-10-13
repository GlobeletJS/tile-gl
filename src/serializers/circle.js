export function parseCircle(feature) {
  const { geometry, properties } = feature;
  const buffers = { origins: flattenCircles(geometry) };

  return { properties, buffers };
}

function flattenCircles(geometry) {
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
