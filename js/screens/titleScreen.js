window.CB = window.CB || {};

CB.TitleScreen = {
  _buttons: [],
  _focusedIndex: 0,
  _hasSave: false,

  // Difficulty order for cycling
  _diffOrder: ['EASY', 'NORMAL', 'HARD'],

  enter(game) {
    CB.TitleScreen._hasSave = CB.Save.exists();
    CB.TitleScreen._focusedIndex = 0;
    CB.TitleScreen._buildButtons(game);
  },

  exit() {},

  _buildButtons(game) {
    CB.TitleScreen._buttons = [
      {
        label: 'NEW GAME',
        state: 'primary',
        action() {
          game.newGame();
          game.setScreen('briefing');
        },
      },
      {
        label: 'CONTINUE',
        state: CB.TitleScreen._hasSave ? 'primary' : 'inactive',
        action() {
          if (!CB.TitleScreen._hasSave) return;
          const save = CB.Save.load();
          if (save) {
            game.loadSave(save);
            game.setScreen('briefing');
          }
        },
      },
      {
        label: 'CREDITS',
        state: 'inactive',
        action() {
          CB.TitleScreen._showCredits = true;
        },
      },
    ];
  },

  _cycleDifficulty(dir) {
    const order = CB.TitleScreen._diffOrder;
    const idx = order.indexOf(CB.currentDifficulty);
    const next = ((idx + dir) % order.length + order.length) % order.length;
    CB.currentDifficulty = order[next];
  },

  update(dt, game) {},

  render(ctx, game) {
    const C = CB.COLORS;
    const W = CB.CANVAS_W;
    const H = CB.CANVAS_H;

    // Background
    ctx.fillStyle = C.BG;
    ctx.fillRect(0, 0, W, H);

    // Title
    ctx.font = '24px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = C.TEXT_TITLE;
    ctx.fillText('CYDER-BOGS', W / 2, 160);

    // Divider
    ctx.fillStyle = C.UI_BORDER;
    ctx.fillRect(W / 2 - 150, 175, 300, 1);

    // Subtitle
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillStyle = C.TEXT_DIM;
    ctx.fillText('A CYBERDOGS TRIBUTE', W / 2, 200);

    // Buttons
    const btnW = 240;
    const btnH = 44;
    const btnX = W / 2 - btnW / 2;
    let btnY = 270;

    CB.TitleScreen._buttons.forEach((btn, i) => {
      const focused = i === CB.TitleScreen._focusedIndex;
      CB.UI.button(ctx, {
        x: btnX, y: btnY,
        w: btnW, h: btnH,
        label: btn.label,
        state: btn.state,
        focused,
      });
      btnY += btnH + 12;
    });

    // Difficulty selector (below buttons)
    const diffY = btnY + 20;
    const diff = CB.DIFFICULTY[CB.currentDifficulty];
    const diffColors = { EASY: '#44CC44', NORMAL: '#FFCC00', HARD: '#FF4444' };

    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = C.TEXT_DIM;
    ctx.fillText('DIFFICULTY', W / 2, diffY);

    // Left arrow
    ctx.fillStyle = C.TEXT_PRIMARY;
    ctx.fillText('<', W / 2 - 80, diffY + 22);

    // Difficulty label (colored)
    ctx.fillStyle = diffColors[CB.currentDifficulty] || C.TEXT_PRIMARY;
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText(diff.label, W / 2, diffY + 22);

    // Right arrow
    ctx.fillStyle = C.TEXT_PRIMARY;
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillText('>', W / 2 + 80, diffY + 22);

    // Hint
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillStyle = C.TEXT_DIM;
    ctx.fillText('LEFT/RIGHT to change', W / 2, diffY + 40);

    // Version
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'right';
    ctx.fillStyle = C.TEXT_DIM;
    ctx.fillText('v1.0 — MVP', W - 8, H - 8);

    // Credits popup
    if (CB.TitleScreen._showCredits) {
      ctx.fillStyle = 'rgba(0,0,0,0.85)';
      ctx.fillRect(100, 100, 600, 400);
      ctx.strokeStyle = C.UI_BORDER;
      ctx.lineWidth = 1;
      ctx.strokeRect(100, 100, 600, 400);
      ctx.font = '16px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = C.TEXT_TITLE;
      ctx.fillText('CREDITS', 400, 155);
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillStyle = C.TEXT_PRIMARY;
      ctx.fillText('A tribute to CYBERDOGS (1994)', 400, 210);
      ctx.fillText('by Jonric Software', 400, 235);
      ctx.fillStyle = C.TEXT_DIM;
      ctx.fillText('Implementation: browser-based JS', 400, 290);
      ctx.fillText('All code: canvas 2D, no frameworks', 400, 315);
      ctx.fillStyle = C.ACCENT_GREEN;
      ctx.fillText('[ PRESS ANY KEY TO CLOSE ]', 400, 460);
    }
  },

  onKey(e, game) {
    if (CB.TitleScreen._showCredits) {
      CB.TitleScreen._showCredits = false;
      return;
    }
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        CB.TitleScreen._focusedIndex = Math.max(0, CB.TitleScreen._focusedIndex - 1);
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        CB.TitleScreen._focusedIndex = Math.min(CB.TitleScreen._buttons.length - 1, CB.TitleScreen._focusedIndex + 1);
        break;
      case 'ArrowLeft':
        CB.TitleScreen._cycleDifficulty(-1);
        break;
      case 'ArrowRight':
        CB.TitleScreen._cycleDifficulty(1);
        break;
      case 'Enter':
      case ' ':
        CB.TitleScreen._buttons[CB.TitleScreen._focusedIndex].action();
        break;
      case 'Tab':
        e.preventDefault && e.preventDefault();
        const dir = e.shiftKey ? -1 : 1;
        const n = CB.TitleScreen._buttons.length;
        CB.TitleScreen._focusedIndex = ((CB.TitleScreen._focusedIndex + dir) % n + n) % n;
        break;
    }
  },

  onClick(x, y, game) {
    if (CB.TitleScreen._showCredits) {
      CB.TitleScreen._showCredits = false;
      return;
    }
    const btnW = 240;
    const btnH = 44;
    const btnX = CB.CANVAS_W / 2 - btnW / 2;
    let btnY = 270;
    CB.TitleScreen._buttons.forEach((btn, i) => {
      if (x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH) {
        btn.action();
      }
      btnY += btnH + 12;
    });

    // Click left/right arrows for difficulty
    const diffY = btnY + 20;
    const W = CB.CANVAS_W;
    // Left arrow zone
    if (x >= W / 2 - 100 && x <= W / 2 - 50 && y >= diffY + 10 && y <= diffY + 35) {
      CB.TitleScreen._cycleDifficulty(-1);
    }
    // Right arrow zone
    if (x >= W / 2 + 50 && x <= W / 2 + 100 && y >= diffY + 10 && y <= diffY + 35) {
      CB.TitleScreen._cycleDifficulty(1);
    }
  },

  onMouseMove() {},
};

CB.TitleScreen._showCredits = false;
