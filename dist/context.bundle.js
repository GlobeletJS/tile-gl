var preamble = `precision highp float;

const float TWOPI = 6.28318530718;

attribute vec3 tileCoords;

uniform vec4 mapCoords;   // x, y, z, extent of tileset[0]
uniform vec3 mapShift;    // translate and scale of tileset[0]

uniform vec4 screenScale; // 2 / width, -2 / height, pixRatio, cameraScale

vec2 tileToMap(vec2 tilePos) {
  // Find distance of this tile from top left tile, in tile units
  float zoomFac = exp2(mapCoords.z - tileCoords.z);
  vec2 dTile = zoomFac * tileCoords.xy - mapCoords.xy;
  // tileCoords.x and mapCoords.x are both wrapped to the range [0..exp2(z)]
  // If the right edge of the tile is left of the map, we need to unwrap dTile
  dTile.x += (dTile.x + zoomFac <= 0.0) ? exp2(mapCoords.z) : 0.0;

  // Convert to a translation in pixels
  vec2 tileTranslate = dTile * mapShift.z + mapShift.xy;

  // Find scaling between tile coordinates and screen pixels
  float tileScale = zoomFac * mapShift.z / mapCoords.w;

  return tilePos * tileScale + tileTranslate;
}

vec4 mapToClip(vec2 mapPos, float z) {
  vec2 projected = mapPos * screenScale.xy + vec2(-1.0, 1.0);
  return vec4(projected, z, 1);
}
`;

var simpleScale = `float styleScale(vec2 tilePos) {
  return screenScale.z;
}
`;

var mercatorScale = `float mercatorScale(float yWeb) {
  // Convert Web Mercator Y to standard Mercator Y
  float yMerc = TWOPI * (0.5 - yWeb);
  return 0.5 * (exp(yMerc) + exp(-yMerc)); // == cosh(y)
}

float styleScale(vec2 tilePos) {
  float y = (tileCoords.y + tilePos.y / mapCoords.w) / exp2(tileCoords.z);
  return screenScale.z * mercatorScale(y) / screenScale.w;
}
`;

function initSetters(pairs, uniformSetters) {
  return pairs
    .filter(([get]) => get.type !== "property")
    .map(([get, key]) => {
      const set = uniformSetters[key];
      return (z, f) => set(get(z, f));
    });
}

function initVectorTilePainter(context, layerId, setAtlas) {
  return function(tileBox, translate, scale, framebufferHeight) {
    const { x, y, tile } = tileBox;
    const { layers, atlas } = tile.data;

    const data = layers[layerId];
    if (!data) return;

    const [x0, y0] = [x, y].map((c, i) => (c + translate[i]) * scale);
    const yflip = framebufferHeight - y0 - scale;
    context.clipRect(x0, yflip, scale, scale);

    if (setAtlas && atlas) setAtlas(atlas);

    context.draw(data.buffers);
  };
}

function initGrid(context, framebufferSize, program) {
  const { use, uniformSetters } = program;
  const { screenScale, mapCoords, mapShift } = uniformSetters;

  function setGrid(tileset, pixRatio = 1) {
    const { x, y, z } = tileset[0];
    const numTiles = 1 << z;
    const xw = x - Math.floor(x / numTiles) * numTiles;
    const extent = 512; // TODO: don't assume this!!
    mapCoords([xw, y, z, extent]);

    const { translate, scale } = tileset;
    const pixScale = scale * pixRatio;
    const [dx, dy] = [x, y].map((c, i) => (c + translate[i]) * pixScale);

    // At low zooms, some tiles may be repeated on opposite ends of the map
    // We split them into subsets, with different values of mapShift
    // NOTE: Only accounts for repetition across X!
    const subsets = [0, 1, 2].map(repeat => {
      const shift = repeat * numTiles;
      const tiles = tileset.filter(tile => {
        const delta = tile.x - x;
        return (delta >= shift && delta < shift + numTiles);
      });
      const setter = () => mapShift([dx + shift * pixScale, dy, pixScale]);
      return { tiles, setter };
    }).filter(set => set.tiles.length);

    return { translate, scale: pixScale, subsets };
  }

  function initTilesetPainter(id, styleMap, setAtlas) {
    const zoomFuncs = initSetters(styleMap, uniformSetters);
    const paintTile = initVectorTilePainter(context, id, setAtlas);

    return function({ tileset, zoom, pixRatio = 1, cameraScale = 1.0 }) {
      if (!tileset || !tileset.length) return;

      use();
      const { width, height } = framebufferSize;
      screenScale([2 / width, -2 / height, pixRatio, cameraScale]);
      const { translate, scale, subsets } = setGrid(tileset, pixRatio);

      zoomFuncs.forEach(f => f(zoom));

      subsets.forEach(({ setter, tiles }) => {
        setter();
        tiles.forEach(box => paintTile(box, translate, scale, height));
      });
    };
  }

  return initTilesetPainter;
}

