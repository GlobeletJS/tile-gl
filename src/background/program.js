export function initBackground(context) {
  function initPainter(style) {
    const { paint } = style;

    return function({ zoom }) {
      const opacity = paint["background-opacity"](zoom);
      const color = paint["background-color"](zoom);
      context.clear(color.map(c => c * opacity));
    };
  }

  return { initPainter };
}
