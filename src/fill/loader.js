export function initFillLoader(context, constructVao) {
  const { initAttribute, initIndices } = context;

  return function(buffers) {
    const { vertices, indices: indexData, color, tileCoords } = buffers;

    const attributes = {
      a_position: initAttribute({ data: vertices, divisor: 0 }),
      tileCoords: initAttribute({ data: tileCoords, numComponents: 3 }),
    };
    if (color) {
      attributes.color = initAttribute({ data: color, numComponents: 4 });
    }

    const indices = initIndices({ data: indexData });

    const vao = constructVao({ attributes, indices });
    return { vao, indices };
  };
}
