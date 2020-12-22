export function initTextLoader(context, constructVao) {
  const { initQuad, initAttribute } = context;

  const quadPos = initQuad({ x0: 0.0, y0: 0.0 });

  const attrInfo = {
    labelPos: {},
    charPos: { numComponents: 3 },
    sdfRect: { numComponents: 4 },
    tileCoords: { numComponents: 3 },
    color: { numComponents: 4 },
    opacity: { numComponents: 1 },
  };

  return function(buffers) {
    const attributes = Object.entries(attrInfo).reduce((d, [key, info]) => {
      let data = buffers[key];
      if (data) d[key] = initAttribute(Object.assign({ data }, info));
      return d;
    }, { quadPos });

    const vao = constructVao({ attributes });

    return { vao, numInstances: buffers.labelPos.length / 2 };
  };
}
