window.CB = window.CB || {};

CB.Game = {
  canvas: null,
  ctx: null,
  screen: null,   // current screen name
  screens: {},    // registered screens
  _nextId: 1,

  // Global stats across the whole campaign
  campaignStats: {
    totalKills: 0,
    totalCreditsEarned: 0,
    totalTimeSec: 0,
  },

  // Player loadout & progress (persists across screens)
  playerState: {
    missionIndex: 0,   // 0-based
    credits: 0,
    armor: 0,
    weapons: [
      { kind: 'pistol', ammo: 30 },
      null,
      null,
    ],
    activeSlot: 0,
  },

  // Session-level debug
  debug: false,
  _debugBuffer: [],

  init(canvas) {
    CB.Game.canvas = canvas;
    CB.Game.ctx = canvas.getContext('2d');
    CB.Game.ctx.imageSmoothingEnabled = false;
    CB.Input.init(canvas);

    // Register all screens
    CB.Game.screens = {
      title:           CB.TitleScreen,
      briefing:        CB.BriefingScreen,
      playing:         CB.PlayScreen,
      missionComplete: CB.MissionCompleteScreen,
      missionFailed:   CB.MissionFailedScreen,
      shop:            CB.ShopScreen,
      victory:         CB.VictoryScreen,
    };

    // Hook up mouse clicks to current screen
    canvas.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (canvas.height / rect.height);
      if (CB.Game.screens[CB.Game.screen] && CB.Game.screens[CB.Game.screen].onClick) {
        CB.Game.screens[CB.Game.screen].onClick(x, y, CB.Game);
      }
    });

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (canvas.height / rect.height);
      if (CB.Game.screens[CB.Game.screen] && CB.Game.screens[CB.Game.screen].onMouseMove) {
        CB.Game.screens[CB.Game.screen].onMouseMove(x, y, CB.Game);
      }
    });

    window.addEventListener('keydown', (e) => {
      if (CB.Game.screens[CB.Game.screen] && CB.Game.screens[CB.Game.screen].onKey) {
        CB.Game.screens[CB.Game.screen].onKey(e, CB.Game);
      }
    });

    CB.Game.setScreen('title');
  },

  nextId() {
    return CB.Game._nextId++;
  },

  setScreen(name, args) {
    const prev = CB.Game.screen;
    if (prev && CB.Game.screens[prev] && CB.Game.screens[prev].exit) {
      CB.Game.screens[prev].exit(CB.Game);
    }
    CB.Game.screen = name;
    if (CB.Game.screens[name] && CB.Game.screens[name].enter) {
      CB.Game.screens[name].enter(CB.Game, args || {});
    }
  },

  update(dt) {
    if (CB.Game.screens[CB.Game.screen] && CB.Game.screens[CB.Game.screen].update) {
      CB.Game.screens[CB.Game.screen].update(dt, CB.Game);
    }
    CB.Input.poll(CB.Game.screens[CB.Game.screen] && CB.Game.screens[CB.Game.screen].camera
      ? CB.Game.screens[CB.Game.screen].camera
      : null);
  },

  render() {
    const ctx = CB.Game.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = CB.COLORS.BG;
    ctx.fillRect(0, 0, CB.CANVAS_W, CB.CANVAS_H);

    if (CB.Game.screens[CB.Game.screen] && CB.Game.screens[CB.Game.screen].render) {
      CB.Game.screens[CB.Game.screen].render(ctx, CB.Game);
    }

    if (CB.Game.debug && CB.Game.screens[CB.Game.screen] && CB.Game.screens[CB.Game.screen].getDebugInfo) {
      CB.Game._renderDebug(ctx, CB.Game.screens[CB.Game.screen].getDebugInfo(CB.Game));
    }
  },

  _renderDebug(ctx, info) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, 280, info.length * 14 + 8);
    ctx.font = '8px monospace';
    ctx.fillStyle = '#00FF66';
    info.forEach((line, i) => {
      ctx.fillText(line, 4, 12 + i * 14);
    });
  },

  // Save current player progress
  saveProgress() {
    CB.Save.save({
      missionIndex: CB.Game.playerState.missionIndex,
      credits: CB.Game.playerState.credits,
      armor: CB.Game.playerState.armor,
      weapons: CB.Game.playerState.weapons,
      activeSlot: CB.Game.playerState.activeSlot,
      stats: CB.Game.campaignStats,
    });
  },

  // Load save into playerState
  loadSave(saveData) {
    CB.Game.playerState.missionIndex = saveData.missionIndex || 0;
    CB.Game.playerState.credits = saveData.credits || 0;
    CB.Game.playerState.armor = saveData.armor || 0;
    CB.Game.playerState.weapons = saveData.weapons || [{ kind: 'pistol', ammo: 30 }, null, null];
    CB.Game.playerState.activeSlot = saveData.activeSlot || 0;
    if (saveData.stats) {
      CB.Game.campaignStats = Object.assign({}, saveData.stats);
    }
  },

  // Reset to fresh new game state
  newGame() {
    CB.Game.playerState = {
      missionIndex: 0,
      credits: 0,
      armor: 0,
      weapons: [
        { kind: 'pistol', ammo: 30 },
        null,
        null,
      ],
      activeSlot: 0,
    };
    CB.Game.campaignStats = {
      totalKills: 0,
      totalCreditsEarned: 0,
      totalTimeSec: 0,
    };
    CB.Save.clear();
  },
};
