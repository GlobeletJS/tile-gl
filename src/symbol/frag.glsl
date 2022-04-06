#version 300 es

precision highp float;

uniform sampler2D sprite, sdf;

in vec2 texCoord;

in float opacity;

in vec4 fillColor;
in vec4 haloColor;
in vec2 haloSize; // width, blur
in float taperWidth; // 0 for icons

out vec4 pixColor;

void main() {
  // Get color from sprite if this is an icon glyph
  vec4 spritePix = texture(sprite, texCoord);
  // Input sprite does NOT have pre-multiplied alpha
  vec4 iconColor = vec4(spritePix.rgb * spritePix.a, spritePix.a) * opacity;

  // Compute fill and halo color from sdf if this is a text glyph
  float sdfVal = texture(sdf, texCoord).a;
  float screenDist = taperWidth * (191.0 - 255.0 * sdfVal) / 32.0;

  float fillAlpha = smoothstep(-0.707, 0.707, -screenDist);
  float hEdge = haloSize.x - haloSize.y / 2.0;
  float hTaper = haloSize.x + haloSize.y / 2.0;
  float haloAlpha = (haloSize.x > 0.0 || haloSize.y > 0.0)
    ? (1.0 - fillAlpha) * smoothstep(-hTaper, -hEdge, -screenDist)
    : 0.0;
  vec4 textColor = fillColor * fillAlpha + haloColor * haloAlpha;

  // Choose icon or text color based on taperWidth value
  pixColor = (taperWidth == 0.0) ? iconColor : textColor;
}
