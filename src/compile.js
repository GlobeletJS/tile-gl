import { initCircle } from "./circle/program.js";
import { initLine } from "./line/program.js";
import { initFill } from "./fill/program.js";
import { initSymbol } from "./symbol/program.js";
import { initLoader } from "./loader.js";

export function compilePrograms(context, preamble) {
  const progInfo = {
    circle: initCircle(context),
    line: initLine(context),
    fill: initFill(context),
    symbol: initSymbol(context),
  };

  function compile(info) {
    const { vert, frag, styleKeys } = info;
    const program = context.initProgram(preamble + vert, frag);
    const load = initLoader(context, info, program);
    return { program, load, styleKeys };
  }

  return Object.entries(progInfo)
    .reduce((d, [k, info]) => (d[k] = compile(info), d), {});
}
