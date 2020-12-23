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

export function initVectorTilePainter(context, layerId, setAtlas) {
  return function(tileBox, translate, scale) {
    const { x, y, tile } = tileBox;
    const { layers, atlas } = tile.data;

    const data = layers[layerId];
    if (!data) return;

    const [x0, y0] = [x, y].map((c, i) => (c + translate[i]) * scale);
    context.clipRect(x0, y0, scale, scale);

    if (setAtlas && atlas) setAtlas(atlas);

    context.draw(data.buffers);
  };
}
