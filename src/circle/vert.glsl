attribute vec2 quadPos; // Vertices of the quad instance
attribute vec2 circlePos;
attribute float radius;
attribute vec4 color;
attribute float opacity;

varying vec2 delta;
varying vec4 strokeStyle;
varying float circleRadius;

void main() {
  vec2 mapPos = tileToMap(circlePos);

  // Shift to the appropriate corner of the current instance quad
  delta = 2.0 * quadPos * (radius + 1.0);
  vec2 dPos = delta * styleScale(circlePos);

  strokeStyle = color * opacity;
  // TODO: normalize delta? Then can drop one varying
  circleRadius = radius;

  gl_Position = mapToClip(mapPos + dPos, 0.0);
}
