import { initBackground } from "./background/program.js";
import { initCircle } from "./circle/program.js";
import { initLine } from "./line/program.js";
import { initFill } from "./fill/program.js";
import { initSymbol } from "./symbol/program.js";
import { initLoader } from "./loader.js";

export function compilePrograms(params) {
  const { context, preamble, extraAttributes } = params;

  const progInfo = {
    background: initBackground(context),
    circle: initCircle(context),
    line: initLine(context),
    fill: initFill(context),
    symbol: initSymbol(context),
  };

  function compile(info) {
    const { vert, frag, styleKeys } = info;
    const program = context.initProgram(preamble + vert, frag);
    const { use, constructVao, uniformSetters } = program;
    const load = initLoader(context, info, constructVao, extraAttributes);
    return { load, use, uniformSetters, styleKeys };
  }

  return Object.entries(progInfo)
    .reduce((d, [k, info]) => (d[k] = compile(info), d), {});
}
