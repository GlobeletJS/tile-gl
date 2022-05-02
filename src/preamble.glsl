#version 300 es

precision highp float;

uniform vec4 screenScale; // 2 / width, -2 / height, pixRatio, cameraScale

vec2 tileToMap(vec2 tilePos) {
  return tilePos * screenScale.z;
}

vec4 mapToClip(vec2 mapPos, float z) {
  vec2 projected = mapPos * screenScale.xy + vec2(-1.0, 1.0);
  return vec4(projected, z, 1.0);
}

float styleScale(vec2 tilePos) {
  return screenScale.z;
}

