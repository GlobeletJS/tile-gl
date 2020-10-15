precision highp float;

attribute vec2 quadPos; // Vertices of the quad instance
attribute vec2 circlePos;

uniform mat3 projection;
uniform float lineWidth;

varying vec2 delta;

void main() {
  float extend = 2.0; // Extra space in the quad for tapering
  delta = (lineWidth + extend) * quadPos;
  vec2 vPos = circlePos + delta;

  vec2 projected = (projection * vec3(vPos, 1)).xy;
  gl_Position = vec4(projected, 0, 1);
}
