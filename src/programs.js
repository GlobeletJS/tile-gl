import { initCircle } from "./circle/program.js";
import { initLine } from "./line/program.js";
import { initFill } from "./fill/program.js";
import { initSprite } from "./sprite/program.js";
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
    "symbol": setupSymbol(),
  };

  function setupSymbol() {
    const spriteProg = setupProgram(initSprite(context));
    const textProg = setupProgram(initText(context));

    function load(buffers) {
      const loaded = {};
      if (buffers.spritePos) loaded.sprite = spriteProg.load(buffers);
      if (buffers.charPos) loaded.text = textProg.load(buffers);
      return loaded;
    }

    function initPainter(style, sprite) {
      const iconPaint = spriteProg.initPainter(style, sprite);
      const textPaint = textProg.initPainter(style);

      return function(params) {
        iconPaint(params);
        textPaint(params);
      };
    }

    return { load, initPainter };
  }

  function setupProgram(progInfo) {
    const { vert, frag, styleKeys } = progInfo;

    const program = context.initProgram(preamble + vert, frag);
    const { use, uniformSetters, constructVao } = program;

    const load = initLoader(context, progInfo, constructVao);
    const grid = initGrid(use, uniformSetters, framebuffer);

    function initPainter(style, sprite) {
      const styleProg = initStyleProg(style, styleKeys, uniformSetters, sprite);
      return initTilePainter(context, grid, styleProg, multiTile);
    }

    return { load, initPainter };
  }
}
