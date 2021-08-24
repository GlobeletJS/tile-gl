import vert from "./vert.glsl";
import frag from "./frag.glsl";

export function initText(context) {
  const { initPaintProgram, initQuad, initAttributes } = context;

  const { constructVao, initTilesetPainter } = initPaintProgram(vert, frag);

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
    const attributes = initAttributes(attrInfo, buffers, { quadPos });
    const vao = constructVao({ attributes });
    return { vao, instanceCount: buffers.labelPos.length / 3 };
  }

  function initPainter(id, paint) {
    const zoomFuncs = [
      [paint["text-color"],   "color"],
      [paint["text-opacity"], "opacity"],

      // text-halo-color
      // TODO: sprites
    ];

    return initTilesetPainter(id, zoomFuncs);
  }

  return { load, initPainter };
}
