precision highp float;

attribute vec2 a_position;

uniform vec3 tileTransform; // shiftX, shiftY, scale
uniform vec3 screenScale;   // 2 / width, -2 / height, pixRatio
uniform vec2 translation;   // From style property paint["fill-translate"]

void main() {
  // Transform from tile to map coordinates
  vec2 mapPos = a_position * tileTransform.z + tileTransform.xy + translation;

  // Convert to clipspace coordinates
  vec2 projected = mapPos * screenScale.xy + vec2(-1.0, 1.0);
  gl_Position = vec4(projected, 0, 1);
}
