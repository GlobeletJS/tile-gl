precision highp float;

uniform sampler2D sdf;

varying vec4 fillColor;
varying vec4 haloColor;
varying vec2 haloSize; // width, blur
varying vec2 texCoord;
varying float taperWidth;

void main() {
  float sdfVal = texture2D(sdf, texCoord).a;
  float screenDist = taperWidth * (191.0 - 255.0 * sdfVal) / 32.0;

  float fillAlpha = smoothstep(-0.707, 0.707, -screenDist);
  float hEdge = haloSize.x - haloSize.y / 2.0;
  float hTaper = haloSize.x + haloSize.y / 2.0;
  float haloAlpha = (haloSize.x > 0.0 || haloSize.y > 0.0)
    ? (1.0 - fillAlpha) * smoothstep(-hTaper, -hEdge, -screenDist)
    : 0.0;

  gl_FragColor = fillColor * fillAlpha + haloColor * haloAlpha;
}
