#version 300 es

precision mediump float;

uniform vec4 backgroundColor;
uniform float backgroundOpacity;

out vec4 pixColor;

void main() {
  float alpha = backgroundColor.a * backgroundOpacity;
  pixColor = vec4(backgroundColor.rgb * alpha, alpha);
}
