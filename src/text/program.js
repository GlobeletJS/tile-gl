import vert from "./vert.glsl";
import frag from "./frag.glsl";
import { initTextLoader } from "./loader.js";
import { initGrid, initTilesetPainter } from "../grid.js";
import { initSetters, initVectorTilePainter } from "../util.js";

export function initText(context, framebufferSize, preamble) {
  const program = context.initProgram(preamble + vert, frag);
  const { use, uniformSetters, constructVao } = program;
  const grid = initGrid(framebufferSize, use, uniformSetters);

  const load = initTextLoader(context, constructVao);

  function setAtlas(atlas) {
    uniformSetters.sdf(atlas.sampler);
    uniformSetters.sdfDim([atlas.width, atlas.height]);
  }

  function initPainter(style) {
    const { id, paint } = style;

    const zoomFuncs = initSetters([
      [paint["text-color"],   "color"],
      [paint["text-opacity"], "opacity"],

      // text-halo-color
      // TODO: sprites
    ], uniformSetters);

    const paintTile = initVectorTilePainter(
      context, framebufferSize, id, setAtlas
    );
    return initTilesetPainter(grid, zoomFuncs, paintTile);
  }

  return { load, initPainter };
}
