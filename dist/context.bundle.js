var preamble = `precision highp float;

attribute vec3 tileCoords;

uniform vec4 mapCoords;   // x, y, z, extent of tileset[0]
uniform vec3 mapShift;    // translate and scale of tileset[0]

uniform vec3 screenScale; // 2 / width, -2 / height, pixRatio

vec2 tileToMap(vec2 tilePos) {
  // Find distance of this tile from top left tile, in tile units
  float zoomFac = exp2(mapCoords.z - tileCoords.z);
  vec2 dTile = zoomFac * tileCoords.xy - mapCoords.xy;
  dTile.x += (dTile.x < 0.0) ? exp2(mapCoords.z) : 0.0;

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

function createUniformSetter(gl, program, info, textureUnit) {
  const { name, type, size } = info;
  const isArray = name.endsWith("[0]");
  const loc = gl.getUniformLocation(program, name);

  switch (type) {
    case gl.FLOAT:
      return (isArray)
        ? (v) => gl.uniform1fv(loc, v)
        : (v) => gl.uniform1f(loc, v);
    case gl.FLOAT_VEC2:
      return (v) => gl.uniform2fv(loc, v);
    case gl.FLOAT_VEC3:
      return (v) => gl.uniform3fv(loc, v);
    case gl.FLOAT_VEC4:
      return (v) => gl.uniform4fv(loc, v);
    case gl.INT:
      return (isArray)
        ? (v) => gl.uniform1iv(loc, v)
        : (v) => gl.uniform1i(loc, v);
    case gl.INT_VEC2:
      return (v) => gl.uniform2iv(loc, v);
    case gl.INT_VEC3:
      return (v) => gl.uniform3iv(loc, v);
    case gl.INT_VEC4:
      return (v) => gl.uniform4iv(loc, v);
    case gl.BOOL:
      return (v) => gl.uniform1iv(loc, v);
    case gl.BOOL_VEC2:
      return (v) => gl.uniform2iv(loc, v);
    case gl.BOOL_VEC3:
      return (v) => gl.uniform3iv(loc, v);
    case gl.BOOL_VEC4:
      return (v) => gl.uniform4iv(loc, v);
    case gl.FLOAT_MAT2:
      return (v) => gl.uniformMatrix2fv(loc, false, v);
    case gl.FLOAT_MAT3:
      return (v) => gl.uniformMatrix3fv(loc, false, v);
    case gl.FLOAT_MAT4:
      return (v) => gl.uniformMatrix4fv(loc, false, v);
    case gl.SAMPLER_2D:
      return getTextureSetter(gl.TEXTURE_2D);
    case gl.SAMPLER_CUBE:
      return getTextureSetter(gl.TEXTURE_CUBE_MAP);
    default:  // we should never get here
      throw("unknown type: 0x" + type.toString(16));
  }

  function getTextureSetter(bindPoint) {
    return (size > 1)
      ? buildTextureArraySetter(bindPoint)
      : buildTextureSetter(bindPoint);
  }

  function buildTextureSetter(bindPoint) {
    return function(texture) {
      gl.uniform1i(loc, textureUnit);
      gl.activeTexture(gl.TEXTURE0 + textureUnit);
      gl.bindTexture(bindPoint, texture);
    };
  }

  function buildTextureArraySetter(bindPoint) {
    const units = Array.from(Array(size), () => textureUnit++);
    return function(textures) {
      gl.uniform1iv(loc, units);
      textures.forEach((texture, i) => {
        gl.activeTexture(gl.TEXTURE0 + units[i]);
        gl.bindTexture(bindPoint, texture);
      });
    };
  }
}

function createUniformSetters(gl, program) {
  const typeSizes = {
    [gl.FLOAT]: 1,
    [gl.FLOAT_VEC2]: 2,
    [gl.FLOAT_VEC3]: 3,
    [gl.FLOAT_VEC4]: 4,
    [gl.INT]: 1,
    [gl.INT_VEC2]: 2,
    [gl.INT_VEC3]: 3,
    [gl.INT_VEC4]: 4,
    [gl.BOOL]: 1,
    [gl.BOOL_VEC2]: 2,
    [gl.BOOL_VEC3]: 3,
    [gl.BOOL_VEC4]: 4,
    [gl.FLOAT_MAT2]: 4,
    [gl.FLOAT_MAT3]: 9,
    [gl.FLOAT_MAT4]: 16,
    [gl.SAMPLER_2D]: 1,
    [gl.SAMPLER_CUBE]: 1,
  };

  const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  const uniformInfo = Array.from({ length: numUniforms })
    .map((v, i) => gl.getActiveUniform(program, i))
    .filter(info => info !== undefined);

  var textureUnit = 0;

  return uniformInfo.reduce((d, info) => {
    let { name, type, size } = info;
    let isArray = name.endsWith("[0]");
    let key = isArray ? name.slice(0, -3) : name;

    //let setter = createUniformSetter(gl, program, info, textureUnit);
    //d[key] = wrapSetter(setter, isArray, type, size);
    d[key] = createUniformSetter(gl, program, info, textureUnit);

    if (type === gl.TEXTURE_2D || type === gl.TEXTURE_CUBE_MAP) {
      textureUnit += size;
    }

    return d;
  }, {});
}

function getVao(gl, program, attributeState) {
  const { attributes, indices } = attributeState;

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  Object.entries(attributes).forEach(([name, a]) => {
    var index = gl.getAttribLocation(program, name);
    if (index < 0) return;

    gl.enableVertexAttribArray(index);
    gl.bindBuffer(gl.ARRAY_BUFFER, a.buffer);
    gl.vertexAttribPointer(
      index, // index of attribute in program
      a.numComponents || a.size, // Number of elements to read per vertex
      a.type || gl.FLOAT, // Type of each element
      a.normalize || false, // Whether to normalize it
      a.stride || 0, // Byte spacing between vertices
      a.offset || 0 // Byte # to start reading from
    );
    gl.vertexAttribDivisor(index, a.divisor || 0);
  });

  if (indices) gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices.buffer);

  gl.bindVertexArray(null);
  return vao;
}

function initProgram(gl, vertexSrc, fragmentSrc) {
  const program = gl.createProgram();
  gl.attachShader(program, loadShader(gl, gl.VERTEX_SHADER, vertexSrc));
  gl.attachShader(program, loadShader(gl, gl.FRAGMENT_SHADER, fragmentSrc));
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    fail("Unable to link the program", gl.getProgramInfoLog(program));
  }

  return {
    uniformSetters: createUniformSetters(gl, program),
    use: () => gl.useProgram(program),
    constructVao: (attributeState) => getVao(gl, program, attributeState),
  };
}

function loadShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    let log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    fail("An error occured compiling the shader", log);
  }

  return shader;
}

function fail(msg, log) {
  throw Error("yawgl.initProgram: " + msg + ":\n" + log);
}

function initQuad(gl, instanceGeom) {
  const { x0, y0, w = 1.0, h = 1.0 } = instanceGeom;

  const triangles = new Float32Array([
    x0, y0,  x0 + w, y0,  x0 + w, y0 + h,
    x0, y0,  x0 + w, y0 + h,  x0, y0 + h,
  ]);

  // Create a buffer with the position of the vertices within one instance
  return initAttribute(gl, { data: triangles, divisor: 0 });
}

function initAttribute(gl, options) {
  // Set defaults for unsupplied values
  const {
    buffer = createBuffer(gl, options.data),
    numComponents = 2,
    type = gl.FLOAT,
    normalize = false,
    stride = 0,
    offset = 0,
    divisor = 1,
  } = options;

  // Return attribute state object
  return { buffer, numComponents, type, normalize, stride, offset, divisor };
}

function createBuffer(gl, data) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  return buffer;
}

function initContext(gl, framebuffer, framebufferSize) {
  // Input is an extended WebGL context, as created by yawgl.getExtendedContext
  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  return {
    gl,
    initQuad: (geom) => initQuad(gl, geom),
    initAttribute: (options) => initAttribute(gl, options),
    initProgram: (vert, frag) => initProgram(gl, preamble + vert, frag),
    canvas: framebufferSize,

    bindFramebufferAndSetViewport,
    clear,
    clipRect,
    drawInstancedQuads,
    drawElements,
  };

  function bindFramebufferAndSetViewport(pixRatio = 1) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    let { width, height } = framebufferSize;
    gl.viewport(0, 0, width, height);
  }

  function clear(color = [0.0, 0.0, 0.0, 0.0]) {
    gl.disable(gl.SCISSOR_TEST);
    gl.clearColor(...color);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  function clipRect(x, y, width, height) {
    gl.enable(gl.SCISSOR_TEST);
    let yflip = framebufferSize.height - y - height;
    let roundedArgs = [x, yflip, width, height].map(Math.round);
    gl.scissor(...roundedArgs);
  }

  function drawInstancedQuads(vao, numInstances) {
    gl.bindVertexArray(vao);
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, numInstances);
    gl.bindVertexArray(null);
  }

  function drawElements(vao, indices) {
    const { vertexCount, type, offset } = indices;
    gl.bindVertexArray(vao);
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    gl.bindVertexArray(null);
  }
}

function initBackground(context) {
  function initPainter(style) {
    const { paint } = style;

    return function({ zoom }) {
      let opacity = paint["background-opacity"](zoom);
      let color = paint["background-color"](zoom);
      context.clear(color.map(c => c * opacity));
    };
  }

  return { initPainter };
}

var vert = `attribute vec2 quadPos; // Vertices of the quad instance
attribute vec2 circlePos;

