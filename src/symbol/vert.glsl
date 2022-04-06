in vec2 quadPos;   // Vertices of the quad instance
in vec4 labelPos;  // x, y, angle, font size scalar (0 for icons)
in vec4 glyphPos;  // dx, dy (relative to labelPos), w, h
in vec4 glyphRect; // x, y, w, h

in float iconOpacity;

in vec4 textColor;
in float textOpacity;
in float textHaloBlur;
in vec4 textHaloColor;
in float textHaloWidth;

out vec2 texCoord;

out float opacity;

out vec4 fillColor;
out vec4 haloColor;
out vec2 haloSize; // width, blur
out float taperWidth;

void main() {
  // For icons only
  opacity = iconOpacity;

  // For text only
  taperWidth = labelPos.w * screenScale.z; // == 0.0 for icon glyphs
  haloSize = vec2(textHaloWidth, textHaloBlur) * screenScale.z;

  float fillAlpha = textColor.a * textOpacity;
  fillColor = vec4(textColor.rgb * fillAlpha, fillAlpha);
  float haloAlpha = textHaloColor.a * textOpacity;
  haloColor = vec4(textHaloColor.rgb * haloAlpha, haloAlpha);

  // Texture coordinates
  texCoord = glyphRect.xy + glyphRect.zw * quadPos;

  // Compute glyph position. First transform the label origin
  vec2 mapPos = tileToMap(labelPos.xy);

  // Shift to the appropriate corner of the current instance quad
  vec2 dPos = (glyphPos.xy + glyphPos.zw * quadPos) * styleScale(labelPos.xy);

  float cos_a = cos(labelPos.z);
  float sin_a = sin(labelPos.z);
  float dx = dPos.x * cos_a - dPos.y * sin_a;
  float dy = dPos.x * sin_a + dPos.y * cos_a;

  gl_Position = mapToClip(mapPos + vec2(dx, dy), 0.0);
}
