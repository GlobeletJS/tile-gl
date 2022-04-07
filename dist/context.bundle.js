var defaultPreamble = `#version 300 es

precision highp float;

uniform vec4 screenScale; // 2 / width, -2 / height, pixRatio, cameraScale

vec2 tileToMap(vec2 tilePos) {
  return tilePos * screenScale.z;
}

vec4 mapToClip(vec2 mapPos, float z) {
  vec2 projected = mapPos * screenScale.xy + vec2(-1.0, 1.0);
  return vec4(projected, z, 1.0);
}

float styleScale(vec2 tilePos) {
  return screenScale.z;
}
`;

function setParams(userParams) {
  const {
    context, framebuffer, extraAttributes,
    preamble = defaultPreamble,
  } = userParams;

  return { context, framebuffer, preamble, extraAttributes };
}

var vert$4 = `in vec2 quadPos;

void main() {
  gl_Position = vec4(quadPos, 0.0, 1.0);
}
`;

var frag$4 = `#version 300 es

precision mediump float;

uniform vec4 backgroundColor;
uniform float backgroundOpacity;

out vec4 pixColor;

void main() {
  float alpha = backgroundColor.a * backgroundOpacity;
  pixColor = vec4(backgroundColor.rgb * alpha, alpha);
}
`;

function initBackground(context) {
  const quadPos = context.initQuad();

  const styleKeys = ["background-color", "background-opacity"];

  return {
    vert: vert$4, frag: frag$4, styleKeys,
    getSpecialAttrs: () => ({ quadPos }),
    countInstances: () => 1,
  };
}

var vert$3 = `in vec2 quadPos; // Vertices of the quad instance
in vec2 circlePos;
in float circleRadius;
in vec4 circleColor;
in float circleOpacity;

out vec2 delta;
out vec4 strokeStyle;
out float radius;

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

var frag$3 = `#version 300 es

precision mediump float;

in vec2 delta;
in vec4 strokeStyle;
in float radius;

out vec4 pixColor;

void main() {
  float r = length(delta);
  float dr = fwidth(r);

  float taper = 1.0 - smoothstep(radius - dr, radius + dr, r);
  pixColor = strokeStyle * taper;
}
`;

function initCircle(context) {
  const attrInfo = {
    circlePos: { numComponents: 2 },
    circleRadius: { numComponents: 1 },
    circleColor: { numComponents: 4 },
    circleOpacity: { numComponents: 1 },
  };
  const quadPos = context.initQuad({ x0: -1.0, y0: -1.0, x1: 1.0, y1: 1.0 });

  const styleKeys = ["circle-radius", "circle-color", "circle-opacity"];

  return {
    vert: vert$3, frag: frag$3, attrInfo, styleKeys,
    getSpecialAttrs: () => ({ quadPos }),
    countInstances: (buffers) => buffers.circlePos.length / 2,
  };
}

var vert$2 = `in vec2 quadPos;
in vec3 pointA, pointB, pointC, pointD;
in vec4 lineColor;
in float lineOpacity, lineWidth, lineGapWidth;

uniform float lineMiterLimit;
const int numDashes = 4;
uniform float lineDasharray[numDashes];

out float yCoord;
flat out vec2 lineSize; // lineWidth, lineGapWidth
out vec2 miterCoord1, miterCoord2;
flat out vec4 strokeStyle;
flat out float dashPattern[numDashes];
out float lineSoFar;

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

float sumComponents(float[numDashes] v) {
  float sum = 0.0;
  for (int i = 0; i < v.length(); i++) {
    sum += v[i];
  }
  return sum;
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

  float dashLength = sumComponents(lineDasharray) * lineWidth;
  if (dashLength <= 0.0) dashLength = 1.0;

  float dashScale = lineWidth / dashLength;
  dashPattern[0] = lineDasharray[0] * dashScale;
  for (int i = 1; i < lineDasharray.length(); i++) {
    dashPattern[i] = dashPattern[i - 1] + lineDasharray[i] * dashScale;
  }

  float xLen = length(xAxis) / screenScale.z;
  float extendRatio = length(extend) / screenScale.z / xLen;
  float stretch = xLen / (pointC.z - pointB.z);

  float dist0 = pointB.z * stretch / dashLength;
  float dDist = (pointC.z - pointB.z) * stretch / dashLength;
  float eDist = dDist * extendRatio;
  lineSoFar = dist0 - eDist + quadPos.x * (dDist + 2.0 * eDist);

  float z = (min(pointB.z, pointC.z) < 0.0) ? -2.0 : 0.0;

  gl_Position = mapToClip(point, z);
}
`;

var frag$2 = `#version 300 es

