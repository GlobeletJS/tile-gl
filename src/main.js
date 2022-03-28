import { setParams } from "./params.js";
import { compilePrograms } from "./compile.js";
import { initStyleProg } from "./style-prog.js";
import { initTilePainter } from "./paint-tile.js";

export function initGLpaint(userParams) {
  const { context, preamble, framebuffer } = setParams(userParams);
  const programs = compilePrograms(context, preamble);

  return { prep, loadAtlas, loadBuffers, loadSprite, initPainter };

  function prep() {
    context.bindFramebufferAndSetViewport(framebuffer);
    return context.clear();
  }

  function loadAtlas(atlas) {
    const format = context.gl.ALPHA;
    const { width, height, data } = atlas;
    return context.initTexture({ format, width, height, data, mips: false });
  }

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

    const program = programs[type];
    if (!program) return () => null;

    const styleProg = initStyleProg(style, program, framebuffer);

    const painter = initTilePainter(context, styleProg);
    return Object.assign(painter, { id, type, source, minzoom, maxzoom });
  }
}
