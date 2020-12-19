import { initCircleParsing } from "./circle/serializer.js";
import { initLineParsing } from "./line/serializer.js";
import { initFillParsing } from "./fill/serializer.js";
import { initShaping } from 'tile-labeler';

export function initSerializer(style) {
  const { getLen, parse } = initParser(style);

  return function(feature, tileCoords, atlas, tree) {
    const { z, x, y } = tileCoords;

    const buffers = parse(feature, z, atlas, tree);

    if (buffers) buffers.tileCoords = Array
      .from({ length: getLen(buffers) })
      .flatMap(v => [x, y, z]);

    return buffers;
  };
}

function initParser(style) {
  switch (style.type) {
    case "circle":
      return { 
        getLen: (b) => b.points.length / 2,
        parse: initCircleParsing(style),
      };
    case "line":
      return {
        getLen: (b) => b.lines.length / 3,
        parse: initLineParsing(style),
      };
    case "fill":
      return {
        getLen: (b) => b.position.length / 2,
        parse: initFillParsing(style),
      };
    case "symbol":
      return {
        getLen: (b) => b.origins.length / 2,
        parse: initShaping(style),
      };
    default:
      throw Error("tile-gl: unknown serializer type!");
  }
}
