import preamble from "./preamble.glsl";
import { initBackground } from "./background/program.js";
import { initCircle } from "./circle/program.js";
import { initLine } from "./line/program.js";
import { initFill } from "./fill/program.js";
import { initText } from "./text/program.js";

export function initPrograms(context, framebuffer) {
  const { initAttribute } = context;

  context.initAttributes = function(attrInfo, buffers, preInitialized = {}) {
    return Object.entries(attrInfo).reduce((d, [key, info]) => {
      const data = buffers[key];
      if (data) d[key] = initAttribute(Object.assign({ data }, info));
      return d;
    }, preInitialized);
  };

  return {
    "background": initBackground(context),
    "circle": initCircle(context, framebuffer.size, preamble),
    "line": initLine(context, framebuffer.size, preamble),
    "fill": initFill(context, framebuffer.size, preamble),
    "symbol": initText(context, framebuffer.size, preamble),
  };
}