function initBackground(context) {
  function initPainter(style) {
    const { paint } = style;

    return function({ zoom }) {
      const opacity = paint["background-opacity"](zoom);
      const color = paint["background-color"](zoom);
      context.clear(color.map(c => c * opacity));
    };
  }

  return { initPainter };
}

var vert$3 = `attribute vec2 quadPos; // Vertices of the quad instance
attribute vec2 circlePos;
attribute float radius;
attribute vec4 color;
attribute float opacity;

varying vec2 delta;
varying vec4 strokeStyle;
varying float circleRadius;

void main() {
  vec2 mapPos = tileToMap(circlePos);

  // Shift to the appropriate corner of the current instance quad
  delta = 2.0 * quadPos * (radius + 1.0);
  vec2 dPos = delta * styleScale(circlePos);

  strokeStyle = color * opacity;
  // TODO: normalize delta? Then can drop one varying
  circleRadius = radius;

  gl_Position = mapToClip(mapPos + dPos, 0.0);
}
`;

var frag$3 = `precision mediump float;

varying vec2 delta;
varying vec4 strokeStyle;
varying float circleRadius;

void main() {
  float r = length(delta);
  float dr = fwidth(r);

  float taper = 1.0 - smoothstep(circleRadius - dr, circleRadius + dr, r);
  gl_FragColor = strokeStyle * taper;
}
`;

function initCircle(context) {
  const { initPaintProgram, initQuad, initAttributes } = context;

  const { constructVao, initTilesetPainter } = initPaintProgram(vert$3, frag$3);

  const quadPos = initQuad({ x0: -0.5, y0: -0.5, x1: 0.5, y1: 0.5 });

  const attrInfo = {
    circlePos: { numComponents: 2 },
    tileCoords: { numComponents: 3 },
    radius: { numComponents: 1 },
    color: { numComponents: 4 },
    opacity: { numComponents: 1 },
  };

  function load(buffers) {
    const attributes = initAttributes(attrInfo, buffers, { quadPos });
    const vao = constructVao({ attributes });
    return { vao, instanceCount: buffers.circlePos.length / 2 };
  }

  function initPainter(style) {
    const { id, paint } = style;

    const zoomFuncs = [
      [paint["circle-radius"],  "radius"],
      [paint["circle-color"],   "color"],
      [paint["circle-opacity"], "opacity"],
    ];

    return initTilesetPainter(id, zoomFuncs);
  }

  return { load, initPainter };
}

