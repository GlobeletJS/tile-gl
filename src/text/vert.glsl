attribute vec2 quadPos;  // Vertices of the quad instance
attribute vec2 labelPos; // x, y
attribute vec3 charPos;  // dx, dy, scale (relative to labelPos)
attribute vec4 sdfRect;  // x, y, w, h
attribute vec4 color;
attribute float opacity;

varying vec2 texCoord;
varying vec4 fillStyle;

void main() {
  fillStyle = color * opacity;

  texCoord = sdfRect.xy + sdfRect.zw * quadPos;

  vec2 mapPos = tileToMap(labelPos);

  // Shift to the appropriate corner of the current instance quad
  float projScale = screenScale.z * projectionScale(labelPos);
  vec2 dPos = (charPos.xy + sdfRect.zw * quadPos) * charPos.z * projScale;

  gl_Position = mapToClip(mapPos + dPos, 0.0);
}
