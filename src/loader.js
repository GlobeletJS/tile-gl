export function initLoader(context, info, constructVao, extraAttributes) {
  const { initAttribute, initIndices } = context;
  const { attrInfo, getSpecialAttrs, countInstances } = info;

  const allAttrs = Object.assign({}, attrInfo, extraAttributes);

  function getAttributes(buffers) {
    return Object.entries(allAttrs).reduce((d, [key, info]) => {
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
