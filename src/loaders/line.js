export function initLineBufferLoader(gl, constructVao) {
  // Create a buffer with the position of the vertices within one instance
  const instanceGeom = new Float32Array([
    0, -0.5,   1, -0.5,   1,  0.5,
    0, -0.5,   1,  0.5,   0,  0.5
  ]);

  const position = {
    buffer: gl.createBuffer(),
    numComponents: 2,
    type: gl.FLOAT,
    normalize: false,
    stride: 0,
    offset: 0,
    divisor: 0,
  };
  gl.bindBuffer(gl.ARRAY_BUFFER, position.buffer);
  gl.bufferData(gl.ARRAY_BUFFER, instanceGeom, gl.STATIC_DRAW);

  return function(buffers) {
    const { lines } = buffers;
    const numComponents = 3;
    const numInstances = lines.length / numComponents - 3;

    // Create buffer containing the vertex positions
    const linesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, linesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, lines, gl.STATIC_DRAW);

    // Create interleaved attributes pointing to different offsets in buffer
    const attributes = {
      position,
      pointA: setupPoint(0),
      pointB: setupPoint(1),
      pointC: setupPoint(2),
      pointD: setupPoint(3),
    };

    function setupPoint(offset) {
      return {
        buffer: linesBuffer,
        numComponents: numComponents,
        type: gl.FLOAT,
        normalize: false,
        stride: Float32Array.BYTES_PER_ELEMENT * numComponents,
        offset: Float32Array.BYTES_PER_ELEMENT * numComponents * offset,
        divisor: 1
      };
    }

    const strokeVao = constructVao({ attributes });

    return { strokeVao, numInstances };
  };
}
