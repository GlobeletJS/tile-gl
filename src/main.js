import { setParams } from "./params.js";
import { compilePrograms } from "./compile.js";
import { initStyleProg } from "./style-prog.js";
import { initSprite } from "./sprite.js";

export function initGL(userParams) {
  const params = setParams(userParams);
  const { context, framebuffer } = params;
  const programs = compilePrograms(params);
  const sprite = initSprite(context, programs);

  return { prep, loadAtlas, loadBuffers, loadSprite: sprite.load, initPainter };

  function prep() {
    context.bindFramebufferAndSetViewport(framebuffer);
    sprite.set();
    return context.clear();
  }

  function loadAtlas(atlas) { // TODO: name like loadSprite, different behavior
    const format = context.gl.ALPHA;
    const { width, height, data } = atlas;
    return context.initTexture({ format, width, height, data, mips: false });
  }

  function loadBuffers(layer) {
    const program = programs[layer.type];
    if (!program) throw Error("tile-gl loadBuffers: unknown layer type");
    layer.buffers = program.load(layer.buffers);
  }

  function initPainter(style) {
    return initStyleProg(style, programs[style.type], context, framebuffer);
  }
}
