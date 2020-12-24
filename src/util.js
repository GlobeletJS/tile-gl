export function initSetters(pairs, uniformSetters) {
  return pairs
    .filter(([get]) => get.type !== "property")
    .map(([get, key]) => {
      let set = uniformSetters[key];
      return (z, f) => set(get(z, f));
    });
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
