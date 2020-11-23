attribute vec2 quadPos; // Vertices of the quad instance
attribute vec2 circlePos;

uniform float circleRadius;

varying vec2 delta;

void main() {
  vec2 mapPos = tileToMap(circlePos);

  // Shift to the appropriate corner of the current instance quad
  delta = 2.0 * quadPos * (circleRadius + 1.0);
  vec2 dPos = delta * screenScale.z;

  gl_Position = mapToClip(mapPos + dPos, 0.0);
}
