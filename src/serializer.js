import { initCircleParsing } from "./circle/serializer.js";
import { initLineParsing } from "./line/serializer.js";
import { initFillParsing } from "./fill/serializer.js";
import { initShaping } from 'tile-labeler';

export function initSerializer(style) {
  switch (style.type) {
    case "circle":
      return initCircleParsing(style);
    case "line":
      return initLineParsing(style);
    case "fill":
      return initFillParsing(style);
    case "symbol":
      return initShaping(style);
    default:
      throw Error("tile-gl: unknown serializer type!");
  }
}
