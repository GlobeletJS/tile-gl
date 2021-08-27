export function initGrid(context, uniformSetters) {
  const { mapCoords, mapShift } = uniformSetters;

  function setGrid(tileset, pixRatio = 1) {
    const { x, y, z } = tileset[0];
    const numTiles = 1 << z;
    const xw = x - Math.floor(x / numTiles) * numTiles;
    const extent = 512; // TODO: don't assume this!!
    mapCoords([xw, y, z, extent]);

    const { translate, scale: rawScale } = tileset;
    const scale = rawScale * pixRatio;
    const [dx, dy] = [x, y].map((c, i) => (c + translate[i]) * scale);

    // At low zooms, some tiles may be repeated on opposite ends of the map
    // We split them into subsets, with different values of mapShift
    // NOTE: Only accounts for repetition across X!
    const subsets = [0, 1, 2].map(repeat => {
      const shift = repeat * numTiles;
      const tiles = tileset.filter(tile => {
        const delta = tile.x - x;
        return (delta >= shift && delta < shift + numTiles);
      });
      const setter = () => mapShift([dx + shift * scale, dy, scale]);
      return { tiles, setter };
    }).filter(set => set.tiles.length);

    return { translate, scale, subsets };
  }

  function initTilesetPainter(styleProg) {
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

      styleProg.setup(zoom, pixRatio, cameraScale);

      const { translate, scale, subsets } = setGrid(tileset, pixRatio);

      subsets.forEach(({ setter, tiles }) => {
        setter();
        tiles.forEach(t => drawTile(t, translate, scale));
      });
    };
  }

  return initTilesetPainter;
}
