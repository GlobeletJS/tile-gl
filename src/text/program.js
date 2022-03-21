import vert from "./vert.glsl";
import frag from "./frag.glsl";

export function initText(context) {
  const attrInfo = {
    labelPos: { numComponents: 4 },
    charPos: { numComponents: 4 },
    sdfRect: { numComponents: 4 },
    textColor: { numComponents: 4 },
    textOpacity: { numComponents: 1 },
    textHaloBlur: { numComponents: 1 },
    textHaloColor: { numComponents: 4 },
    textHaloWidth: { numComponents: 1 },
  };
  const quadPos = context.initQuad({ x0: 0.0, y0: 0.0, x1: 1.0, y1: 1.0 });

  const styleKeys = [
    "text-color",
    "text-opacity",
    "text-halo-blur",
    "text-halo-color",
    "text-halo-width",
  ];

  return {
    vert, frag, attrInfo, styleKeys,
    getSpecialAttrs: () => ({ quadPos }),
    countInstances: (buffers) => buffers.labelPos.length / 4,
  };
}
