#version 300 es

precision highp float;

uniform sampler2D sdf;

in vec4 fillColor;
in vec4 haloColor;
in vec2 haloSize; // width, blur
in vec2 texCoord;
in float taperWidth;

out vec4 pixColor;

void main() {
  float sdfVal = texture(sdf, texCoord).a;
  float screenDist = taperWidth * (191.0 - 255.0 * sdfVal) / 32.0;

  float fillAlpha = smoothstep(-0.707, 0.707, -screenDist);
  float hEdge = haloSize.x - haloSize.y / 2.0;
  float hTaper = haloSize.x + haloSize.y / 2.0;
  float haloAlpha = (haloSize.x > 0.0 || haloSize.y > 0.0)
    ? (1.0 - fillAlpha) * smoothstep(-hTaper, -hEdge, -screenDist)
    : 0.0;

  pixColor = fillColor * fillAlpha + haloColor * haloAlpha;
}
