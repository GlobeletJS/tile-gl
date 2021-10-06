export const circleInfo = {
  styleKeys: ["circle-radius", "circle-color", "circle-opacity"],
  serialize: flattenPoints,
  getLength: (buffers) => buffers.circlePos.length / 2,
};

function flattenPoints(geometry) {
  const { type, coordinates } = geometry;
  if (!coordinates || !coordinates.length) return;

  switch (type) {
    case "Point":
      return ({ circlePos: coordinates });
    case "MultiPoint":
      return ({ circlePos: coordinates.flat() });
    default:
      return;
  }
}