precision highp float;

in float yCoord;
flat in vec2 lineSize; // lineWidth, lineGapWidth
in vec2 miterCoord1, miterCoord2;
flat in vec4 strokeStyle;
flat in float dashPattern[4];
in float lineSoFar;

out vec4 pixColor;

float taper(float edge, float width, float x) {
  return smoothstep(edge - width, edge + width, x);
}

float muteGap(float start, float end, float ramp, float x) {
  return (start < end)
    ? 1.0 - taper(start, ramp, x) * taper(-end, ramp, -x)
    : 1.0;
}

void main() {
  float step0 = fwidth(yCoord) * 0.707;
  vec2 step1 = fwidth(miterCoord1) * 0.707;
  vec2 step2 = fwidth(miterCoord2) * 0.707;

  // Antialiasing tapers for line edges
  float hGap = 0.5 * lineSize.y;
  float inner = (hGap > 0.0) ? taper(hGap, step0, abs(yCoord)) : 1.0;
  float hWidth = (hGap > 0.0) ? hGap + lineSize.x : 0.5 * lineSize.x;
  float outer = taper(-hWidth, step0, -abs(yCoord));
  float antialias = inner * outer;

  // Bevels, endcaps: Use smooth taper for antialiasing
  float taperx =
    taper(0.0, step1.x, miterCoord1.x) * 
    taper(0.0, step2.x, miterCoord2.x);

  // Miters: Use hard step, slightly shifted to avoid overlap at center
  float tapery = 
    step(-0.01 * step1.y, miterCoord1.y) *
    step(0.01 * step2.y, miterCoord2.y);

  // Dashes
  float dashX = fract(lineSoFar);
  float stepD = fwidth(lineSoFar) * 0.707;
  float gap1 = muteGap(dashPattern[0], dashPattern[1], stepD, dashX);
  float gap2 = muteGap(dashPattern[2], dashPattern[3], stepD, dashX);
  float dashMute = min(gap1, gap2);

  pixColor = strokeStyle * antialias * taperx * tapery * dashMute;
}
`;

function initLine(context) {
  const { initQuad, createBuffer, initAttribute } = context;

  const attrInfo = {
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
    "line-width", "line-gap-width", "line-dasharray",
    // "line-translate", "line-translate-anchor",
    // "line-offset", "line-blur", "line-gradient", "line-pattern"
  ];

  return {
    vert: vert$2, frag: frag$2, attrInfo, styleKeys, getSpecialAttrs,
    countInstances: (buffers) => buffers.lines.length / numComponents - 3,
  };
}

var vert$1 = `in vec2 position;
in vec4 fillColor;
in float fillOpacity;

uniform vec2 fillTranslate;

out vec4 fillStyle;

void main() {
  vec2 mapPos = tileToMap(position) + fillTranslate * screenScale.z;

  fillStyle = fillColor * fillOpacity;

  gl_Position = mapToClip(mapPos, 0.0);
}
`;

var frag$1 = `#version 300 es

precision mediump float;

in vec4 fillStyle;

out vec4 pixColor;

