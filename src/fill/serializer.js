import earcut from 'earcut';

export function initFillParsing(style) {
  // TODO: check for property-dependence of globalAlpha
  const getColor = style.paint["fill-color"];

  return function(feature) {
    const triangles = triangulate(feature.geometry);
    if (!triangles) return;

    const buffers = {
      vertices: triangles.vertices,
      indices: triangles.indices,
    };

    if (getColor.type === "property") {
      let color = getColor(null, feature);
      buffers.colors = Array
        .from({ length: triangles.vertices.length / 2 })
        .flatMap(v => color);
    }

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
