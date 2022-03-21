import { circleInfo } from "../circle/serializer.js";
import { lineInfo } from "../line/serializer.js";
import { fillInfo } from "../fill/serializer.js";
import { initShaping } from "tile-labeler";
import { camelCase } from "../camelCase.js";

export function initFeatureSerializer(style, spriteData) {
  const { type, paint } = style;

  switch (type) {
    case "circle":
      return initParsing(paint, circleInfo);
    case "line":
      return initParsing(paint, lineInfo);
    case "fill":
      return initParsing(paint, fillInfo);
    case "symbol":
      return initParsing(paint, initShaping(style, spriteData));
    default:
      throw Error("tile-gl: unknown serializer type!");
  }
}

function initParsing(paint, info) {
  const { styleKeys = [], serialize, getLength } = info;
  const dataFuncs = styleKeys.filter(k => paint[k].type === "property")
    .map(k => ([paint[k], camelCase(k)]));

  return function(feature, tileCoords, atlas, tree) {
    const buffers = serialize(feature, tileCoords, atlas, tree);
    if (!buffers) return;

    const dummy = Array.from({ length: getLength(buffers) });

    const { z, x, y } = tileCoords;
    buffers.tileCoords = dummy.flatMap(() => [x, y, z]);

    dataFuncs.forEach(([get, key]) => {
      const val = get(null, feature);
      buffers[key] = dummy.flatMap(() => val);
    });

    return buffers;
  };
}
