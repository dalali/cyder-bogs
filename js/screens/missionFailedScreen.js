window.CB = window.CB || {};

CB.MissionFailedScreen = {
  _data: null,

  enter(game, args) {
    CB.MissionFailedScreen._data = args || {};
    game.saveProgress();
  },

  exit() {},
  update(dt, game) {},

  render(ctx, game) {
    const C = CB.COLORS;
    const W = CB.CANVAS_W;
    const H = CB.CANVAS_H;
    const d = CB.MissionFailedScreen._data || {};

    // Background with red vignette
    ctx.fillStyle = C.UI_BG;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(180,0,0,0.08)';
    ctx.fillRect(0, 0, W, H);

    // Title
    ctx.font = '22px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = C.ACCENT_RED;
    ctx.fillText('MISSION FAILED', W / 2, 140);

    // Divider
    ctx.fillStyle = '#331111';
    ctx.fillRect(W / 2 - 200, 158, 400, 1);

    // Status
    ctx.font = '14px "Press Start 2P", monospace';
    ctx.fillStyle = C.ACCENT_RED;
    ctx.fillText('ELIMINATED', W / 2, 200);

    // Stats
    ctx.font = '10px "Press Start 2P", monospace';
    const lx = W / 2 - 150;
    let ly = 260;
    const lineH = 28;

    ctx.textAlign = 'left';
    ctx.fillStyle = C.TEXT_LABEL;
    ctx.fillText('MISSION:', lx, ly);
    ctx.fillStyle = C.TEXT_PRIMARY;
    ctx.fillText(d.mission ? d.mission.title : '---', lx + 160, ly);
    ly += lineH;

    ctx.fillStyle = C.TEXT_LABEL;
    ctx.fillText('KILLS:', lx, ly);
    ctx.fillStyle = C.TEXT_PRIMARY;
    ctx.fillText(`${d.kills || 0} of ${d.total || 0}`, lx + 160, ly);
    ly += lineH;

    ctx.fillStyle = C.TEXT_LABEL;
    ctx.fillText('TIME:', lx, ly);
    ctx.fillStyle = C.TEXT_PRIMARY;
    ctx.fillText(CB.Utils.formatTime(d.timeSec || 0), lx + 160, ly);
    ly += lineH + 10;

    // Preservation notice
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = C.TEXT_DIM;
    ctx.fillText('YOUR LOADOUT AND CREDITS ARE PRESERVED.', W / 2, ly);
    ly += 18;
    ctx.fillText('RETRY FROM THE START OF THIS MISSION.', W / 2, ly);

    // Buttons
    const btnW = 200;
    const btnH = 42;
    const gap = 20;
    const totalW = btnW * 2 + gap;
    const startX = W / 2 - totalW / 2;
    const btnY = H - 90;

    CB.UI.button(ctx, {
      x: startX, y: btnY, w: btnW, h: btnH,
      label: 'RETRY', state: 'primary', focused: true,
    });
    CB.UI.button(ctx, {
      x: startX + btnW + gap, y: btnY, w: btnW, h: btnH,
      label: 'MAIN MENU', state: 'inactive', focused: false,
    });
  },

  onKey(e, game) {
    if (e.key === 'Enter' || e.key === ' ') {
      CB.MissionFailedScreen._retry(game);
    }
    if (e.key === 'Escape') {
      game.setScreen('title');
    }
  },

  onClick(x, y, game) {
    const btnW = 200;
    const btnH = 42;
    const gap = 20;
    const totalW = btnW * 2 + gap;
    const startX = CB.CANVAS_W / 2 - totalW / 2;
    const btnY = CB.CANVAS_H - 90;

    if (x >= startX && x <= startX + btnW && y >= btnY && y <= btnY + btnH) {
      CB.MissionFailedScreen._retry(game);
    }
    const menuX = startX + btnW + gap;
    if (x >= menuX && x <= menuX + btnW && y >= btnY && y <= btnY + btnH) {
      game.setScreen('title');
    }
  },

  onMouseMove() {},

  _retry(game) {
    game.setScreen('briefing');
  },
};
