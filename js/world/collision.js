window.CB = window.CB || {};

CB.Collision = {
  // Move entity by dx,dy with tile-grid AABB collision (axis-separated for sliding)
  moveAndCollide(entity, dx, dy, tilemap) {
    // X axis
    entity.x += dx;
    if (CB.Collision._overlapsSolid(entity, tilemap)) {
      entity.x -= dx;
    }
    // Y axis
    entity.y += dy;
    if (CB.Collision._overlapsSolid(entity, tilemap)) {
      entity.y -= dy;
    }
  },

  // Check if entity's AABB overlaps any solid tile (corners + edges)
  _overlapsSolid(entity, tilemap) {
    const hw = entity.w / 2;
    const hh = entity.h / 2;
    const left   = entity.x - hw;
    const right  = entity.x + hw - 1;
    const top    = entity.y - hh;
    const bottom = entity.y + hh - 1;

    const tx0 = Math.floor(left  / CB.TILE_SIZE);
    const tx1 = Math.floor(right / CB.TILE_SIZE);
    const ty0 = Math.floor(top   / CB.TILE_SIZE);
    const ty1 = Math.floor(bottom / CB.TILE_SIZE);

    for (let ty = ty0; ty <= ty1; ty++) {
      for (let tx = tx0; tx <= tx1; tx++) {
        if (tilemap.isSolid(tx, ty)) return true;
      }
    }
    return false;
  },

  // Can the entity move to given absolute position?
  canMoveTo(entity, nx, ny, tilemap) {
    const hw = entity.w / 2;
    const hh = entity.h / 2;
    const left   = nx - hw;
    const right  = nx + hw - 1;
    const top    = ny - hh;
    const bottom = ny + hh - 1;

    const tx0 = Math.floor(left  / CB.TILE_SIZE);
    const tx1 = Math.floor(right / CB.TILE_SIZE);
    const ty0 = Math.floor(top   / CB.TILE_SIZE);
    const ty1 = Math.floor(bottom / CB.TILE_SIZE);

    for (let ty = ty0; ty <= ty1; ty++) {
      for (let tx = tx0; tx <= tx1; tx++) {
        if (tilemap.isSolid(tx, ty)) return false;
      }
    }
    return true;
  },
};
