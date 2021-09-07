export function initTilePainter(context, program, layer, multiTile) {
  return (multiTile) ? drawTileset : drawTile;

  function drawTile({ tile, zoom, pixRatio = 1.0, cameraScale = 1.0 }) {
    program.use();

    const data = layer.getData(tile);
    if (!data) return;
    const z = (zoom !== undefined) ? zoom : tile.z;
    layer.setStyles(z);

    program.setScreen(pixRatio, cameraScale);
    program.setCoords(tile);

    const fakeTileset = [{ x: 0, y: 0 }];
    Object.assign(fakeTileset, { translate: [0, 0], scale: 512 });
    program.setShift(fakeTileset, pixRatio);

    context.draw(data.buffers);
  }

  function drawTileset({ tileset, zoom, pixRatio = 1.0, cameraScale = 1.0 }) {
    if (!tileset || !tileset.length) return;

    program.use();
    program.setScreen(pixRatio, cameraScale);
    layer.setStyles(zoom);

    const numTiles = program.setCoords(tileset[0]);
    const subsets = antiMeridianSplit(tileset, numTiles);

    subsets.forEach(subset => {
      const { translate, scale } = program.setShift(subset, pixRatio);
      subset.forEach(t => drawTileBox(t, translate, scale));
    });
  }

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

  function drawTileBox(box, translate, scale) {
    const { x, y, tile } = box;
    const data = layer.getData(tile);
    if (!data) return;

    const [x0, y0] = [x, y].map((c, i) => (c + translate[i]) * scale);
    context.clipRectFlipY(x0, y0, scale, scale);

    context.draw(data.buffers);
  }
}
