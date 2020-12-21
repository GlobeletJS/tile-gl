import { initContext } from "./context.js";
import { initBackground } from "./background/program.js";
import { initCircle } from "./circle/program.js";
import { initLine } from "./line/program.js";
import { initFill } from "./fill/program.js";
import { initText } from "./text/program.js";
import { initAtlasLoader } from "./atlas.js";

export function initGLpaint(gl, framebuffer, framebufferSize) {
  const context = initContext(gl, framebuffer, framebufferSize);

  const programs = {
    "background": initBackground(context),
    "circle": initCircle(context),
    "line":   initLine(context),
    "fill":   initFill(context),
    "symbol": initText(context),
  };

  function loadBuffers(buffers) {
    if (buffers.indices) {
      return programs.fill.load(buffers);
    } else if (buffers.lines) {
      return programs.line.load(buffers);
    } else if (buffers.circlePos) {
      return programs.circle.load(buffers);
    } else if (buffers.origins) {
      return programs.symbol.load(buffers);
    } else {
      throw("loadBuffers: unknown buffers structure!");
    }
  }

  function initPainter(style) {
    const { id, type, source, minzoom = 0, maxzoom = 24 } = style;

    const program = programs[type];
    if (!program) return () => null;

    const painter = program.initPainter(style);
    return Object.assign(painter, { id, type, source, minzoom, maxzoom });
  }

  return {
    bindFramebufferAndSetViewport: context.bindFramebufferAndSetViewport,
    clear: context.clear,
    loadBuffers,
    loadAtlas: initAtlasLoader(gl),
    initPainter,
  };
}
