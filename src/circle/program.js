import vert from "./vert.glsl";
import frag from "./frag.glsl";

export function initCircle(context) {
  const attrInfo = {
    circlePos: { numComponents: 2 },
    tileCoords: { numComponents: 3 },
    circleRadius: { numComponents: 1 },
    circleColor: { numComponents: 4 },
    circleOpacity: { numComponents: 1 },
  };
  const quadPos = context.initQuad({ x0: -1.0, y0: -1.0, x1: 1.0, y1: 1.0 });

  const styleKeys = ["circle-radius", "circle-color", "circle-opacity"];

  return {
    vert, frag, attrInfo, styleKeys,
    getSpecialAttrs: () => ({ quadPos }),
    countInstances: (buffers) => buffers.circlePos.length / 2,
  };
}
