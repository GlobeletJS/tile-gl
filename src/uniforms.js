import * as d3 from 'd3-color';

export function initUniforms(transform) {
  const uniforms = {
    projection: transform,
    fillStyle: [0, 0, 0, 1],
    strokeStyle: [0, 0, 0, 1],
    globalAlpha: 1.0,
    lineWidth: 1.0,
    miterLimit: 10.0,
    fontScale: 1.0,
    sdf: null,
    sdfDim: [256, 256],
  };

  // Mimic Canvas2D API
  const setters = {
    set globalAlpha(val) {
      uniforms.globalAlpha = val;
    },
    set fillStyle(val) {
      uniforms.fillStyle = convertColor(val);
    },
    set strokeStyle(val) {
      uniforms.strokeStyle = convertColor(val);
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
    set fontSize(val) {
      uniforms.fontScale = val / 24.0; // TODO: get divisor from sdf-manager?
    },
    // TODO: implement dashed lines, patterns
    setLineDash: () => null,
    createPattern: () => null,
  };

  return { values: uniforms, setters };
}

function convertColor(cssString) {
  let c = d3.rgb(cssString);
  return [c.r / 255, c.g / 255, c.b / 255, c.opacity];
}
