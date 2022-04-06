import { setParams } from "./params.js";
import { initLayerSerializer } from "./layer.js";
import RBush from "rbush";

export function initSerializer(userParams) {
  const { parsedStyles, spriteData, getAtlas } = setParams(userParams);

  const layerSerializers = parsedStyles
    .reduce((d, s) => (d[s.id] = initLayerSerializer(s, spriteData), d), {});

  return function(source, tileCoords) {
    return getAtlas(source, tileCoords.z)
      .then(atlas => process(source, tileCoords, atlas));
  };

  function process(source, coords, atlas) {
    const tree = new RBush();

    function serializeLayer([id, layer]) {
      const serialize = layerSerializers[id];
      if (serialize) return serialize(layer, coords, atlas, tree);
    }

    const layers = Object.entries(source)
      .reverse() // Reverse order for collision checks
      .map(serializeLayer)
      .reverse()
      .reduce((d, l) => Object.assign(d, l), {});

    // Note: atlas.data.buffer is a Transferable
    return { atlas: atlas.image, layers };
  }
}
