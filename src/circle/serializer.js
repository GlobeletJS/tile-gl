export function initCircleParsing(style) {
  // TODO: check for property-dependence of 
  //   circleRadius, globalAlpha, strokeStyle

  return function(feature) {
    const points = flattenPoints(feature.geometry);
    if (!points) return;
    
    return { 
      points 
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
