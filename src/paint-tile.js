export function initTilePainter(context, layer) {
  return function({ tile, zoom, pixRatio = 1.0, cameraScale = 1.0 }) {
    const z = (zoom !== undefined) ? zoom : tile.z;
    layer.setStyles(z, pixRatio, cameraScale);

    const data = layer.getData(tile);
    if (data) context.draw(data.buffers);
  };
}
