import preamble from "./preamble.glsl";
import simpleScale from "./scale.glsl";
import mercatorScale from "./merc-scale.glsl";

export function setParams(userParams) {
  const { context, framebuffer, projScale } = userParams;

  const scaleCode = (projScale) ? mercatorScale : simpleScale;

  return {
    context,
    framebuffer,
    preamble: preamble + scaleCode,
  };
}
