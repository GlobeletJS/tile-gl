import defaultPreamble from "./preamble.glsl";

export function setParams(userParams) {
  const {
    context, framebuffer,
    preamble = defaultPreamble,
    extraAttributes,
  } = userParams;

  const size = framebuffer.size;

  context.clipRectFlipY = function(x, y, w, h) {
    const yflip = size.height - y - h;
    context.clipRect(x, yflip, w, h);
  };

  return { context, framebuffer, preamble, extraAttributes };
}
