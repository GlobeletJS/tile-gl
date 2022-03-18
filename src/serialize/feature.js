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
      return initSymbolParsing(style, spriteData);
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

function initSymbolParsing(style, spriteData) {
  const shaper = initShaping(style, spriteData);

  return function(feature, tileCoords, atlas, tree) {
    const buffers = shaper(feature, tileCoords, atlas, tree);
    if (!buffers) return;

    const { charPos, spritePos } = buffers;
    const length = charPos ? charPos.length / 4 : spritePos.length / 4;
    const dummy = Array.from({ length });

    const { z, x, y } = tileCoords;
    buffers.tileCoords = dummy.flatMap(() => [x, y, z]);

    return buffers;
  };
}
