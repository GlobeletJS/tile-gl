export function initLoader(context, progInfo) {
  const { initAttribute, initIndices } = context;
  const { attrInfo, getSpecialAttrs, countInstances, program } = progInfo;

  const universalAttrs = { tileCoords: { numComponents: 3 } };
  const allAttrs = Object.assign({}, attrInfo, universalAttrs);

  function getAttributes(buffers) {
    return Object.entries(allAttrs).reduce((d, [key, info]) => {
      const data = buffers[key];
      if (data) d[key] = initAttribute(Object.assign({ data }, info));
      return d;
    }, getSpecialAttrs(buffers));
  }

  function loadInstanced(buffers) {
    const attributes = getAttributes(buffers);
    const vao = program.constructVao({ attributes });
    return { vao, instanceCount: countInstances(buffers) };
  }

  function loadIndexed(buffers) {
    const attributes = getAttributes(buffers);
    const indices = initIndices({ data: buffers.indices });
    const vao = program.constructVao({ attributes, indices });
    return { vao, indices, count: buffers.indices.length };
  }

  return (countInstances) ? loadInstanced : loadIndexed;
}
