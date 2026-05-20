window.CB = window.CB || {};

CB.HUD = {
  HUD_Y: 520,   // CB.VIEWPORT_H

  draw(ctx, player, mission, stats, objState) {
    const C = CB.COLORS;
    const HY = CB.HUD.HUD_Y;

    // Background bar
    ctx.fillStyle = C.HUD_BG;
    ctx.fillRect(0, HY, CB.CANVAS_W, CB.HUD_H);
    ctx.fillStyle = C.HUD_BORDER;
    ctx.fillRect(0, HY, CB.CANVAS_W, 1);

    // HP Section (x:8, w:152)
    CB.HUD._drawHP(ctx, player, 8, HY + 8);

    // Weapon slots (x:180, w:440)
    CB.HUD._drawWeaponSlots(ctx, player, 180, HY + 4);

    // Credits (x:660, w:140)
    CB.HUD._drawCredits(ctx, player.credits || 0, 660, HY + 8);

    // Top overlay
    if (mission) {
      CB.HUD._drawTopOverlay(ctx, mission, stats, objState, player);
    }
  },

  _drawHP(ctx, player, x, y) {
    const C = CB.COLORS;
    ctx.font = '8px "Press Start 2P", monospace';

    // HP label
    ctx.fillStyle = C.TEXT_LABEL;
    ctx.textAlign = 'left';
    ctx.fillText('HP', x, y + 10);

    // Bar track
    const barX = x + 20;
    const barY = y + 2;
    const barW = 110;
    const barH = 10;
    ctx.fillStyle = C.HP_BG;
    ctx.fillRect(barX, barY, barW, barH);

    // Bar fill — color shifts
    const hpRatio = player.hp / player.hpMax;
    let barColor = C.HP_BAR;
    if (hpRatio <= 0.25) {
      // Flash at 1Hz when critical
      barColor = Math.floor(Date.now() / 500) % 2 === 0 ? '#FF2222' : '#881100';
    } else if (hpRatio <= 0.5) {
      barColor = '#FF6600';
    }
    ctx.fillStyle = barColor;
    ctx.fillRect(barX, barY, Math.ceil(barW * hpRatio), barH);

    // HP text
    ctx.fillStyle = C.TEXT_PRIMARY;
    ctx.fillText(`${player.hp}/${player.hpMax}`, x + 134, y + 10);

    // Armor
    ctx.fillStyle = player.armor > 0 ? C.ARMOR_ICON : C.TEXT_DIM;
    ctx.fillText(`ARMOR: ${player.armor > 0 ? player.armor : '--'}`, x, y + 30);
  },

  _drawWeaponSlots(ctx, player, x, y) {
    const C = CB.COLORS;
    const slotW = 140;
    const slotH = 68;
    const gap = 4;

    for (let i = 0; i < 3; i++) {
      const sx = x + i * (slotW + gap);
      const w = player.weapons[i];
      const isActive = player.activeSlot === i;

      // Background
      ctx.fillStyle = isActive ? '#0D1A0D' : '#0A0A0A';
      ctx.fillRect(sx, y, slotW, slotH);

      // Border
      ctx.strokeStyle = isActive ? C.WEAPON_ACTIVE : C.WEAPON_INACTIVE;
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.strokeRect(sx + 0.5, y + 0.5, slotW - 1, slotH - 1);

      // Slot number
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = C.TEXT_DIM;
      ctx.fillText(`[${i + 1}]`, sx + 4, y + 14);

      if (w) {
        const def = CB.WEAPON_DEFS[w.kind];
        const ammoRatio = w.ammo / def.ammoMax;

        // Weapon name
        ctx.fillStyle = C.TEXT_PRIMARY;
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.fillText(def.name, sx + 4, y + 34);

        // Ammo count
        let ammoColor = C.AMMO_TEXT;
        if (w.ammo === 0) ammoColor = C.AMMO_EMPTY;
        else if (ammoRatio < 0.25) ammoColor = C.AMMO_LOW;

        ctx.fillStyle = ammoColor;
        ctx.fillText(`${w.ammo}/${def.ammoMax}`, sx + 4, y + 54);
      } else {
        ctx.fillStyle = C.TEXT_DIM;
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillText('----', sx + 4, y + 40);
      }
    }
  },

  _drawCredits(ctx, credits, x, y) {
    const C = CB.COLORS;
    ctx.textAlign = 'right';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = C.TEXT_LABEL;
    ctx.fillText('CR', x + 136, y + 10);
    ctx.font = '16px "Press Start 2P", monospace';
    ctx.fillStyle = C.ACCENT_GOLD;
    ctx.fillText(CB.Utils.formatNum(credits), x + 136, y + 40);
  },

  _drawTopOverlay(ctx, mission, stats, objState, player) {
    const C = CB.COLORS;

    // Semi-transparent backing
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, CB.CANVAS_W, 22);

    ctx.font = '8px "Press Start 2P", monospace';

    // Mission name (left)
    ctx.textAlign = 'left';
    ctx.fillStyle = C.TEXT_LABEL;
    ctx.fillText(`MISSION ${mission.id}: ${mission.title}`, 8, 14);

    // Kill counter (center) — only for KILL_ALL objectives
    if (mission.objectives.indexOf('KILL_ALL') >= 0 || mission.objectives.indexOf('KILL_TARGET') >= 0) {
      const { killed, total } = CB.Objectives.getKillCount({ enemies: stats._enemies || [] });
      ctx.textAlign = 'center';
      ctx.fillStyle = C.TEXT_PRIMARY;
      ctx.fillText(`KILLS: ${killed} / ${total}`, CB.CANVAS_W / 2, 14);
    }

    // Objectives (right)
    if (objState) {
      ctx.textAlign = 'right';
      let rx = CB.CANVAS_W - 8;
      for (let i = objState.defs.length - 1; i >= 0; i--) {
        const obj = objState.defs[i];
        const done = objState.completed[obj];
        const label = obj === 'KILL_ALL' ? 'KILL ALL'
          : obj === 'KILL_TARGET' ? 'KILL BOSS'
          : 'REACH EXIT';
        ctx.fillStyle = done ? C.ACCENT_GREEN : '#555555';
        ctx.fillText(`${done ? '[x]' : '[ ]'} ${label}`, rx, 14);
        rx -= ctx.measureText(`${done ? '[x]' : '[ ]'} ${label}  `).width;
      }
    }
  },
};
