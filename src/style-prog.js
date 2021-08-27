import { camelCase } from "./camelCase.js";

export function initStyleProg(style, styleKeys, program, bufferSize) {
  const { id, paint } = style;
  const { use, uniformSetters } = program;
  const { sdf, screenScale } = uniformSetters;

  const zoomFuncs = styleKeys
    .filter(styleKey => paint[styleKey].type !== "property")
    .map(styleKey => {
      const get = paint[styleKey];
      const shaderVar = camelCase(styleKey);
      const set = uniformSetters[shaderVar];
      return (z, f) => set(get(z, f));
    });

  function setup(zoom, pixRatio = 1.0, cameraScale = 1.0) {
    use();
    const { width, height } = bufferSize;
    screenScale([2 / width, -2 / height, pixRatio, cameraScale]);
    zoomFuncs.forEach(f => f(zoom));
  }

  function getData(tile) {
    const { layers, atlas } = tile.data;
    const data = layers[id];

    if (data && sdf && atlas) sdf(atlas);

    return data;
  }

  return { setup, getData };
}
