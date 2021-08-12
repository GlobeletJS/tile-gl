import vert from "./vert.glsl";
import frag from "./frag.glsl";
import { initGrid } from "../grid.js";

export function initFill(context, framebufferSize, preamble) {
  const { initProgram, initAttributes, initIndices } = context;

  const program = initProgram(preamble + vert, frag);
  const { use, uniformSetters, constructVao } = program;

  const initTilesetPainter = initGrid(framebufferSize, use, uniformSetters);

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

  function initPainter(style) {
    const { id, paint } = style;

    const zoomFuncs = [
      [paint["fill-color"],     "color"],
      [paint["fill-opacity"],   "opacity"],
      [paint["fill-translate"], "translation"],
    ];

    return initTilesetPainter(context, id, zoomFuncs);
  }

  return { load, initPainter };
}
