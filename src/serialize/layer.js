import { initSerializer } from "./feature.js";
import { concatBuffers } from "./concat-buffers.js";

export function initLayerSerializer(style) {
  const { id, type, interactive } = style;

  const transform = initSerializer(style);
  if (!transform) return;

  return function(layer, tileCoords, atlas, tree) {
    const { extent, features } = layer;

    const transformed = features.map(feature => {
      const { properties, geometry } = feature;
      const buffers = transform(feature, tileCoords, atlas, tree);
      // If no buffers, skip entire feature (it won't be rendered)
      if (buffers) return { properties, geometry, buffers };
    }).filter(f => f !== undefined);

    if (!transformed.length) return;

    const newLayer = { type, extent, buffers: concatBuffers(transformed) };

    if (interactive) newLayer.features = transformed
      .map(({ properties, geometry }) => ({ properties, geometry }));

    return { [id]: newLayer };
  };
}
