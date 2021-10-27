attribute vec2 quadPos;  // Vertices of the quad instance
attribute vec4 labelPos; // x, y, angle, font size scalar
attribute vec4 charPos;  // dx, dy (relative to labelPos), w, h
attribute vec4 sdfRect;  // x, y, w, h
attribute vec4 textColor;
attribute float textOpacity;

varying float taperWidth;
varying vec2 texCoord;
varying vec4 fillStyle;

void main() {
  taperWidth = labelPos.w * screenScale.z;
  texCoord = sdfRect.xy + sdfRect.zw * quadPos;
  fillStyle = textColor * textOpacity;

  vec2 mapPos = tileToMap(labelPos.xy);

  // Shift to the appropriate corner of the current instance quad
  vec2 dPos = (charPos.xy + charPos.zw * quadPos) * styleScale(labelPos.xy);

  float cos_a = cos(labelPos.z);
  float sin_a = sin(labelPos.z);
  float dx = dPos.x * cos_a - dPos.y * sin_a;
  float dy = dPos.x * sin_a + dPos.y * cos_a;

  gl_Position = mapToClip(mapPos + vec2(dx, dy), 0.0);
}
