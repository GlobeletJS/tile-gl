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

  function initIndices(options) {
    const {
      buffer = createBuffer(options.data, gl.ELEMENT_ARRAY_BUFFER),
      type = gl.UNSIGNED_INT,
      offset = 0,
    } = options;

    return { buffer, type, offset, vertexCount: options.data.length };
  }

  function initQuad({ x0, y0, w = 1.0, h = 1.0 }) {
    // Create a buffer with the position of the vertices within one instance
    const triangles = new Float32Array([
      x0, y0,  x0 + w, y0,  x0 + w, y0 + h,
      x0, y0,  x0 + w, y0 + h,  x0, y0 + h,
    ]);

    return initAttribute({ data: triangles, divisor: 0 });
  }
}
