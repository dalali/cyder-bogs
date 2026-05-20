window.CB = window.CB || {};

CB.MissionCompleteScreen = {
  _data: null,

  enter(game, args) {
    CB.MissionCompleteScreen._data = args;
    // Award mission reward
    game.playerState.credits += args.missionReward || 0;
    game.campaignStats.totalCreditsEarned += args.missionReward || 0;
    game.saveProgress();
  },

  exit() {},
  update(dt, game) {},

  render(ctx, game) {
    const C = CB.COLORS;
    const W = CB.CANVAS_W;
    const H = CB.CANVAS_H;
    const d = CB.MissionCompleteScreen._data;
    if (!d) return;

    // Background with green vignette
    ctx.fillStyle = C.UI_BG;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(0,180,60,0.06)';
    ctx.fillRect(0, 0, W, H);

    // Title
    ctx.font = '22px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = C.ACCENT_GREEN;
    ctx.fillText('MISSION COMPLETE', W / 2, 120);

    // Divider
    ctx.fillStyle = C.UI_BORDER;
    ctx.fillRect(W / 2 - 200, 135, 400, 1);

    // Mission name
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillStyle = C.TEXT_PRIMARY;
    ctx.fillText(d.mission.title, W / 2, 170);

    // Stats
    const timeFmt = CB.Utils.formatTime(d.timeSec || 0);
    const kills = d.kills || 0;
    const total = d.total || 0;
    const missionReward = d.missionReward || 0;
    const killCredits = kills * 30; // approximate; actual tracked via creditsToAdd

    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    const lx = W / 2 - 180;
    let ly = 220;
    const lineH = 30;

    ctx.fillStyle = C.TEXT_LABEL;
    ctx.fillText('KILLS:', lx, ly);
    ctx.fillStyle = C.TEXT_PRIMARY;
    ctx.fillText(`${kills} / ${total}`, lx + 200, ly);
    ctx.fillStyle = C.ACCENT_GOLD;
    ctx.textAlign = 'right';
    ctx.fillText(`+${CB.Utils.formatNum(game.campaignStats.totalCreditsEarned)} cr`, W / 2 + 180, ly);
    ctx.textAlign = 'left';
    ly += lineH;

    ctx.fillStyle = C.TEXT_LABEL;
    ctx.fillText('MISSION REWARD:', lx, ly);
    ctx.fillStyle = C.ACCENT_GOLD;
    ctx.textAlign = 'right';
    ctx.fillText(`+${missionReward} cr`, W / 2 + 180, ly);
    ctx.textAlign = 'left';
    ly += lineH;

    // Divider above total
    ctx.fillStyle = C.UI_BORDER;
    ctx.fillRect(lx, ly + 5, 360, 1);
    ly += 20;

    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillStyle = C.ACCENT_GOLD;
    ctx.fillText('TOTAL CREDITS:', lx, ly);
    ctx.textAlign = 'right';
    ctx.fillText(`${CB.Utils.formatNum(game.playerState.credits)} cr`, W / 2 + 180, ly);
    ctx.textAlign = 'left';
    ly += lineH;

    ctx.fillStyle = C.TEXT_LABEL;
    ctx.fillText('TIME:', lx, ly);
    ctx.fillStyle = C.TEXT_PRIMARY;
    ctx.fillText(timeFmt, lx + 200, ly);

    // Button
    const btnW = 220;
    const btnH = 42;
    const btnX = W / 2 - btnW / 2;
    const btnY = H - 90;
    CB.UI.button(ctx, {
      x: btnX, y: btnY, w: btnW, h: btnH,
      label: 'ENTER SHOP', state: 'primary', focused: true,
    });
  },

  onKey(e, game) {
    if (e.key === 'Enter' || e.key === ' ') {
      CB.MissionCompleteScreen._advance(game);
    }
  },

  onClick(x, y, game) {
    const btnW = 220;
    const btnH = 42;
    const btnX = CB.CANVAS_W / 2 - btnW / 2;
    const btnY = CB.CANVAS_H - 90;
    if (x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH) {
      CB.MissionCompleteScreen._advance(game);
    }
  },

  onMouseMove() {},

  _advance(game) {
    const ps = game.playerState;
    // Check if this was the final mission
    if (ps.missionIndex >= CB.MISSION_DEFS.length - 1) {
      game.setScreen('victory');
    } else {
      game.setScreen('shop');
    }
  },
};
