import { compilePrograms } from "./compile.js";
import { initStyleProg } from "./style-prog.js";
import { initTilePainter } from "./paint-tile.js";

export function initPrograms(params) {
  const { context, preamble, framebuffer } = params;
  const programs = compilePrograms(context, preamble);

  return {
    "circle": setup(programs.circle),
    "line": setup(programs.line),
    "fill": setup(programs.fill),
    "symbol": setup(programs.symbol),
  };

  function setup(info) {
    function initPainter(style, sprite) {
      const styleProg = initStyleProg(style, sprite, info, framebuffer);
      return initTilePainter(context, styleProg);
    }

    return { load: info.load, initPainter };
  }
}
