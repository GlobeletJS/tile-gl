# tile-gl background

## Rendering
Background layers are rendered as a single quad (divided into two triangles)
which is filled with the color and opacity specified in the style document.

## Serialization
Background layers do not input any data. We construct a default buffer
containing the quad in ../style-prog.js.

## TODO
Implement [background-pattern](https://maplibre.org/maplibre-gl-js-docs/style-spec/layers/#paint-background-background-pattern)
