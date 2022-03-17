import { initCircle } from "./circle/program.js";
import { initLine } from "./line/program.js";
import { initFill } from "./fill/program.js";
import { initSprite } from "./sprite/program.js";
import { initText } from "./text/program.js";

export function getProgInfo(context) {
  return {
    "circle": initCircle(context),
    "line": initLine(context),
    "fill": initFill(context),
    "sprite": initSprite(context),
    "text": initText(context),
  };
}
