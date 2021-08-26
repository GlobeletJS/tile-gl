attribute vec2 position;
attribute vec4 fillColor;
attribute float fillOpacity;

uniform vec2 fillTranslate;

varying vec4 fillStyle;

void main() {
  vec2 mapPos = tileToMap(position) + fillTranslate * screenScale.z;

  fillStyle = fillColor * fillOpacity;

  gl_Position = mapToClip(mapPos, 0.0);
}
