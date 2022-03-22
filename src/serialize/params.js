import { getStyleFuncs } from "tile-stencil";
import { initAtlasGetter } from "tile-labeler";

export function setParams(userParams) {
  const { glyphs, spriteData, layers } = userParams;

  if (!layers || !layers.length) fail("no valid array of style layers");
  const parsedStyles = layers.map(getStyleFuncs);

  const glyphsOK = ["string", "undefined"].includes(typeof glyphs);
  if (!glyphsOK) fail("glyphs must be a string URL");

  const getAtlas = initAtlasGetter({ parsedStyles, glyphEndpoint: glyphs });

  return { parsedStyles, spriteData, getAtlas };
}

function fail(message) {
  throw Error("tile-gl initSerializer: " + message);
}