uniform float circleRadius;

varying vec2 delta;

void main() {
  vec2 mapPos = tileToMap(circlePos);

  // Shift to the appropriate corner of the current instance quad
  delta = 2.0 * quadPos * (circleRadius + 1.0);
  vec2 dPos = delta * screenScale.z;

  gl_Position = mapToClip(mapPos + dPos, 0.0);
}
`;

var frag = `precision mediump float;

uniform highp float circleRadius;
uniform vec4 strokeStyle;
uniform float globalAlpha;

varying vec2 delta;

void main() {
  float r = length(delta);
  float dr = fwidth(r);

  float taper = 1.0 - smoothstep(circleRadius - dr, circleRadius + dr, r);
  gl_FragColor = strokeStyle * globalAlpha * taper;
}
`;

function initSetters(pairs, uniformSetters) {
  function pair([get, key]) {
    let set = uniformSetters[key];
    return (z, f) => set(get(z, f));
  }

  return {
    zoomFuncs: pairs.filter(p => p[0].type !== "property").map(pair),
    dataFuncs: pairs.filter(p => p[0].type === "property").map(pair),
  };
}

function initGrid(context, useProgram, setters) {
  const { screenScale, mapCoords, mapShift } = setters;

  return function(tileset, pixRatio = 1) {
    useProgram();

    const { width, height } = context.canvas;
    screenScale([ 2 / width, -2 / height, pixRatio ]);

    const { x, y, z } = tileset[0];
    const j = 1 << z;
    const xw = x - Math.floor(x / j) * j;
    const extent = 512; // TODO: don't assume this!!
    mapCoords([xw, y, z, extent]);

    const { translate, scale } = tileset;
    const pixScale = scale * pixRatio;
    const [dx, dy] = [x, y].map((c, i) => (c + translate[i]) * pixScale);
    mapShift([dx, dy, pixScale]);

    return [translate, pixScale];
  };
}

function initTilesetPainter(setGrid, zoomFuncs, paintTile) {
  return function({ tileset, zoom, pixRatio = 1 }) {
    if (!tileset || !tileset.length) return;

    const [translate, scale] = setGrid(tileset, pixRatio);

    zoomFuncs.forEach(f => f(zoom));

    tileset.forEach(box => paintTile(box, zoom, translate, scale));
  };
}

function initVectorTilePainter(context, program) {
  const { id, setAtlas, dataFuncs, draw } = program;

  return function(tileBox, zoom, translate, scale) {
    const { x, y, tile } = tileBox;
    const { layers, atlas } = tile.data;

    const data = layers[id];
    if (!data) return;

    const [x0, y0] = [x, y].map((c, i) => (c + translate[i]) * scale);
    context.clipRect(x0, y0, scale, scale);

    if (setAtlas && atlas) setAtlas(atlas);

    data.compressed.forEach(f => drawFeature(zoom, f));
  };

  function drawFeature(zoom, feature) {
    dataFuncs.forEach(f => f(zoom, feature));
    draw(feature.path);
  }
}

function initCircle(context) {
  const program = context.initProgram(vert, frag);
  const { use, uniformSetters, constructVao } = program;

  const grid = initGrid(context, use, uniformSetters);

  const quadPos = context.initQuad({ x0: -0.5, y0: -0.5 });

  function load(buffers) {
    const { points, tileCoords } = buffers;
    const attributes = {
      quadPos,
      circlePos: context.initAttribute({ data: points }),
      tileCoords: context.initAttribute({ data: tileCoords, numComponents: 3 }),
    };
    const vao = constructVao({ attributes });
    return { vao, numInstances: points.length / 2 };
  }

  function draw(buffers) {
    const { vao, numInstances } = buffers;
    context.drawInstancedQuads(vao, numInstances);
  }

  function initPainter(style) {
    const { id, paint } = style;

    const { zoomFuncs, dataFuncs } = initSetters([
      [paint["circle-radius"],  "circleRadius"],
      [paint["circle-color"],   "strokeStyle"],
      [paint["circle-opacity"], "globalAlpha"],
    ], uniformSetters);

    const paintTile = initVectorTilePainter(context, { id, dataFuncs, draw });
    return initTilesetPainter(grid, zoomFuncs, paintTile);
  }
  return { load, initPainter };
}

var vert$1 = `attribute vec2 position;
attribute vec3 pointA, pointB, pointC, pointD;

