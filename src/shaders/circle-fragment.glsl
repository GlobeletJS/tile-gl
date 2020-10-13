precision mediump float;

uniform highp float circleRadius;
uniform vec4 fillStyle;
uniform float globalAlpha;

varying vec2 delta;

void main() {
  float radius = length(delta);
  float dr = fwidth(radius);

  float taper = 1.0 - smoothstep(circleRadius - dr, circleRadius + dr, radius);
  gl_FragColor = fillStyle * globalAlpha * taper;
}
