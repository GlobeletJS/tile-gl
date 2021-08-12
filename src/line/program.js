import vert from "./vert.glsl";
import frag from "./frag.glsl";
import { initLineLoader } from "./loader.js";
import { initGrid } from "../grid.js";
import { initVectorTilePainter } from "../util.js";

export function initLine(context, framebufferSize, preamble) {
  const program = context.initProgram(preamble + vert, frag);
  const { use, uniformSetters, constructVao } = program;

  const initTilesetPainter = initGrid(framebufferSize, use, uniformSetters);

  const load = initLineLoader(context, constructVao);

  function initPainter(style) {
    const { id, layout, paint } = style;

    const zoomFuncs = [
      // TODO: move these to serialization step??
      // [layout["line-cap"],      "lineCap"],
      // [layout["line-join"],     "lineJoin"],
      [layout["line-miter-limit"], "miterLimit"],

      [paint["line-width"],     "lineWidth"],
      [paint["line-color"],     "color"],
      [paint["line-opacity"],   "opacity"],
      // line-gap-width,
      // line-translate, line-translate-anchor,
      // line-offset, line-blur, line-gradient, line-pattern
    ];

    const paintTile = initVectorTilePainter(context, framebufferSize, id);
    return initTilesetPainter(zoomFuncs, paintTile);
  }

  return { load, initPainter };
}
