import vert from "./vert.glsl";
import frag from "./frag.glsl";

export function initFill(context) {
  const { initPaintProgram, initAttributes, initIndices } = context;

  const { constructVao, initTilesetPainter } = initPaintProgram(vert, frag);

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
  }

  function initPainter(id, paint) {
    const zoomFuncs = [
      [paint["fill-color"],     "color"],
      [paint["fill-opacity"],   "opacity"],
      [paint["fill-translate"], "translation"],
    ];

    return initTilesetPainter(id, zoomFuncs);
  }

  return { load, initPainter };
}
