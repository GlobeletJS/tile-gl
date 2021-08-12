import vert from "./vert.glsl";
import frag from "./frag.glsl";
import { initGrid, initTilesetPainter } from "../grid.js";
import { initSetters, initVectorTilePainter } from "../util.js";

export function initFill(context, framebufferSize, preamble) {
  const { initProgram, initAttributes, initIndices } = context;

  const program = context.initProgram(preamble + vert, frag);
  const { use, uniformSetters, constructVao } = program;

  const grid = initGrid(framebufferSize, use, uniformSetters);

  const attrInfo = {
    position: { numComponents: 2, divisor: 0 },
    tileCoords: { numComponents: 3, divisor: 0 },
    color: { numComponents: 4, divisor: 0 },
    opacity: { numComponents: 1, divisor: 0 },
  };

  function load(buffers) {
    const attributes = initAttributes(attrInfo, buffers);
    const indices = initIndices({ data: buffers.indices });
    const vao = constructVao({ attributes, indices });
    return { vao, indices, count: buffers.indices.length };
  };

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
