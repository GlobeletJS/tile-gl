# tile-gl code structure
The code for each [layer type][] is placed in its own directory, including
both shader programs and data serializers. This is to help keep the structure
of the serialized data near at hand when looking at the inputs (attributes) in
the shader code.

When the code is bundled, a single serializer function will be constructed
(in serialize/serialize.js). This function can be constructed and executed
on a Web Worker (see [tile-worker][]).

Also, a context initializer will be constructed in main.js. The initialized
context constructs painter functions that input the serialized data and
draw it on the Canvas.

[layer type]: https://maplibre.org/maplibre-gl-js-docs/style-spec/layers/#type
[tile-worker]: https://github.com/GlobeletJS/tile-worker

## TODO
Add support for [raster layers][].

[raster layers]: https://maplibre.org/maplibre-gl-js-docs/style-spec/layers/#raster
