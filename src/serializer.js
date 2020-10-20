import { parseCircle } from "./serializers/circle.js";
import { parseLine } from "./serializers/line.js";
import { parseFill } from "./serializers/fill.js";

export const serializers = {
  circle: parseCircle,
  line: parseLine,
  fill: parseFill,
};
