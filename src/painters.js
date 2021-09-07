export function initTilesetPainter(context, grid, styleProg) {
  function antiMeridianSplit(tileset, numTiles) {
    const { translate, scale } = tileset;
    const { x } = tileset[0];

    // At low zooms, some tiles may be repeated on opposite ends of the map
    // We split them into subsets, one tileset for each copy of the map
    return [0, 1, 2].map(repeat => repeat * numTiles).map(shift => {
      const tiles = tileset.filter(tile => {
        const delta = tile.x - x - shift;
        return (delta >= 0 && delta < numTiles);
      });
      return Object.assign(tiles, { translate, scale });
    }).filter(subset => subset.length);
  }

  function drawTile(box, translate, scale) {
    const { x, y, tile } = box;
    const data = styleProg.getData(tile);
    if (!data) return;

    const [x0, y0] = [x, y].map((c, i) => (c + translate[i]) * scale);
    context.clipRectFlipY(x0, y0, scale, scale);

    context.draw(data.buffers);
  }

  return function({ tileset, zoom, pixRatio = 1, cameraScale = 1.0 }) {
    if (!tileset || !tileset.length) return;

    grid.setScreen(pixRatio, cameraScale);
    styleProg.setStyles(zoom);

    const numTiles = grid.setCoords(tileset[0]);
    const subsets = antiMeridianSplit(tileset, numTiles);

    subsets.forEach(subset => {
      const { translate, scale } = grid.setShift(subset, pixRatio);
      subset.forEach(t => drawTile(t, translate, scale));
    });
  };
}
