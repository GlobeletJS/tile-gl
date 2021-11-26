var preamble = `precision highp float;

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

var mercatorScale = `const float TWOPI = 6.28318530718;

float mercatorScale(float yWeb) {
  // Convert Web Mercator Y to standard Mercator Y
  float yMerc = TWOPI * (0.5 - yWeb);
  return 0.5 * (exp(yMerc) + exp(-yMerc)); // == cosh(y)
}

float styleScale(vec2 tilePos) {
  float y = (tileCoords.y + tilePos.y / mapCoords.w) / exp2(tileCoords.z);
  return screenScale.z * mercatorScale(y) / screenScale.w;
}
`;

function setParams(userParams) {
  const {
    context, framebuffer,
    projScale = false,
    multiTile = true,
  } = userParams;

  const scaleCode = (projScale) ? mercatorScale : simpleScale;
  const size = framebuffer.size;

  context.clipRectFlipY = function(x, y, w, h) {
    const yflip = size.height - y - h;
    context.clipRect(x, yflip, w, h);
  };

  return {
    context, framebuffer, multiTile,
    preamble: preamble + scaleCode,
  };
}

var vert$4 = `attribute vec2 quadPos; // Vertices of the quad instance
attribute vec2 circlePos;
attribute float circleRadius;
attribute vec4 circleColor;
attribute float circleOpacity;

varying vec2 delta;
varying vec4 strokeStyle;
varying float radius;

void main() {
  vec2 mapPos = tileToMap(circlePos);

  // Shift to the appropriate corner of the current instance quad
  delta = quadPos * (circleRadius + 1.0);
  vec2 dPos = delta * styleScale(circlePos);

  strokeStyle = circleColor * circleOpacity;
  // TODO: normalize delta? Then can drop one varying
  radius = circleRadius;

  gl_Position = mapToClip(mapPos + dPos, 0.0);
}
`;

var frag$4 = `precision mediump float;

varying vec2 delta;
varying vec4 strokeStyle;
varying float radius;

void main() {
  float r = length(delta);
  float dr = fwidth(r);

  float taper = 1.0 - smoothstep(radius - dr, radius + dr, r);
  gl_FragColor = strokeStyle * taper;
}
`;

function initCircle(context) {
  const attrInfo = {
    circlePos: { numComponents: 2 },
    tileCoords: { numComponents: 3 },
    circleRadius: { numComponents: 1 },
    circleColor: { numComponents: 4 },
    circleOpacity: { numComponents: 1 },
  };
  const quadPos = context.initQuad({ x0: -1.0, y0: -1.0, x1: 1.0, y1: 1.0 });

  const styleKeys = ["circle-radius", "circle-color", "circle-opacity"];

  return {
    vert: vert$4, frag: frag$4, attrInfo, styleKeys,
    getSpecialAttrs: () => ({ quadPos }),
    countInstances: (buffers) => buffers.circlePos.length / 2,
  };
}

var vert$3 = `attribute vec2 quadPos;
attribute vec3 pointA, pointB, pointC, pointD;
attribute vec4 lineColor;
attribute float lineOpacity, lineWidth, lineGapWidth;

uniform float lineMiterLimit;

varying float yCoord;
varying vec2 lineSize; // lineWidth, lineGapWidth
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
    : lineMiterLimit + 1.0;
  float bevelLength = abs(dot(yHat, m0));
  float tx = (miterLength > lineMiterLimit)
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
  float pixWidth = (lineGapWidth > 0.0)
    ? (lineGapWidth + 2.0 * lineWidth) * screenScale.z
    : lineWidth * screenScale.z;
  mat3 m1 = miterTransform(xBasis, yBasis, mapA - mapB, pixWidth);
  mat3 m2 = miterTransform(-xBasis, yBasis, mapD - mapC, pixWidth);

  // Find the position of the current instance vertex, in 3 coordinate systems
  vec2 extend = lineMiterLimit * xBasis * pixWidth * (quadPos.x - 0.5);
  // Add one pixel on either side of the line for the anti-alias taper
  float y = (pixWidth + 2.0) * quadPos.y;
  vec2 point = mapB + xAxis * quadPos.x + yBasis * y + extend;
  miterCoord1 = (m1 * vec3(point - mapB, 1)).xy;
  miterCoord2 = (m2 * vec3(point - mapC, 1)).xy;

  // Remove pixRatio from varying (we taper edges using unscaled value)
  yCoord = y / screenScale.z;
  lineSize = vec2(lineWidth, lineGapWidth);

  // TODO: should this premultiplication be done in tile-stencil?
  //vec4 premult = vec4(color.rgb * color.a, color.a);
  //strokeStyle = premult * opacity;
  strokeStyle = lineColor * lineOpacity;

  gl_Position = mapToClip(point, pointB.z + pointC.z);
}
`;

var frag$3 = `precision highp float;

