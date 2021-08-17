import preamble from "./preamble.glsl";
import simpleScale from "./scale.glsl";
import mercatorScale from "./merc-scale.glsl";
import { initGrid } from "./grid.js";
import { initBackground } from "./background/program.js";
import { initCircle } from "./circle/program.js";
import { initLine } from "./line/program.js";
import { initFill } from "./fill/program.js";
import { initText } from "./text/program.js";

export function initPrograms(context, framebuffer, projScale) {
  const { initAttribute, initProgram } = context;

  const scaleCode = (projScale) ? mercatorScale : simpleScale;

  context.initAttributes = function(attrInfo, buffers, preInitialized = {}) {
    return Object.entries(attrInfo).reduce((d, [key, info]) => {
      const data = buffers[key];
      if (data) d[key] = initAttribute(Object.assign({ data }, info));
      return d;
    }, preInitialized);
  };

  context.initPaintProgram = function(vert, frag) {
    const program = initProgram(preamble + scaleCode + vert, frag);
    const initTilesetPainter = initGrid(context, framebuffer.size, program);
    const { constructVao, uniformSetters } = program;
    return { constructVao, uniformSetters, initTilesetPainter };
  };

  return {
    "background": initBackground(context),
    "circle": initCircle(context),
    "line": initLine(context),
    "fill": initFill(context),
    "symbol": initText(context),
  };
}
