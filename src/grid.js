export function initGrid(use, uniformSetters, framebuffer) {
  const { screenScale, mapCoords, mapShift } = uniformSetters;

  function setScreen(pixRatio = 1.0, cameraScale = 1.0) {
    const { width, height } = framebuffer.size;
    screenScale([2 / width, -2 / height, pixRatio, cameraScale]);
  }

  function setCoords({ x, y, z }) {
    const numTiles = 1 << z;
    const xw = x - Math.floor(x / numTiles) * numTiles;
    const extent = 512; // TODO: don't assume this!!
    mapCoords([xw, y, z, extent]);
  }

  function setShift(tileset, pixRatio = 1) {
    const { x, y } = tileset[0];
    const { translate, scale: rawScale } = tileset;
    const scale = rawScale * pixRatio;
    const [dx, dy] = [x, y].map((c, i) => (c + translate[i]) * scale);
    mapShift([dx, dy, scale]);
    return { translate, scale };
  }

  return { use, setScreen, setCoords, setShift };
}
