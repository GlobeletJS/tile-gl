attribute vec2 a_position;

uniform vec2 translation;   // From style property paint["fill-translate"]

void main() {
  vec2 mapPos = tileToMap(a_position) + translation * screenScale.z;

  gl_Position = mapToClip(mapPos, 0.0);
}
