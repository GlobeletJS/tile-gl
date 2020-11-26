export function initTextLoader(context, constructVao) {
  const { initQuad, initAttribute } = context;

  const quadPos = initQuad({ x0: 0.0, y0: 0.0 });

  return function(buffers) {
    const { origins, deltas, rects, tileCoords } = buffers;

    const attributes = {
      quadPos,
      labelPos: initAttribute({ data: origins }),
      charPos: initAttribute({ data: deltas, numComponents: 3 }),
      sdfRect: initAttribute({ data: rects, numComponents: 4 }),
      tileCoords: initAttribute({ data: tileCoords, numComponents: 3 }),
    };
    const vao = constructVao({ attributes });

    return { vao, numInstances: origins.length / 2 };
  };
}
