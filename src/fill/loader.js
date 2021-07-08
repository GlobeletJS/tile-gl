export function initFillLoader(context, constructVao) {
  const { initAttribute, initIndices } = context;

  const attrInfo = {
    position: { numComponents: 2, divisor: 0 },
    tileCoords: { numComponents: 3, divisor: 0 },
    color: { numComponents: 4, divisor: 0 },
    opacity: { numComponents: 1, divisor: 0 },
  };

  return function(buffers) {
    const attributes = Object.entries(attrInfo).reduce((d, [key, info]) => {
      const data = buffers[key];
      if (data) d[key] = initAttribute(Object.assign({ data }, info));
      return d;
    }, {});

    const indices = initIndices({ data: buffers.indices });
    const count = buffers.indices.length;

    const vao = constructVao({ attributes, indices });
    return { vao, indices, count };
  };
}
