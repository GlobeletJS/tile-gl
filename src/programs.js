import { initStyleProg } from "./style-prog.js";
import { initGrid } from "./grid.js";
import { initBackground } from "./background/program.js";
import { initCircle } from "./circle/program.js";
import { initLine } from "./line/program.js";
import { initFill } from "./fill/program.js";
import { initText } from "./text/program.js";

export function initPrograms(context, framebuffer, preamble) {
  const { initProgram, initAttribute, initIndices } = context;
  const bufferSize = framebuffer.size;

  return {
    "background": initBackground(context),
    "circle": initPaintProgram(initCircle(context)),
    "line": initPaintProgram(initLine(context)),
    "fill": initPaintProgram(initFill(context)),
    "symbol": initPaintProgram(initText(context)),
  };

  function initPaintProgram(progInfo) {
    const { vert, frag, styleKeys } = progInfo;

    const program = initProgram(preamble + vert, frag);
    const { uniformSetters, constructVao } = program;

    const load = initLoader(progInfo, constructVao);

    const initTileGrid = initGrid(context, uniformSetters);

    function initPainter(style) {
      const styleProg = initStyleProg(style, styleKeys, program, bufferSize);
      return initTileGrid(styleProg);
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

    return (countInstances) ? loadInstanced : loadIndexed;
  }
}
