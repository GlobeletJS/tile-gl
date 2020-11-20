import { initCircleLoader } from "./circle.js";
import { initLineLoader } from "./line.js";
import { initFillLoader } from "./fill.js";
import { initTextLoader } from "./text.js";

export function initBufferLoader(gl, programs) {
  const { circle, line, fill, text } = programs;

  const loadCircle = initCircleLoader(gl, circle.constructVao);
  const loadLine = initLineLoader(gl, line.constructVao);
  const loadFill = initFillLoader(gl, fill.constructVao);
  const loadText = initTextLoader(gl, text.constructVao);

  return function(buffers) {
    if (buffers.vertices) {
      return loadFill(buffers);
    } else if (buffers.lines) {
      return loadLine(buffers);
    } else if (buffers.points) {
      return loadCircle(buffers);
    } else if (buffers.origins) {
      return loadText(buffers);
    } else {
      throw("loadBuffers: unknown buffers structure!");
    }
  };
}