uniform float lineWidth, miterLimit;

varying float yCoord;
varying vec2 miterCoord1, miterCoord2;

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
  vec2 extend = miterLimit * xBasis * pixWidth * (position.x - 0.5);
  // Add one pixel on either side of the line for the anti-alias taper
  float y = (pixWidth + 2.0) * position.y;
  vec2 point = mapB + xAxis * position.x + yBasis * y + extend;
  miterCoord1 = (m1 * vec3(point - mapB, 1)).xy;
  miterCoord2 = (m2 * vec3(point - mapC, 1)).xy;

  // Remove pixRatio from varying (we taper edges using unscaled value)
  yCoord = y / screenScale.z;

  gl_Position = mapToClip(point, pointB.z + pointC.z);
}
`;

var frag$1 = `precision highp float;

uniform vec4 strokeStyle;
uniform float lineWidth, globalAlpha;

varying float yCoord;
varying vec2 miterCoord1, miterCoord2;

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

  vec4 premult = vec4(strokeStyle.rgb * strokeStyle.a, strokeStyle.a);
  gl_FragColor = premult * globalAlpha * antialias * taperx * tapery;
}
`;

function initLineLoader(context, constructVao) {
  const { gl, initQuad, initAttribute } = context;

  const position = initQuad({ x0: 0.0, y0: -0.5 });

  const numComponents = 3;
  const stride = Float32Array.BYTES_PER_ELEMENT * numComponents;

  return function(buffers) {
    const { lines, tileCoords } = buffers;

    // Create buffer containing the vertex positions
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, lines, gl.STATIC_DRAW);

    // Create interleaved attributes pointing to different offsets in buffer
    const attributes = {
      position,
      pointA: setupPoint(0),
      pointB: setupPoint(1),
      pointC: setupPoint(2),
      pointD: setupPoint(3),
      tileCoords: initAttribute({ data: tileCoords, numComponents: 3 }),
    };

    function setupPoint(shift) {
      const offset = shift * stride;
      return initAttribute({ buffer, numComponents, stride, offset });
    }

    const vao = constructVao({ attributes });

    return { vao, numInstances: lines.length / numComponents - 3 };
  };
}

function initLine(context) {
  const program = context.initProgram(vert$1, frag$1);
  const { use, uniformSetters, constructVao } = program;

  const grid = initGrid(context, use, uniformSetters);

  const load = initLineLoader(context, constructVao);

  function draw(buffers) {
    const { vao, numInstances } = buffers;
    context.drawInstancedQuads(vao, numInstances);
  }

  function initPainter(style) {
    const { id, layout, paint } = style;

    const { zoomFuncs, dataFuncs } = initSetters([
      // TODO: move these to serialization step??
      //[layout["line-cap"],      "lineCap"],
      //[layout["line-join"],     "lineJoin"],
      [layout["line-miter-limit"], "miterLimit"],

      [paint["line-width"],     "lineWidth"],
      [paint["line-color"],     "strokeStyle"],
      [paint["line-opacity"],   "globalAlpha"],
      // line-gap-width,
      // line-translate, line-translate-anchor,
      // line-offset, line-blur, line-gradient, line-pattern
    ], uniformSetters);

    const paintTile = initVectorTilePainter(context, { id, dataFuncs, draw });
    return initTilesetPainter(grid, zoomFuncs, paintTile);
  }
  return { load, initPainter };
}

var vert$2 = `attribute vec2 a_position;