var vert$2 = `attribute vec2 quadPos;
attribute vec3 pointA, pointB, pointC, pointD;
attribute vec4 color;
attribute float opacity;

uniform float lineWidth, miterLimit;

varying float yCoord;
varying vec2 miterCoord1, miterCoord2;
varying vec4 strokeStyle;

mat3 miterTransform(vec2 xHat, vec2 yHat, vec2 v, float pixWidth) {
  // Find a coordinate basis vector aligned along the bisector
  bool isCap = length(v) < 0.0001; // TODO: think about units
  vec2 vHat = (isCap)
    ? xHat // Treat v = 0 like 180 deg turn
    : normalize(v);
  vec2 m0 = (dot(xHat, vHat) < -0.9999)
    ? yHat // For vHat == -xHat
    : normalize(xHat + vHat);
  
  // Find a perpendicular basis vector, pointing toward xHat
  float x_m0 = dot(xHat, m0);
  vec2 m1 = (x_m0 < 0.9999)
    ? normalize(xHat - vHat)
    : yHat;

  // Compute miter length
  float sin2 = 1.0 - x_m0 * x_m0; // Could be zero!
  float miterLength = (sin2 > 0.0001)
    ? inversesqrt(sin2)
    : miterLimit + 1.0;
  float bevelLength = abs(dot(yHat, m0));
  float tx = (miterLength > miterLimit)
    ? 0.5 * pixWidth * bevelLength
    : 0.5 * pixWidth * miterLength;

  float ty = isCap ? 1.2 * pixWidth : 0.0;

  return mat3(m0.x, m1.x, 0, m0.y, m1.y, 0, tx, ty, 1);
}

void main() {
  // Transform vertex positions from tile to map coordinates
  vec2 mapA = tileToMap(pointA.xy);
  vec2 mapB = tileToMap(pointB.xy);
  vec2 mapC = tileToMap(pointC.xy);
  vec2 mapD = tileToMap(pointD.xy);

  vec2 xAxis = mapC - mapB;
  vec2 xBasis = normalize(xAxis);
  vec2 yBasis = vec2(-xBasis.y, xBasis.x);

  // Get coordinate transforms for the miters
  float pixWidth = lineWidth * screenScale.z;
  mat3 m1 = miterTransform(xBasis, yBasis, mapA - mapB, pixWidth);
  mat3 m2 = miterTransform(-xBasis, yBasis, mapD - mapC, pixWidth);

  // Find the position of the current instance vertex, in 3 coordinate systems
  vec2 extend = miterLimit * xBasis * pixWidth * (quadPos.x - 0.5);
  // Add one pixel on either side of the line for the anti-alias taper
  float y = (pixWidth + 2.0) * quadPos.y;
  vec2 point = mapB + xAxis * quadPos.x + yBasis * y + extend;
  miterCoord1 = (m1 * vec3(point - mapB, 1)).xy;
  miterCoord2 = (m2 * vec3(point - mapC, 1)).xy;

  // Remove pixRatio from varying (we taper edges using unscaled value)
  yCoord = y / screenScale.z;

  // TODO: should this premultiplication be done in tile-stencil?
  //vec4 premult = vec4(color.rgb * color.a, color.a);
  //strokeStyle = premult * opacity;
  strokeStyle = color * opacity;

  gl_Position = mapToClip(point, pointB.z + pointC.z);
}
`;

var frag$2 = `precision highp float;

uniform float lineWidth;

varying float yCoord;
varying vec2 miterCoord1, miterCoord2;
varying vec4 strokeStyle;

void main() {
  float step0 = fwidth(yCoord) * 0.707;
  vec2 step1 = fwidth(miterCoord1) * 0.707;
  vec2 step2 = fwidth(miterCoord2) * 0.707;

  // Antialiasing for edges of lines
  float outside = -0.5 * lineWidth - step0;
  float inside = -0.5 * lineWidth + step0;
  float antialias = smoothstep(outside, inside, -abs(yCoord));

  // Bevels, endcaps: Use smooth taper for antialiasing
  float taperx = 
    smoothstep(-step1.x, step1.x, miterCoord1.x) *
    smoothstep(-step2.x, step2.x, miterCoord2.x);

  // Miters: Use hard step, slightly shifted to avoid overlap at center
  float tapery = 
    step(-0.01 * step1.y, miterCoord1.y) *
    step(0.01 * step2.y, miterCoord2.y);

  gl_FragColor = strokeStyle * antialias * taperx * tapery;
}
`;

