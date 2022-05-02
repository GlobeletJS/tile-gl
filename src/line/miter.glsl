uniform float lineMiterLimit;

vec2 rotate90(vec2 v) {
  return vec2(-v.y, v.x);
}

mat2 bisect(vec2 x, vec2 u) {
  // x and u are ASSUMED to be unit vectors
  vec2 y = rotate90(x);
  // Find which quadrant u is in
  bool posX = dot(u, x) >= 0.0;
  bool posY = dot(u, y) >= 0.0;

  // The sum is a bisector, but can be unstable if small (posX false)
  vec2 sum = normalize(x + u);
  vec2 dif = posY ? normalize(x - u) : normalize(u - x);
  vec2 m = posX ? sum : rotate90(dif);

  vec2 n = posY ? rotate90(-m) : rotate90(m);

  return mat2(m, n);
}

mat3 miterTransform(vec2 x, vec2 u, float pixWidth) {
  // x is ASSUMED to be a unit vector
  bool isCap = length(u) < 0.0001;
  vec2 uNorm = (isCap)
    ? x // Treat caps like 180 degree angles
    : normalize(u);

  // Get basis vectors of miter coordinate system
  mat2 m = bisect(x, uNorm);
  
  // Compute miter length
  float bevelLength = abs(dot(x, m[1]));
  float miterLength = (bevelLength > 0.0001)
    ? 1.0 / bevelLength
    : lineMiterLimit + 1.0;

  // Switch to a bevel if miter is too long
  float tm = (miterLength > lineMiterLimit)
    ? 0.5 * pixWidth * bevelLength
    : 0.5 * pixWidth * miterLength;

  // Endcaps have no miter joint, so shift coord out of the way
  float tn = isCap ? pixWidth : 0.0;

  return mat3(m[0].x, m[1].x, 0, m[0].y, m[1].y, 0, tm, tn, 1);
}

