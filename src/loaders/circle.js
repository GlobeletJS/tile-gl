export function initCircleBufferLoader(context) {
  const { gl, constructCircleVao } = context;

  // Create a buffer with the position of the vertices within one instance
  const instanceGeom = new Float32Array([
    -1.0, -1.0,   1.0, -1.0,   1.0,  1.0,
    -1.0, -1.0,   1.0,  1.0,  -1.0,  1.0,
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
    const { origins } = buffers;
    const numInstances = origins.length / 2;

    const circlePos = {
      buffer: gl.createBuffer(),
      numComponents: 2,
      type: gl.FLOAT,
      normalize: false,
      stride: 0,
      offset: 0,
      divisor: 1,
    };
    gl.bindBuffer(gl.ARRAY_BUFFER, circlePos.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, origins, gl.STATIC_DRAW);

    const attributes = { quadPos, circlePos };
    const circleVao = constructCircleVao({ attributes });

    return { circleVao, numInstances };
  };
}
