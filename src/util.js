export function initSetters(pairs, uniformSetters) {
  return pairs
    .filter(([get]) => get.type !== "property")
    .map(([get, key]) => {
      const set = uniformSetters[key];
      return (z, f) => set(get(z, f));
    });
}

export function initVectorTilePainter(
  context, framebufferSize, layerId, setAtlas
) {
  return function(tileBox, translate, scale) {
    const { x, y, tile } = tileBox;
    const { layers, atlas } = tile.data;

    const data = layers[layerId];
    if (!data) return;

    const [x0, y0] = [x, y].map((c, i) => (c + translate[i]) * scale);
    const yflip = framebufferSize.height - y0 - scale;
    context.clipRect(x0, yflip, scale, scale);

    if (setAtlas && atlas) setAtlas(atlas);

    context.draw(data.buffers);
  };
}
