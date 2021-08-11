precision highp float;

const float TWOPI = 6.28318530718;

attribute vec3 tileCoords;

uniform vec4 mapCoords;   // x, y, z, extent of tileset[0]
uniform vec3 mapShift;    // translate and scale of tileset[0]

uniform vec3 screenScale; // 2 / width, -2 / height, pixRatio

vec2 tileToMap(vec2 tilePos) {
  // Find distance of this tile from top left tile, in tile units
  float zoomFac = exp2(mapCoords.z - tileCoords.z);
  vec2 dTile = zoomFac * tileCoords.xy - mapCoords.xy;
  // tileCoords.x and mapCoords.x are both wrapped to the range [0..exp2(z)]
  // If the right edge of the tile is left of the map, we need to unwrap dTile
  dTile.x += (dTile.x + zoomFac <= 0.0) ? exp2(mapCoords.z) : 0.0;

  // Convert to a translation in pixels
  vec2 tileTranslate = dTile * mapShift.z + mapShift.xy;

  // Find scaling between tile coordinates and screen pixels
  float tileScale = zoomFac * mapShift.z / mapCoords.w;

  return tilePos * tileScale + tileTranslate;
}

float mercatorScale(float yWeb) {
  // Convert Web Mercator Y to standard Mercator Y
  float yMerc = TWOPI * (0.5 - yWeb);
  return 0.5 * (exp(yMerc) + exp(-yMerc)); // == cosh(y)
}

float cameraY() {
  // Find the distance (in tile units) between the screen center and 
  //  the top of the tileset
  float dTileY = (-1.0 / screenScale.y - mapShift.y) / mapShift.z;
  // Convert to Web Mercator Y
  return (dTileY + mapCoords.y) / exp2(mapCoords.z);
}

float projectionScale(vec2 tilePos) {
  float y = (tileCoords.y + tilePos.y / mapCoords.w) / exp2(tileCoords.z);
  return mercatorScale(y) / mercatorScale(cameraY());
}

vec4 mapToClip(vec2 mapPos, float z) {
  vec2 projected = mapPos * screenScale.xy + vec2(-1.0, 1.0);
  return vec4(projected, z, 1);
}
