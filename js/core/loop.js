window.CB = window.CB || {};

CB.Loop = {
  _lastTime: 0,
  _accumulator: 0,
  _running: false,
  _rafId: null,

  start(game) {
    CB.Loop._running = true;
    CB.Loop._lastTime = performance.now();
    CB.Loop._tick(game);
  },

  stop() {
    CB.Loop._running = false;
    if (CB.Loop._rafId) {
      cancelAnimationFrame(CB.Loop._rafId);
      CB.Loop._rafId = null;
    }
  },

  _tick(game) {
    if (!CB.Loop._running) return;
    CB.Loop._rafId = requestAnimationFrame((now) => CB.Loop._tick(game));

    const now = performance.now();
    let rawDt = (now - CB.Loop._lastTime) / 1000;
    CB.Loop._lastTime = now;

    // Clamp to avoid huge catch-up on tab return
    rawDt = Math.min(rawDt, CB.MAX_DT);
    CB.Loop._accumulator += rawDt;

    let updates = 0;
    while (CB.Loop._accumulator >= CB.FIXED_DT && updates < CB.MAX_UPDATES_PER_FRAME) {
      game.update(CB.FIXED_DT);
      CB.Loop._accumulator -= CB.FIXED_DT;
      updates++;
    }

    game.render();
  },
};
