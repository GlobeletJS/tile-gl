import { initBackground } from "./background/program.js";
import preamble from "./preamble.glsl";
import { initCircle } from "./circle/program.js";
import { initLine } from "./line/program.js";
import { initFill } from "./fill/program.js";
import { initText } from "./text/program.js";

export function initGLpaint(context, framebuffer) {
  const programs = {
    "background": initBackground(context),
    "circle": initCircle(context, framebuffer.size, preamble),
    "line": initLine(context, framebuffer.size, preamble),
    "fill": initFill(context, framebuffer.size, preamble),
    "symbol": initText(context, framebuffer.size, preamble),
  };

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
    const mips = false;

    const { width, height, data } = atlas;
    const sampler = context.initTexture({ format, width, height, data, mips });

    return { width, height, sampler };
  }

  function initPainter(style) {
    const { id, type, source, minzoom = 0, maxzoom = 24 } = style;

    const program = programs[type];
    if (!program) return () => null;

    const painter = program.initPainter(style);
    return Object.assign(painter, { id, type, source, minzoom, maxzoom });
  }

  return { prep, loadBuffers, loadAtlas, initPainter };
}
