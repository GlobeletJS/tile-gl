precision mediump float;

varying vec2 delta;
varying vec4 strokeStyle;
varying float circleRadius;

void main() {
  float r = length(delta);
  float dr = fwidth(r);

  float taper = 1.0 - smoothstep(circleRadius - dr, circleRadius + dr, r);
  gl_FragColor = strokeStyle * taper;
}
