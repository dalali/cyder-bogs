window.CB = window.CB || {};

CB.Sprites = {
  // Draw player sprite at (cx, cy) — rotated by caller
  // cx/cy are screen coords, angle applied via ctx.rotate
  drawPlayer(ctx, cx, cy, angle, flashRed) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    if (flashRed) {
      ctx.fillStyle = '#FF2222';
      ctx.fillRect(-8, -8, 16, 16);
    } else {
      // Body (10x10)
      ctx.fillStyle = '#8888AA';
      ctx.fillRect(-5, -5, 10, 10);

      // Head (6x6) — in direction of angle (right = angle 0)
      ctx.fillStyle = '#9999BB';
      ctx.fillRect(2, -3, 6, 6);

      // Snout (direction indicator)
      ctx.fillStyle = '#AAAACC';
      ctx.fillRect(7, -1, 3, 2);

      // Tail (opposite of head)
      ctx.fillStyle = '#777799';
      ctx.fillRect(-8, -2, 4, 4);

      // Legs (4 corners)
      ctx.fillStyle = '#666688';
      ctx.fillRect(-6, -6, 3, 3);
      ctx.fillRect(3, -6, 3, 3);
      ctx.fillRect(-6, 3, 3, 3);
      ctx.fillRect(3, 3, 3, 3);
    }

    ctx.restore();
  },

  // Draw enemy sprite at cx, cy (relative to entity center, pre-translated & rotated)
  drawEnemy(ctx, subtype, cx, cy) {
    ctx.save();
    ctx.translate(cx, cy);

    switch (subtype) {
      case 'grunt': {
        ctx.fillStyle = '#664422';
        ctx.fillRect(-5, -5, 10, 10);
        ctx.fillStyle = '#885533';
        ctx.fillRect(-3, -7, 6, 6);
        ctx.fillStyle = '#443311';
        ctx.fillRect(-1, -1, 2, 2);
        break;
      }
      case 'heavy': {
        ctx.fillStyle = '#444444';
        ctx.fillRect(-6, -6, 12, 12);
        ctx.fillStyle = '#555555';
        ctx.fillRect(-3, -9, 7, 7);
        // Shoulder pads
        ctx.fillStyle = '#333333';
        ctx.fillRect(-8, -4, 3, 4);
        ctx.fillRect(5, -4, 3, 4);
        ctx.fillStyle = '#666666';
        ctx.fillRect(-6, -6, 12, 1);
        break;
      }
      case 'sniper': {
        ctx.fillStyle = '#335522';
        ctx.fillRect(-4, -6, 8, 12);
        ctx.fillStyle = '#446633';
        ctx.fillRect(-2, -9, 5, 5);
        // Rifle barrel
        ctx.fillStyle = '#222222';
        ctx.fillRect(4, -1, 8, 1);
        break;
      }
      case 'berserker': {
        ctx.fillStyle = '#661111';
        ctx.fillRect(-6, -6, 12, 12);
        ctx.fillStyle = '#882222';
        ctx.fillRect(-4, -9, 8, 8);
        // Arms spread
        ctx.fillStyle = '#550000';
        ctx.fillRect(-9, -2, 4, 3);
        ctx.fillRect(5, -2, 4, 3);
        break;
      }
      case 'boss': {
        ctx.fillStyle = '#222244';
        ctx.fillRect(-12, -12, 24, 24);
        ctx.fillStyle = '#333355';
        ctx.fillRect(-5, -16, 10, 10);
        // Shoulder cannon
        ctx.fillStyle = '#111133';
        ctx.fillRect(6, -14, 4, 8);
        // Border highlight
        ctx.fillStyle = '#4444AA';
        ctx.fillRect(-12, -12, 24, 1);
        ctx.fillRect(-12, -12, 1, 24);
        break;
      }
    }

    ctx.restore();
  },
};
