export function initLineParsing(style) {
  const { paint } = style;

  // TODO: check for property-dependence of lineWidth, lineGapWidth
  const dataFuncs = [
    [paint["line-color"], "color"],
    [paint["line-opacity"], "opacity"],
  ].filter(([get]) => get.type === "property");

  return function(feature, { z, x, y }) {
    const lines = flattenLines(feature.geometry);
    if (!lines) return;

    const length = lines.length / 3;

    const buffers = {
      lines,
      tileCoords: Array.from({ length }).flatMap(() => [x, y, z]),
    };

    dataFuncs.forEach(([get, key]) => {
      let val = get(null, feature);
      buffers[key] = Array.from({ length }).flatMap(() => val);
    });

    return buffers;
  };
}

function flattenLines(geometry) {
  let { type, coordinates } = geometry;

  switch (type) {
    case "LineString":
      return flattenLineString(coordinates);
    case "MultiLineString":
      return coordinates.flatMap(flattenLineString);
    case "Polygon":
      return flattenPolygon(coordinates);
    case "MultiPolygon":
      return coordinates.flatMap(flattenPolygon);
    default:
      return;
  }
}

function flattenLineString(line) {
  return [
    ...[...line[0], -2.0],
    ...line.flatMap(([x, y]) => [x, y, 0.0]),
    ...[...line[line.length - 1], -2.0]
  ];
}

function flattenPolygon(rings) {
  return rings.flatMap(flattenLinearRing);
}

function flattenLinearRing(ring) {
  // Definition of linear ring:
  // ring.length > 3 && ring[ring.length - 1] == ring[0]
  return [
    ...[...ring[ring.length - 2], -2.0],
    ...ring.flatMap(([x, y]) => [x, y, 0.0]),
    ...[...ring[1], -2.0]
  ];
}
