attribute vec2 position;
attribute vec4 color;
attribute float opacity;

uniform vec2 translation;   // From style property paint["fill-translate"]

varying vec4 fillStyle;

void main() {
  vec2 mapPos = tileToMap(position) + translation * screenScale.z;

  fillStyle = color * opacity;

  gl_Position = mapToClip(mapPos, 0.0);
}
