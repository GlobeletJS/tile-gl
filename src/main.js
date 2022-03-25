import { setParams } from "./params.js";
import { initPrograms } from "./programs.js";

export function initGLpaint(userParams) {
  const params = setParams(userParams);
  const { context, framebuffer } = params;

  const { loadBuffers, loadSprite, initPainter } = initPrograms(params);

  function prep() {
    context.bindFramebufferAndSetViewport(framebuffer);
    return context.clear();
  }

  function loadAtlas(atlas) {
    const format = context.gl.ALPHA;
    const { width, height, data } = atlas;
    return context.initTexture({ format, width, height, data, mips: false });
  }

  return { prep, loadBuffers, loadAtlas, loadSprite, initPainter };
}
