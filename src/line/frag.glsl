#version 300 es

precision highp float;

in float yCoord;
flat in vec2 lineSize; // lineWidth, lineGapWidth
in vec2 miterCoord1, miterCoord2;
flat in vec4 strokeStyle;
flat in float dashPattern[4];
in float lineSoFar;

out vec4 pixColor;

float taper(float edge, float width, float x) {
  return smoothstep(edge - width, edge + width, x);
}

float muteGap(float start, float end, float ramp, float x) {
  return (start < end)
    ? 1.0 - taper(start, ramp, x) * taper(-end, ramp, -x)
    : 1.0;
}

void main() {
  float step0 = fwidth(yCoord) * 0.707;
  vec2 step1 = fwidth(miterCoord1) * 0.707;
  vec2 step2 = fwidth(miterCoord2) * 0.707;

  // Antialiasing tapers for line edges
  float hGap = 0.5 * lineSize.y;
  float inner = (hGap > 0.0) ? taper(hGap, step0, abs(yCoord)) : 1.0;
  float hWidth = (hGap > 0.0) ? hGap + lineSize.x : 0.5 * lineSize.x;
  float outer = taper(-hWidth, step0, -abs(yCoord));
  float antialias = inner * outer;

  // Bevels, endcaps: Use smooth taper for antialiasing
  float taperx =
    taper(0.0, step1.x, miterCoord1.x) * 
    taper(0.0, step2.x, miterCoord2.x);

  // Miters: Use hard step, slightly shifted to avoid overlap at center
  float tapery = 
    step(-0.01 * step1.y, miterCoord1.y) *
    step(0.01 * step2.y, miterCoord2.y);

  // Dashes
  float dashX = fract(lineSoFar);
  float stepD = fwidth(lineSoFar) * 0.707;
  float gap1 = muteGap(dashPattern[0], dashPattern[1], stepD, dashX);
  float gap2 = muteGap(dashPattern[2], dashPattern[3], stepD, dashX);
  float dashMute = min(gap1, gap2);

  pixColor = strokeStyle * antialias * taperx * tapery * dashMute;
}
