export function initSetters(pairs, uniformSetters) {
  function pair([get, key]) {
    let set = uniformSetters[key];
    return (z, f) => set(get(z, f));
  }

  return {
    zoomFuncs: pairs.filter(p => p[0].type !== "property").map(pair),
    dataFuncs: pairs.filter(p => p[0].type === "property").map(pair),
  };
}

export function initGrid(context, useProgram, setters) {
  const { screenScale, mapCoords, mapShift } = setters;

  return function(tileset, pixRatio = 1) {
    useProgram();

    const { width, height } = context.canvas;
    screenScale([ 2 / width, -2 / height, pixRatio ]);

    const { x, y, z } = tileset[0];
    const j = 1 << z;
    const xw = x - Math.floor(x / j) * j;
    const extent = 512; // TODO: don't assume this!!
    mapCoords([xw, y, z, extent]);

    const { translate, scale } = tileset;
    const pixScale = scale * pixRatio;
    const [dx, dy] = [x, y].map((c, i) => (c + translate[i]) * pixScale);
    mapShift([dx, dy, pixScale]);

    return [translate, pixScale];
  };
}

export function initTilesetPainter(setGrid, zoomFuncs, paintTile) {
  return function({ tileset, zoom, pixRatio = 1 }) {
    if (!tileset || !tileset.length) return;

    const [translate, scale] = setGrid(tileset, pixRatio);

    zoomFuncs.forEach(f => f(zoom));

    tileset.forEach(box => paintTile(box, zoom, translate, scale));
  };
}

export function initVectorTilePainter(context, program) {
  const { id, setAtlas, dataFuncs, draw } = program;

  return function(tileBox, zoom, translate, scale) {
    const { x, y, tile } = tileBox;
    const { layers, atlas } = tile.data;

    const data = layers[id];
    if (!data) return;

    const [x0, y0] = [x, y].map((c, i) => (c + translate[i]) * scale);
    context.clipRect(x0, y0, scale, scale);

    if (setAtlas && atlas) setAtlas(atlas);

    data.compressed.forEach(f => drawFeature(zoom, f));
  };

  function drawFeature(zoom, feature) {
    dataFuncs.forEach(f => f(zoom, feature));
    draw(feature.path);
  }
}
