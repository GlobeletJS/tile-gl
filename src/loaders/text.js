export function initTextBufferLoader(gl, constructVao) {
  // Create a buffer with the position of the vertices within one instance
  const instanceGeom = new Float32Array([
    0.0,  0.0,   1.0,  0.0,   1.0,  1.0,
    0.0,  0.0,   1.0,  1.0,   0.0,  1.0
  ]);

  const quadPos = {
    buffer: gl.createBuffer(),
    numComponents: 2,
    type: gl.FLOAT,
    normalize: false,
    stride: 0,
    offset: 0,
    divisor: 0,
  };
  gl.bindBuffer(gl.ARRAY_BUFFER, quadPos.buffer);
  gl.bufferData(gl.ARRAY_BUFFER, instanceGeom, gl.STATIC_DRAW);

  return function(buffers) {
    const { origins, deltas, rects } = buffers;
    const numInstances = origins.length / 2;

    const labelPos = {
      buffer: gl.createBuffer(),
      numComponents: 2,
      type: gl.FLOAT,
      normalize: false,
      stride: 0,
      offset: 0,
      divisor: 1,
    };
    gl.bindBuffer(gl.ARRAY_BUFFER, labelPos.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, origins, gl.STATIC_DRAW);

    const charPos = {
      buffer: gl.createBuffer(),
      numComponents: 2,
      type: gl.FLOAT,
      normalize: false,
      stride: 0,
      offset: 0,
      divisor: 1,
    };
    gl.bindBuffer(gl.ARRAY_BUFFER, charPos.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, deltas, gl.STATIC_DRAW);

    const sdfRect = {
      buffer: gl.createBuffer(),
      numComponents: 4,
      type: gl.FLOAT,
      normalize: false,
      stride: 0,
      offset: 0,
      divisor: 1,
    };
    gl.bindBuffer(gl.ARRAY_BUFFER, sdfRect.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, rects, gl.STATIC_DRAW);

    const attributes = { quadPos, labelPos, charPos, sdfRect };
    const textVao = constructVao({ attributes });

    return { textVao, numInstances };
  };
}
