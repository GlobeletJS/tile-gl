export function initTransform(gl, framebuffer, framebufferSize) {
  const tileTransform = new Float64Array(3); // shiftX, shiftY, scale
  const screenScale   = new Float64Array(3); // 2 / width, -2 / height, pixRatio

  function setTileTransform(dx, dy, scale) {
    tileTransform.set([dx, dy, scale]);
  }

  function bindFramebufferAndSetViewport(pixRatio = 1) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    let { width, height } = framebufferSize;
    gl.viewport(0, 0, width, height);
    screenScale.set([2 / width, -2 / height, pixRatio]);
  }

  return {
    methods: {
      setTileTransform,
      bindFramebufferAndSetViewport,
    },

    tileTransform,
    screenScale,
  };
}
