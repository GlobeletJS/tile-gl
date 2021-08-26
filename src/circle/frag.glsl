precision mediump float;

varying vec2 delta;
varying vec4 strokeStyle;
varying float radius;

void main() {
  float r = length(delta);
  float dr = fwidth(r);

  float taper = 1.0 - smoothstep(radius - dr, radius + dr, r);
  gl_FragColor = strokeStyle * taper;
}
