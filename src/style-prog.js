import { camelCase } from "./camelCase.js";

export function initStyleProg(style, spriteTexture, styleKeys, program) {
  const { id, type, paint } = style;
  const { sdf, sprite } = program.uniformSetters;
  const haveSprite = sprite && (spriteTexture instanceof WebGLTexture);

  const zoomFuncs = styleKeys
    .filter(styleKey => paint[styleKey].type !== "property")
    .map(styleKey => {
      const get = paint[styleKey];
      const shaderVar = camelCase(styleKey);
      const set = program.uniformSetters[shaderVar];
      return (z, f) => set(get(z, f));
    });

  function setStyles(zoom) {
    program.use();
    zoomFuncs.forEach(f => f(zoom));
    if (haveSprite) sprite(spriteTexture);
  }

  const getData = (type !== "symbol") ? getFeatures :
    (haveSprite) ? getIcons : getText;

  function getFeatures(tile) {
    return tile.data.layers[id];
  }

  function getIcons(tile) {
    const layer = tile.data.layers[id];
    if (!layer) return;
    const { type, extent, buffers: { sprite } } = layer;
    if (sprite) return { type, extent, buffers: sprite };
  }

  function getText(tile) {
    const { layers: { [id]: layer }, atlas } = tile.data;
    if (!layer || !atlas) return;
    const { type, extent, buffers: { text } } = layer;
    if (!text || !sdf) return;
    sdf(atlas);
    return { type, extent, buffers: text };
  }

  return { setStyles, getData };
}
