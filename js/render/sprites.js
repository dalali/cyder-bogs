window.CB = window.CB || {};

// Sprites drawn facing RIGHT (positive X = front). Caller does ctx.rotate(angle).
// Style: chunky top-down soldiers matching original Cyberdogs aesthetic.
// Player = blue body + orange head. Enemies = red/dark variants of same silhouette.

CB.Sprites = {

  // ── shared soldier silhouette ──────────────────────────────────────────────
  // bodyColor, headColor, gunColor, dark = shadow/boot color
  _drawSoldier(ctx, bodyColor, headColor, gunColor, dark, big) {
    const s = big ? 1.4 : 1.0;  // scale factor for heavy/boss

    // Boots (back, negative X)
    ctx.fillStyle = dark;
    ctx.fillRect(-9*s, -5*s, 4*s, 3*s);
    ctx.fillRect(-9*s,  2*s, 4*s, 3*s);

    // Body (solid rectangle — the uniform)
    ctx.fillStyle = bodyColor;
    ctx.fillRect(-8*s, -5*s, 13*s, 10*s);

    // Belt line
    ctx.fillStyle = dark;
    ctx.fillRect(-8*s, -1*s, 13*s, 2*s);

    // Gun hand (toward front)
    ctx.fillStyle = dark;
    ctx.fillRect( 4*s, -2*s, 3*s, 4*s);

    // Gun barrel
    ctx.fillStyle = gunColor;
    ctx.fillRect( 6*s, -1*s, 7*s, 2*s);

    // Head — large round circle, the most recognisable feature
    ctx.fillStyle = headColor;
    ctx.beginPath();
    ctx.arc(3*s, 0, 6*s, 0, Math.PI * 2);
    ctx.fill();

    // Helmet top (darker band across top half of head)
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.arc(3*s, 0, 6*s, -Math.PI, 0);
    ctx.fill();

    // Eye glint
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(6*s, -1*s, 2*s, 2*s);
  },

  // ── player ────────────────────────────────────────────────────────────────
  drawPlayer(ctx, cx, cy, angle, flashRed) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    if (flashRed) {
      ctx.fillStyle = '#FF4444';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    // Blue uniform, orange head (matches original Cyberdogs player)
    CB.Sprites._drawSoldier(ctx, '#2255cc', '#dd6622', '#111111', '#112288', false);

    ctx.restore();
  },

  // ── enemies ───────────────────────────────────────────────────────────────
  drawEnemy(ctx, subtype, cx, cy) {
    ctx.save();
    ctx.translate(cx, cy);

    switch (subtype) {

      case 'grunt':
        // Same silhouette as player, dark red — classic Cyberdogs enemy look
        CB.Sprites._drawSoldier(ctx, '#882211', '#cc3311', '#111111', '#441100', false);
        break;

      case 'heavy': {
        // Stockier armored variant — grey with red visor
        const s = 1.25;
        // Body
        ctx.fillStyle = '#444444';
        ctx.fillRect(-9*s, -5*s, 14*s, 10*s);
        // Shoulder pads
        ctx.fillStyle = '#333333';
        ctx.fillRect(-10*s, -6*s, 3*s, 5*s);
        ctx.fillRect(-10*s,  1*s, 3*s, 5*s);
        // Heavy gun
        ctx.fillStyle = '#111111';
        ctx.fillRect(4*s, -2*s, 3*s, 4*s);
        ctx.fillRect(6*s, -1*s, 9*s, 3*s);
        // Head — grey helmet, red visor slit
        ctx.fillStyle = '#666666';
        ctx.beginPath();
        ctx.arc(3*s, 0, 7*s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#333333';
        ctx.beginPath();
        ctx.arc(3*s, 0, 7*s, -Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#cc2200';
        ctx.fillRect(0*s, -2*s, 8*s, 3*s);
        ctx.fillStyle = '#ff4400';
        ctx.fillRect(1*s, -1*s, 6*s, 1*s);
        break;
      }

      case 'sniper':
        // Dark camo green, same silhouette but with long rifle
        CB.Sprites._drawSoldier(ctx, '#334422', '#445533', '#111111', '#1a2211', false);
        // Extra long barrel override
        ctx.fillStyle = '#111111';
        ctx.fillRect(6, -1, 11, 2);   // longer than standard
        ctx.fillRect(12, -3, 2, 2);   // scope
        break;

      case 'berserker': {
        // Bigger, red, arms wide — no gun, uses fists
        const s = 1.15;
        ctx.fillStyle = '#660000';
        ctx.fillRect(-8*s, -6*s, 14*s, 12*s);
        ctx.fillStyle = '#440000';
        ctx.fillRect(-8*s, -1*s, 14*s, 2*s);
        // Wide arms with claws
        ctx.fillStyle = '#880000';
        ctx.fillRect(-12*s, -3*s, 5*s, 3*s);
        ctx.fillRect(-12*s,  0*s, 5*s, 3*s);
        ctx.fillRect( 5*s, -4*s, 5*s, 3*s);
        ctx.fillRect( 5*s,  1*s, 5*s, 3*s);
        // Claws
        ctx.fillStyle = '#ffccaa';
        ctx.fillRect(-13*s, -3*s, 3*s, 2*s);
        ctx.fillRect(-13*s,  1*s, 3*s, 2*s);
        ctx.fillRect(9*s, -4*s, 3*s, 2*s);
        ctx.fillRect(9*s,  1*s, 3*s, 2*s);
        // Head — blood red, big, angry
        ctx.fillStyle = '#cc0000';
        ctx.beginPath();
        ctx.arc(3*s, 0, 7*s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#880000';
        ctx.beginPath();
        ctx.arc(3*s, 0, 7*s, -Math.PI, 0);
        ctx.fill();
        // Yellow eyes
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(0*s, -2*s, 3*s, 2*s);
        ctx.fillRect(5*s, -2*s, 3*s, 2*s);
        break;
      }

      case 'boss': {
        // Large mech — black armoured exosuit
        const s = 1.6;
        // Leg units
        ctx.fillStyle = '#111133';
        ctx.fillRect(-11*s, -6*s, 7*s, 5*s);
        ctx.fillRect(-11*s,  1*s, 7*s, 5*s);
        // Main body
        ctx.fillStyle = '#1a1a44';
        ctx.fillRect(-11*s, -7*s, 18*s, 14*s);
        // Chest plate
        ctx.fillStyle = '#222266';
        ctx.fillRect(-9*s, -6*s, 13*s, 5*s);
        ctx.fillRect(-9*s,  1*s, 13*s, 5*s);
        // Weapon arm
        ctx.fillStyle = '#111111';
        ctx.fillRect(6*s, -2*s, 3*s, 4*s);
        ctx.fillRect(8*s, -1*s, 10*s, 3*s);
        ctx.fillStyle = '#ff4400';
        ctx.fillRect(17*s, -1*s, 2*s, 2*s);  // muzzle glow
        // Head — dark with cyan visor
        ctx.fillStyle = '#1a1a44';
        ctx.beginPath();
        ctx.arc(3*s, 0, 8*s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0a0a33';
        ctx.beginPath();
        ctx.arc(3*s, 0, 8*s, -Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#00ccff';
        ctx.fillRect(-2*s, -3*s, 10*s, 5*s);
        ctx.fillStyle = '#003344';
        ctx.fillRect(-1*s, -2*s, 8*s, 3*s);
        ctx.fillStyle = '#00eeff';
        ctx.fillRect(0*s, -1*s, 6*s, 2*s);
        // Antenna
        ctx.fillStyle = '#ff4400';
        ctx.fillRect(1*s, -12*s, 2*s, 5*s);
        ctx.fillRect(-1*s, -13*s, 6*s, 3*s);
        break;
      }
    }

    ctx.restore();
  },

  // ── fire effect ───────────────────────────────────────────────────────────
  drawFireEffect(ctx, cx, cy, age) {
    const t = age * 8;
    ctx.save();
    ctx.translate(cx, cy);
    const colors = ['#FF6600', '#FF3300', '#FF9900', '#FFAA00'];
    for (let i = 0; i < 6; i++) {
      const phase = t + i * (Math.PI * 2 / 6);
      const r = 8 + Math.sin(phase * 1.3) * 3;
      const px = Math.cos(phase) * r;
      const py = Math.sin(phase) * r - Math.abs(Math.sin(phase * 2)) * 4;
      const sz = 2 + Math.abs(Math.sin(phase * 2.1)) * 3;
      ctx.fillStyle = colors[i % colors.length];
      ctx.globalAlpha = 0.7 + Math.sin(phase * 3) * 0.3;
      ctx.fillRect(px - sz / 2, py - sz / 2, sz, sz);
    }
    ctx.globalAlpha = 0.5 + Math.sin(t * 2) * 0.3;
    ctx.fillStyle = '#FFFF44';
    ctx.fillRect(-2, -2, 4, 4);
    ctx.globalAlpha = 1;
    ctx.restore();
  },
};
