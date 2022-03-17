export function initTilePainter(context, framebuffer, program, layer) {
  const { screenScale } = program.uniformSetters;

  return function({ tile, zoom, pixRatio = 1.0, cameraScale = 1.0 }) {
    const z = (zoom !== undefined) ? zoom : tile.z;
    layer.setStyles(z);

    // Note: layer.getData executes uniform1i for text layers.
    // So we must call useProgram first (done in layer.setStyles)
    const data = layer.getData(tile);
    if (!data) return;

    const { width, height } = framebuffer.size;
    screenScale([2 / width, -2 / height, pixRatio, cameraScale]);

    context.draw(data.buffers);
  };
}
