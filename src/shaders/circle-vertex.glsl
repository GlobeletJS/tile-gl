attribute vec2 quadPos; // Vertices of the quad instance
attribute vec2 circlePos;

uniform vec3 screenScale;   // 2 / width, -2 / height, pixRatio
uniform float lineWidth;

varying vec2 delta;

void main() {
  vec2 mapPos = tileToMap(circlePos);

  // Shift to the appropriate corner of the current instance quad
  float extend = 2.0; // Extra space in the quad for tapering
  delta = (lineWidth + extend) * quadPos * screenScale.z;
  vec2 vPos = mapPos + delta;

  // Convert to clipspace coordinates
  vec2 projected = vPos * screenScale.xy + vec2(-1.0, 1.0);
  gl_Position = vec4(projected, 0, 1);
}
