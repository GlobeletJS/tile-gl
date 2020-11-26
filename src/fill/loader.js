export function initFillLoader(context, constructVao) {
  const { gl, initAttribute } = context;

  return function(buffers) {
    const { vertices, indices: indexData, lines, tileCoords } = buffers;

    const attributes = {
      a_position: initAttribute({ data: vertices, divisor: 0 }),
      tileCoords: initAttribute({ data: tileCoords, numComponents: 3 }),
    };

    const indices = {
      buffer: gl.createBuffer(),
      vertexCount: indexData.length,
      type: gl.UNSIGNED_SHORT,
      offset: 0
    };
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices.buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexData, gl.STATIC_DRAW);

    const vao = constructVao({ attributes, indices });
    return { vao, indices };
  };
}
