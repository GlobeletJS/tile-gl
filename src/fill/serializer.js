import earcut from 'earcut';

export function initFillParsing(style) {
  // TODO: check for property-dependence of globalAlpha, fillStyle

  return function(feature) {
    const triangles = triangulate(feature.geometry);
    if (!triangles) return;

    return {
      vertices: triangles.vertices,
      indices: triangles.indices,
    };
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
