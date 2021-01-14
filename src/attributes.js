export function initAttributeMethods(gl) {
  return { createBuffer, initAttribute, initIndices, initQuad };

  function createBuffer(data, bindPoint = gl.ARRAY_BUFFER) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(bindPoint, buffer);
    gl.bufferData(bindPoint, data, gl.STATIC_DRAW);
    return buffer;
  }

  function initAttribute(options) {
    // Set defaults for unsupplied values
    const {
      buffer = createBuffer(options.data),
      numComponents = 3,
      type = gl.FLOAT,
      normalize = false,
      stride = 0,
      offset = 0,
      divisor = 1,
    } = options;

    // Return attribute state object
    return { buffer, numComponents, type, normalize, stride, offset, divisor };
  }

  function initIndices(options) {
    const {
      buffer = createBuffer(options.data, gl.ELEMENT_ARRAY_BUFFER),
      type = gl.UNSIGNED_INT,
      offset = 0,
    } = options;

    return { buffer, type, offset };
  }

  function initQuad({ x0 = -1.0, y0 = -1.0, x1 = 1.0, y1 = 1.0 } = {}) {
    // Create a buffer with the position of the vertices within one instance
    const data = new Float32Array([
      x0, y0,  x1, y0,  x1, y1,
      x0, y0,  x1, y1,  x0, y1,
    ]);

    return initAttribute({ data, numComponents: 2, divisor: 0 });
  }
}
