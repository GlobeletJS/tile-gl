export function addTileCoords(tile, coords) {
  const { z, x, y } = coords;

  Object.values(tile.layers).forEach(layer => {
    const { length, buffers } = layer;
    const coordArray = Array.from({ length }).flatMap(() => [x, y, z]);
    buffers.tileCoords = new Float32Array(coordArray);
  });

  return tile;
}
