import earcut from "earcut";

export const fillInfo = {
  styleKeys: ["fill-color", "fill-opacity"],
  serialize: triangulate,
  getLength: (buffers) => buffers.position.length / 2,
};

function triangulate(geometry) {
  const { type, coordinates } = geometry;
  if (!coordinates || !coordinates.length) return;

  switch (type) {
    case "Polygon":
      return indexPolygon(coordinates);
    case "MultiPolygon":
      return coordinates.map(indexPolygon).reduce((acc, cur) => {
        const indexShift = acc.position.length / 2;
        cur.position.forEach(c => acc.position.push(c));
        cur.indices.map(h => h + indexShift).forEach(c => acc.indices.push(c));
        return acc;
      });
    default:
      return;
  }
}

function indexPolygon(coords) {
  const { vertices, holes, dimensions } = earcut.flatten(coords);
  const indices = earcut(vertices, holes, dimensions);
  return { position: vertices, indices };
}
