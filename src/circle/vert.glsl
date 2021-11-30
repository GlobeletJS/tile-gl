in vec2 quadPos; // Vertices of the quad instance
in vec2 circlePos;
in float circleRadius;
in vec4 circleColor;
in float circleOpacity;

out vec2 delta;
out vec4 strokeStyle;
out float radius;

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
