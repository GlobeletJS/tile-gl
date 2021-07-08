import earcut from "earcut";

export function initFillParsing(style) {
  const { paint } = style;

  const dataFuncs = [
    [paint["fill-color"], "color"],
    [paint["fill-opacity"], "opacity"],
  ].filter(([get]) => get.type === "property");

  return function(feature, { z, x, y }) {
    const triangles = triangulate(feature.geometry);
    if (!triangles) return;

    const length = triangles.vertices.length / 2;

    const buffers = {
      position: triangles.vertices,
      indices: triangles.indices,
      tileCoords: Array.from({ length }).flatMap(() => [x, y, z]),
    };

    dataFuncs.forEach(([get, key]) => {
      const val = get(null, feature);
      buffers[key] = Array.from({ length }).flatMap(() => val);
    });

    return buffers;
  };
}

function triangulate(geometry) {
  const { type, coordinates } = geometry;

  switch (type) {
    case "Polygon":
      return indexPolygon(coordinates);
    case "MultiPolygon":
      return coordinates.map(indexPolygon).reduce((acc, cur) => {
        const indexShift = acc.vertices.length / 2;
        acc.vertices.push(...cur.vertices);
        acc.indices.push(...cur.indices.map(h => h + indexShift));
        return acc;
      });
    default:
      return;
  }
}

function indexPolygon(coords) {
  const { vertices, holes, dimensions } = earcut.flatten(coords);
  const indices = earcut(vertices, holes, dimensions);
  return { vertices, indices };
}
