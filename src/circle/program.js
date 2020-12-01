import vert from "./vert.glsl";
import frag from "./frag.glsl";
import { initGrid, initTilesetPainter } from "../grid.js";
import { initSetters, initVectorTilePainter } from "../util.js";

export function initCircle(context) {
  const program = context.initProgram(vert, frag);
  const { use, uniformSetters, constructVao } = program;

  const grid = initGrid(context, use, uniformSetters);

  const quadPos = context.initQuad({ x0: -0.5, y0: -0.5 });

  function load(buffers) {
    const { points, tileCoords } = buffers;
    const attributes = {
      quadPos,
      circlePos: context.initAttribute({ data: points }),
      tileCoords: context.initAttribute({ data: tileCoords, numComponents: 3 }),
    };
    const vao = constructVao({ attributes });
    return { vao, numInstances: points.length / 2 };
  }

  function draw(buffers) {
    const { vao, numInstances } = buffers;
    context.drawInstancedQuads(vao, numInstances);
  }

  function initPainter(style) {
    const { id, paint } = style;

    const { zoomFuncs, dataFuncs } = initSetters([
      [paint["circle-radius"],  "circleRadius"],
      [paint["circle-color"],   "strokeStyle"],
      [paint["circle-opacity"], "globalAlpha"],
    ], uniformSetters);

    const paintTile = initVectorTilePainter(context, { id, dataFuncs, draw });
    return initTilesetPainter(grid, zoomFuncs, paintTile);
  };

  return { load, initPainter };
}
