export function initTransform(framebufferSize) {
  const scalar      = new Float64Array(2); // a, d
  const skew        = new Float64Array(2); // c, b
  const translation = new Float64Array(2); // e, f

  function getTransform() {
    let [a, d] = scalar;
    let [c, b] = skew;
    let [e, f] = translation;
    return [a, b, c, d, e, f];
  }

  function reset() {
    let { width, height } = framebufferSize;

    scalar[0] = 2 / width;
    scalar[1] = -2 / height;
    skew[0] = 0;
    skew[1] = 0;
    translation[0] = -1;
    translation[1] = 1;
  }

  function setTransform(a, b, c, d, e, f) {
    reset();
    transform(a, b, c, d, e, f);
  }

  function transform(a, b, c, d, e, f) {
    translate(e, f);
    let [a0, d0] = scalar;
    scalar[0] = a0 * a + skew[0] * b;
    scalar[1] = d0 * d + skew[1] * c;
    skew[0] = a0 * c + skew[0] * d;
    skew[1] = d0 * b + skew[1] * a;
  }

  function translate(e, f) {
    translation[0] += scalar[0] * e + skew[0] * f;
    translation[1] += scalar[1] * f + skew[1] * e;
  }

  function scale(a, d) {
    scalar[0] *= a;
    scalar[1] *= d;
    skew[0] *= d;
    skew[1] *= a;
  }

  // Mimic Canvas2D API
  const methods = {
    transform,
    translate,
    scale,
    setTransform,
    getTransform,
  };

  return { scalar, skew, translation, methods };
}
