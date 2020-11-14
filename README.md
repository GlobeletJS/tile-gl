# tile-gl

2D context emulator in WebGL for vector tiles

## Installation
tile-gl is provided as an ESM import
```javascript
import * as tileGL from 'tile-gl';
```

tileGL exposes two things:
- initGLpaint: A function to initialize a 2D context emulator
- serializers: A dictionary of geometry serializers, to parse GeoJSON
  features into buffers that can be rendered with the context emulator

## initGLpaint

### Syntax
A new context emulator can be initalized as follows:
```javascript
const context = tileGL.initGLpaint(gl, framebuffer, framebufferSize);
```

where the arguments are:
- `gl`: A [WebGLRenderingContext], as extended by the [yawgl] method
  getExtendedContext
- `framebuffer`: The [WebGLFramebuffer] on which draw calls will be executed.
  If null, draw calls will render directly to the Canvas
- `framebufferSize`: An object with properties `{ width, height }` describing
  the dimensions of the framebuffer. For rendering to the Canvas, supply the
  Canvas itself

[WebGLRenderingContext]: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext
[yawgl]: https://github.com/GlobeletJS/yawgl
[WebGLFramebuffer]: https://developer.mozilla.org/en-US/docs/Web/API/WebGLFramebuffer

### API
The returned context object has the following properties and methods:
- `gl`: A back-link to the WebGL context supplied on init
- `canvas`: A back-link to the `framebufferSize` object supplied on init
- `clear(color)`: Clears the canvas to the supplied color, where `color` is a
  4-element array of clamped floats, which defaults to [0, 0, 0, 0]
- `clipRect(x, y, width, height)`:
- `fill(buffers)`: ...
- `stroke(buffers)`: ...
- `fillText(buffers)`: ...
- ...
- `loadBuffers(buffers)`: ...

## serializers
A dictionary of geometry serializers, to parse GeoJSON features into buffers
that can be rendered with the context emulator.

Types:
- `circle`: Inputs Point or MultiPoint geometries, and creates the buffers
  needed to render circle styles
- `line`: Inputs LineString, MultiLineString, Polygon, or MultiPolygon
  geometries, and creates the buffers needed to render line styles
- `fill`: Inputs Polygon or MultiPolygon geometries, and creates the buffers
  needed to render fill styles

...

## TODO
- Finish this README
- Canvas2D strokeText method or similar, for text-halo
- Gapped lines for line-gap-width in Mapbox styles
