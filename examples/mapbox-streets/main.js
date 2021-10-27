import * as tileStencil from "tile-stencil";
import * as yawgl from "yawgl";
import * as tileRetriever from "tile-retriever";
import * as tileMixer from "tile-mixer";
import { initSerializer, initGLpaint } from "../../";

const styleHref = "./streets-v8-noInteractive.json";
const mapboxToken = "pk.eyJ1IjoiamhlbWJkIiwiYSI6ImNqcHpueHpyZjBlMjAzeG9kNG9oNzI2NTYifQ.K7fqhk2Z2YZ8NIV94M-5nA";
const tileCoords = { z: 13, x: 1310, y: 3166 };

export function main() {
  tileStencil.loadStyle(styleHref, mapboxToken).then(getTile);
}

function getTile(style) {
  const source = style.sources.composite;
  const retrieve = tileRetriever.init({ source });
  retrieve(tileCoords, (error, data) => setup(error, data, style));
}

function setup(error, data, style) {
  if (error) throw error;

  const { glyphs, layers: rawLayers } = style;
  const layers = rawLayers.filter(l => l.source && l.source === "composite");
  const mixer = tileMixer.init({ layers });
  const mixed = mixer(data, tileCoords.z);
  const serialize = initSerializer({ glyphs, layers });
  serialize(mixed, tileCoords).then(data => render(data, style));
}

function render(data, style) {
  const canvas = document.getElementById("tileCanvas");
  const pixRatio = window.devicePixelRatio;
  yawgl.resizeCanvasToDisplaySize(canvas, pixRatio);
  const gl = yawgl.getExtendedContext(canvas);
  const context = yawgl.initContext(gl);

  const tileContext = initGLpaint({ 
    context,
    framebuffer: { buffer: null, size: canvas },
    multiTile: false,
  });

  Object.values(data.layers).forEach(tileContext.loadBuffers);
  data.atlas = tileContext.loadAtlas(data.atlas);

  const painters = style.layers
    .map(tileStencil.getStyleFuncs)
    .map(tileContext.initPainter);

  const tile = Object.assign({ data }, tileCoords);
  painters.forEach(painter => painter({ tile, pixRatio }));

  console.log("All done!");
}
