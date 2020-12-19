import vert from "./vert.glsl";
import frag from "./frag.glsl";
import { initFillLoader } from "./loader.js";
import { initGrid, initTilesetPainter } from "../grid.js";
import { initSetters, initVectorTilePainter } from "../util.js";

export function initFill(context) {
  const program = context.initProgram(vert, frag);
  const { use, uniformSetters, constructVao } = program;
  const grid = initGrid(context, use, uniformSetters);

  const load = initFillLoader(context, constructVao);

  function draw(buffers) {
    const { vao, indices } = buffers;
    context.drawElements(vao, indices);
  }

  function initPainter(style) {
    const { id, paint } = style;

    const { zoomFuncs, dataFuncs } = initSetters([
      //[paint["fill-color"],     "fillStyle"],
      [paint["fill-color"],     "color"],
      [paint["fill-opacity"],   "globalAlpha"],
      [paint["fill-translate"], "translation"],
    ], uniformSetters);

    //const paintTile = initVectorTilePainter(context, { id, dataFuncs, draw });
    const paintTile = initVectorTilePainter(context, { id, dataFuncs: [], draw });
    return initTilesetPainter(grid, zoomFuncs, paintTile);
  };

  return { load, initPainter };
}
