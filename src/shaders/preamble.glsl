precision highp float;

attribute vec3 tileCoords;

uniform vec4 mapCoords; // x, y, z, extent of tileset[0]
uniform vec3 mapShift;  // translate and scale of tileset[0]

vec2 tileToMap(vec2 tilePos) {
  // Find distance of this tile from top left tile, in tile units
  float zoomFac = exp2(mapCoords.z - tileCoords.z);
  vec2 dTile = zoomFac * tileCoords.xy - mapCoords.xy;
  dTile.x += (dTile.x < 0.0) ? exp2(mapCoords.z) : 0.0;

  // Convert to a translation in pixels
  vec2 tileTranslate = dTile * mapShift.z + mapShift.xy;

  // Find scaling between tile coordinates and screen pixels
  float tileScale = zoomFac * mapShift.z / mapCoords.w;

  return tilePos * tileScale + tileTranslate;
}
