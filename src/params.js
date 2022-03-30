import defaultPreamble from "./preamble.glsl";

export function setParams(userParams) {
  const {
    context, framebuffer, extraAttributes,
    preamble = defaultPreamble,
  } = userParams;

  return { context, framebuffer, preamble, extraAttributes };
}
