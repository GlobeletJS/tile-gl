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

export function initIndices(gl, options) {
  const {
    buffer = createBuffer(gl, options.data, gl.ELEMENT_ARRAY_BUFFER),
    type = gl.UNSIGNED_SHORT,
    offset = 0,
  } = options;

  return { buffer, type, offset, vertexCount: options.data.length };
}

export function createBuffer(gl, data, bindPoint = gl.ARRAY_BUFFER) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(bindPoint, buffer);
  gl.bufferData(bindPoint, data, gl.STATIC_DRAW);
  return buffer;
}
