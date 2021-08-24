export function initBackground(context) {
  function initPainter(id, paint) {
    return function({ zoom }) {
      const opacity = paint["background-opacity"](zoom);
      const color = paint["background-color"](zoom);
      context.clear(color.map(c => c * opacity));
    };
  }

  return { initPainter };
}
