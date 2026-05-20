// main.js — bootstrap entry point
window.CB = window.CB || {};

(function () {
  function start() {
    const canvas = document.getElementById('game');
    if (!canvas) {
      console.error('Canvas element #game not found');
      return;
    }

    canvas.width = CB.CANVAS_W;
    canvas.height = CB.CANVAS_H;

    CB.Game.init(canvas);
    CB.Loop.start(CB.Game);
  }

  // Wait for fonts to load, then start
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(start);
  } else {
    // Fallback for browsers without FontFaceSet
    window.addEventListener('load', start);
  }
})();
