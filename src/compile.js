import { initCircle } from "./circle/program.js";
import { initLine } from "./line/program.js";
import { initFill } from "./fill/program.js";
import { initSprite } from "./sprite/program.js";
import { initText } from "./text/program.js";

export function compilePrograms(context, preamble) {
  const progInfo = {
    circle: initCircle(context),
    line: initLine(context),
    fill: initFill(context),
    sprite: initSprite(context),
    text: initText(context),
  };

  function compile(info) {
    info.program = context.initProgram(preamble + info.vert, info.frag);
    delete info.vert;
    delete info.frag;
  }

  Object.values(progInfo).forEach(compile);
  return progInfo;
}
