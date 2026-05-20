window.CB = window.CB || {};

CB.Tiles = {
  // Draw a single tile at screen position sx, sy (top-left of tile)
  draw(ctx, tileId, sx, sy, exitActive) {
    const S = CB.TILE_SIZE;
    const C = CB.COLORS;

    switch (tileId) {
      case CB.TILE.FLOOR:
      case CB.TILE.SPAWN_PLAYER:
      case CB.TILE.SPAWN_ENEMY:
        ctx.fillStyle = C.FLOOR;
        ctx.fillRect(sx, sy, S, S);
        break;

      case CB.TILE.WALL: {
        ctx.fillStyle = C.WALL;
        ctx.fillRect(sx, sy, S, S);
        // Top & left highlight
        ctx.fillStyle = C.WALL_LIGHT;
        ctx.fillRect(sx, sy, S, 1);
        ctx.fillRect(sx, sy, 1, S);
        // Bottom & right shadow
        ctx.fillStyle = C.WALL_DARK;
        ctx.fillRect(sx, sy + S - 1, S, 1);
        ctx.fillRect(sx + S - 1, sy, 1, S);
        break;
      }

      case CB.TILE.EXIT: {
        if (exitActive) {
          ctx.fillStyle = C.EXIT_ACTIVE;
          ctx.fillRect(sx, sy, S, S);
          // Pulsing border
          const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 500);
          ctx.globalAlpha = 0.5 + 0.5 * pulse;
          ctx.strokeStyle = C.EXIT_GLOW;
          ctx.lineWidth = 2;
          ctx.strokeRect(sx + 1, sy + 1, S - 2, S - 2);
          ctx.globalAlpha = 1;
          // Arrow inward
          ctx.fillStyle = C.EXIT_GLOW;
          // down-pointing arrows
          ctx.fillRect(sx + 13, sy + 6, 6, 4);
          ctx.fillRect(sx + 14, sy + 10, 4, 4);
          ctx.fillRect(sx + 15, sy + 14, 2, 4);
        } else {
          ctx.fillStyle = C.EXIT_LOCKED;
          ctx.fillRect(sx, sy, S, S);
        }
        break;
      }

      case CB.TILE.COVER: {
        ctx.fillStyle = C.COVER;
        ctx.fillRect(sx, sy, S, S);
        // Top edge lighter
        ctx.fillStyle = '#7A5228';
        ctx.fillRect(sx, sy, S, 2);
        // Right & bottom shadow
        ctx.fillStyle = C.COVER_DARK;
        ctx.fillRect(sx + S - 2, sy, 2, S);
        ctx.fillRect(sx, sy + S - 2, S, 2);
        // Inner inset panel
        ctx.fillStyle = '#4A3015';
        ctx.fillRect(sx + 4, sy + 4, S - 8, S - 8);
        break;
      }

      case CB.TILE.DOOR: {
        ctx.fillStyle = C.FLOOR;
        ctx.fillRect(sx, sy, S, S);
        ctx.fillStyle = C.DOOR;
        // Side frames
        ctx.fillRect(sx, sy, 4, S);
        ctx.fillRect(sx + S - 4, sy, 4, S);
        // Top arch
        ctx.fillRect(sx, sy, S, 4);
        break;
      }
    }
  },

  // Render all visible tiles
  renderAll(ctx, tilemap, camera, objState) {
    const S = CB.TILE_SIZE;
    const tx0 = Math.max(0, Math.floor(camera.x / S));
    const ty0 = Math.max(0, Math.floor(camera.y / S));
    const tx1 = Math.min(tilemap.width - 1, Math.ceil((camera.x + CB.CANVAS_W) / S));
    const ty1 = Math.min(tilemap.height - 1, Math.ceil((camera.y + CB.VIEWPORT_H) / S));

    const exitActive = objState ? CB.Objectives.exitActive(objState) : false;

    for (let ty = ty0; ty <= ty1; ty++) {
      for (let tx = tx0; tx <= tx1; tx++) {
        const id = tilemap.tileAt(tx, ty);
        const sx = tx * S - camera.x;
        const sy = ty * S - camera.y;
        CB.Tiles.draw(ctx, id, sx, sy, exitActive);
      }
    }
  },
};
