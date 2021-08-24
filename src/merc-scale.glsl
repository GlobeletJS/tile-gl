const float TWOPI = 6.28318530718;

float mercatorScale(float yWeb) {
  // Convert Web Mercator Y to standard Mercator Y
  float yMerc = TWOPI * (0.5 - yWeb);
  return 0.5 * (exp(yMerc) + exp(-yMerc)); // == cosh(y)
}

float styleScale(vec2 tilePos) {
  float y = (tileCoords.y + tilePos.y / mapCoords.w) / exp2(tileCoords.z);
  return screenScale.z * mercatorScale(y) / screenScale.w;
}
