import vert from "./vert.glsl";
import frag from "./frag.glsl";

export function initSprite(context) {
  const attrInfo = {
    labelPos0: { numComponents: 3 },
    spritePos: { numComponents: 4 },
    spriteRect: { numComponents: 4 },
    tileCoords: { numComponents: 3 },
    iconOpacity: { numComponents: 1 },
  };
  const quadPos = context.initQuad({ x0: 0.0, y0: 0.0, x1: 1.0, y1: 1.0 });

  const styleKeys = ["icon-opacity"];

  return {
    vert, frag, attrInfo, styleKeys,
    getSpecialAttrs: () => ({ quadPos }),
    countInstances: (buffers) => buffers.labelPos0.length / 3,
  };
}
