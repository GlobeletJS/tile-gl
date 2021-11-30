in vec2 position;
in vec4 fillColor;
in float fillOpacity;

uniform vec2 fillTranslate;

out vec4 fillStyle;

void main() {
  vec2 mapPos = tileToMap(position) + fillTranslate * screenScale.z;

  fillStyle = fillColor * fillOpacity;

  gl_Position = mapToClip(mapPos, 0.0);
}
