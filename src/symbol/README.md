# tile-gl symbol

## Rendering
Symbols are rendered via [instanced drawing][]. The instance geometry is a
simple rectangular quad with four corner points (divided into two triangles).

Text instances are rendered from [signed distance fields][] (SDFs). Sprites
(small icons at the label position) are rendered from the
[spritesheet supplied with the style document][sprite].

Text and sprite instances are serialized all together into one set of buffers.
The fragment shader simply chooses between the two computed texture values
based on the value of a font scalar attribute, which is set to zero for sprites.

[instanced drawing]: https://webgl2fundamentals.org/webgl/lessons/webgl-instanced-drawing.html
[signed distance fields]: https://observablehq.com/@jjhembd/mapbox-glyph-pbfs
[sprite]: https://maplibre.org/maplibre-gl-js-docs/style-spec/sprite/

## Serialization
Data serialization is delegated to the [tile-labeler][] module.

Unlike other layer types, serializing text depends on more than just the feature
geometry and the style. We first have to load the SDF for each glyph, from which
we get the dimensions of the character, and compute where it will fit within the
overall label.

The following data is uploaded to the GPU:
- 2D position of the label as a whole
- Label rotation angle (for labels along a line)
- Font size scalar
- Position of the glyph relative to the main label position
- Size of the glyph
- Texture coordinates within the SDF atlas (or spritesheet)
- Feature-dependent style value arrays, IF the style functions depend on feature
  properties

Allowed feature-dependent styles include:
- [icon-opacity](https://maplibre.org/maplibre-gl-js-docs/style-spec/layers/#paint-symbol-icon-opacity)
- [text-color](https://maplibre.org/maplibre-gl-js-docs/style-spec/layers/#paint-symbol-text-color)
- [text-opacity](https://maplibre.org/maplibre-gl-js-docs/style-spec/layers/#paint-symbol-text-opacity)
- [text-halo-color](https://maplibre.org/maplibre-gl-js-docs/style-spec/layers/#paint-symbol-text-halo-color)
- [text-halo-blur](https://maplibre.org/maplibre-gl-js-docs/style-spec/layers/#paint-symbol-text-halo-blur)
- [text-halo-width](https://maplibre.org/maplibre-gl-js-docs/style-spec/layers/#paint-symbol-text-halo-width)

Note: since we are using instanced rendering, all the above data only needs to
be uploaded once per glyph, rather than once for each of the four vertices.

[tile-labeler]: https://github.com/GlobeletJS/tile-labeler

## TODO
Most of these will require new code in [tile-labeler][].
- Labels aligned along a line geometry are currently only rotated to the local
  slope of the line. We should also honor the local curvature, and perhaps even
  a third-order term for S-shaped labels
- Symbol collisions are computed once in tile-labeler. It might be better to
  compute a minimum zoom at which the label can be displayed without colliding
  with other labels, so that overzoomed tiles can show more labels
- Text is always laid out from left to right. We should honor right-to-left
  scripts
