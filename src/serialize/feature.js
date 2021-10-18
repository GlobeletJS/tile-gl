import { circleInfo } from "../circle/serializer.js";
import { lineInfo } from "../line/serializer.js";
import { fillInfo } from "../fill/serializer.js";
import { initShaping } from "tile-labeler";
import { camelCase } from "../camelCase.js";

export function initSerializer(style) {
  const { type, paint } = style;

  switch (type) {
    case "circle":
      return initParsing(paint, circleInfo);
    case "line":
      return initParsing(paint, lineInfo);
    case "fill":
      return initParsing(paint, fillInfo);
    case "symbol":
      return initShaping(style);
    default:
      throw Error("tile-gl: unknown serializer type!");
  }
}

function initParsing(paint, info) {
  const { styleKeys, serialize, getLength } = info;
  const dataFuncs = styleKeys.filter(k => paint[k].type === "property")
    .map(k => ([paint[k], camelCase(k)]));

  return function(feature, { z, x, y }) {
    const buffers = serialize(feature.geometry);
    if (!buffers) return;

    const dummy = Array.from({ length: getLength(buffers) });

    buffers.tileCoords = dummy.flatMap(() => [x, y, z]);
    dataFuncs.forEach(([get, key]) => {
      const val = get(null, feature);
      buffers[key] = dummy.flatMap(() => val);
    });

    return buffers;
  };
}
