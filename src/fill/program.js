import vert from "./vert.glsl";
import frag from "./frag.glsl";

export function initFill() {
  const attrInfo = {
    position: { numComponents: 2, divisor: 0 },
    tileCoords: { numComponents: 3, divisor: 0 },
    color: { numComponents: 4, divisor: 0 },
    opacity: { numComponents: 1, divisor: 0 },
  };

  const styleMap = [
    ["fill-color", "color"],
    ["fill-opacity", "opacity"],
    ["fill-translate", "translation"],
  ];

  return {
    vert, frag, attrInfo, styleMap,
    getSpecialAttrs: () => ({}),
  };
}
