import * as yawgl from 'yawgl';
import { shaders } from "./shaders/shaders.js";
import { initBufferLoader } from "./loaders/loader.js";
import { initAtlasLoader } from "./loaders/atlas.js";

export function initPrograms(gl, uniforms) {
  const programs = {
    text: yawgl.initProgram(gl, shaders.text.vert, shaders.text.frag),
    fill: yawgl.initProgram(gl, shaders.fill.vert, shaders.fill.frag),
    line: yawgl.initProgram(gl, shaders.line.vert, shaders.line.frag),
    circle: yawgl.initProgram(gl, shaders.circle.vert, shaders.circle.frag),
  };

  function fillText(buffers) {
    let { textVao, numInstances } = buffers;
    programs.text.setupDraw(uniforms);
    gl.bindVertexArray(textVao);
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, numInstances);
    gl.bindVertexArray(null);
  }

  function fill(buffers) {
    let { fillVao, indices: { vertexCount, type, offset } } = buffers;
    programs.fill.setupDraw(uniforms);
    gl.bindVertexArray(fillVao);
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    gl.bindVertexArray(null);
  }

  function stroke(buffers) {
    let { strokeVao, circleVao, numInstances } = buffers;
    if (strokeVao) {
      programs.line.setupDraw(uniforms);
      gl.bindVertexArray(strokeVao);
    } else if (circleVao) {
      programs.circle.setupDraw(uniforms);
      gl.bindVertexArray(circleVao);
    } else {
      return;
    }
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, numInstances);
    gl.bindVertexArray(null);
  }

  return {
    fillText,
    fill,
    stroke,

    loadBuffers: initBufferLoader(gl, programs),
    loadAtlas: initAtlasLoader(gl),
  };
}
