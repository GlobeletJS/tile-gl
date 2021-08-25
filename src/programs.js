import { initGrid } from "./grid.js";
import { initBackground } from "./background/program.js";
import { initCircle } from "./circle/program.js";
import { initLine } from "./line/program.js";
import { initFill } from "./fill/program.js";
import { initText } from "./text/program.js";

export function initPrograms(context, framebuffer, preamble) {
  const { initProgram, initAttribute, initIndices } = context;

  return {
    "background": initBackground(context),
    "circle": initPaintProgram(initCircle(context)),
    "line": initPaintProgram(initLine(context)),
    "fill": initPaintProgram(initFill(context)),
    "symbol": initPaintProgram(initText(context)),
  };

  function initPaintProgram(progInfo) {
    const { vert, frag, styleMap } = progInfo;

    const program = initProgram(preamble + vert, frag);

    const load = initLoader(progInfo, program.constructVao);

    const initTilesetPainter = initGrid(context, framebuffer.size, program);
    function initPainter(id, paint) {
      const zoomFuncs = styleMap
        .map(([styleKey, shaderVar]) => ([paint[styleKey], shaderVar]));
      return initTilesetPainter(id, zoomFuncs);
    }

    return { load, initPainter };
  }

  function initLoader(progInfo, constructVao) {
    const { attrInfo, getSpecialAttrs, countInstances } = progInfo;

    function getAttributes(buffers) {
      return Object.entries(attrInfo).reduce((d, [key, info]) => {
        const data = buffers[key];
        if (data) d[key] = initAttribute(Object.assign({ data }, info));
        return d;
      }, getSpecialAttrs(buffers));
    }

    function loadInstanced(buffers) {
      const attributes = getAttributes(buffers);
      const vao = constructVao({ attributes });
      return { vao, instanceCount: countInstances(buffers) };
    }

    function loadIndexed(buffers) {
      const attributes = getAttributes(buffers);
      const indices = initIndices({ data: buffers.indices });
      const vao = constructVao({ attributes, indices });
      return { vao, indices, count: buffers.indices.length };
    }

    return (!!countInstances)
      ? loadInstanced
      : loadIndexed;
  }
}
