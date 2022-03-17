import singlePreamble from "./single-tile.glsl";
import multiPreamble from "./multi-tile.glsl";
import simpleScale from "./scale.glsl";
import mercatorScale from "./merc-scale.glsl";

export function setParams(userParams) {
  const {
    context, framebuffer,
    projScale = false,
    multiTile = true,
  } = userParams;

  const preamble = (multiTile) ? multiPreamble : singlePreamble;
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
