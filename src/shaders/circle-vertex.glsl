attribute vec2 quadPos; // Vertices of the quad instance
attribute vec2 circlePos;

uniform float lineWidth;

varying vec2 delta;

void main() {
  vec2 mapPos = tileToMap(circlePos);

  // Shift to the appropriate corner of the current instance quad
  float extend = 2.0; // Extra space in the quad for tapering
  delta = (lineWidth + extend) * quadPos * screenScale.z;

  gl_Position = mapToClip(mapPos + delta, 0.0);
}
