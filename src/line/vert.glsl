in vec2 quadPos;
in vec3 pointA, pointB, pointC, pointD;
in vec4 lineColor;
in float lineOpacity, lineWidth, lineGapWidth;

const int numDashes = 4;
uniform float lineDasharray[numDashes];

out float yCoord;
flat out vec2 lineSize; // lineWidth, lineGapWidth
out vec2 miterCoord1, miterCoord2;
flat out vec4 strokeStyle;
flat out float dashPattern[numDashes];
out float lineSoFar;

float sumComponents(float[numDashes] v) {
  float sum = 0.0;
  for (int i = 0; i < v.length(); i++) {
    sum += v[i];
  }
  return sum;
}

void main() {
  // Transform vertex positions from tile to map coordinates
  vec2 mapA = tileToMap(pointA.xy);
  vec2 mapB = tileToMap(pointB.xy);
  vec2 mapC = tileToMap(pointC.xy);
  vec2 mapD = tileToMap(pointD.xy);

  vec2 xAxis = mapC - mapB;
  vec2 xBasis = normalize(xAxis);
  vec2 yBasis = rotate90(xBasis);

  float pixWidth = (lineGapWidth > 0.0)
    ? (lineGapWidth + 2.0 * lineWidth) * screenScale.z
    : lineWidth * screenScale.z;

  // Get coordinate transforms for the miters
  mat3 m1 = miterTransform(xBasis, mapA - mapB, pixWidth);
  mat3 m2 = miterTransform(-xBasis, mapD - mapC, pixWidth);

  // Position vertex, extending by miter length and line width + taper
  vec2 extend = mix(-m1[2][0], m2[2][0], quadPos.x) * xBasis;
  float y = (pixWidth + 2.0) * quadPos.y;
  vec2 point = mapB + xAxis * quadPos.x + extend + y * yBasis;

  // Compute positions in miter coordinates
  miterCoord1 = (m1 * vec3(point - mapB, 1)).xy;
  miterCoord2 = (m2 * vec3(point - mapC, 1)).xy;

  // Remove pixRatio from varying (we taper edges using unscaled value)
  yCoord = y / screenScale.z;
  lineSize = vec2(lineWidth, lineGapWidth);

  // TODO: should this premultiplication be done in tile-stencil?
  //strokeStyle = vec4(lineColor.rgb * lineColor.a, lineColor.a) * opacity;
  strokeStyle = lineColor * lineOpacity;

  float dashLength = sumComponents(lineDasharray) * lineWidth;
  if (dashLength <= 0.0) dashLength = 1.0;

  float dashScale = lineWidth / dashLength;
  dashPattern[0] = lineDasharray[0] * dashScale;
  for (int i = 1; i < lineDasharray.length(); i++) {
    dashPattern[i] = dashPattern[i - 1] + lineDasharray[i] * dashScale;
  }

  float xLen = length(xAxis) / screenScale.z;
  float extendRatio = length(extend) / screenScale.z / xLen;
  float stretch = xLen / (pointC.z - pointB.z);

  float dist0 = pointB.z * stretch / dashLength;
  float dDist = (pointC.z - pointB.z) * stretch / dashLength;
  float eDist = dDist * extendRatio;
  lineSoFar = dist0 - eDist + quadPos.x * (dDist + 2.0 * eDist);

  float z = (min(pointB.z, pointC.z) < 0.0) ? -2.0 : 0.0;

  gl_Position = mapToClip(point, z);
}
