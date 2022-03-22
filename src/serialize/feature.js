import { circleInfo } from "../circle/serializer.js";
import { lineInfo } from "../line/serializer.js";
import { fillInfo } from "../fill/serializer.js";
import { initShaping } from "tile-labeler";
import { camelCase } from "../camelCase.js";

export function getSerializeInfo(style, spriteData) {
  switch (style.type) {
    case "circle":
      return circleInfo;
    case "line":
      return lineInfo;
    case "fill":
      return fillInfo;
    case "symbol":
      return initShaping(style, spriteData);
    default:
      throw Error("tile-gl: unknown serializer type!");
  }
}

export function initFeatureSerializer(paint, info) {
  const { styleKeys = [], serialize, getLength } = info;

  const dataFuncs = styleKeys
    .filter(k => paint[k].type === "property")
    .map(k => ([paint[k], camelCase(k)]));

  return function(feature, tileCoords, atlas, tree) {
    const buffers = serialize(feature, tileCoords, atlas, tree);
    if (!buffers) return;

    const dummy = Array.from({ length: getLength(buffers) });

    dataFuncs.forEach(([get, key]) => {
      const val = get(null, feature);
      buffers[key] = dummy.flatMap(() => val);
    });

    return buffers;
  };
}
