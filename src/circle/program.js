import vert from "./vert.glsl";
import frag from "./frag.glsl";

export function initCircle(context) {
  const attrInfo = {
    circlePos: { numComponents: 2 },
    tileCoords: { numComponents: 3 },
    radius: { numComponents: 1 },
    color: { numComponents: 4 },
    opacity: { numComponents: 1 },
  };
  const quadPos = context.initQuad({ x0: -0.5, y0: -0.5, x1: 0.5, y1: 0.5 });

  const styleMap = [
    ["circle-radius", "radius"],
    ["circle-color", "color"],
    ["circle-opacity", "opacity"],
  ];

  return {
    vert, frag, attrInfo, styleMap,
    getSpecialAttrs: () => ({ quadPos }),
    countInstances: (buffers) => buffers.circlePos.length / 2,
  };
}
