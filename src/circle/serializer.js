export function initCircleParsing(style) {
  // TODO: check for property-dependence of 
  //   circleRadius, globalAlpha, strokeStyle

  return function(feature, { z, x, y }) {
    const points = flattenPoints(feature.geometry);
    if (!points) return;

    const length = points.length / 2;
    
    return { 
      points,
      tileCoords: Array.from({ length }).flatMap(v => [x, y, z]),
    };
  };
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
