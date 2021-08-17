precision highp float;

uniform sampler2D sdf;

varying vec4 fillStyle;
varying vec2 texCoord;
varying float taperWidth;

void main() {
  float sdfVal = texture2D(sdf, texCoord).a;
  float screenDist = taperWidth * (191.0 - 255.0 * sdfVal) / 32.0;

  float alpha = smoothstep(-0.707, 0.707, -screenDist);
  gl_FragColor = fillStyle * alpha;
}
