export function initQuad(gl, instanceGeom) {
  const { x0, y0, w = 1.0, h = 1.0 } = instanceGeom;

  const triangles = new Float32Array([
    x0, y0,  x0 + w, y0,  x0 + w, y0 + h,
    x0, y0,  x0 + w, y0 + h,  x0, y0 + h,
  ]);

  // Create a buffer with the position of the vertices within one instance
  return initAttribute(gl, { data: triangles, divisor: 0 });
}

export function initAttribute(gl, options) {
  // Set defaults for unsupplied values
  const {
    buffer = createBuffer(gl, options.data),
    numComponents = 2,
    type = gl.FLOAT,
    normalize = false,
    stride = 0,
    offset = 0,
    divisor = 1,
  } = options;

  // Return attribute state object
  return { buffer, numComponents, type, normalize, stride, offset, divisor };
}

function createBuffer(gl, data) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  return buffer;
}