void main() {
    pixColor = fillStyle;
}
`;

function initFill() {
  const attrInfo = {
    position: { numComponents: 2, divisor: 0 },
    fillColor: { numComponents: 4, divisor: 0 },
    fillOpacity: { numComponents: 1, divisor: 0 },
  };

  const styleKeys = ["fill-color", "fill-opacity", "fill-translate"];

  return {
    vert: vert$1, frag: frag$1, attrInfo, styleKeys,
    getSpecialAttrs: () => ({}),
  };
}

var vert = `in vec2 quadPos;   // Vertices of the quad instance
in vec4 labelPos;  // x, y, angle, font size scalar (0 for icons)
in vec4 glyphPos;  // dx, dy (relative to labelPos), w, h
in vec4 glyphRect; // x, y, w, h

in float iconOpacity;

in vec4 textColor;
in float textOpacity;
in float textHaloBlur;
in vec4 textHaloColor;
in float textHaloWidth;

out vec2 texCoord;

out float opacity;

out vec4 fillColor;
out vec4 haloColor;
out vec2 haloSize; // width, blur
out float taperWidth;

void main() {
  // For icons only
  opacity = iconOpacity;

  // For text only
  taperWidth = labelPos.w * screenScale.z; // == 0.0 for icon glyphs
  haloSize = vec2(textHaloWidth, textHaloBlur) * screenScale.z;

  float fillAlpha = textColor.a * textOpacity;
  fillColor = vec4(textColor.rgb * fillAlpha, fillAlpha);
  float haloAlpha = textHaloColor.a * textOpacity;
  haloColor = vec4(textHaloColor.rgb * haloAlpha, haloAlpha);

  // Texture coordinates
  texCoord = glyphRect.xy + glyphRect.zw * quadPos;

  // Compute glyph position. First transform the label origin
  vec2 mapPos = tileToMap(labelPos.xy);

  // Shift to the appropriate corner of the current instance quad
  vec2 dPos = (glyphPos.xy + glyphPos.zw * quadPos) * styleScale(labelPos.xy);

  float cos_a = cos(labelPos.z);
  float sin_a = sin(labelPos.z);
  float dx = dPos.x * cos_a - dPos.y * sin_a;
  float dy = dPos.x * sin_a + dPos.y * cos_a;

  gl_Position = mapToClip(mapPos + vec2(dx, dy), 0.0);
}
`;

var frag = `#version 300 es

precision highp float;

uniform sampler2D sprite, sdf;

in vec2 texCoord;

in float opacity;

in vec4 fillColor;
in vec4 haloColor;
in vec2 haloSize; // width, blur
in float taperWidth; // 0 for icons

out vec4 pixColor;

