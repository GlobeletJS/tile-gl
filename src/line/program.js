import vert from "./vert.glsl";
import frag from "./frag.glsl";

export function initLine(context) {
  const { initQuad, createBuffer, initAttribute } = context;

  const attrInfo = {
    tileCoords: { numComponents: 3 },
    color: { numComponents: 4 },
    opacity: { numComponents: 1 },
  };
  const quadPos = initQuad({ x0: 0.0, y0: -0.5, x1: 1.0, y1: 0.5 });
  const numComponents = 3;
  const stride = Float32Array.BYTES_PER_ELEMENT * numComponents;

  function getSpecialAttrs(buffers) {
    // Create buffer containing the vertex positions
    const buffer = createBuffer(buffers.lines);

    // Construct interleaved attributes pointing to different offsets in buffer
    function setupPoint(shift) {
      const offset = shift * stride;
      return initAttribute({ buffer, numComponents, stride, offset });
    }

    return {
      quadPos,
      pointA: setupPoint(0),
      pointB: setupPoint(1),
      pointC: setupPoint(2),
      pointD: setupPoint(3),
    };
  }

  const styleMap = [
    // [layout["line-cap"],      "lineCap"],
    // [layout["line-join"],     "lineJoin"],
    // NOTE: line-miter-limit is a layout property in the style spec
    // We copied the function to a paint property in ../main.js
    ["line-miter-limit", "miterLimit"],

    ["line-width",     "lineWidth"],
    ["line-color",     "color"],
    ["line-opacity",   "opacity"],
    // line-gap-width,
    // line-translate, line-translate-anchor,
    // line-offset, line-blur, line-gradient, line-pattern
  ];

  return {
    vert, frag, attrInfo, styleMap, getSpecialAttrs,
    countInstances: (buffers) => buffers.lines.length / numComponents - 3,
  };
}
