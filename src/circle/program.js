import vert from "./vert.glsl";
import frag from "./frag.glsl";
import { initGrid, initTilesetPainter } from "../grid.js";
import { initSetters, initVectorTilePainter } from "../util.js";

export function initCircle(context, framebufferSize, preamble) {
  const { initProgram, initQuad, initAttributes } = context;

  const program = initProgram(preamble + vert, frag);
  const { use, uniformSetters, constructVao } = program;

  const grid = initGrid(framebufferSize, use, uniformSetters);

  const quadPos = initQuad({ x0: -0.5, y0: -0.5, x1: 0.5, y1: 0.5 });

  const attrInfo = {
    circlePos: { numComponents: 2 },
    tileCoords: { numComponents: 3 },
    radius: { numComponents: 1 },
    color: { numComponents: 4 },
    opacity: { numComponents: 1 },
  };

  function load(buffers) {
    const attributes = initAttributes(attrInfo, buffers, { quadPos });
    const vao = constructVao({ attributes });
    return { vao, instanceCount: buffers.circlePos.length / 2 };
  }

  function initPainter(style) {
    const { id, paint } = style;

    const zoomFuncs = initSetters([
      [paint["circle-radius"],  "radius"],
      [paint["circle-color"],   "color"],
      [paint["circle-opacity"], "opacity"],
    ], uniformSetters);

    const paintTile = initVectorTilePainter(context, framebufferSize, id);
    return initTilesetPainter(grid, zoomFuncs, paintTile);
  }

  return { load, initPainter };
}