uniform vec2 translation;   // From style property paint["fill-translate"]

void main() {
  vec2 mapPos = tileToMap(a_position) + translation * screenScale.z;

  gl_Position = mapToClip(mapPos, 0.0);
}
`;

var frag$2 = `precision mediump float;

uniform vec4 fillStyle;
uniform float globalAlpha;

void main() {
    gl_FragColor = fillStyle * globalAlpha;
}
`;

function initFillLoader(context, constructVao) {
  const { gl, initAttribute } = context;

  return function(buffers) {
    const { vertices, indices: indexData, lines, tileCoords } = buffers;

    const attributes = {
      a_position: initAttribute({ data: vertices, divisor: 0 }),
      tileCoords: initAttribute({ data: tileCoords, numComponents: 3 }),
    };

    const indices = {
      buffer: gl.createBuffer(),
      vertexCount: indexData.length,
      type: gl.UNSIGNED_SHORT,
      offset: 0
    };
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices.buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexData, gl.STATIC_DRAW);

    const vao = constructVao({ attributes, indices });
    return { vao, indices };
  };
}

function initFill(context) {
  const program = context.initProgram(vert$2, frag$2);
  const { use, uniformSetters, constructVao } = program;
  const grid = initGrid(context, use, uniformSetters);

  const load = initFillLoader(context, constructVao);

  function draw(buffers) {
    const { vao, indices } = buffers;
    context.drawElements(vao, indices);
  }

  function initPainter(style) {
    const { id, paint } = style;

    const { zoomFuncs, dataFuncs } = initSetters([
      [paint["fill-color"],     "fillStyle"],
      [paint["fill-opacity"],   "globalAlpha"],
      [paint["fill-translate"], "translation"],
    ], uniformSetters);

    const paintTile = initVectorTilePainter(context, { id, dataFuncs, draw });
    return initTilesetPainter(grid, zoomFuncs, paintTile);
  }
  return { load, initPainter };
}

var vert$3 = `attribute vec2 quadPos;  // Vertices of the quad instance
attribute vec2 labelPos; // x, y
attribute vec3 charPos;  // dx, dy, scale (relative to labelPos)
attribute vec4 sdfRect;  // x, y, w, h

