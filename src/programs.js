import * as yawgl from 'yawgl';
import textVertSrc from "./shaders/text-vertex.glsl";
import textFragSrc from "./shaders/text-fragment.glsl";
import fillVertSrc from "./shaders/fill-vertex.glsl";
import fillFragSrc from "./shaders/fill-fragment.glsl";
import strokeVertSrc from "./shaders/stroke-vertex.glsl";
import strokeFragSrc from "./shaders/stroke-fragment.glsl";

export function initPrograms(gl, uniforms) {
  const textProgram = yawgl.initProgram(gl, textVertSrc, textFragSrc);
  const fillProgram = yawgl.initProgram(gl, fillVertSrc, fillFragSrc);
  const strokeProgram = yawgl.initProgram(gl, strokeVertSrc, strokeFragSrc);

  function fillText(buffers) {
    let { textVao, numInstances } = buffers;
    textProgram.setupDraw({ uniforms, vao: textVao });
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, numInstances);
    gl.bindVertexArray(null);
  }

  function fill(buffers) {
    let { fillVao, indices: { vertexCount, type, offset } } = buffers;
    fillProgram.setupDraw({ uniforms, vao: fillVao });
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    gl.bindVertexArray(null);
  }

  function stroke(buffers) {
    let { strokeVao, numInstances } = buffers;
    strokeProgram.setupDraw({ uniforms, vao: strokeVao });
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, numInstances);
    gl.bindVertexArray(null);
  }

  return {
    fillText,
    fill,
    stroke,

    constructTextVao: textProgram.constructVao,
    constructFillVao: fillProgram.constructVao,
    constructStrokeVao: strokeProgram.constructVao,
  };
}
