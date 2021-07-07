import vert from "./vert.glsl";
import frag from "./frag.glsl";
import { initFillLoader } from "./loader.js";
import { initGrid, initTilesetPainter } from "../grid.js";
import { initSetters, initVectorTilePainter } from "../util.js";

export function initFill(context, framebufferSize, preamble) {
  const program = context.initProgram(preamble + vert, frag);
  const { use, uniformSetters, constructVao } = program;
  const grid = initGrid(framebufferSize, use, uniformSetters);

  const load = initFillLoader(context, constructVao);

  function initPainter(style) {
    const { id, paint } = style;

    const zoomFuncs = initSetters([
      [paint["fill-color"],     "color"],
      [paint["fill-opacity"],   "opacity"],
      [paint["fill-translate"], "translation"],
    ], uniformSetters);

    const paintTile = initVectorTilePainter(context, framebufferSize, id);
    return initTilesetPainter(grid, zoomFuncs, paintTile);
  }

  return { load, initPainter };
}
