precision mediump float;

uniform highp float lineWidth;
uniform vec4 strokeStyle;
uniform float globalAlpha;

varying vec2 delta;

void main() {
  float r = length(delta);
  float dr = fwidth(r);
  float radius = lineWidth / 2.0;

  float taper = 1.0 - smoothstep(radius - dr, radius + dr, r);
  gl_FragColor = strokeStyle * globalAlpha * taper;
}
