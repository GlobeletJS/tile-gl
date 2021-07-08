export function initGrid(framebufferSize, useProgram, setters) {
  const { screenScale, mapCoords, mapShift } = setters;

  return function(tileset, pixRatio = 1) {
    useProgram();

    const { width, height } = framebufferSize;
    screenScale([2 / width, -2 / height, pixRatio]);

    const { x, y, z } = tileset[0];
    const numTiles = 1 << z;
    const xw = x - Math.floor(x / numTiles) * numTiles;
    const extent = 512; // TODO: don't assume this!!
    mapCoords([xw, y, z, extent]);

    const { translate, scale } = tileset;
    const pixScale = scale * pixRatio;
    const [dx, dy] = [x, y].map((c, i) => (c + translate[i]) * pixScale);

    // At low zooms, some tiles may be repeated on opposite ends of the map
    // We split them into subsets, with different values of mapShift
    // NOTE: Only accounts for repetition across X!
    const subsets = [];
    [0, 1, 2].forEach(addSubset);

    function addSubset(repeat) {
      const shift = repeat * numTiles;
      const tiles = tileset.filter(tile => {
        const delta = tile.x - x;
        return (delta >= shift && delta < shift + numTiles);
      });
      if (!tiles.length) return;
      const setter = () => mapShift([dx + shift * pixScale, dy, pixScale]);
      subsets.push({ tiles, setter });
    }

    return { translate, scale: pixScale, subsets };
  };
}

export function initTilesetPainter(setGrid, zoomFuncs, paintTile) {
  return function({ tileset, zoom, pixRatio = 1 }) {
    if (!tileset || !tileset.length) return;

    const { translate, scale, subsets } = setGrid(tileset, pixRatio);

    zoomFuncs.forEach(f => f(zoom));

    subsets.forEach(({ setter, tiles }) => {
      setter();
      tiles.forEach(box => paintTile(box, translate, scale));
    });
  };
}
