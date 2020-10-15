import earcut from 'earcut';
import { flattenLines } from "./line.js";

export function parseFill(feature) {
  const { geometry, properties } = feature;

  // Normalize coordinate structure
  var { type, coordinates } = geometry;
  if (type === "Polygon") {
    coordinates = [coordinates];
  } else if (type !== "MultiPolygon") {
    return feature; // Triangulation only makes sense for Polygons/MultiPolygons
  }

  const combined = coordinates
    .map(coord => {
      let { vertices, holes, dimensions } = earcut.flatten(coord);
      let indices = earcut(vertices, holes, dimensions);
      return { vertices, indices };
    })
    .reduce((accumulator, current) => {
      let indexShift = accumulator.vertices.length / 2;
      accumulator.vertices.push(...current.vertices);
      accumulator.indices.push(...current.indices.map(h => h + indexShift));
      return accumulator;
    });

  const buffers = {
    vertices: combined.vertices,
    indices: combined.indices,
    lines: flattenLines(geometry), // For rendering the outline
  };

  return { properties, buffers };
}
