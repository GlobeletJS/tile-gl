precision mediump float;

uniform highp float circleRadius;
uniform vec4 strokeStyle;
uniform float globalAlpha;

varying vec2 delta;

void main() {
  float r = length(delta);
  float dr = fwidth(r);

  float taper = 1.0 - smoothstep(circleRadius - dr, circleRadius + dr, r);
  gl_FragColor = strokeStyle * globalAlpha * taper;
}
