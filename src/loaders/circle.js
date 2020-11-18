import { initQuad, initAttribute } from "./attributes.js";

export function initCircleLoader(gl, constructVao) {
  const quadPos = initQuad(gl, { x0: -0.5, y0: -0.5 });

  return function(buffers) {
    const { points, tileCoords } = buffers;

    const attributes = { 
      quadPos, 
      circlePos: initAttribute(gl, { data: points }),
      tileCoords: initAttribute(gl, { data: tileCoords, numComponents: 3 }),
    };
    const circleVao = constructVao({ attributes });

    return { circleVao, numInstances: points.length / 2 };
  };
}
