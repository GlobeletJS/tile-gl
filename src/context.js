import preamble from "./preamble.glsl";
import { initProgram } from 'yawgl';
import { initQuad, initAttribute, initIndices, createBuffer } from "./attributes.js";

export function initContext(gl, framebuffer, framebufferSize) {
  // Input is an extended WebGL context, as created by yawgl.getExtendedContext
  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  return {
    gl,
    initQuad: (geom) => initQuad(gl, geom),
    initAttribute: (options) => initAttribute(gl, options),
    initIndices: (options) => initIndices(gl, options),
    createBuffer: (data) => createBuffer(gl, data),
    initProgram: (vert, frag) => initProgram(gl, preamble + vert, frag),
    canvas: framebufferSize,

    bindFramebufferAndSetViewport,
    clear,
    clipRect,
    drawInstancedQuads,
    drawElements,
  };

  function bindFramebufferAndSetViewport() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    let { width, height } = framebufferSize;
    gl.viewport(0, 0, width, height);
  }

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

  function drawInstancedQuads(vao, numInstances) {
    gl.bindVertexArray(vao);
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, numInstances);
    gl.bindVertexArray(null);
  }

  function drawElements(vao, indices) {
    const { vertexCount, type, offset } = indices;
    gl.bindVertexArray(vao);
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    gl.bindVertexArray(null);
  }
}
