import { initQuad, initAttribute } from "./attributes.js";

export function initTextLoader(gl, constructVao) {
  const quadPos = initQuad(gl, { x0: 0.0, y0: 0.0 });

  return function(buffers) {
    const { origins, deltas, rects, tileCoords } = buffers;

    const attributes = {
      quadPos,
      labelPos: initAttribute(gl, { data: origins }),
      charPos: initAttribute(gl, { data: deltas, numComponents: 3 }),
      sdfRect: initAttribute(gl, { data: rects, numComponents: 4 }),
      tileCoords: initAttribute(gl, { data: tileCoords, numComponents: 3 }),
    };
    const textVao = constructVao({ attributes });

    return { textVao, numInstances: origins.length / 2 };
  };
}
