precision highp float;

attribute vec2 quadPos; // Vertices of the quad instance
attribute vec2 labelPos, charPos;
attribute vec4 sdfRect; // x, y, w, h

uniform vec3 tileTransform; // shiftX, shiftY, scale
uniform vec3 screenScale;   // 2 / width, -2 / height, pixRatio
uniform float fontScale;

varying vec2 texCoord;

void main() {
  // Transform label position from tile to map coordinates
  vec2 mapPos = labelPos * tileTransform.z + tileTransform.xy;

  // Shift to the appropriate corner of the current instance quad
  vec2 dPos = sdfRect.zw * quadPos;
  texCoord = sdfRect.xy + dPos;
  vec2 vPos = mapPos + (charPos + dPos) * fontScale * screenScale.z;

  // Convert to clipspace coordinates
  vec2 projected = vPos * screenScale.xy + vec2(-1.0, 1.0);

  gl_Position = vec4(projected, 0, 1);
}
