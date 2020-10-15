export function initFillBufferLoader(gl, constructVao, lineLoader) {
  return function(buffers) {
    // buffers: { vertices, indices, lines }

    const vertexPositions = {
      buffer: gl.createBuffer(),
      numComponents: 2,
      type: gl.FLOAT,
      normalize: false,
      stride: 0,
      offset: 0
    };
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositions.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, buffers.vertices, gl.STATIC_DRAW);

    const indices = {
      buffer: gl.createBuffer(),
      vertexCount: buffers.indices.length,
      type: gl.UNSIGNED_SHORT,
      offset: 0
    };
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices.buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, buffers.indices, gl.STATIC_DRAW);

    const attributes = { a_position: vertexPositions };
    const fillVao = constructVao({ attributes, indices });
    const path = { fillVao, indices };

    const strokePath = lineLoader(buffers);

    return Object.assign(path, strokePath);
  }
}
