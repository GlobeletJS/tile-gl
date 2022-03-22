import { getSerializeInfo, initFeatureSerializer } from "./feature.js";
import { concatBuffers } from "./concat-buffers.js";

export function initLayerSerializer(style, spriteData) {
  const { id, type, interactive } = style;

  const info = getSerializeInfo(style, spriteData);
  const transform = initFeatureSerializer(style.paint, info);
  if (!transform) return;

  return function(layer, tileCoords, atlas, tree) {
    const { extent, features } = layer;

    const transformed = features
      .map(f => transform(f, tileCoords, atlas, tree))
      .filter(f => f !== undefined);

    if (!transformed.length) return;

    const buffers = concatBuffers(transformed);
    const length = info.getLength(buffers);
    const newLayer = { type, extent, buffers, length };

    if (interactive) newLayer.features = features.slice();

    return { [id]: newLayer };
  };
}
