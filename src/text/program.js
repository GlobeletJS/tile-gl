import vert from "./vert.glsl";
import frag from "./frag.glsl";

export function initText(context) {
  const attrInfo = {
    labelPos: { numComponents: 3 },
    charPos: { numComponents: 4 },
    sdfRect: { numComponents: 4 },
    tileCoords: { numComponents: 3 },
    color: { numComponents: 4 },
    opacity: { numComponents: 1 },
  };
  const quadPos = context.initQuad({ x0: 0.0, y0: 0.0, x1: 1.0, y1: 1.0 });

  const styleMap = [
    ["text-color", "color"],
    ["text-opacity", "opacity"],

    // text-halo-color
    // TODO: sprites
  ];

  return {
    vert, frag, attrInfo, styleMap,
    getSpecialAttrs: () => ({ quadPos }),
    countInstances: (buffers) => buffers.labelPos.length / 3,
  };
}
