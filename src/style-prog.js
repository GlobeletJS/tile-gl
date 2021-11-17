import { camelCase } from "./camelCase.js";

export function initStyleProg(style, styleKeys, uniformSetters, spriteTexture) {
  // TODO: check if spriteTexture is a WebGLTexture
  const { id, type, paint } = style;
  const { sdf, sprite } = uniformSetters;
  const haveSprite = sprite && (spriteTexture instanceof WebGLTexture);

  const zoomFuncs = styleKeys
    .filter(styleKey => paint[styleKey].type !== "property")
    .map(styleKey => {
      const get = paint[styleKey];
      const shaderVar = camelCase(styleKey);
      const set = uniformSetters[shaderVar];
      return (z, f) => set(get(z, f));
    });

  function setStyles(zoom) {
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
    const buffers = layer.buffers.sprite;
    if (buffers) return { type: layer.type, extent: layer.extent, buffers };
  }

  function getText(tile) {
    const { layers, atlas } = tile.data;
    const layer = layers[id];
    if (!layer || !sdf || !atlas) return;
    sdf(atlas);
    const buffers = layer.buffers.text;
    return { type: layer.type, extent: layer.extent, buffers };
  }

  return { setStyles, getData };
}
