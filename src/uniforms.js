import { rgb as d3rgb } from 'd3-color';

export function initUniforms(transform) {
  const { mapCoords, mapShift, screenScale } = transform;

  const uniforms = {
    mapCoords, mapShift, screenScale, // Pointers. Values updated outside
    translation: new Float32Array([0, 0]),
    fillStyle: new Float32Array([0, 0, 0, 1]),
    strokeStyle: new Float32Array([0, 0, 0, 1]),
    globalAlpha: 1.0,
    lineWidth: 1.0,
    miterLimit: 10.0,
    sdf: null,
    sdfDim: [256, 256],
  };

  // Mimic Canvas2D API
  const setters = {
    set globalAlpha(val) {
      if (val < 0.0 || val > 1.0) return;
      uniforms.globalAlpha = val;
    },
    set fillStyle(val) {
      let color = convertColor(val);
      if (!color || color.length !== 4) return;
      uniforms.fillStyle.set(convertColor(val));
    },
    set strokeStyle(val) {
      let color = convertColor(val);
      if (!color || color.length !== 4) return;
      uniforms.strokeStyle.set(convertColor(val));
    },
    set lineWidth(val) {
      uniforms.lineWidth = val;
    },
    set miterLimit(val) {
      uniforms.miterLimit = val;
    },
    set font(val) {
      uniforms.sdf = val.sampler;
      uniforms.sdfDim = [val.width, val.height];
    },
    set translation(val) {
      if (!val || val.length !== 2) return;
      uniforms.translation.set(val);
    },
    // TODO: implement dashed lines, patterns
    setLineDash: () => null,
    createPattern: () => null,
  };

  return { values: uniforms, setters };

  function convertColor(cssString) {
    let c = d3rgb(cssString);
    return [c.r / 255, c.g / 255, c.b / 255, c.opacity];
  }
}
