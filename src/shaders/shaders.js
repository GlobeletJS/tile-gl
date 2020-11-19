import preamble from "./preamble.glsl";
import textVert from "./text-vertex.glsl";
import textFrag from "./text-fragment.glsl";
import fillVert from "./fill-vertex.glsl";
import fillFrag from "./fill-fragment.glsl";
import strokeVert from "./stroke-vertex.glsl";
import strokeFrag from "./stroke-fragment.glsl";
import circleVert from "./circle-vertex.glsl";
import circleFrag from "./circle-fragment.glsl";

export const shaders = {
  text: {
    vert: preamble + textVert,
    frag: textFrag,
  },
  fill: {
    vert: preamble + fillVert,
    frag: fillFrag,
  },
  line: {
    vert: preamble + strokeVert,
    frag: strokeFrag,
  },
  circle: {
    vert: preamble + circleVert,
    frag: circleFrag,
  },
}
