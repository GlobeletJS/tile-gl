import { getStyleFuncs } from "tile-stencil";
import { initAtlasGetter } from "tile-labeler";
import { initLayerSerializer } from "./layer.js";
import RBush from "rbush";

export function initSerializer(userParams) {
  const { glyphEndpoint, layers } = setParams(userParams);
  const parsedStyles = layers.map(getStyleFuncs);

  const getAtlas = initAtlasGetter({ parsedStyles, glyphEndpoint });
  const process = initTileSerializer(parsedStyles);

  return function(source, tileCoords) {
    return getAtlas(source, tileCoords.z).then(atlas => {
      const layers = process(source, tileCoords, atlas);

      // Note: atlas.data.buffer is a Transferable
      return { atlas: atlas.image, layers };
    });
  };
}

function setParams({ glyphs, layers }) {
  if (!layers || !layers.length) fail("no valid array of style layers");

  const glyphsOK = ["string", "undefined"].includes(typeof glyphs);
  if (!glyphsOK) fail("glyphs must be a string URL");

  return { glyphEndpoint: glyphs, layers };
}

function fail(message) {
  throw Error("tile-gl initSerializer: " + message);
}

function initTileSerializer(styles) {
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
