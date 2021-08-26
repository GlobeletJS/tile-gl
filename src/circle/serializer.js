import { camelCase } from "../camelCase.js";

export function initCircleParsing(style) {
  const { paint } = style;

  const styleKeys = ["circle-radius", "circle-color", "circle-opacity"];
  const dataFuncs = styleKeys.filter(k => paint[k].type === "property")
    .map(k => ([paint[k], camelCase(k)]));

  return function(feature, { z, x, y }) {
    const circlePos = flattenPoints(feature.geometry);
    if (!circlePos) return;

    const length = circlePos.length / 2;

    const buffers = {
      circlePos,
      tileCoords: Array.from({ length }).flatMap(() => [x, y, z]),
    };

    dataFuncs.forEach(([get, key]) => {
      const val = get(null, feature);
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
