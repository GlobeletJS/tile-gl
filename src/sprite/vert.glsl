attribute vec2 quadPos;    // Vertices of the quad instance
attribute vec3 labelPos0;   // x, y, angle
attribute vec4 spritePos;  // dx, dy (relative to labelPos0), w, h
attribute vec4 spriteRect; // x, y, w, h
attribute float iconOpacity;

varying float opacity;
varying vec2 texCoord;

void main() {
  texCoord = spriteRect.xy + spriteRect.zw * quadPos;
  opacity = iconOpacity;

  vec2 mapPos = tileToMap(labelPos0.xy);

  // Shift to the appropriate corner of the current instance quad
  vec2 dPos = (spritePos.xy + spritePos.zw * quadPos) * styleScale(labelPos0.xy);

  float cos_a = cos(labelPos0.z);
  float sin_a = sin(labelPos0.z);
  float dx = dPos.x * cos_a - dPos.y * sin_a;
  float dy = dPos.x * sin_a + dPos.y * cos_a;

  gl_Position = mapToClip(mapPos + vec2(dx, dy), 0.0);
}
