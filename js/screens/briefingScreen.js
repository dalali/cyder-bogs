window.CB = window.CB || {};

CB.BriefingScreen = {
  _mission: null,

  enter(game) {
    const idx = game.playerState.missionIndex;
    CB.BriefingScreen._mission = CB.MISSION_DEFS[idx] || CB.MISSION_DEFS[0];
  },

  exit() {},
  update(dt, game) {},

  render(ctx, game) {
    const C = CB.COLORS;
    const W = CB.CANVAS_W;
    const H = CB.CANVAS_H;
    const m = CB.BriefingScreen._mission;
    if (!m) return;

    ctx.fillStyle = C.UI_BG;
    ctx.fillRect(0, 0, W, H);

    // Mission number
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = C.TEXT_DIM;
    ctx.fillText(`MISSION ${m.id}`, 40, 60);

    // Mission title
    ctx.font = '20px "Press Start 2P", monospace';
    ctx.fillStyle = C.TEXT_TITLE;
    ctx.fillText(m.title, 40, 95);

    // Divider
    ctx.fillStyle = C.UI_BORDER;
    ctx.fillRect(40, 108, W - 80, 1);

    // Situation header
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = C.TEXT_LABEL;
    ctx.fillText('SITUATION:', 40, 135);

    // Briefing text (wrapped)
    const lines = CB.UI.wrapText(m.briefing, 55);
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = C.TEXT_PRIMARY;
    lines.forEach((line, i) => {
      ctx.fillText(line, 40, 160 + i * 18);
    });

    let y = 160 + lines.length * 18 + 20;

    // Objectives
    ctx.fillStyle = C.TEXT_LABEL;
    ctx.fillText('OBJECTIVES:', 40, y);
    y += 22;

    for (const obj of m.objectives) {
      const label = obj === 'KILL_ALL' ? 'Eliminate all enemies'
        : obj === 'KILL_TARGET' ? 'Eliminate the Boss'
        : 'Reach the extraction point';
      ctx.fillStyle = C.TEXT_DIM;
      ctx.fillText('[ ]', 40, y);
      ctx.fillStyle = C.TEXT_PRIMARY;
      ctx.fillText(label, 72, y);
      y += 20;
    }

    y += 10;
    // Reward
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = C.ACCENT_GOLD;
    ctx.fillText(`REWARD: ${m.creditReward} CREDITS on completion`, 40, y);

    // Divider
    y += 16;
    ctx.fillStyle = C.UI_BORDER;
    ctx.fillRect(40, y, W - 80, 1);
    y += 18;

    // Current Loadout
    ctx.fillStyle = C.TEXT_LABEL;
    ctx.fillText('CURRENT LOADOUT:', 40, y);
    y += 18;
    CB.BriefingScreen._drawLoadout(ctx, game.playerState, 40, y);

    // Deploy button
    const btnW = 200;
    const btnH = 40;
    const btnX = W / 2 - btnW / 2;
    const btnY = H - 70;
    CB.UI.button(ctx, {
      x: btnX, y: btnY, w: btnW, h: btnH,
      label: 'DEPLOY', state: 'primary', focused: true,
    });
  },

  _drawLoadout(ctx, ps, x, y) {
    const C = CB.COLORS;
    const slotW = 120;
    const slotH = 44;
    const gap = 10;
    ps.weapons.forEach((w, i) => {
      const sx = x + i * (slotW + gap);
      ctx.fillStyle = '#0A0A0A';
      ctx.fillRect(sx, y, slotW, slotH);
      ctx.strokeStyle = i === ps.activeSlot ? C.WEAPON_ACTIVE : C.UI_BORDER;
      ctx.lineWidth = i === ps.activeSlot ? 2 : 1;
      ctx.strokeRect(sx + 0.5, y + 0.5, slotW - 1, slotH - 1);
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.textAlign = 'left';
      if (w) {
        const def = CB.WEAPON_DEFS[w.kind];
        ctx.fillStyle = C.TEXT_PRIMARY;
        ctx.fillText(def.name, sx + 4, y + 16);
        ctx.fillStyle = C.AMMO_TEXT;
        ctx.fillText(`${w.ammo}/${def.ammoMax}`, sx + 4, y + 32);
      } else {
        ctx.fillStyle = C.TEXT_DIM;
        ctx.fillText('--- EMPTY ---', sx + 4, y + 24);
      }
    });
  },

  onKey(e, game) {
    if (e.key === 'Enter' || e.key === ' ') {
      CB.BriefingScreen._deploy(game);
    }
    if (e.key === 'Escape') {
      game.setScreen('title');
    }
  },

  onClick(x, y, game) {
    const btnW = 200;
    const btnH = 40;
    const btnX = CB.CANVAS_W / 2 - btnW / 2;
    const btnY = CB.CANVAS_H - 70;
    if (x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH) {
      CB.BriefingScreen._deploy(game);
    }
  },

  onMouseMove() {},

  _deploy(game) {
    game.setScreen('playing');
  },
};
