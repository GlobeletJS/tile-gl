#version 300 es

precision highp float;

in float yCoord;
in vec2 lineSize; // lineWidth, lineGapWidth
in vec2 miterCoord1, miterCoord2;
in vec4 strokeStyle;

out vec4 pixColor;

void main() {
  float step0 = fwidth(yCoord) * 0.707;
  vec2 step1 = fwidth(miterCoord1) * 0.707;
  vec2 step2 = fwidth(miterCoord2) * 0.707;

  // Antialiasing tapers for line edges
  float hGap = 0.5 * lineSize.y;
  float inner = (hGap > 0.0)
    ? smoothstep(hGap - step0, hGap + step0, abs(yCoord))
    : 1.0;
  float hWidth = (hGap > 0.0)
    ? hGap + lineSize.x
    : 0.5 * lineSize.x;
  float outer = smoothstep(-hWidth - step0, -hWidth + step0, -abs(yCoord));
  float antialias = inner * outer;

  // Bevels, endcaps: Use smooth taper for antialiasing
  float taperx = 
    smoothstep(-step1.x, step1.x, miterCoord1.x) *
    smoothstep(-step2.x, step2.x, miterCoord2.x);

  // Miters: Use hard step, slightly shifted to avoid overlap at center
  float tapery = 
    step(-0.01 * step1.y, miterCoord1.y) *
    step(0.01 * step2.y, miterCoord2.y);

  pixColor = strokeStyle * antialias * taperx * tapery;
}
