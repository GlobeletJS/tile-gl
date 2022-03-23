import { getProgInfo } from "./prog-info.js";
import { initLoader } from "./loader.js";
import { initStyleProg } from "./style-prog.js";
import { initTilePainter } from "./paint-tile.js";

export function initPrograms(params) {
  const { context, framebuffer, preamble } = params;
  const info = getProgInfo(context);

  return {
    "circle": setupProgram(info.circle),
    "line": setupProgram(info.line),
    "fill": setupProgram(info.fill),
    "symbol": setupSymbol(),
  };

  function setupProgram(progInfo) {
    const { vert, frag, styleKeys } = progInfo;

    const program = context.initProgram(preamble + vert, frag);
    const load = initLoader(context, progInfo, program.constructVao);

    function initPainter(style, sprite) {
      const styleProg = initStyleProg(style, sprite, styleKeys, program);
      return initTilePainter(context, framebuffer, program, styleProg);
    }

    return { load, initPainter };
  }

  function setupSymbol() {
    const spriteProg = setupProgram(info.sprite);
    const textProg = setupProgram(info.text);

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
}
