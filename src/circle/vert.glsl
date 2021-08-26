attribute vec2 quadPos; // Vertices of the quad instance
attribute vec2 circlePos;
attribute float circleRadius;
attribute vec4 circleColor;
attribute float circleOpacity;

varying vec2 delta;
varying vec4 strokeStyle;
varying float radius;

void main() {
  vec2 mapPos = tileToMap(circlePos);

  // Shift to the appropriate corner of the current instance quad
  delta = quadPos * (circleRadius + 1.0);
  vec2 dPos = delta * styleScale(circlePos);

  strokeStyle = circleColor * circleOpacity;
  // TODO: normalize delta? Then can drop one varying
  radius = circleRadius;

  gl_Position = mapToClip(mapPos + dPos, 0.0);
}
