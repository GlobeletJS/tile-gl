export function initCircleParsing(style) {
  const { paint } = style;

  const dataFuncs = [
    [paint["circle-radius"],  "radius"],
    [paint["circle-color"],   "color"],
    [paint["circle-opacity"], "opacity"],
  ].filter(([get]) => get.type === "property");

  return function(feature, { z, x, y }) {
    const circlePos = flattenPoints(feature.geometry);
    if (!circlePos) return;

    const length = circlePos.length / 2;

    const buffers = {
      circlePos,
      tileCoords: Array.from({ length }).flatMap(() => [x, y, z]),
    };

    dataFuncs.forEach(([get, key]) => {
      let val = get(null, feature);
      buffers[key] = Array.from({ length }).flatMap(() => val);
    });

    return buffers;
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
