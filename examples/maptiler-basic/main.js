import * as tileStencil from "tile-stencil";
import * as yawgl from "yawgl";
import * as tileRetriever from "tile-retriever";
import * as tileMixer from "tile-mixer";
import { initSerializer, initGL } from "../../";

const styleHref = "./klokantech-basic-style.json";
const tileCoords = { z: 13, x: 1310, y: 3166 };

export function main() {
  tileStencil.loadStyle(styleHref).then(getTile);
}

function getTile(style) {
  const source = style.sources.openmaptiles;
  const retrieve = tileRetriever.init({ source });
  retrieve(tileCoords, (error, data) => setup(error, data, style));
}

function setup(error, data, style) {
  if (error) throw error;

  const { glyphs, layers: rawLayers } = style;
  const layers = rawLayers.filter(l => l.source && l.source === "openmaptiles");
  const mixer = tileMixer.init({ layers });
  const mixed = mixer(data, tileCoords.z);
  const serialize = initSerializer({ glyphs, layers });
  serialize(mixed, tileCoords).then(data => render(data, style));
}

function render(data, style) {
  const canvas = document.getElementById("tileCanvas");
  const pixRatio = window.devicePixelRatio;
  canvas.width = 512 * pixRatio;
  canvas.height = 512 * pixRatio;
  const context = yawgl.initContext(canvas);

  const framebuffer = { buffer: null, size: canvas };
  const tileContext = initGL({ context, framebuffer });

  Object.values(data.layers).forEach(tileContext.loadBuffers);
  data.atlas = tileContext.loadAtlas(data.atlas);

  const painters = style.layers
    .map(tileStencil.getStyleFuncs)
    .map(tileContext.initPainter);

  painters.forEach(painter => {
    painter.setStyles(tileCoords.z, pixRatio);
    painter.paint({ data });
  });

  console.log("All done!");
}
