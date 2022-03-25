import { camelCase } from "./camelCase.js";

export function initStyleProg(style, program, framebuffer) {
  const { id, paint } = style;
  const { sdf, screenScale } = program.uniformSetters;

  const zoomFuncs = program.styleKeys
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
  }

  function getData(tile) {
    const { layers: { [id]: layer }, atlas } = tile.data;
    if (sdf && atlas) sdf(atlas);
    return layer;
  }

  return { setStyles, getData };
}
