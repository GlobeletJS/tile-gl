export function antiMeridianSplit(tileset) {
  // At low zooms, some tiles may be repeated on opposite ends of the map
  // We split them into subsets, one tileset for each copy of the map

  const { 0: { x, z }, translate, scale } = tileset;
  const numTiles = 1 << z;

  function inRange(tile, shift) {
    const delta = tile.x - x - shift;
    return (0 <= delta && delta < numTiles);
  }

  return [0, 1, 2]
    .map(repeat => repeat * numTiles)
    .map(shift => tileset.filter(tile => inRange(tile, shift)))
    .map(tiles => Object.assign(tiles, { translate, scale }))
    .filter(subset => subset.length);
}
