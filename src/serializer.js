import { parseCircle } from "./serializers/circle.js";
import { parseLine } from "./serializers/line.js";
import { parseFill } from "./serializers/fill.js";
import { initShaping } from 'tile-labeler';

export function initSerializer(style) {
  switch (style.type) {
    case "circle":
      return parseCircle;
    case "line":
      return parseLine;
    case "fill":
      return parseFill;
    case "symbol":
      return initShaping(style);
    default:
      throw Error("tile-gl: unknown serializer type!");
  }
}
