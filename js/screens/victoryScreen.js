window.CB = window.CB || {};

CB.VictoryScreen = {
  enter(game) {
    // Nothing extra needed — stats are in game.campaignStats
  },

  exit() {},
  update(dt, game) {},

  render(ctx, game) {
    const C = CB.COLORS;
    const W = CB.CANVAS_W;
    const H = CB.CANVAS_H;
    const stats = game.campaignStats;

    ctx.fillStyle = C.UI_BG;
    ctx.fillRect(0, 0, W, H);

    // Title
    ctx.font = '22px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = C.ACCENT_GOLD;
    ctx.fillText('OPERATION COMPLETE', W / 2, 130);

    // Flavor text
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = C.TEXT_DIM;
    ctx.fillText('All objectives achieved. The compound is clear.', W / 2, 165);

    // Divider (gold)
    ctx.fillStyle = C.ACCENT_GOLD;
    ctx.fillRect(W / 2 - 200, 180, 400, 1);

    // Stats
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillStyle = C.TEXT_LABEL;
    ctx.textAlign = 'center';
    ctx.fillText('FINAL STATS', W / 2, 215);

    const lx = W / 2 - 180;
    let ly = 250;
    const lineH = 32;

    ctx.textAlign = 'left';
    const rows = [
      ['TOTAL KILLS:', `${stats.totalKills}`],
      ['TOTAL CREDITS EARNED:', CB.Utils.formatNum(stats.totalCreditsEarned)],
      ['TOTAL TIME:', CB.Utils.formatTime(stats.totalTimeSec)],
      ['MISSIONS COMPLETED:', `5 / 5`],
    ];
    rows.forEach(([label, val]) => {
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillStyle = C.TEXT_LABEL;
      ctx.fillText(label, lx, ly);
      ctx.fillStyle = C.TEXT_PRIMARY;
      ctx.textAlign = 'right';
      ctx.fillText(val, W / 2 + 180, ly);
      ctx.textAlign = 'left';
      ly += lineH;
    });

    // Divider
    ctx.fillStyle = C.UI_BORDER;
    ctx.fillRect(lx, ly + 5, 360, 1);
    ly += 20;

    // Play Again button
    const btnW = 220;
    const btnH = 44;
    const btnX = W / 2 - btnW / 2;
    const btnY = H - 90;
    CB.UI.button(ctx, {
      x: btnX, y: btnY, w: btnW, h: btnH,
      label: 'PLAY AGAIN', state: 'primary', focused: true,
    });
  },

  onKey(e, game) {
    if (e.key === 'Enter' || e.key === ' ') {
      CB.VictoryScreen._restart(game);
    }
  },

  onClick(x, y, game) {
    const btnW = 220;
    const btnH = 44;
    const btnX = CB.CANVAS_W / 2 - btnW / 2;
    const btnY = CB.CANVAS_H - 90;
    if (x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH) {
      CB.VictoryScreen._restart(game);
    }
  },

  onMouseMove() {},

  _restart(game) {
    game.newGame();
    game.setScreen('title');
  },
};
