precision highp float;
attribute vec2 a_position;

uniform vec2 scalar, skew, translation;

void main() {
  vec2 projected = scalar * a_position + skew * a_position.yx + translation;
  gl_Position = vec4(projected, 0, 1);
}
