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

export function initVectorTilePainter(context, program) {
  const { id, setAtlas, dataFuncs } = program;

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
    context.draw(feature.path);
  }
}
