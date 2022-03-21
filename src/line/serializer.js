export const lineInfo = {
  styleKeys: [
    "line-color",
    "line-opacity",
    "line-width",
    "line-gap-width",
  ],
  serialize: flattenLines,
  getLength: (buffers) => buffers.lines.length / 3,
};

function flattenLines(feature) {
  const { type, coordinates } = feature.geometry;
  if (!coordinates || !coordinates.length) return;

  switch (type) {
    case "LineString":
      return ({ lines: flattenLineString(coordinates) });
    case "MultiLineString":
      return ({ lines: coordinates.flatMap(flattenLineString) });
    case "Polygon":
      return ({ lines: flattenPolygon(coordinates) });
    case "MultiPolygon":
      return ({ lines: coordinates.flatMap(flattenPolygon) });
    default:
      return;
  }
}

function flattenLineString(line) {
  const distances = getDistances(line);
  return [
    ...line[0], -999.0,
    ...line.flatMap(([x, y], i) => [x, y, distances[i]]),
    ...line[line.length - 1], -999.0,
  ];
}

function flattenPolygon(rings) {
  return rings.flatMap(flattenLinearRing);
}

function flattenLinearRing(ring) {
  // Definition of linear ring:
  // ring.length > 3 && ring[ring.length - 1] == ring[0]
  const distances = getDistances(ring);
  return [
    ...ring[ring.length - 2], -999.0,
    ...ring.flatMap(([x, y], i) => [x, y, distances[i]]),
    ...ring[1], -999.0,
  ];
}

function getDistances(line) {
  let d = 0.0;
  const distances = line.slice(1).map((c, i) => d += dist(line[i], c));
  distances.unshift(0.0);
  return distances;
}

function dist([x0, y0], [x1, y1]) {
  return Math.hypot(x1 - x0, y1 - y0);
}