void main() {
  // Get color from sprite if this is an icon glyph
  vec4 spritePix = texture(sprite, texCoord);
  // Input sprite does NOT have pre-multiplied alpha
  vec4 iconColor = vec4(spritePix.rgb * spritePix.a, spritePix.a) * opacity;

  // Compute fill and halo color from sdf if this is a text glyph
  float sdfVal = texture(sdf, texCoord).a;
  float screenDist = taperWidth * (191.0 - 255.0 * sdfVal) / 32.0;

  float fillAlpha = smoothstep(-0.707, 0.707, -screenDist);
  float hEdge = haloSize.x - haloSize.y / 2.0;
  float hTaper = haloSize.x + haloSize.y / 2.0;
  float haloAlpha = (haloSize.x > 0.0 || haloSize.y > 0.0)
    ? (1.0 - fillAlpha) * smoothstep(-hTaper, -hEdge, -screenDist)
    : 0.0;
  vec4 textColor = fillColor * fillAlpha + haloColor * haloAlpha;

  // Choose icon or text color based on taperWidth value
  pixColor = (taperWidth == 0.0) ? iconColor : textColor;
}
`;

function initSymbol(context) {
  const attrInfo = {
    labelPos: { numComponents: 4 },
    glyphPos: { numComponents: 4 },
    glyphRect: { numComponents: 4 },
    iconOpacity: { numComponents: 1 },
    textColor: { numComponents: 4 },
    textOpacity: { numComponents: 1 },
    textHaloBlur: { numComponents: 1 },
    textHaloColor: { numComponents: 4 },
    textHaloWidth: { numComponents: 1 },
  };
  const quadPos = context.initQuad({ x0: 0.0, y0: 0.0, x1: 1.0, y1: 1.0 });

  const styleKeys = [
    "icon-opacity",
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

function initLoader(context, info, constructVao, extraAttributes) {
  const { initAttribute, initIndices } = context;
  const { attrInfo, getSpecialAttrs, countInstances } = info;

  const allAttrs = Object.assign({}, attrInfo, extraAttributes);

  function getAttributes(buffers) {
    return Object.entries(allAttrs).reduce((d, [key, info]) => {
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

function compilePrograms(params) {
  const { context, preamble, extraAttributes } = params;

  const progInfo = {
    background: initBackground(context),
    circle: initCircle(context),
    line: initLine(context),
    fill: initFill(),
    symbol: initSymbol(context),
  };

  function compile(info) {
    const { vert, frag, styleKeys } = info;
    const program = context.initProgram(preamble + vert, frag);
    const { use, constructVao, uniformSetters } = program;
    const load = initLoader(context, info, constructVao, extraAttributes);
    return { load, use, uniformSetters, styleKeys };
  }

  return Object.entries(progInfo)
    .reduce((d, [k, info]) => (d[k] = compile(info), d), {});
}

function camelCase(hyphenated) {
  return hyphenated.replace(/-([a-z])/gi, (h, c) => c.toUpperCase());
}

function initStyleProg(style, program, context, framebuffer) {
  if (!program) return;

  const { id, type, layout, paint } = style;
  const { load, use, uniformSetters, styleKeys } = program;
  const { sdf, screenScale } = uniformSetters;

  if (type === "line") {
    // We handle line-miter-limit in the paint phase, not layout phase
    paint["line-miter-limit"] = layout["line-miter-limit"];
  }

  const zoomFuncs = styleKeys
    .filter(styleKey => paint[styleKey].type !== "property")
    .map(styleKey => {
      const get = paint[styleKey];
      const shaderVar = camelCase(styleKey);
      const set = uniformSetters[shaderVar];
      return (z, f) => set(get(z, f));
    });

  function setStyles(zoom, pixRatio = 1.0, cameraScale = 1.0) {
    use();
    zoomFuncs.forEach(f => f(zoom));
    if (!screenScale) return;
    const { width, height } = framebuffer.size;
    screenScale([2 / width, -2 / height, pixRatio, cameraScale]);
  }

  const getData = (type === "background") ? initBackgroundData() : getFeatures;

  function draw(tile) {
    const data = getData(tile);
    if (data) context.draw(data.buffers);
  }

  function initBackgroundData() {
    const buffers = load({});
    return () => ({ buffers });
  }

  function getFeatures(tile) {
    const { layers: { [id]: layer }, atlas } = tile.data;
    if (sdf && atlas) sdf(atlas);
    return layer;
  }

  return { id, type, setStyles, getData, uniformSetters, paint: draw };
}

function initGL(userParams) {
  const params = setParams(userParams);
  const { context, framebuffer } = params;
  const programs = compilePrograms(params);

  let spriteTexture;
  const spriteSetters = Object.values(programs)
    .map(({ use, uniformSetters }) => ({ use, set: uniformSetters.sprite }))
    .filter(setter => setter.set !== undefined);

  function loadSprite(image) {
    if (image) spriteTexture = context.initTexture({ image, mips: false });
  }

  return { prep, loadAtlas, loadBuffers, loadSprite, initPainter };

  function prep() {
    context.bindFramebufferAndSetViewport(framebuffer);
    spriteSetters.forEach(({ use, set }) => (use(), set(spriteTexture)));
    return context.clear();
  }

  function loadAtlas(atlas) { // TODO: name like loadSprite, different behavior
    const format = context.gl.ALPHA;
    const { width, height, data } = atlas;
    return context.initTexture({ format, width, height, data, mips: false });
  }

  function loadBuffers(layer) {
    const program = programs[layer.type];
    if (!program) throw Error("tile-gl loadBuffers: unknown layer type");
    layer.buffers = program.load(layer.buffers);
  }

  function initPainter(style) {
    return initStyleProg(style, programs[style.type], context, framebuffer);
  }
}

export { initGL };
