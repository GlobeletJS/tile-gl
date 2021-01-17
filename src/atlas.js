export function initAtlasLoader(gl) {
  const target = gl.TEXTURE_2D;
  const level = 0;
  const format = gl.ALPHA;
  const border = 0;
  const type = gl.UNSIGNED_BYTE;

  return function(atlas) {
    const { width, height, data } = atlas;

    const texture = gl.createTexture();
    gl.bindTexture(target, texture);

    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

    gl.texImage2D(target, level, format, 
      width, height, border, format, type, data);

    gl.texParameteri(target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    return { width, height, sampler: texture };
  };
}
