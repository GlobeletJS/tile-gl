# tile-gl circle 

## Rendering
Circles are rendered via [instanced drawing][]. The instance geometry is a
simple square quad with four corner points (divided into two triangles). The
circle shape is then constructed in the fragment shader, by computing the
distance from the center of the circle, comparing it to the circle radius,
and tapering appropriately.

## Serialization
The serialized data uploaded to the GPU includes:
- A position array containing the 2D positions of the circle centers
- Feature-dependent style value arrays, IF the style functions depend on feature
  properties

Allowed feature-dependent styles include:
- [circle-radius](https://maplibre.org/maplibre-gl-js-docs/style-spec/layers/#paint-circle-circle-radius)
- [circle-color](https://maplibre.org/maplibre-gl-js-docs/style-spec/layers/#paint-circle-circle-color)
- [circle-opacity](https://maplibre.org/maplibre-gl-js-docs/style-spec/layers/#paint-circle-circle-opacity)

[instanced drawing]: https://webgl2fundamentals.org/webgl/lessons/webgl-instanced-drawing.html

## TODO
The current code only fills circles with a single color. None of the
[circle-stroke-][] properties from the style spec have been implemented.

[circle-stroke-]: https://maplibre.org/maplibre-gl-js-docs/style-spec/layers/#paint-circle-circle-stroke-color
