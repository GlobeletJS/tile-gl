export function concatBuffers(buffers) {
  // Concatenate the buffers from all the features
  const arrays = buffers.reduce(appendBuffers, {});

  // Convert to TypedArrays (now that the lengths are finalized)
  return Object.entries(arrays)
    .reduce((d, [k, a]) => (d[k] = makeTypedArray(k, a), d), {});
}

function makeTypedArray(key, array) {
  const type = (key === "indices") ? Uint32Array : Float32Array;
  return new type(array);
}

function appendBuffers(buffers, newBuffers) {
  const appendix = Object.assign({}, newBuffers);
  if (buffers.indices) {
    const indexShift = buffers.position.length / 2;
    appendix.indices = newBuffers.indices.map(i => i + indexShift);
  }

  Object.keys(appendix).forEach(k => {
    // NOTE: The 'obvious' buffers[k].push(...appendix[k]) fails with
    //  the error "Maximum call stack size exceeded"
    const base = buffers[k] || (buffers[k] = []);
    appendix[k].forEach(a => base.push(a));
  });

  return buffers;
}
