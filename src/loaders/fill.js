import { initAttribute } from "./attributes.js";

export function initFillLoader(gl, constructVao, lineLoader) {
  return function(buffers) {
    const { vertices, indices: indexData, lines, tileCoords } = buffers;

    const attributes = {
      a_position: initAttribute(gl, { data: vertices, divisor: 0 }),
      tileCoords: initAttribute(gl, { data: tileCoords, numComponents: 3 }),
    };

    const indices = {
      buffer: gl.createBuffer(),
      vertexCount: indexData.length,
      type: gl.UNSIGNED_SHORT,
      offset: 0
    };
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices.buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexData, gl.STATIC_DRAW);

    const fillVao = constructVao({ attributes, indices });
    const path = { fillVao, indices };

    const strokePath = lineLoader(buffers);

    return Object.assign(path, strokePath);
  };
}
