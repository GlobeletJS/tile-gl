import * as tileStencil from "tile-stencil";
import * as yawgl from "yawgl";
import * as tileRetriever from "tile-retriever";
import * as tileMixer from "tile-mixer";
import { initSerializer, initGL } from "../../";

const styleHref = "./streets-v8-noInteractive.json";
const mapboxToken = "pk.eyJ1IjoiamhlbWJkIiwiYSI6ImNqcHpueHpyZjBlMjAzeG9kNG9oNzI2NTYifQ.K7fqhk2Z2YZ8NIV94M-5nA";
const tileCoords = { z: 15, x: 7703, y: 13544 };

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

  const { glyphs, layers: rawLayers, spriteData } = style;
  const layers = rawLayers.filter(l => l.source && l.source === "composite");
  const mixer = tileMixer.init({ layers });
  const mixed = mixer(data, tileCoords.z);
  const serialize = initSerializer({ glyphs, layers, spriteData });
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
  tileContext.loadSprite(style.spriteData.image);

  const painters = style.layers
    .map(tileStencil.getStyleFuncs)
    .map(tileContext.initPainter);

  painters.forEach(painter => {
    painter.setStyles(tileCoords.z, pixRatio);
    painter.paint({ data });
  });

  console.log("All done!");
}
