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
    "symbol": setupSymbol(),
  };

  function setup(info) {
    function initPainter(style, sprite) {
      const styleProg = initStyleProg(style, sprite, info, framebuffer);
      return initTilePainter(context, styleProg);
    }

    return { load: info.load, initPainter };
  }

  function setupSymbol() {
    const spriteProg = setup(programs.sprite);
    const textProg = setup(programs.text);

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
