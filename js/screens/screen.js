window.CB = window.CB || {};

// Base screen — all screens implement this interface
// { enter(game, args), exit(game), update(dt, game), render(ctx, game), onKey(e, game), onClick(x, y, game), onMouseMove(x, y, game) }

CB.BaseScreen = {
  _hitTargets: [],
  _focusedIndex: 0,

  _buildHitTargets() {
    this._hitTargets = [];
    this._focusedIndex = 0;
  },

  _addHit(rect, action) {
    this._hitTargets.push({ rect, action });
  },

  _testClick(x, y) {
    for (const ht of this._hitTargets) {
      const r = ht.rect;
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) {
        ht.action();
        return true;
      }
    }
    return false;
  },

  _cycleFocus(dir) {
    const n = this._hitTargets.length;
    if (n === 0) return;
    this._focusedIndex = ((this._focusedIndex + dir) % n + n) % n;
  },

  _activateFocused() {
    const ht = this._hitTargets[this._focusedIndex];
    if (ht) ht.action();
  },
};