function initLineLoader(context, constructVao) {
  const { initQuad, createBuffer, initAttribute, initAttributes } = context;

  const quadPos = initQuad({ x0: 0.0, y0: -0.5, x1: 1.0, y1: 0.5 });

  const attrInfo = {
    tileCoords: { numComponents: 3 },
    color: { numComponents: 4 },
    opacity: { numComponents: 1 },
  };

  const numComponents = 3;
  const stride = Float32Array.BYTES_PER_ELEMENT * numComponents;

  return function(buffers) {
    const { lines } = buffers;

    // Create buffer containing the vertex positions
    const buffer = createBuffer(lines);

    // Create interleaved attributes pointing to different offsets in buffer
    const geometryAttributes = {
      quadPos,
      pointA: setupPoint(0),
      pointB: setupPoint(1),
      pointC: setupPoint(2),
      pointD: setupPoint(3),
    };

    function setupPoint(shift) {
      const offset = shift * stride;
      return initAttribute({ buffer, numComponents, stride, offset });
    }

    const attributes = initAttributes(attrInfo, buffers, geometryAttributes);
    const vao = constructVao({ attributes });

    return { vao, instanceCount: lines.length / numComponents - 3 };
  };
}

function initLine(context) {
  const program = context.initPaintProgram(vert$2, frag$2);
  const { constructVao, initTilesetPainter } = program;

  const load = initLineLoader(context, constructVao);

  function initPainter(style) {
    const { id, layout, paint } = style;

    const zoomFuncs = [
      // TODO: move these to serialization step??
      // [layout["line-cap"],      "lineCap"],
      // [layout["line-join"],     "lineJoin"],
      [layout["line-miter-limit"], "miterLimit"],

      [paint["line-width"],     "lineWidth"],
      [paint["line-color"],     "color"],
      [paint["line-opacity"],   "opacity"],
      // line-gap-width,
      // line-translate, line-translate-anchor,
      // line-offset, line-blur, line-gradient, line-pattern
    ];

    return initTilesetPainter(id, zoomFuncs);
  }

  return { load, initPainter };
}

var vert$1 = `attribute vec2 position;
attribute vec4 color;
attribute float opacity;

uniform vec2 translation;   // From style property paint["fill-translate"]

varying vec4 fillStyle;

void main() {
  vec2 mapPos = tileToMap(position) + translation * screenScale.z;

  fillStyle = color * opacity;

  gl_Position = mapToClip(mapPos, 0.0);
}
`;

var frag$1 = `precision mediump float;

varying vec4 fillStyle;

void main() {
    gl_FragColor = fillStyle;
}
`;

function initFill(context) {
  const { initPaintProgram, initAttributes, initIndices } = context;

  const { constructVao, initTilesetPainter } = initPaintProgram(vert$1, frag$1);

  const attrInfo = {
    position: { numComponents: 2, divisor: 0 },
    tileCoords: { numComponents: 3, divisor: 0 },
    color: { numComponents: 4, divisor: 0 },
    opacity: { numComponents: 1, divisor: 0 },
  };

  function load(buffers) {
    const attributes = initAttributes(attrInfo, buffers);
    const indices = initIndices({ data: buffers.indices });
    const vao = constructVao({ attributes, indices });
    return { vao, indices, count: buffers.indices.length };
  }

  function initPainter(style) {
    const { id, paint } = style;

    const zoomFuncs = [
      [paint["fill-color"],     "color"],
      [paint["fill-opacity"],   "opacity"],
      [paint["fill-translate"], "translation"],
    ];

    return initTilesetPainter(id, zoomFuncs);
  }

  return { load, initPainter };
}

var vert = `attribute vec2 quadPos;  // Vertices of the quad instance
attribute vec3 labelPos; // x, y, font size scalar
attribute vec4 charPos;  // dx, dy (relative to labelPos), w, h
attribute vec4 sdfRect;  // x, y, w, h
attribute vec4 color;
attribute float opacity;

varying float taperWidth;
varying vec2 texCoord;
varying vec4 fillStyle;

void main() {
  taperWidth = labelPos.z * screenScale.z;
  texCoord = sdfRect.xy + sdfRect.zw * quadPos;
  fillStyle = color * opacity;

  vec2 mapPos = tileToMap(labelPos.xy);

  // Shift to the appropriate corner of the current instance quad
  vec2 dPos = (charPos.xy + charPos.zw * quadPos) * styleScale(labelPos.xy);

  gl_Position = mapToClip(mapPos + dPos, 0.0);
}
`;

