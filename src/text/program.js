import vert from "./vert.glsl";
import frag from "./frag.glsl";
import { initTextLoader } from "./loader.js";
import { initGrid, initTilesetPainter } from "../grid.js";
import { initSetters, initVectorTilePainter } from "../util.js";

export function initText(context) {
  const program = context.initProgram(vert, frag);
  const { use, uniformSetters, constructVao } = program;
  const grid = initGrid(context, use, uniformSetters);

  const load = initTextLoader(context, constructVao);

  function draw(buffers) {
    const { vao, numInstances } = buffers;
    context.drawInstancedQuads(vao, numInstances);
  }

  function setAtlas(atlas) {
    uniformSetters.sdf(atlas.sampler);
    uniformSetters.sdfDim([atlas.width, atlas.height]);
  }

  function initPainter(style) {
    const { id, paint } = style;

    const { zoomFuncs, dataFuncs } = initSetters([
      [paint["text-color"],     "fillStyle"],
      [paint["text-opacity"],   "globalAlpha"],

      // text-halo-color
      // TODO: sprites
    ], uniformSetters);

    const progInfo = { id, dataFuncs, setAtlas, draw };
    const paintTile = initVectorTilePainter(context, progInfo);
    return initTilesetPainter(grid, zoomFuncs, paintTile);
  };

  return { load, initPainter };
}
