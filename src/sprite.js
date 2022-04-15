export function initSprite(context, programs) {
  // Construct a default sprite: one blue pixel
  const bluePixel = new Uint8Array([0, 0, 255, 255]);
  let spriteTexture = context.initTexture({ data: bluePixel, mips: false });

  // Collect sprite setter uniforms from the programs
  const spriteSetters = Object.values(programs)
    .map(({ use, uniformSetters }) => ({ use, set: uniformSetters.sprite }))
    .filter(setter => setter.set !== undefined);

  function load(image) {
    if (image) spriteTexture = context.initTexture({ image, mips: false });
  }

  function set() {
    spriteSetters.forEach(({ use, set }) => (use(), set(spriteTexture)));
  }

  return { load, set };
}
