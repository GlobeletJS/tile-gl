in vec2 quadPos;
in vec3 pointA, pointB, pointC, pointD;
in vec4 lineColor;
in float lineOpacity, lineWidth, lineGapWidth;

uniform float lineMiterLimit;
const int numDashes = 4;
uniform float lineDasharray[numDashes];

out float yCoord;
flat out vec2 lineSize; // lineWidth, lineGapWidth
out vec2 miterCoord1, miterCoord2;
flat out vec4 strokeStyle;
flat out float dashPattern[numDashes];
out float lineSoFar;

mat3 miterTransform(vec2 xHat, vec2 yHat, vec2 v, float pixWidth) {
  // Find a coordinate basis vector aligned along the bisector
  bool isCap = length(v) < 0.0001; // TODO: think about units
  vec2 vHat = (isCap)
    ? xHat // Treat v = 0 like 180 deg turn
    : normalize(v);
  vec2 m0 = (dot(xHat, vHat) < -0.9999)
    ? yHat // For vHat == -xHat
    : normalize(xHat + vHat);
  
  // Find a perpendicular basis vector, pointing toward xHat
  float x_m0 = dot(xHat, m0);
  vec2 m1 = (x_m0 < 0.9999)
    ? normalize(xHat - vHat)
    : yHat;

  // Compute miter length
  float sin2 = 1.0 - x_m0 * x_m0; // Could be zero!
  float miterLength = (sin2 > 0.0001)
    ? inversesqrt(sin2)
    : lineMiterLimit + 1.0;
  float bevelLength = abs(dot(yHat, m0));
  float tx = (miterLength > lineMiterLimit)
    ? 0.5 * pixWidth * bevelLength
    : 0.5 * pixWidth * miterLength;

  float ty = isCap ? 1.2 * pixWidth : 0.0;

  return mat3(m0.x, m1.x, 0, m0.y, m1.y, 0, tx, ty, 1);
}

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
  vec2 yBasis = vec2(-xBasis.y, xBasis.x);

  // Get coordinate transforms for the miters
  float pixWidth = (lineGapWidth > 0.0)
    ? (lineGapWidth + 2.0 * lineWidth) * screenScale.z
    : lineWidth * screenScale.z;
  mat3 m1 = miterTransform(xBasis, yBasis, mapA - mapB, pixWidth);
  mat3 m2 = miterTransform(-xBasis, yBasis, mapD - mapC, pixWidth);

  // Find the position of the current instance vertex, in 3 coordinate systems
  vec2 extend = lineMiterLimit * xBasis * pixWidth * (quadPos.x - 0.5);
  // Add one pixel on either side of the line for the anti-alias taper
  float y = (pixWidth + 2.0) * quadPos.y;
  vec2 point = mapB + xAxis * quadPos.x + yBasis * y + extend;
  miterCoord1 = (m1 * vec3(point - mapB, 1)).xy;
  miterCoord2 = (m2 * vec3(point - mapC, 1)).xy;

  // Remove pixRatio from varying (we taper edges using unscaled value)
  yCoord = y / screenScale.z;
  lineSize = vec2(lineWidth, lineGapWidth);

  // TODO: should this premultiplication be done in tile-stencil?
  //vec4 premult = vec4(color.rgb * color.a, color.a);
  //strokeStyle = premult * opacity;
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
