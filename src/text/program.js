import vert from "./vert.glsl";
import frag from "./frag.glsl";
import { initGrid, initTilesetPainter } from "../grid.js";
import { initSetters, initVectorTilePainter } from "../util.js";

export function initText(context, framebufferSize, preamble) {
  const { initProgram, initQuad, initAttribute } = context;

  const program = initProgram(preamble + vert, frag);
  const { use, uniformSetters, constructVao } = program;

  const grid = initGrid(framebufferSize, use, uniformSetters);

  const quadPos = initQuad({ x0: 0.0, y0: 0.0, x1: 1.0, y1: 1.0 });

  const attrInfo = {
    labelPos: { numComponents: 3 },
    charPos: { numComponents: 4 },
    sdfRect: { numComponents: 4 },
    tileCoords: { numComponents: 3 },
    color: { numComponents: 4 },
    opacity: { numComponents: 1 },
  };

  function load(buffers) {
    const attributes = Object.entries(attrInfo).reduce((d, [key, info]) => {
      const data = buffers[key];
      if (data) d[key] = initAttribute(Object.assign({ data }, info));
      return d;
    }, { quadPos });

    const vao = constructVao({ attributes });
    return { vao, instanceCount: buffers.labelPos.length / 3 };
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
      context, framebufferSize, id, uniformSetters.sdf
    );
    return initTilesetPainter(grid, zoomFuncs, paintTile);
  }

  return { load, initPainter };
}
