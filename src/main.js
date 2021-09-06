import { setParams } from "./params.js";
import { initPrograms } from "./programs.js";
import { initBackground } from "./background/program.js";

export function initGLpaint(userParams) {
  const { context, framebuffer, preamble } = setParams(userParams);

  const programs = initPrograms(context, framebuffer, preamble);
  programs["background"] = initBackground(context);

  function prep() {
    context.bindFramebufferAndSetViewport(framebuffer);
    return context.clear();
  }

  function loadBuffers(layer) {
    const { type, buffers } = layer;

    const program = programs[type];
    if (!program) throw "loadBuffers: unknown layer type";

    layer.buffers = program.load(buffers);
  }

  function loadAtlas(atlas) {
    const format = context.gl.ALPHA;
    const { width, height, data } = atlas;
    return context.initTexture({ format, width, height, data, mips: false });
  }

  function initPainter(style) {
    const { id, type, source, minzoom = 0, maxzoom = 24 } = style;

    const program = programs[type];
    if (!program) return () => null;

    const { layout, paint } = style;
    if (type === "line") {
      // We handle line-miter-limit in the paint phase, not layout phase
      paint["line-miter-limit"] = layout["line-miter-limit"];
    }
    const painter = program.initPainter(style);
    return Object.assign(painter, { id, type, source, minzoom, maxzoom });
  }

  return { prep, loadBuffers, loadAtlas, initPainter };
}
