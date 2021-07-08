export function initLineLoader(context, constructVao) {
  const { initQuad, createBuffer, initAttribute } = context;

  const quadPos = initQuad({ x0: 0.0, y0: -0.5, x1: 1.0, y1: 0.5 });

  const attrInfo = {
    tileCoords: { numComponents: 3 },
    color: { numComponents: 4 },
    opacity: { numComponents: 1 },
  };

  const numComponents = 3;
  const stride = Float32Array.BYTES_PER_ELEMENT * numComponents;

  return function(buffers) {
    const { lines } = buffers;

    // Create buffer containing the vertex positions
    const buffer = createBuffer(lines);

    // Create interleaved attributes pointing to different offsets in buffer
    const geometryAttributes = {
      quadPos,
      pointA: setupPoint(0),
      pointB: setupPoint(1),
      pointC: setupPoint(2),
      pointD: setupPoint(3),
    };

    function setupPoint(shift) {
      const offset = shift * stride;
      return initAttribute({ buffer, numComponents, stride, offset });
    }

    const attributes = Object.entries(attrInfo).reduce((d, [key, info]) => {
      const data = buffers[key];
      if (data) d[key] = initAttribute(Object.assign({ data }, info));
      return d;
    }, geometryAttributes);

    const vao = constructVao({ attributes });

    return { vao, instanceCount: lines.length / numComponents - 3 };
  };
}
