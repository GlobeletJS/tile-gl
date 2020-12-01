import vert from "./vert.glsl";
import frag from "./frag.glsl";
import { initLineLoader } from "./loader.js";
import { initGrid, initTilesetPainter } from "../grid.js";
import { initSetters, initVectorTilePainter } from "../util.js";

export function initLine(context) {
  const program = context.initProgram(vert, frag);
  const { use, uniformSetters, constructVao } = program;

  const grid = initGrid(context, use, uniformSetters);

  const load = initLineLoader(context, constructVao);

  function draw(buffers) {
    const { vao, numInstances } = buffers;
    context.drawInstancedQuads(vao, numInstances);
  }

  function initPainter(style) {
    const { id, layout, paint } = style;

    const { zoomFuncs, dataFuncs } = initSetters([
      // TODO: move these to serialization step??
      //[layout["line-cap"],      "lineCap"],
      //[layout["line-join"],     "lineJoin"],
      [layout["line-miter-limit"], "miterLimit"],

      [paint["line-width"],     "lineWidth"],
      [paint["line-color"],     "strokeStyle"],
      [paint["line-opacity"],   "globalAlpha"],
      // line-gap-width,
      // line-translate, line-translate-anchor,
      // line-offset, line-blur, line-gradient, line-pattern
    ], uniformSetters);

    const paintTile = initVectorTilePainter(context, { id, dataFuncs, draw });
    return initTilesetPainter(grid, zoomFuncs, paintTile);
  };

  return { load, initPainter };
}
