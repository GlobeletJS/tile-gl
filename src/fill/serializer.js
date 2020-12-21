import earcut from 'earcut';

export function initFillParsing(style) {
  const { paint } = style;

  const dataFuncs = [
    [paint["fill-color"],   "color"],
    [paint["fill-opacity"], "opacity"],
  ].filter(([get, key]) => get.type === "property");

  return function(feature, { z, x, y }) {
    const triangles = triangulate(feature.geometry);
    if (!triangles) return;

    const length = triangles.vertices.length / 2;

    const buffers = {
      position: triangles.vertices,
      indices: triangles.indices,
      tileCoords: Array.from({ length }).flatMap(v => [x, y, z]),
    };

    dataFuncs.forEach(([get, key]) => {
      let val = get(null, feature);
      buffers[key] = Array.from({ length }).flatMap(v => val);
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
        let indexShift = acc.vertices.length / 2;
        acc.vertices.push(...cur.vertices);
        acc.indices.push(...cur.indices.map(h => h + indexShift));
        return acc;
      });
    default:
      return;
  }
}

function indexPolygon(coords) {
  let { vertices, holes, dimensions } = earcut.flatten(coords);
  let indices = earcut(vertices, holes, dimensions);
  return { vertices, indices };
}
