import { initTransform } from "./transform.js";
import { initUniforms } from "./uniforms.js";
import { initPrograms } from "./programs.js";

export function initGLpaint(gl, framebuffer, framebufferSize) {
  // Input is an extended WebGL context, as created by yawgl.getExtendedContext
  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  const transform = initTransform(framebufferSize);
  const uniforms = initUniforms(transform.matrix);
  const programs = initPrograms(gl, uniforms.values);

  const api = {
    gl,
    canvas: framebufferSize,
    bindFramebufferAndSetViewport,

    save: () => null,
    restore,
    clear,
    clearRect: () => clear(), // TODO: clipRect() before clear()?
    clipRect,
    fillRect,
  };

  Object.assign(api, transform.methods, programs);
  Object.defineProperties(api,
    Object.getOwnPropertyDescriptors(uniforms.setters)
  );

  return api;

  function clear(color = [0.0, 0.0, 0.0, 0.0]) {
    gl.disable(gl.SCISSOR_TEST);
    gl.clearColor(...color);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  function clipRect(x, y, width, height) {
    gl.enable(gl.SCISSOR_TEST);
    let yflip = framebufferSize.height - y - height;
    let roundedArgs = [x, yflip, width, height].map(Math.round);
    gl.scissor(...roundedArgs);
  }

  function restore() {
    gl.disable(gl.SCISSOR_TEST);
    transform.methods.setTransform(1, 0, 0, 1, 0, 0);
  }

  function fillRect(x, y, width, height) {
    clipRect(x, y, width, height);
    let opacity = uniforms.values.globalAlpha;
    let color = uniforms.values.fillStyle.map(c => c * opacity);
    clear(color);
  }

  function bindFramebufferAndSetViewport() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    let { width, height } = framebufferSize;
    gl.viewport(0, 0, width, height);
  }
}
