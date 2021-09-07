import { initCircle } from "./circle/program.js";
import { initLine } from "./line/program.js";
import { initFill } from "./fill/program.js";
import { initText } from "./text/program.js";
import { initLoader } from "./loader.js";
import { initGrid } from "./grid.js";
import { initStyleProg } from "./style-prog.js";
import { initTilePainter } from "./painters.js";

export function initPrograms(context, framebuffer, preamble, multiTile) {
  return {
    "circle": setupProgram(initCircle(context)),
    "line": setupProgram(initLine(context)),
    "fill": setupProgram(initFill(context)),
    "symbol": setupProgram(initText(context)),
  };

  function setupProgram(progInfo) {
    const { vert, frag, styleKeys } = progInfo;

    const program = context.initProgram(preamble + vert, frag);
    const { use, uniformSetters, constructVao } = program;

    const load = initLoader(context, progInfo, constructVao);
    const grid = initGrid(use, uniformSetters, framebuffer);

    function initPainter(style) {
      const styleProg = initStyleProg(style, styleKeys, uniformSetters);
      return initTilePainter(context, grid, styleProg, multiTile);
    }

    return { load, initPainter };
  }
}
