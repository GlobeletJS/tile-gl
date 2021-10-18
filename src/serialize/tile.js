import { initLayerSerializer } from "./layer.js";
import RBush from "rbush";

export function initTileSerializer(styles) {
  const layerSerializers = styles
    .reduce((d, s) => (d[s.id] = initLayerSerializer(s), d), {});

  return function(layers, tileCoords, atlas) {
    const tree = new RBush();

    return Object.entries(layers)
      .reverse() // Reverse order for collision checks
      .map(([id, layer]) => {
        const serialize = layerSerializers[id];
        if (serialize) return serialize(layer, tileCoords, atlas, tree);
      })
      .reverse()
      .reduce((d, l) => Object.assign(d, l), {});
  };
}
