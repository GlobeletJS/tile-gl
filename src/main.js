import { setParams } from "./params.js";
import { initPrograms } from "./programs.js";

export function initGLpaint(userParams) {
  const { context, framebuffer, preamble } = setParams(userParams);

  const programs = initPrograms(context, framebuffer, preamble);

  function prep() {
    context.bindFramebufferAndSetViewport(framebuffer);
    return context.clear();
  }

  function loadBuffers(buffers) {
    if (buffers.indices) {
      return programs.fill.load(buffers);
    } else if (buffers.lines) {
      return programs.line.load(buffers);
    } else if (buffers.circlePos) {
      return programs.circle.load(buffers);
    } else if (buffers.labelPos) {
      return programs.symbol.load(buffers);
    } else {
      throw "loadBuffers: unknown buffers structure!";
    }
  }

  function loadAtlas(atlas) {
    const format = context.gl.ALPHA;
    const { width, height, data } = atlas;
    const mips = false;
    return context.initTexture({ format, width, height, data, mips });
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
    const painter = program.initPainter(id, paint);
    return Object.assign(painter, { id, type, source, minzoom, maxzoom });
  }

  return { prep, loadBuffers, loadAtlas, initPainter };
}
