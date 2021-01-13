import { initProgram } from 'yawgl';
import { initAttributeMethods } from "./attributes.js";

export function initContext(gl) {
  // Input is an extended WebGL context, as created by yawgl.getExtendedContext
  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  const api = { gl,
    initProgram: (vert, frag) => initProgram(gl, vert, frag),

    bindFramebufferAndSetViewport,
    clear,
    clipRect,
    draw,
  };

  return Object.assign(api, initAttributeMethods(gl));

  function bindFramebufferAndSetViewport(framebuffer, { width, height }) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.viewport(0, 0, width, height);
  }

  function clear(color = [0.0, 0.0, 0.0, 0.0]) {
    gl.disable(gl.SCISSOR_TEST);
    gl.clearColor(...color);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  function clipRect(x, y, width, height) {
    gl.enable(gl.SCISSOR_TEST);
    let roundedArgs = [x, y, width, height].map(Math.round);
    gl.scissor(...roundedArgs);
  }

  function draw({ vao, indices, numInstances }) {
    gl.bindVertexArray(vao);
    if (indices) {
      let { vertexCount, type, offset } = indices;
      gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    } else {
      // Assume quad instances
      gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, numInstances);
    }
    gl.bindVertexArray(null);
  }
}
