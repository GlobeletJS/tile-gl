import { antiMeridianSplit } from "./unwrap-tileset.js";

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

    program.setCoords(tileset[0]);
    const subsets = antiMeridianSplit(tileset);

    subsets.forEach(subset => {
      const { translate, scale } = program.setShift(subset, pixRatio);
      subset.forEach(t => drawTileBox(t, translate, scale));
    });
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
