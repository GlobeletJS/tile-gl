import vert from "./vert.glsl";
import frag from "./frag.glsl";

export function initCircle(context) {
  const { initPaintProgram, initQuad, initAttributes } = context;

  const { constructVao, initTilesetPainter } = initPaintProgram(vert, frag);

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

    const zoomFuncs = [
      [paint["circle-radius"],  "radius"],
      [paint["circle-color"],   "color"],
      [paint["circle-opacity"], "opacity"],
    ];

    return initTilesetPainter(id, zoomFuncs);
  }

  return { load, initPainter };
}
