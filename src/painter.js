import { camelCase } from "./camelCase.js";

export function initTilePainter(context, style, styleKeys, setters) {
  const { id, paint } = style;
  const setAtlas = setters.sdf;

  const zoomFuncs = styleKeys
    .filter(styleKey => paint[styleKey].type !== "property")
    .map(styleKey => {
      const get = paint[styleKey];
      const shaderVar = camelCase(styleKey);
      const set = setters[shaderVar];
      return (z, f) => set(get(z, f));
    });

  function setStyles(zoom) {
    zoomFuncs.forEach(f => f(zoom));
  }

  function paintTile(tileBox, translate, scale, framebufferHeight) {
    const { x, y, tile } = tileBox;
    const { layers, atlas } = tile.data;

    const data = layers[id];
    if (!data) return;

    const [x0, y0] = [x, y].map((c, i) => (c + translate[i]) * scale);
    const yflip = framebufferHeight - y0 - scale;
    context.clipRect(x0, yflip, scale, scale);

    if (setAtlas && atlas) setAtlas(atlas);

    context.draw(data.buffers);
  }

  return { setStyles, paintTile };
}
