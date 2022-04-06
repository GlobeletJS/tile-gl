# tile-gl line

## Rendering
Line segments are rendered via [instanced drawing][]. The instance geometry is
a simple rectangular quad with four corner points (divided into two triangles).

The inspiration for tile-gl's line rendering strategy came from Rye Terrell's
[fascinating article][Terrell 1]. However, that article used overlapping
instances. The overlapping instances are problematic for partially transparent
lines. Terrell addressed this in his [second article][Terrell 2], by splitting
the geometry into non-overlapping instances, with specially-shaped geometries
for the line joins.

tile-gl sticks with a simple rectangular instance, and applies tapers in the
fragment shader to avoid double-rendering the overlap between instances.
(We need fragment shader tapers anyway for [anti-aliasing][].)

To compute the tapers, we first do some coordinate transformation in the vertex
shader, and then send three sets of 2D coordinates to the fragment shader:
1. Line coordinates, with the x-axis aligned along the line segment. The y-value
   is used for computing antialias tapers, both at the outer edge of the line
   and on the inside of [line casings][]. The x-values are used to toggle
   the line color on and off along the line, to create dash patterns.
2. Miter coordinates, with the x-axis aligned along the "miter" seam between
   the start of the segment and the previous segment. (The x-axis bisects the
   angle between the segments, and points into the space bewteen them.)
   The y-values are used to impose a hard cut at the miter, to avoid overlap
   with the previous segment. The x-values are used for constructing the bevel
   at the join.
3. Miter coordinates, with the x-axis aligned along the "miter" seam between
   the end of the segment and the start of the next segment. These are used
   in the same way as the previous miter coordinates.

[instanced drawing]: https://webgl2fundamentals.org/webgl/lessons/webgl-instanced-drawing.html
[Terrell 1]: https://wwwtyro.net/2019/11/18/instanced-lines.html
[Terrell 2]: https://wwwtyro.net/2021/10/01/instanced-lines-part-2.html
[anti-aliasing]: https://blog.mapbox.com/drawing-antialiased-lines-with-opengl-8766f34192dc
[line casings]: https://maplibre.org/maplibre-gl-js-docs/style-spec/layers/#paint-line-line-gap-width

## Serialization
The beauty of instanced rendering for lines (as pointed out by
[Rye Terrell][Terrell 1], is that we only need to upload a single buffer
containing the line vertices.

Rendering of one instance needs to consider four points: the endpoints of the
current segment, plus the endpoints of the adjacent segments (for computing
the miters). But we can construct these four points as four attributes pointing
to *the same buffer*, simply by setting a different value for the "offset" in
[vertexAttribPointer][].

We do have to be careful with the ends of the LineString. We have to pad the
buffer with a few fake values, to make sure none of the attributes run off the
end of the buffer. For Polygons, the padded values must be copied from the other
end of the geometry, so that the two "ends" of the shape will miter together
correctly.

The data uploaded to the GPU is therefore:
- One position buffer, containing the 2D positions of the line vertices
- Feature-dependent style value arrays, IF the style functions depend on feature
  properties.

Allowed feature-dependent styles include:
- [line-color](https://maplibre.org/maplibre-gl-js-docs/style-spec/layers/#paint-line-line-color)
- [line-opacity](https://maplibre.org/maplibre-gl-js-docs/style-spec/layers/#paint-line-line-opacity)
- [line-width](https://maplibre.org/maplibre-gl-js-docs/style-spec/layers/#paint-line-line-width)
- [line-gap-width](https://maplibre.org/maplibre-gl-js-docs/style-spec/layers/#paint-line-line-gap-width)

[vertexAttribPointer]: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer

## TODO
The code only recognizes the first four numbers of [line-dasharray][].

Also, the following style properties are not implemented yet:
- [line-blur](https://maplibre.org/maplibre-gl-js-docs/style-spec/layers/#paint-line-line-blur)
- [line-cap](https://maplibre.org/maplibre-gl-js-docs/style-spec/layers/#layout-line-line-cap).
  Caps are drawn as "butt" caps, regardless of the style setting
- [line-join](https://maplibre.org/maplibre-gl-js-docs/style-spec/layers/#layout-line-line-join).
  Round joins are not implemented. Miter joins are default. Bevel joins can
  be rendered by setting [line-miter-limit][] to zero
- [line-offset](https://maplibre.org/maplibre-gl-js-docs/style-spec/layers/#paint-line-line-offset)
- [line-translate](https://maplibre.org/maplibre-gl-js-docs/style-spec/layers/#paint-line-line-translate)

The following styles are not implemented, and it is not clear if their usage
is common enough to warrant adding that much complexity to the code:
- [line-gradient](https://maplibre.org/maplibre-gl-js-docs/style-spec/layers/#paint-line-line-gradient)
- [line-pattern](https://maplibre.org/maplibre-gl-js-docs/style-spec/layers/#paint-line-line-pattern)

[line-dasharray]: https://maplibre.org/maplibre-gl-js-docs/style-spec/layers/#paint-line-line-dasharray
