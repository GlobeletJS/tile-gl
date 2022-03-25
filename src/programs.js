import { compilePrograms } from "./compile.js";
import { initBackground } from "./background/program.js";
import { initStyleProg } from "./style-prog.js";
import { initTilePainter } from "./paint-tile.js";

export function initPrograms(params) {
  const { context, preamble, framebuffer } = params;
  const programs = compilePrograms(context, preamble);

  return { loadBuffers, loadSprite, initPainter };

  function loadBuffers(layer) {
    const { type, buffers } = layer;

    const program = programs[type];
    if (!program) throw Error("tile-gl loadBuffers: unknown layer type");

    layer.buffers = program.load(buffers);
  }

  function loadSprite(image) {
    if (!image) return false;
    const spriteTex = context.initTexture({ image, mips: false });
    programs.symbol.use();
    programs.symbol.uniformSetters.sprite(spriteTex);
    return true;
  }

  function initPainter(style) {
    const { id, type, source, minzoom = 0, maxzoom = 24 } = style;
    const painter = getPainter(style);
    return Object.assign(painter, { id, type, source, minzoom, maxzoom });
  }

  function getPainter(style) {
    const { type, layout, paint } = style;

    if (type === "background") return initBackground(context, style);

    const program = programs[type];
    if (!program) return () => null;

    if (type === "line") {
      // We handle line-miter-limit in the paint phase, not layout phase
      paint["line-miter-limit"] = layout["line-miter-limit"];
    }
    const styleProg = initStyleProg(style, program, framebuffer);

    return initTilePainter(context, styleProg);
  }
}