var frag = `precision highp float;

uniform sampler2D sdf;

varying vec4 fillStyle;
varying vec2 texCoord;
varying float taperWidth;

void main() {
  float sdfVal = texture2D(sdf, texCoord).a;
  float screenDist = taperWidth * (191.0 - 255.0 * sdfVal) / 32.0;

  float alpha = smoothstep(-0.707, 0.707, -screenDist);
  gl_FragColor = fillStyle * alpha;
}
`;

function initText(context) {
  const { initPaintProgram, initQuad, initAttributes } = context;

  const program = initPaintProgram(vert, frag);
  const { uniformSetters, constructVao, initTilesetPainter } = program;

  const quadPos = initQuad({ x0: 0.0, y0: 0.0, x1: 1.0, y1: 1.0 });

  const attrInfo = {
    labelPos: { numComponents: 3 },
    charPos: { numComponents: 4 },
    sdfRect: { numComponents: 4 },
    tileCoords: { numComponents: 3 },
    color: { numComponents: 4 },
    opacity: { numComponents: 1 },
  };

  function load(buffers) {
    const attributes = initAttributes(attrInfo, buffers, { quadPos });
    const vao = constructVao({ attributes });
    return { vao, instanceCount: buffers.labelPos.length / 3 };
  }

  function initPainter(style) {
    const { id, paint } = style;

    const zoomFuncs = [
      [paint["text-color"],   "color"],
      [paint["text-opacity"], "opacity"],

      // text-halo-color
      // TODO: sprites
    ];

    return initTilesetPainter(id, zoomFuncs, uniformSetters.sdf);
  }

  return { load, initPainter };
}

function initPrograms(context, framebuffer, projScale) {
  const { initAttribute, initProgram } = context;

  const scaleCode = (projScale) ? mercatorScale : simpleScale;

  context.initAttributes = function(attrInfo, buffers, preInitialized = {}) {
    return Object.entries(attrInfo).reduce((d, [key, info]) => {
      const data = buffers[key];
      if (data) d[key] = initAttribute(Object.assign({ data }, info));
      return d;
    }, preInitialized);
  };

  context.initPaintProgram = function(vert, frag) {
    const program = initProgram(preamble + scaleCode + vert, frag);
    const initTilesetPainter = initGrid(context, framebuffer.size, program);
    const { constructVao, uniformSetters } = program;
    return { constructVao, uniformSetters, initTilesetPainter };
  };

  return {
    "background": initBackground(context),
    "circle": initCircle(context),
    "line": initLine(context),
    "fill": initFill(context),
    "symbol": initText(context),
  };
}

function initGLpaint({ context, framebuffer, projScale }) {
  const programs = initPrograms(context, framebuffer, projScale);

  function prep() {
    context.bindFramebufferAndSetViewport(framebuffer);
    return context.clear();
  }

  function loadBuffers(buffers) {
    if (buffers.indices) {
      return programs.fill.load(buffers);
    } else if (buffers.lines) {
      return programs.line.load(buffers);
    } else if (buffers.circlePos) {
      return programs.circle.load(buffers);
    } else if (buffers.labelPos) {
      return programs.symbol.load(buffers);
    } else {
      throw "loadBuffers: unknown buffers structure!";
    }
  }

  function loadAtlas(atlas) {
    const format = context.gl.ALPHA;
    const { width, height, data } = atlas;
    const mips = false;
    return context.initTexture({ format, width, height, data, mips });
  }

  function initPainter(style) {
    const { id, type, source, minzoom = 0, maxzoom = 24 } = style;

    const program = programs[type];
    if (!program) return () => null;

    const painter = program.initPainter(style);
    return Object.assign(painter, { id, type, source, minzoom, maxzoom });
  }

  return { prep, loadBuffers, loadAtlas, initPainter };
}

export { initGLpaint };
