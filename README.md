# tile-gl

![tests](https://github.com/GlobeletJS/tile-gl/actions/workflows/node.js.yml/badge.svg)

Data serializers and WebGL renderers for tiled vector map layers

tile-gl exposes two methods:
- initSerializer: Initialize a geometry serializer, to parse GeoJSON
  features into buffers that can be read by tile-gl renderers
- initGLpaint: Wrap a WebGL context with methods to load the buffers to the
  GPU, and to construct renderers for [MapLibre style layers][MapLibre]

See a simple [example][] of tile-gl rendering vector tile data following a
style from [OpenMapTiles][]

[MapLibre]: https://maplibre.org/maplibre-gl-js-docs/style-spec/layers/
[example]: https://globeletjs.github.io/tile-gl/examples/maptiler-basic/index.html
[OpenMapTiles]: https://openmaptiles.org/styles/

## initSerializer
Initializes a geometry serializer, to parse GeoJSON features into buffers
that can be read by tile-gl renderers

### Syntax
```javascript
import * as tileGL from "tile-gl";

const serializer = tileGL.initSerializer(parameters);
```

where the supplied parameters object has the following properties:
- `glyphs`: The [glyphs][] property from the style document. Used for
  processing text labels in symbol layers
- `spriteData`: The data referenced in the [sprite][] property from the
  style document, loaded into an object with properties `{ image, meta }`,
  as returned by [tile-stencil][]
- `layers` (REQUIRED): An array containing the [layers][MapLibre] from 
  the style document that use data from a given [source][]

[glyphs]: https://maplibre.org/maplibre-gl-js-docs/style-spec/glyphs/
[sprite]: https://maplibre.org/maplibre-gl-js-docs/style-spec/sprite/
[tile-stencil]: https://github.com/GlobeletJS/tile-stencil/
[source]: https://maplibre.org/maplibre-gl-js-docs/style-spec/sources/

### API
Initialization returns a function with the following signature:
```javascript
const tilePromise = serializer(source, tileCoords);
```

The arguments are:
- `source`: A dictionary of GeoJSON FeatureCollections, with each collection
  containing the features for each layer of the style, as returned by
  [tile-mixer][]
- `tileCoords`: An object with properties `{ z, x, y }` corresponding to the
  indices of the tile data

The return value is a [Promise][] that resolves to the serialized tile data.
See below for a description of the data structure

[tile-mixer]: https://github.com/GlobeletJS/tile-mixer
[Promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise

### Format of returned data
The returned data structure is as follows:
```javascript
{
  atlas,
  layers: {
    layerId_1: { type, extent, buffers, features },
    layerId_2: { type, extent, buffers, features },
    ...
    layerId_N: { type, extent, buffers, features }
  }
}
```

The `.atlas` property points to an atlas of the signed distance functions
(SDFs) for the glyphs needed to render text label features in the tile.
For more information about glyphs and SDFs, see the [tile-labeler][] module.

The `.layers` property points to a dictionary of layers of processed tile data,
keyed on the ID of the relevant style layer. Each layer has the following
properties:
- `type`: The [type of the style layer][styleType] that defines how these
  features will be rendered
- `extent`: The extent of the geometry of the features in the layer (See the
  [vector tile specification][vector tile])
- `buffers`: Geometry and style information for the features of the layer,
  serialized into buffers
- `features` (Optional): The original GeoJSON features. Only present for
  style layers where `layer.interactive === true`. This array is suitable
  for interactive querying of individual layer features

[tile-labeler]: https://github.com/GlobeletJS/tile-labeler
[styleType]: https://maplibre.org/maplibre-gl-js-docs/style-spec/layers/#type

## initGLpaint
Wraps a WebGL contexts with methods to load buffers to the GPU, and to
construct renderers for [MapLibre style layers][MapLibre]

### Syntax
```javascript
import * as tileGL from "tile-gl";

const context = tileGL.initGLpaint(parameters);
```

where the supplied parameters object has the following properties:
- `.context` (REQUIRED): A WebGL context wrapper, as created by the
  [yawgl][] method `initContext`
- `.framebuffer`: A framebuffer object, as created by `context.initFramebuffer`,
  on which draw calls will be executed. If null, draw calls will render
  directly to `context.gl.canvas`
- `.projScale`: A Boolean flag indicating whether to scale style dimensions
  by the ratio of the projection scale at the given feature, vs the supplied
  scalar (e.g., the projection scale at the camera position). Default: false
- `.multiTile`: A Boolean flag indicating whether painter programs (initialized
  by the `.initPainter` method) will input multi-tile tilesets. Default: true.
  Set to false to initialize single-tile painters
 
[yawgl]: https://github.com/GlobeletJS/yawgl

### API
The returned context object exposes the following methods:
- `.prep()`: Calls `context.bindFramebufferAndSetViewport` and `context.clear`,
  as prep for a draw call
- `.loadBuffers(buffers)`: Loads the supplied buffers
- `.loadAtlas(atlas)`: Loads a supplied atlas image object, as generated by
  [tile-labeler][]. Returns a link to a [WebGLTexture object][]
- `.loadSprite(image)`: Loads a supplied sprite image. Note: the
  [sprite property][] from a style document is a URL template. The input image
  to `.loadSprite(image)` should be the actual [HTMLImageElement][], e.g., as
  loaded from the URL into `spriteData.image` by [tile-stencil][]
  Returns a link to a [WebGLTexture object][]
- `.initPainter(style, sprite)`: Initializes a painter program for the given
  style layer. Note: the style layer must have been parsed by [tile-stencil][].
  For symbol layers with sprite features, the second argument is a texture
  object representing a spritesheet previously loaded with the `.loadSprite`
  method

[WebGLTexture object]: https://developer.mozilla.org/en-US/docs/Web/API/WebGLTexture
[sprite property]: https://maplibre.org/maplibre-gl-js-docs/style-spec/sprite/
[HTMLImageElement]: https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement

### Signature of painter functions
The painter functions returned by the `.initPainter` method have the following
signature:
```javascript
const painter = context.initPainter(style);

painter(parameters);
```

where the `parameters` object has the following properties:
`{ tile OR tileset, zoom, pixRatio, cameraScale }`.
- `tile` (IF the context was initialized with `multiTile: false`): 
  The tile to be rendered. The tile object must have the following properties:
  - `z, x, y`: The coordinate indices of the tile
  - `data`: A data object with the same structure as returned by [tile-mixer][],
    with the `.atlas` processed by the tile-gl context's `.loadAtlas` method,
    and the layer `.buffers` properties processed by `.loadBuffers`
- `tileset` (IF the context was initialized with `multiTile: true`):
  An array of tileboxes. The array has global properties `{ translate, scale }`,
  which can be used to compute the position of each tile within a viewport. See
  [d3-tile][] for details. Each tilebox element in the array has the following 
  properties:
  - `z, x, y`: The coordinates of the map tile to be rendered using this tile's
    data (may be different from the native coordinates of the tile)
  - `tile`: A tile object with properties `{ z, x, y, data }`, as described
    above for single-tile rendering
- `zoom`: The zoom level to be used for setting zoom-dependent styles
- `pixRatio`: The ratio between Canvas pixel dimensions and map style
  dimensions. This should usually be set to [window.devicePixelRatio][].
  Default: 1.0
- `cameraScale`: The projection scale at the camera position. Used for scaling
  style dimensions by relative projection scales, IF the context was initialized
  with `projScale: true`. Default: 1.0

[tile-mixer]: https://github.com/GlobeletJS/tile-mixer
[d3-tile]: https://github.com/d3/d3-tile
[window.devicePixelRatio]: https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio
