export function initTilePainter(context, layer) {
  return function({ tile, zoom, pixRatio = 1.0, cameraScale = 1.0 }) {
    const z = (zoom !== undefined) ? zoom : tile.z;
    layer.setStyles(z, pixRatio, cameraScale);

    // Note: layer.getData executes uniform1i for text layers.
    // So we must call useProgram first (done in layer.setStyles)
    const data = layer.getData(tile);
    if (!data) return;

    context.draw(data.buffers);
  };
}
