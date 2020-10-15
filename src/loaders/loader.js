import { initTextBufferLoader } from "./text.js";
import { initFillBufferLoader } from "./fill.js";
import { initLineBufferLoader } from "./line.js";
import { initCircleBufferLoader } from "./circle.js";

export function initBufferLoader(gl, programs) {
  // TODO: clean this up. Can we import differently?
  const lineLoader = initLineBufferLoader(gl, programs.line.constructVao);
  const loaders = {
    line: lineLoader,
    fill: initFillBufferLoader(gl, programs.fill.constructVao, lineLoader),
    circle: initCircleBufferLoader(gl, programs.circle.constructVao),
    text: initTextBufferLoader(gl, programs.text.constructVao),
  };

  return function(buffers) {
    if (buffers.vertices) {
      return loaders.fill(buffers);
    } else if (buffers.lines) {
      return loaders.line(buffers);
    } else if (buffers.points) {
      return loaders.circle(buffers);
    } else if (buffers.origins) {
      return loaders.text(buffers);
    } else {
      throw("loadBuffers: unknown buffers structure!");
    }
  };
}
