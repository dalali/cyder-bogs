window.CB = window.CB || {};

CB.Entity = {
  create(opts) {
    return Object.assign({
      id: CB.Game.nextId(),
      type: 'entity',
      subtype: 'generic',
      x: 0, y: 0,
      w: 20, h: 20,
      angle: 0,
      vx: 0, vy: 0,
      solid: true,
      hp: 1, hpMax: 1,
      dead: false,
      age: 0,
      data: {},
    }, opts);
  },
};
