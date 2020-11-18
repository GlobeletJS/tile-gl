import { initQuad, initAttribute } from "./attributes.js";

export function initLineLoader(gl, constructVao) {
  const position = initQuad(gl, { x0: 0.0, y0: -0.5 });

  const numComponents = 3;
  const stride = Float32Array.BYTES_PER_ELEMENT * numComponents;

  return function(buffers) {
    const { lines, tileCoords } = buffers;

    // Create buffer containing the vertex positions
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, lines, gl.STATIC_DRAW);

    // Create interleaved attributes pointing to different offsets in buffer
    const attributes = {
      position,
      pointA: setupPoint(0),
      pointB: setupPoint(1),
      pointC: setupPoint(2),
      pointD: setupPoint(3),
      tileCoords: initAttribute(gl, { data: tileCoords, numComponents: 3 }),
    };

    function setupPoint(shift) {
      const offset = shift * stride;
      return initAttribute(gl, { buffer, numComponents, stride, offset });
    }

    const strokeVao = constructVao({ attributes });

    return { strokeVao, numInstances: lines.length / numComponents - 3 };
  };
}
