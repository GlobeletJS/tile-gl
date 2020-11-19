export function initTransform(gl, framebuffer, framebufferSize) {
  const mapCoords   = new Float64Array(4); // x, y, z, extent of tileset[0]
  const mapShift    = new Float64Array(3); // translate and extent of tileset[0] 
  const screenScale = new Float64Array(3); // 2 / width, -2 / height, pixRatio

  function setMapCoords(x, y, z, extent) {
    mapCoords.set([x, y, z, extent]);
  }

  function setMapShift(tx, ty, scale) {
    mapShift.set([tx, ty, scale]);
  }

  function bindFramebufferAndSetViewport(pixRatio = 1) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    let { width, height } = framebufferSize;
    gl.viewport(0, 0, width, height);
    screenScale.set([2 / width, -2 / height, pixRatio]);
  }

  return {
    methods: {
      setMapCoords,
      setMapShift,
      bindFramebufferAndSetViewport,
    },

    mapCoords,
    mapShift,
    screenScale,
  };
}
