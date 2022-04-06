# tile-gl fill

## Rendering
Polygons for fill layers are rendered as indexed triangles.

## Serialization
Polygon features are triangulated using [earcut][]. The data uploaded to the
GPU includes:
- A position buffer containing the 2D positions of the vertices of the polygon
- An index buffer indexing the vertices into triangles
- Feature-dependent style value arrays, IF the style functions depend on feature
  properties.

Allowed feature-dependent styles include:
- [fill-color](https://maplibre.org/maplibre-gl-js-docs/style-spec/layers/#paint-fill-fill-color)
- [fill-opacity](https://maplibre.org/maplibre-gl-js-docs/style-spec/layers/#paint-fill-fill-opacity)

## TODO
The following features are not implemented yet:
- [fill-pattern](https://maplibre.org/maplibre-gl-js-docs/style-spec/layers/#paint-fill-fill-pattern)
- [fill-outline-color](https://maplibre.org/maplibre-gl-js-docs/style-spec/layers/#paint-fill-fill-outline-color).
  No outlines are rendered. If an outline is desired, an additional layer can be
  added to the style document, rendering the same data as a [line layer][].

[line layer]: https://maplibre.org/maplibre-gl-js-docs/style-spec/layers/#line
