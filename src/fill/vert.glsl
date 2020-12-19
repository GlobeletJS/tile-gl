attribute vec2 a_position;
attribute vec4 color;

uniform vec2 translation;   // From style property paint["fill-translate"]

varying vec4 fillStyle;

void main() {
  vec2 mapPos = tileToMap(a_position) + translation * screenScale.z;

  fillStyle = color;

  gl_Position = mapToClip(mapPos, 0.0);
}
