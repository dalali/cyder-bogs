window.CB = window.CB || {};

// All sprites drawn facing RIGHT (positive X = front). ctx.rotate(angle) handles orientation.

CB.Sprites = {

  drawPlayer(ctx, cx, cy, angle, flashRed) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    if (flashRed) {
      ctx.fillStyle = '#FF4444';
      ctx.fillRect(-9, -6, 18, 12);
      ctx.restore();
      return;
    }

    // Back leg (darker blue)
    ctx.fillStyle = '#1a3a99';
    ctx.fillRect(-8, 2, 6, 4);

    // Front leg
    ctx.fillStyle = '#1a3a99';
    ctx.fillRect(-8, -6, 6, 4);

    // Body — blue uniform
    ctx.fillStyle = '#2255cc';
    ctx.fillRect(-8, -5, 13, 10);

    // Belt / chest band
    ctx.fillStyle = '#112288';
    ctx.fillRect(-8, -1, 13, 2);

    // Gun arm (right side, front)
    ctx.fillStyle = '#1a3a99';
    ctx.fillRect(3, -2, 3, 4);

    // Gun barrel — dark gray
    ctx.fillStyle = '#222222';
    ctx.fillRect(5, -1, 8, 2);
    ctx.fillRect(6, 1, 3, 2);   // grip/stock

    // Head — orange (iconic)
    ctx.fillStyle = '#dd6622';
    ctx.beginPath();
    ctx.arc(4, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    // Helmet top — darker orange band
    ctx.fillStyle = '#bb4400';
    ctx.beginPath();
    ctx.arc(4, 0, 5, -Math.PI * 0.85, 0.15);
    ctx.lineTo(4, 0);
    ctx.fill();

    // Eye dot — white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(7, -1, 2, 2);

    ctx.restore();
  },

  drawEnemy(ctx, subtype, cx, cy, angle) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle || 0);

    switch (subtype) {

      case 'grunt': {
        // Back legs
        ctx.fillStyle = '#551100';
        ctx.fillRect(-7, 2, 5, 4);
        ctx.fillRect(-7, -6, 5, 4);
        // Body — dark red uniform
        ctx.fillStyle = '#882211';
        ctx.fillRect(-7, -5, 11, 10);
        // Belt
        ctx.fillStyle = '#551100';
        ctx.fillRect(-7, -1, 11, 2);
        // Gun arm
        ctx.fillStyle = '#661100';
        ctx.fillRect(2, -2, 3, 4);
        // Gun
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(4, -1, 7, 2);
        // Head — brighter red/orange
        ctx.fillStyle = '#cc3311';
        ctx.beginPath();
        ctx.arc(3, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        // Helmet stripe
        ctx.fillStyle = '#881100';
        ctx.beginPath();
        ctx.arc(3, 0, 5, -Math.PI * 0.85, 0.15);
        ctx.lineTo(3, 0);
        ctx.fill();
        break;
      }

      case 'heavy': {
        // Larger armored soldier
        // Legs
        ctx.fillStyle = '#333333';
        ctx.fillRect(-9, 3, 6, 5);
        ctx.fillRect(-9, -8, 6, 5);
        // Armored body
        ctx.fillStyle = '#555555';
        ctx.fillRect(-9, -6, 15, 12);
        // Chest plate highlight
        ctx.fillStyle = '#666666';
        ctx.fillRect(-7, -5, 10, 4);
        // Shoulder pads
        ctx.fillStyle = '#444444';
        ctx.fillRect(-10, -6, 3, 5);
        ctx.fillRect(-10, 1, 3, 5);
        // Gun arm
        ctx.fillStyle = '#444444';
        ctx.fillRect(4, -3, 4, 6);
        // Heavy gun
        ctx.fillStyle = '#111111';
        ctx.fillRect(6, -2, 9, 3);
        ctx.fillRect(7, 1, 4, 3);
        // Head — gray with dark visor
        ctx.fillStyle = '#777777';
        ctx.beginPath();
        ctx.arc(3, 0, 6, 0, Math.PI * 2);
        ctx.fill();
        // Visor slit
        ctx.fillStyle = '#cc3300';
        ctx.fillRect(1, -2, 7, 2);
        ctx.fillStyle = '#440000';
        ctx.fillRect(2, -1, 5, 1);
        break;
      }

      case 'sniper': {
        // Lean frame
        ctx.fillStyle = '#223311';
        ctx.fillRect(-6, 2, 4, 4);
        ctx.fillRect(-6, -6, 4, 4);
        // Camo body (dark green)
        ctx.fillStyle = '#334422';
        ctx.fillRect(-6, -5, 10, 10);
        // Camo patches
        ctx.fillStyle = '#223311';
        ctx.fillRect(-4, -4, 3, 3);
        ctx.fillRect(1, 1, 3, 3);
        // Long rifle
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(3, -1, 13, 2);   // long barrel
        ctx.fillRect(4, 1, 4, 2);     // stock
        ctx.fillRect(10, -3, 2, 2);   // scope
        // Head — dark camo
        ctx.fillStyle = '#445533';
        ctx.beginPath();
        ctx.arc(3, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        // Eye slit
        ctx.fillStyle = '#ffdd00';
        ctx.fillRect(5, -1, 3, 1);
        break;
      }

      case 'berserker': {
        // Muscular, arms wide
        ctx.fillStyle = '#660000';
        ctx.fillRect(-7, 3, 5, 5);
        ctx.fillRect(-7, -8, 5, 5);
        // Shredded body
        ctx.fillStyle = '#990000';
        ctx.fillRect(-7, -6, 14, 12);
        // Exposed muscle highlights
        ctx.fillStyle = '#772200';
        ctx.fillRect(-5, -5, 4, 4);
        ctx.fillRect(3, 1, 4, 4);
        // Arms spread wide (claws out)
        ctx.fillStyle = '#880000';
        ctx.fillRect(-10, -3, 4, 3);
        ctx.fillRect(-10, 0, 4, 3);
        ctx.fillRect(6, -4, 4, 3);
        ctx.fillRect(6, 1, 4, 3);
        // Claws
        ctx.fillStyle = '#ffccaa';
        ctx.fillRect(-12, -3, 3, 2);
        ctx.fillRect(-12, 1, 3, 2);
        ctx.fillRect(9, -4, 3, 2);
        ctx.fillRect(9, 1, 3, 2);
        // Head — blood red
        ctx.fillStyle = '#cc0000';
        ctx.beginPath();
        ctx.arc(3, 0, 6, 0, Math.PI * 2);
        ctx.fill();
        // Angry eyes
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(1, -2, 3, 2);
        ctx.fillRect(5, -2, 2, 2);
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(2, -1, 2, 1);
        ctx.fillRect(6, -1, 1, 1);
        break;
      }

      case 'boss': {
        // Large mech/exosuit
        // Leg units
        ctx.fillStyle = '#111133';
        ctx.fillRect(-13, 5, 8, 8);
        ctx.fillRect(-13, -13, 8, 8);
        // Main body — black armored suit
        ctx.fillStyle = '#1a1a44';
        ctx.fillRect(-13, -10, 22, 20);
        // Chest armor plates
        ctx.fillStyle = '#222266';
        ctx.fillRect(-10, -8, 14, 7);
        ctx.fillRect(-10, 1, 14, 7);
        // Shoulder cannon left
        ctx.fillStyle = '#0a0a33';
        ctx.fillRect(-14, -8, 5, 6);
        ctx.fillRect(-14, 2, 5, 6);
        // Main weapon arm / barrel
        ctx.fillStyle = '#111111';
        ctx.fillRect(8, -2, 12, 4);    // main barrel
        ctx.fillRect(8, -5, 6, 3);     // upper barrel
        ctx.fillStyle = '#ff4400';
        ctx.fillRect(18, -1, 3, 2);    // muzzle glow
        // Head unit — dark with glowing visor
        ctx.fillStyle = '#1a1a44';
        ctx.beginPath();
        ctx.arc(3, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        // Visor — glowing cyan
        ctx.fillStyle = '#00ccff';
        ctx.fillRect(-2, -3, 10, 6);
        ctx.fillStyle = '#004466';
        ctx.fillRect(-1, -2, 8, 4);
        ctx.fillStyle = '#00eeff';
        ctx.fillRect(0, -1, 6, 2);
        // Top antenna
        ctx.fillStyle = '#ff4400';
        ctx.fillRect(1, -10, 2, 4);
        ctx.fillRect(0, -12, 4, 3);
        break;
      }
    }

    ctx.restore();
  },

  // Animated fire particles around a burning enemy
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
