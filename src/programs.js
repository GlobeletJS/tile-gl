import * as yawgl from 'yawgl';
import textVertSrc from "./shaders/text-vertex.glsl";
import textFragSrc from "./shaders/text-fragment.glsl";
import fillVertSrc from "./shaders/fill-vertex.glsl";
import fillFragSrc from "./shaders/fill-fragment.glsl";
import strokeVertSrc from "./shaders/stroke-vertex.glsl";
import strokeFragSrc from "./shaders/stroke-fragment.glsl";
import circleVertSrc from "./shaders/circle-vertex.glsl";
import circleFragSrc from "./shaders/circle-fragment.glsl";

export function initPrograms(gl, uniforms) {
  const programs = {
    text: yawgl.initProgram(gl, textVertSrc, textFragSrc),
    fill: yawgl.initProgram(gl, fillVertSrc, fillFragSrc),
    stroke: yawgl.initProgram(gl, strokeVertSrc, strokeFragSrc),
    circle: yawgl.initProgram(gl, circleVertSrc, circleFragSrc),
  };

  function fillText(buffers) {
    let { textVao, numInstances } = buffers;
    programs.text.setupDraw({ uniforms, vao: textVao });
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, numInstances);
    gl.bindVertexArray(null);
  }

  function fill(buffers) {
    let { fillVao, indices: { vertexCount, type, offset } } = buffers;
    programs.fill.setupDraw({ uniforms, vao: fillVao });
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    gl.bindVertexArray(null);
  }

  function stroke(buffers) {
    let { strokeVao, circleVao, numInstances } = buffers;
    if (strokeVao) {
      programs.stroke.setupDraw({ uniforms, vao: strokeVao });
    } else if (circleVao) {
      programs.circle.setupDraw({ uniforms, vao: circleVao });
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

    constructTextVao: programs.text.constructVao,
    constructFillVao: programs.fill.constructVao,
    constructStrokeVao: programs.stroke.constructVao,
    constructCircleVao: programs.circle.constructVao,
  };
}
