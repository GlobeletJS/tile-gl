precision highp float;

uniform vec3 tileTransform; // shiftX, shiftY, scale

vec2 tileToMap(vec2 tilePos) {
  return tilePos * tileTransform.z + tileTransform.xy;
}
