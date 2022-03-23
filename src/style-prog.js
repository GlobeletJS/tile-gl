import { camelCase } from "./camelCase.js";

export function initStyleProg(style, spriteTexture, info, framebuffer) {
  const { id, type, paint } = style;
  const { styleKeys, program } = info;

  const { sdf, sprite, screenScale } = program.uniformSetters;
  const haveSprite = sprite && (spriteTexture instanceof WebGLTexture);

  const zoomFuncs = styleKeys
    .filter(styleKey => paint[styleKey].type !== "property")
    .map(styleKey => {
      const get = paint[styleKey];
      const shaderVar = camelCase(styleKey);
      const set = program.uniformSetters[shaderVar];
      return (z, f) => set(get(z, f));
    });

  function setStyles(zoom, pixRatio, cameraScale = 1.0) {
    program.use();
    const { width, height } = framebuffer.size;
    screenScale([2 / width, -2 / height, pixRatio, cameraScale]);
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
