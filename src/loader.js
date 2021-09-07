export function initLoader(context, progInfo, constructVao) {
  const { initAttribute, initIndices } = context;
  const { attrInfo, getSpecialAttrs, countInstances } = progInfo;

  function getAttributes(buffers) {
    return Object.entries(attrInfo).reduce((d, [key, info]) => {
      const data = buffers[key];
      if (data) d[key] = initAttribute(Object.assign({ data }, info));
      return d;
    }, getSpecialAttrs(buffers));
  }

  function loadInstanced(buffers) {
    const attributes = getAttributes(buffers);
    const vao = constructVao({ attributes });
    return { vao, instanceCount: countInstances(buffers) };
  }

  function loadIndexed(buffers) {
    const attributes = getAttributes(buffers);
    const indices = initIndices({ data: buffers.indices });
    const vao = constructVao({ attributes, indices });
    return { vao, indices, count: buffers.indices.length };
  }

  return (countInstances) ? loadInstanced : loadIndexed;
}
