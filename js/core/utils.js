window.CB = window.CB || {};

CB.Utils = {
  clamp(v, min, max) {
    return v < min ? min : v > max ? max : v;
  },

  lerp(a, b, t) {
    return a + (b - a) * t;
  },

  dist(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  },

  dist2(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return dx * dx + dy * dy;
  },

  angleTo(from, to) {
    return Math.atan2(to.y - from.y, to.x - from.x);
  },

  // AABB overlap test. Entities have x,y as center; w,h as full size
  aabbOverlap(a, b) {
    const aHW = a.w / 2, aHH = a.h / 2;
    const bHW = b.w / 2, bHH = b.h / 2;
    return (
      Math.abs(a.x - b.x) < aHW + bHW &&
      Math.abs(a.y - b.y) < aHH + bHH
    );
  },

  // AABB overlap with explicit rect {x,y,w,h} where x,y is top-left
  rectOverlap(r1, r2) {
    return (
      r1.x < r2.x + r2.w &&
      r1.x + r1.w > r2.x &&
      r1.y < r2.y + r2.h &&
      r1.y + r1.h > r2.y
    );
  },

  // Check if point px,py is inside rect {x,y,w,h} (top-left based)
  pointInRect(px, py, rx, ry, rw, rh) {
    return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
  },

  // LOS ray from entity 'from' to entity 'to', step by 16px
  hasLineOfSight(from, to, tilemap) {
    const steps = Math.ceil(CB.Utils.dist(from, to) / 16) + 1;
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const px = from.x + (to.x - from.x) * t;
      const py = from.y + (to.y - from.y) * t;
      if (tilemap.isSolidAtWorld(px, py)) return false;
    }
    return true;
  },

  // Normalize diagonal movement
  normalize(vx, vy) {
    const len = Math.sqrt(vx * vx + vy * vy);
    if (len === 0) return { x: 0, y: 0 };
    return { x: vx / len, y: vy / len };
  },

  // Random float [min, max)
  rand(min, max) {
    return min + Math.random() * (max - min);
  },

  // Format number with commas
  formatNum(n) {
    return Math.floor(n).toLocaleString();
  },

  // Format seconds as M:SS
  formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  },

  // Push two entities apart so they don't overlap (simple entity-vs-entity resolution)
  resolveOverlap(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const overlapX = (a.w / 2 + b.w / 2) - Math.abs(dx);
    const overlapY = (a.h / 2 + b.h / 2) - Math.abs(dy);
    if (overlapX <= 0 || overlapY <= 0) return;
    if (overlapX < overlapY) {
      const push = overlapX / 2;
      a.x -= dx > 0 ? push : -push;
      b.x += dx > 0 ? push : -push;
    } else {
      const push = overlapY / 2;
      a.y -= dy > 0 ? push : -push;
      b.y += dy > 0 ? push : -push;
    }
  },
};
