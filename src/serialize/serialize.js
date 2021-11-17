import { getStyleFuncs } from "tile-stencil";
import { initAtlasGetter } from "tile-labeler";
import { initTileSerializer } from "./tile.js";

export function initSerializer(userParams) {
  const { glyphEndpoint, spriteData, layers } = setParams(userParams);
  const parsedStyles = layers.map(getStyleFuncs);

  const getAtlas = initAtlasGetter({ parsedStyles, glyphEndpoint });
  const process = initTileSerializer(parsedStyles, spriteData);

  return function(source, tileCoords) {
    return getAtlas(source, tileCoords.z).then(atlas => {
      const layers = process(source, tileCoords, atlas);

      // Note: atlas.data.buffer is a Transferable
      return { atlas: atlas.image, layers };
    });
  };
}

function setParams({ glyphs, spriteData, layers }) {
  if (!layers || !layers.length) fail("no valid array of style layers");

  const glyphsOK = ["string", "undefined"].includes(typeof glyphs);
  if (!glyphsOK) fail("glyphs must be a string URL");

  return { glyphEndpoint: glyphs, spriteData, layers };
}

function fail(message) {
  throw Error("tile-gl initSerializer: " + message);
}
