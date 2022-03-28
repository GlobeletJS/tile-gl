import { camelCase } from "./camelCase.js";

export function initStyleProg(style, program, framebuffer) {
  const { id, type, layout, paint } = style;
  const { sdf, screenScale } = program.uniformSetters;

  if (type === "line") {
    // We handle line-miter-limit in the paint phase, not layout phase
    paint["line-miter-limit"] = layout["line-miter-limit"];
  }

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
    zoomFuncs.forEach(f => f(zoom));
    if (!screenScale) return;
    const { width, height } = framebuffer.size;
    screenScale([2 / width, -2 / height, pixRatio, cameraScale]);
  }

  function getFeatures(tile) {
    const { layers: { [id]: layer }, atlas } = tile.data;
    if (sdf && atlas) sdf(atlas);
    return layer;
  }

  function initBackgroundData() {
    const buffers = program.load({});
    return () => ({ buffers });
  }

  const getData = (type === "background") ? initBackgroundData() : getFeatures;

  return { setStyles, getData };
}
