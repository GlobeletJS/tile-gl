import preamble from "./preamble.glsl";
import simpleScale from "./scale.glsl";
import mercatorScale from "./merc-scale.glsl";

export function setParams(userParams) {
  const {
    context, framebuffer,
    projScale = false,
    multiTile = true,
  } = userParams;

  const scaleCode = (projScale) ? mercatorScale : simpleScale;
  const size = framebuffer.size;

  context.clipRectFlipY = function(x, y, w, h) {
    const yflip = size.height - y - h;
    context.clipRect(x, yflip, w, h);
  };

  return {
    context, framebuffer, multiTile,
    preamble: preamble + scaleCode,
  };
}
