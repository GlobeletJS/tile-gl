import vert from "./vert.glsl";
import frag from "./frag.glsl";

export function initBackground(context) {
  const quadPos = context.initQuad();

  const styleKeys = ["background-color", "background-opacity"];

  return {
    vert, frag, styleKeys,
    getSpecialAttrs: () => ({ quadPos }),
    countInstances: () => 1,
  };
}
