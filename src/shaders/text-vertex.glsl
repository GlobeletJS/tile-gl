precision highp float;

attribute vec2 quadPos;  // Vertices of the quad instance
attribute vec2 labelPos; // x, y
attribute vec3 charPos;  // dx, dy, scale (relative to labelPos)
attribute vec4 sdfRect;  // x, y, w, h

uniform vec3 tileTransform; // shiftX, shiftY, scale
uniform vec3 screenScale;   // 2 / width, -2 / height, pixRatio

varying vec2 texCoord;

void main() {
  texCoord = sdfRect.xy + sdfRect.zw * quadPos;

  // Transform label position from tile to map coordinates
  vec2 mapPos = labelPos * tileTransform.z + tileTransform.xy;

  // Shift to the appropriate corner of the current instance quad
  vec2 dPos = (charPos.xy + sdfRect.zw * quadPos) * charPos.z;
  vec2 vPos = mapPos + dPos * screenScale.z;

  // Convert to clipspace coordinates
  vec2 projected = vPos * screenScale.xy + vec2(-1.0, 1.0);

  gl_Position = vec4(projected, 0, 1);
}