varying vec2 texCoord;

void main() {
  texCoord = sdfRect.xy + sdfRect.zw * quadPos;

  vec2 mapPos = tileToMap(labelPos);

  // Shift to the appropriate corner of the current instance quad
  vec2 dPos = (charPos.xy + sdfRect.zw * quadPos) * charPos.z * screenScale.z;

  gl_Position = mapToClip(mapPos + dPos, 0.0);
}
`;

var frag$3 = `precision highp float;

uniform sampler2D sdf;
uniform vec2 sdfDim;
uniform vec4 fillStyle;
uniform float globalAlpha;

varying vec2 texCoord;

void main() {
  float sdfVal = texture2D(sdf, texCoord / sdfDim).a;
  // Find taper width: ~ dScreenPixels / dTexCoord
  float screenScale = 1.414 / length(fwidth(texCoord));
  float screenDist = screenScale * (191.0 - 255.0 * sdfVal) / 32.0;

  // TODO: threshold 0.5 looks too pixelated. Why?
  float alpha = smoothstep(-0.8, 0.8, -screenDist);
  gl_FragColor = fillStyle * (alpha * globalAlpha);
}
`;

function initTextLoader(context, constructVao) {
  const { initQuad, initAttribute } = context;

  const quadPos = initQuad({ x0: 0.0, y0: 0.0 });

  return function(buffers) {
    const { origins, deltas, rects, tileCoords } = buffers;

    const attributes = {
      quadPos,
      labelPos: initAttribute({ data: origins }),
      charPos: initAttribute({ data: deltas, numComponents: 3 }),
      sdfRect: initAttribute({ data: rects, numComponents: 4 }),
      tileCoords: initAttribute({ data: tileCoords, numComponents: 3 }),
    };
    const vao = constructVao({ attributes });

    return { vao, numInstances: origins.length / 2 };
  };
}

function initAtlasLoader(gl) {
  return function(atlas) {
    const { width, height, data } = atlas;

    const target = gl.TEXTURE_2D;
    const texture = gl.createTexture();
    gl.bindTexture(target, texture);

    const level = 0;
    const format = gl.ALPHA;
    const border = 0;
    const type = gl.UNSIGNED_BYTE;

    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

    gl.texImage2D(target, level, format, 
      width, height, border, format, type, data);

    gl.texParameteri(target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    return { width, height, sampler: texture };
  };
}

function initText(context) {
  const program = context.initProgram(vert$3, frag$3);
  const { use, uniformSetters, constructVao } = program;
  const grid = initGrid(context, use, uniformSetters);

  const load = initTextLoader(context, constructVao);
  const loadAtlas = initAtlasLoader(context.gl);

  function draw(buffers) {
    const { vao, numInstances } = buffers;
    context.drawInstancedQuads(vao, numInstances);
  }

  function setAtlas(atlas) {
    uniformSetters.sdf(atlas.sampler);
    uniformSetters.sdfDim([atlas.width, atlas.height]);
  }

  function initPainter(style) {
    const { id, paint } = style;

    const { zoomFuncs, dataFuncs } = initSetters([
      [paint["text-color"],     "fillStyle"],
      [paint["text-opacity"],   "globalAlpha"],

      // text-halo-color
      // TODO: sprites
    ], uniformSetters);

    const progInfo = { id, dataFuncs, setAtlas, draw };
    const paintTile = initVectorTilePainter(context, progInfo);
    return initTilesetPainter(grid, zoomFuncs, paintTile);
  }
  return { load, loadAtlas, initPainter };
}

function initGLpaint(gl, framebuffer, framebufferSize) {
  const context = initContext(gl, framebuffer, framebufferSize);

  const programs = {
    "background": initBackground(context),
    "circle": initCircle(context),
    "line":   initLine(context),
    "fill":   initFill(context),
    "symbol": initText(context),
  };

  function loadBuffers(buffers) {
    if (buffers.vertices) {
      return programs.fill.load(buffers);
    } else if (buffers.lines) {
      return programs.line.load(buffers);
    } else if (buffers.points) {
      return programs.circle.load(buffers);
    } else if (buffers.origins) {
      return programs.symbol.load(buffers);
    } else {
      throw("loadBuffers: unknown buffers structure!");
    }
  }

  function initPainter(style) {
    const { id, type, source, minzoom = 0, maxzoom = 24 } = style;

    const program = programs[type];
    if (!program) return () => null;

    const painter = program.initPainter(style);
    return Object.assign(painter, { id, type, source, minzoom, maxzoom });
  }

  return {
    bindFramebufferAndSetViewport: context.bindFramebufferAndSetViewport,
    clear: context.clear,
    loadBuffers,
    loadAtlas: programs.symbol.loadAtlas,
    initPainter,
  };
}

export { initGLpaint };
