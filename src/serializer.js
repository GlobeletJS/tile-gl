import { parseCircle } from "./serializers/circle.js";
import { parseLine } from "./serializers/line.js";
import { parseFill } from "./serializers/fill.js";
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
        parse: parseCircle,
      };
    case "line":
      return {
        getLen: (b) => b.lines.length / 3 - 3,
        parse: parseLine,
      };
    case "fill":
      return {
        getLen: (b) => b.vertices.length / 2,
        parse: parseFill,
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
