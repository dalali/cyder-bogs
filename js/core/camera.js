window.CB = window.CB || {};

CB.Camera = {
  create() {
    return { x: 0, y: 0 };
  },

  follow(camera, target, mapW, mapH) {
    const vw = CB.CANVAS_W;
    const vh = CB.VIEWPORT_H;

    // Center camera on target
    let cx = target.x - vw / 2;
    let cy = target.y - vh / 2;

    // Clamp to map bounds
    cx = CB.Utils.clamp(cx, 0, Math.max(0, mapW - vw));
    cy = CB.Utils.clamp(cy, 0, Math.max(0, mapH - vh));

    camera.x = cx;
    camera.y = cy;
  },
};
