export function initFillLoader(context, constructVao) {
  const { initAttribute, initIndices } = context;

  const attrInfo = {
    position: { divisor: 0 },
    tileCoords: { numComponents: 3 },
    color: { numComponents: 4 },
    opacity: { numComponents: 1 },
  };

  return function(buffers) {
    const attributes = Object.entries(attrInfo).reduce((d, [key, info]) => {
      let data = buffers[key];
      if (data) d[key] = initAttribute(Object.assign({ data }, info));
      return d;
    }, {});

    const indices = initIndices({ data: buffers.indices });

    const vao = constructVao({ attributes, indices });
    return { vao, indices };
  };
}
