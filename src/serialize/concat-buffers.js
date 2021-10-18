export function concatBuffers(features) {
  // Create a new Array for each buffer
  const arrays = Object.keys(features[0].buffers)
    .reduce((d, k) => (d[k] = [], d), {});

  // Concatenate the buffers from all the features
  features.forEach(f => appendBuffers(arrays, f.buffers));

  // Convert to TypedArrays
  return Object.entries(arrays).reduce((d, [key, buffer]) => {
    d[key] = (key === "indices")
      ? new Uint32Array(buffer)
      : new Float32Array(buffer);
    return d;
  }, {});
}

function appendBuffers(buffers, newBuffers) {
  const appendix = Object.assign({}, newBuffers);
  if (buffers.indices) {
    const indexShift = buffers.position.length / 2;
    appendix.indices = newBuffers.indices.map(i => i + indexShift);
  }
  Object.keys(buffers).forEach(k => {
    // NOTE: The 'obvious' buffers[k].push(...appendix[k]) fails with
    //  the error "Maximum call stack size exceeded"
    const base = buffers[k];
    appendix[k].forEach(a => base.push(a));
  });
}
