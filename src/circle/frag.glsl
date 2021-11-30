#version 300 es

precision mediump float;

in vec2 delta;
in vec4 strokeStyle;
in float radius;

out vec4 pixColor;

void main() {
  float r = length(delta);
  float dr = fwidth(r);

  float taper = 1.0 - smoothstep(radius - dr, radius + dr, r);
  pixColor = strokeStyle * taper;
}
