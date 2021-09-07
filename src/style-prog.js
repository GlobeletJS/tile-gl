import { camelCase } from "./camelCase.js";

export function initStyleProg(style, styleKeys, uniformSetters) {
  const { id, paint } = style;
  const { sdf } = uniformSetters;

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
  }

  function getData(tile) {
    const { layers, atlas } = tile.data;
    const data = layers[id];

    if (data && sdf && atlas) sdf(atlas);

    return data;
  }

  return { setStyles, getData };
}
