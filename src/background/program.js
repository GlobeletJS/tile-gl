export function initBackground(context) {
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
