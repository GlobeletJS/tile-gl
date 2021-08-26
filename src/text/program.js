import vert from "./vert.glsl";
import frag from "./frag.glsl";

export function initText(context) {
  const attrInfo = {
    labelPos: { numComponents: 3 },
    charPos: { numComponents: 4 },
    sdfRect: { numComponents: 4 },
    tileCoords: { numComponents: 3 },
    textColor: { numComponents: 4 },
    textOpacity: { numComponents: 1 },
  };
  const quadPos = context.initQuad({ x0: 0.0, y0: 0.0, x1: 1.0, y1: 1.0 });

  const styleKeys = ["text-color", "text-opacity"];
  // TODO: "text-halo-color", sprites

  return {
    vert, frag, attrInfo, styleKeys,
    getSpecialAttrs: () => ({ quadPos }),
    countInstances: (buffers) => buffers.labelPos.length / 3,
  };
}
