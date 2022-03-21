import vert from "./vert.glsl";
import frag from "./frag.glsl";

export function initFill() {
  const attrInfo = {
    position: { numComponents: 2, divisor: 0 },
    fillColor: { numComponents: 4, divisor: 0 },
    fillOpacity: { numComponents: 1, divisor: 0 },
  };

  const styleKeys = ["fill-color", "fill-opacity", "fill-translate"];

  return {
    vert, frag, attrInfo, styleKeys,
    getSpecialAttrs: () => ({}),
  };
}
