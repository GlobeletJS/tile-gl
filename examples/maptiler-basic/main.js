import * as tileStencil from "tile-stencil";
import * as yawgl from "yawgl";
import * as tileRetriever from "tile-retriever";
import * as tileMixer from "tile-mixer";
import { initGLpaint } from "../../";

const styleHref = "./klokantech-basic-style.json";
const tileCoords = { z: 11, x: 327, y: 791 };

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
  const mixer = tileMixer.init({ glyphs, layers });
  mixer(data, tileCoords).then(data => render(data, style));
}

function render(data, style) {
  const canvas = document.getElementById("tileCanvas");
  yawgl.resizeCanvasToDisplaySize(canvas, window.devicePixelRatio);
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
  painters.forEach(painter => painter({ tile }));

  console.log("All done!");
}
