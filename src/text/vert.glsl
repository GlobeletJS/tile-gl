attribute vec2 quadPos;  // Vertices of the quad instance
attribute vec3 labelPos; // x, y, font size scalar
attribute vec4 charPos;  // dx, dy (relative to labelPos), w, h
attribute vec4 sdfRect;  // x, y, w, h
attribute vec4 color;
attribute float opacity;

varying float taperWidth;
varying vec2 texCoord;
varying vec4 fillStyle;

void main() {
  taperWidth = labelPos.z * screenScale.z;
  texCoord = sdfRect.xy + sdfRect.zw * quadPos;
  fillStyle = color * opacity;

  vec2 mapPos = tileToMap(labelPos.xy);

  // Shift to the appropriate corner of the current instance quad
  float projScale = screenScale.z * projectionScale(labelPos.xy);
  vec2 dPos = (charPos.xy + charPos.zw * quadPos) * projScale;

  gl_Position = mapToClip(mapPos + dPos, 0.0);
}
