import vert from "./vert.glsl";
import frag from "./frag.glsl";
import { initLineLoader } from "./loader.js";

export function initLine(context) {
  const program = context.initPaintProgram(vert, frag);
  const { constructVao, initTilesetPainter } = program;

  const load = initLineLoader(context, constructVao);

  function initPainter(id, paint) {
    const zoomFuncs = [
      // [layout["line-cap"],      "lineCap"],
      // [layout["line-join"],     "lineJoin"],
      // NOTE: line-miter-limit is a layout property in the style spec
      // We copied the function to a paint property in ../main.js
      [paint["line-miter-limit"], "miterLimit"],

      [paint["line-width"],     "lineWidth"],
      [paint["line-color"],     "color"],
      [paint["line-opacity"],   "opacity"],
      // line-gap-width,
      // line-translate, line-translate-anchor,
      // line-offset, line-blur, line-gradient, line-pattern
    ];

    return initTilesetPainter(id, zoomFuncs);
  }

  return { load, initPainter };
}