varying float yCoord;
varying vec2 lineSize; // lineWidth, lineGapWidth
varying vec2 miterCoord1, miterCoord2;
varying vec4 strokeStyle;

void main() {
  float step0 = fwidth(yCoord) * 0.707;
  vec2 step1 = fwidth(miterCoord1) * 0.707;
  vec2 step2 = fwidth(miterCoord2) * 0.707;

  // Antialiasing tapers for line edges
  float hGap = 0.5 * lineSize.y;
  float inner = (hGap > 0.0)
    ? smoothstep(hGap - step0, hGap + step0, abs(yCoord))
    : 1.0;
  float hWidth = (hGap > 0.0)
    ? hGap + lineSize.x
    : 0.5 * lineSize.x;
  float outer = smoothstep(-hWidth - step0, -hWidth + step0, -abs(yCoord));
  float antialias = inner * outer;

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

function initLine(context) {
  const { initQuad, createBuffer, initAttribute } = context;

  const attrInfo = {
    tileCoords: { numComponents: 3 },
    lineColor: { numComponents: 4 },
    lineOpacity: { numComponents: 1 },
    lineWidth: { numComponents: 1 },
    lineGapWidth: { numComponents: 1 },
  };
  const quadPos = initQuad({ x0: 0.0, y0: -0.5, x1: 1.0, y1: 0.5 });
  const numComponents = 3;
  const stride = Float32Array.BYTES_PER_ELEMENT * numComponents;

  function getSpecialAttrs(buffers) {
    // Create buffer containing the vertex positions
    const buffer = createBuffer(buffers.lines);

    // Construct interleaved attributes pointing to different offsets in buffer
    function setupPoint(shift) {
      const offset = shift * stride;
      return initAttribute({ buffer, numComponents, stride, offset });
    }

    return {
      quadPos,
      pointA: setupPoint(0),
      pointB: setupPoint(1),
      pointC: setupPoint(2),
      pointD: setupPoint(3),
    };
  }

  const styleKeys = [
    // NOTE: line-miter-limit is a layout property in the style spec
    // We copied the function to a paint property in ../main.js
    "line-miter-limit",
    // Other layout properties not implemented yet:
    // "line-cap", "line-join",

    // Paint properties:
    "line-color", "line-opacity",
    "line-width", "line-gap-width",
    // "line-translate", "line-translate-anchor",
    // "line-offset", "line-blur", "line-gradient", "line-pattern"
  ];

  return {
    vert: vert$3, frag: frag$3, attrInfo, styleKeys, getSpecialAttrs,
    countInstances: (buffers) => buffers.lines.length / numComponents - 3,
  };
}

var vert$2 = `attribute vec2 position;
attribute vec4 fillColor;
attribute float fillOpacity;

uniform vec2 fillTranslate;

varying vec4 fillStyle;

void main() {
  vec2 mapPos = tileToMap(position) + fillTranslate * screenScale.z;

  fillStyle = fillColor * fillOpacity;

  gl_Position = mapToClip(mapPos, 0.0);
}
`;

var frag$2 = `precision mediump float;

varying vec4 fillStyle;

void main() {
    gl_FragColor = fillStyle;
}
`;

function initFill() {
  const attrInfo = {
    position: { numComponents: 2, divisor: 0 },
    tileCoords: { numComponents: 3, divisor: 0 },
    fillColor: { numComponents: 4, divisor: 0 },
    fillOpacity: { numComponents: 1, divisor: 0 },
  };

  const styleKeys = ["fill-color", "fill-opacity", "fill-translate"];

  return {
    vert: vert$2, frag: frag$2, attrInfo, styleKeys,
    getSpecialAttrs: () => ({}),
  };
}

var vert$1 = `attribute vec2 quadPos;    // Vertices of the quad instance
attribute vec3 labelPos0;   // x, y, angle
attribute vec4 spritePos;  // dx, dy (relative to labelPos0), w, h
attribute vec4 spriteRect; // x, y, w, h
attribute float iconOpacity;

varying float opacity;
varying vec2 texCoord;

void main() {
  texCoord = spriteRect.xy + spriteRect.zw * quadPos;
  opacity = iconOpacity;

  vec2 mapPos = tileToMap(labelPos0.xy);

  // Shift to the appropriate corner of the current instance quad
  vec2 dPos = (spritePos.xy + spritePos.zw * quadPos) * styleScale(labelPos0.xy);

  float cos_a = cos(labelPos0.z);
  float sin_a = sin(labelPos0.z);
  float dx = dPos.x * cos_a - dPos.y * sin_a;
  float dy = dPos.x * sin_a + dPos.y * cos_a;

  gl_Position = mapToClip(mapPos + vec2(dx, dy), 0.0);
}
`;

var frag$1 = `precision highp float;

uniform sampler2D sprite;

varying float opacity;
varying vec2 texCoord;

void main() {
  vec4 texColor = texture2D(sprite, texCoord);
  // Input sprite does NOT have pre-multiplied alpha
  gl_FragColor = vec4(texColor.rgb * texColor.a, texColor.a) * opacity;
}
`;

function initSprite(context) {
  const attrInfo = {
    labelPos0: { numComponents: 3 },
    spritePos: { numComponents: 4 },
    spriteRect: { numComponents: 4 },
    tileCoords: { numComponents: 3 },
    iconOpacity: { numComponents: 1 },
  };
  const quadPos = context.initQuad({ x0: 0.0, y0: 0.0, x1: 1.0, y1: 1.0 });

  const styleKeys = ["icon-opacity"];

  return {
    vert: vert$1, frag: frag$1, attrInfo, styleKeys,
    getSpecialAttrs: () => ({ quadPos }),
    countInstances: (buffers) => buffers.labelPos0.length / 3,
  };
}

var vert = `attribute vec2 quadPos;  // Vertices of the quad instance
attribute vec4 labelPos; // x, y, angle, font size scalar
attribute vec4 charPos;  // dx, dy (relative to labelPos), w, h
attribute vec4 sdfRect;  // x, y, w, h
attribute vec4 textColor;
attribute float textOpacity;
attribute float textHaloBlur;
attribute vec4 textHaloColor;
attribute float textHaloWidth;

varying vec4 fillColor;
varying vec4 haloColor;
varying vec2 haloSize; // width, blur
varying vec2 texCoord;
varying float taperWidth;

void main() {
  texCoord = sdfRect.xy + sdfRect.zw * quadPos;

  taperWidth = labelPos.w * screenScale.z;
  haloSize = vec2(textHaloWidth, textHaloBlur) * screenScale.z;

  float fillAlpha = textColor.a * textOpacity;
  fillColor = vec4(textColor.rgb * fillAlpha, fillAlpha);
  float haloAlpha = textHaloColor.a * textOpacity;
  haloColor = vec4(textHaloColor.rgb * haloAlpha, haloAlpha);

  vec2 mapPos = tileToMap(labelPos.xy);

  // Shift to the appropriate corner of the current instance quad
  vec2 dPos = (charPos.xy + charPos.zw * quadPos) * styleScale(labelPos.xy);

  float cos_a = cos(labelPos.z);
  float sin_a = sin(labelPos.z);
  float dx = dPos.x * cos_a - dPos.y * sin_a;
  float dy = dPos.x * sin_a + dPos.y * cos_a;

  gl_Position = mapToClip(mapPos + vec2(dx, dy), 0.0);
}
`;

var frag = `precision highp float;

uniform sampler2D sdf;

varying vec4 fillColor;
varying vec4 haloColor;
varying vec2 haloSize; // width, blur
varying vec2 texCoord;
varying float taperWidth;

void main() {
  float sdfVal = texture2D(sdf, texCoord).a;
  float screenDist = taperWidth * (191.0 - 255.0 * sdfVal) / 32.0;

  float fillAlpha = smoothstep(-0.707, 0.707, -screenDist);
  float hEdge = haloSize.x - haloSize.y / 2.0;
  float hTaper = haloSize.x + haloSize.y / 2.0;
  float haloAlpha = (haloSize.x > 0.0 || haloSize.y > 0.0)
    ? (1.0 - fillAlpha) * smoothstep(-hTaper, -hEdge, -screenDist)
    : 0.0;

  gl_FragColor = fillColor * fillAlpha + haloColor * haloAlpha;
}
`;

function initText(context) {
  const attrInfo = {
    labelPos: { numComponents: 4 },
    charPos: { numComponents: 4 },
    sdfRect: { numComponents: 4 },
    tileCoords: { numComponents: 3 },
    textColor: { numComponents: 4 },
    textOpacity: { numComponents: 1 },
    textHaloBlur: { numComponents: 1 },
    textHaloColor: { numComponents: 4 },
    textHaloWidth: { numComponents: 1 },
  };
  const quadPos = context.initQuad({ x0: 0.0, y0: 0.0, x1: 1.0, y1: 1.0 });

  const styleKeys = [
    "text-color",
    "text-opacity",
    "text-halo-blur",
    "text-halo-color",
    "text-halo-width",
  ];

  return {
    vert, frag, attrInfo, styleKeys,
    getSpecialAttrs: () => ({ quadPos }),
    countInstances: (buffers) => buffers.labelPos.length / 4,
  };
}

function initLoader(context, progInfo, constructVao) {
  const { initAttribute, initIndices } = context;
  const { attrInfo, getSpecialAttrs, countInstances } = progInfo;

  function getAttributes(buffers) {
    return Object.entries(attrInfo).reduce((d, [key, info]) => {
      const data = buffers[key];
      if (data) d[key] = initAttribute(Object.assign({ data }, info));
      return d;
    }, getSpecialAttrs(buffers));
  }

  function loadInstanced(buffers) {
    const attributes = getAttributes(buffers);
    const vao = constructVao({ attributes });
    return { vao, instanceCount: countInstances(buffers) };
  }

  function loadIndexed(buffers) {
    const attributes = getAttributes(buffers);
    const indices = initIndices({ data: buffers.indices });
    const vao = constructVao({ attributes, indices });
    return { vao, indices, count: buffers.indices.length };
  }

  return (countInstances) ? loadInstanced : loadIndexed;
}

function initGrid(use, uniformSetters, framebuffer) {
  const { screenScale, mapCoords, mapShift } = uniformSetters;

  function setScreen(pixRatio = 1.0, cameraScale = 1.0) {
    const { width, height } = framebuffer.size;
    screenScale([2 / width, -2 / height, pixRatio, cameraScale]);
  }

  function setCoords({ x, y, z }) {
    const numTiles = 1 << z;
    const xw = x - Math.floor(x / numTiles) * numTiles;
    const extent = 512; // TODO: don't assume this!!
    mapCoords([xw, y, z, extent]);
    return numTiles;
  }

  function setShift(tileset, pixRatio = 1) {
    const { x, y } = tileset[0];
    const { translate, scale: rawScale } = tileset;
    const scale = rawScale * pixRatio;
    const [dx, dy] = [x, y].map((c, i) => (c + translate[i]) * scale);
    mapShift([dx, dy, scale]);
    return { translate, scale };
  }

  return { use, setScreen, setCoords, setShift };
}

function camelCase(hyphenated) {
  return hyphenated.replace(/-([a-z])/gi, (h, c) => c.toUpperCase());
}

function initStyleProg(style, styleKeys, uniformSetters, spriteTexture) {
  // TODO: check if spriteTexture is a WebGLTexture
  const { id, type, paint } = style;
  const { sdf, sprite } = uniformSetters;
  const haveSprite = sprite && (spriteTexture instanceof WebGLTexture);

  const zoomFuncs = styleKeys
    .filter(styleKey => paint[styleKey].type !== "property")
    .map(styleKey => {
      const get = paint[styleKey];
      const shaderVar = camelCase(styleKey);
      const set = uniformSetters[shaderVar];
      return (z, f) => set(get(z, f));
    });

  function setStyles(zoom) {
    zoomFuncs.forEach(f => f(zoom));
    if (haveSprite) sprite(spriteTexture);
  }

  const getData = (type !== "symbol") ? getFeatures :
    (haveSprite) ? getIcons : getText;

  function getFeatures(tile) {
    return tile.data.layers[id];
  }

  function getIcons(tile) {
    const layer = tile.data.layers[id];
    if (!layer) return;
    const { type, extent, buffers: { sprite } } = layer;
    if (sprite) return { type, extent, buffers: sprite };
  }

  function getText(tile) {
    const { layers: { [id]: layer }, atlas } = tile.data;
    if (!layer || !atlas) return;
    const { type, extent, buffers: { text } } = layer;
    if (!text || !sdf) return;
    sdf(atlas);
    return { type, extent, buffers: text };
  }

  return { setStyles, getData };
}

function initTilePainter(context, program, layer, multiTile) {
  return (multiTile) ? drawTileset : drawTile;

  function drawTile({ tile, zoom, pixRatio = 1.0, cameraScale = 1.0 }) {
    program.use();

    const data = layer.getData(tile);
    if (!data) return;
    const z = (zoom !== undefined) ? zoom : tile.z;
    layer.setStyles(z);

    program.setScreen(pixRatio, cameraScale);
    program.setCoords(tile);

    const fakeTileset = [{ x: 0, y: 0 }];
    Object.assign(fakeTileset, { translate: [0, 0], scale: 512 });
    program.setShift(fakeTileset, pixRatio);

    context.draw(data.buffers);
  }

  function drawTileset({ tileset, zoom, pixRatio = 1.0, cameraScale = 1.0 }) {
    if (!tileset || !tileset.length) return;

    program.use();
    program.setScreen(pixRatio, cameraScale);
    layer.setStyles(zoom);

    const numTiles = program.setCoords(tileset[0]);
    const subsets = antiMeridianSplit(tileset, numTiles);

    subsets.forEach(subset => {
      const { translate, scale } = program.setShift(subset, pixRatio);
      subset.forEach(t => drawTileBox(t, translate, scale));
    });
  }

  function antiMeridianSplit(tileset, numTiles) {
    const { translate, scale } = tileset;
    const { x } = tileset[0];

    // At low zooms, some tiles may be repeated on opposite ends of the map
    // We split them into subsets, one tileset for each copy of the map
    return [0, 1, 2].map(repeat => repeat * numTiles).map(shift => {
      const tiles = tileset.filter(tile => {
        const delta = tile.x - x - shift;
        return (delta >= 0 && delta < numTiles);
      });
      return Object.assign(tiles, { translate, scale });
    }).filter(subset => subset.length);
  }

  function drawTileBox(box, translate, scale) {
    const { x, y, tile } = box;
    const data = layer.getData(tile);
    if (!data) return;

    const [x0, y0] = [x, y].map((c, i) => (c + translate[i]) * scale);
    context.clipRectFlipY(x0, y0, scale, scale);

    context.draw(data.buffers);
  }
}

function initPrograms(context, framebuffer, preamble, multiTile) {
  return {
    "circle": setupProgram(initCircle(context)),
    "line": setupProgram(initLine(context)),
    "fill": setupProgram(initFill()),
    "symbol": setupSymbol(),
  };

  function setupSymbol() {
    const spriteProg = setupProgram(initSprite(context));
    const textProg = setupProgram(initText(context));

    function load(buffers) {
      const loaded = {};
      if (buffers.spritePos) loaded.sprite = spriteProg.load(buffers);
      if (buffers.charPos) loaded.text = textProg.load(buffers);
      return loaded;
    }

    function initPainter(style, sprite) {
      const iconPaint = spriteProg.initPainter(style, sprite);
      const textPaint = textProg.initPainter(style);

      return function(params) {
        iconPaint(params);
        textPaint(params);
      };
    }

    return { load, initPainter };
  }

  function setupProgram(progInfo) {
    const { vert, frag, styleKeys } = progInfo;

    const program = context.initProgram(preamble + vert, frag);
    const { use, uniformSetters, constructVao } = program;

    const load = initLoader(context, progInfo, constructVao);
    const grid = initGrid(use, uniformSetters, framebuffer);

    function initPainter(style, sprite) {
      const styleProg = initStyleProg(style, styleKeys, uniformSetters, sprite);
      return initTilePainter(context, grid, styleProg, multiTile);
    }

    return { load, initPainter };
  }
}

function initBackground(context) {
  function initPainter({ paint }) {
    return function({ zoom }) {
      const opacity = paint["background-opacity"](zoom);
      const color = paint["background-color"](zoom);
      context.clear(color.map(c => c * opacity));
    };
  }

  return { initPainter };
}

function initGLpaint(userParams) {
  const { context, framebuffer, preamble, multiTile } = setParams(userParams);

  const programs = initPrograms(context, framebuffer, preamble, multiTile);
  programs["background"] = initBackground(context);

  function prep() {
    context.bindFramebufferAndSetViewport(framebuffer);
    return context.clear();
  }

  function loadBuffers(layer) {
    const { type, buffers } = layer;

    const program = programs[type];
    if (!program) throw "loadBuffers: unknown layer type";

    layer.buffers = program.load(buffers);
  }

  function loadAtlas(atlas) {
    const format = context.gl.ALPHA;
    const { width, height, data } = atlas;
    return context.initTexture({ format, width, height, data, mips: false });
  }

  function loadSprite(image) {
    return context.initTexture({ image, mips: false });
  }

  function initPainter(style, sprite) {
    const { id, type, source, minzoom = 0, maxzoom = 24 } = style;

    const program = programs[type];
    if (!program) return () => null;

    const { layout, paint } = style;
    if (type === "line") {
      // We handle line-miter-limit in the paint phase, not layout phase
      paint["line-miter-limit"] = layout["line-miter-limit"];
    }
    const painter = program.initPainter(style, sprite);
    return Object.assign(painter, { id, type, source, minzoom, maxzoom });
  }

  return { prep, loadBuffers, loadAtlas, loadSprite, initPainter };
}

export { initGLpaint };
