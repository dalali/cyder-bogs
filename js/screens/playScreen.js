window.CB = window.CB || {};

CB.PlayScreen = {
  world: null,
  camera: null,
  _missionStartTime: 0,
  _paused: false,

  enter(game) {
    CB.PlayScreen._paused = false;
    CB.PlayScreen._missionStartTime = Date.now();
    CB.PlayScreen.world = CB.PlayScreen._buildWorld(game);
    CB.PlayScreen.camera = CB.PlayScreen.world.camera;
  },

  _buildWorld(game) {
    const ps = game.playerState;
    const missionDef = CB.MISSION_DEFS[ps.missionIndex];
    const mapData = CB.MAPS[missionDef.mapId];

    const tilemap = CB.TileMap.create(mapData);

    // Spawn player
    const spawnTile = mapData.spawns.player;
    const playerWeapons = ps.weapons.map(w => w ? Object.assign({}, w, { cooldown: 0 }) : null);
    const player = CB.Player.create(
      spawnTile.tx * CB.TILE_SIZE + CB.TILE_SIZE / 2,
      spawnTile.ty * CB.TILE_SIZE + CB.TILE_SIZE / 2,
      playerWeapons,
      ps.activeSlot,
      ps.armor
    );
    player.credits = ps.credits;

    // Spawn enemies
    const enemies = [];
    let bossSpawned = false;
    for (const spawnInfo of mapData.spawns.enemies) {
      const e = CB.Enemy.create(spawnInfo);
      enemies.push(e);
      if (e.subtype === 'boss') bossSpawned = true;
    }

    // Spawn pickups
    const pickups = [];
    for (const pInfo of (mapData.spawns.pickups || [])) {
      pickups.push(CB.Pickup.create({
        subtype: pInfo.type,
        x: pInfo.tx * CB.TILE_SIZE + CB.TILE_SIZE / 2,
        y: pInfo.ty * CB.TILE_SIZE + CB.TILE_SIZE / 2,
      }));
    }

    const camera = CB.Camera.create();
    CB.Camera.follow(camera, player, tilemap.pixelWidth(), tilemap.pixelHeight());

    const objState = CB.Objectives.init(missionDef);

    return {
      player,
      enemies,
      projectiles: [],
      pickups,
      particles: [],
      tilemap,
      camera,
      mission: missionDef,
      objectives: objState,
      stats: {
        kills: 0,
        startTime: Date.now(),
        _enemies: enemies,
      },
      screenShake: 0,
      creditsToAdd: 0,
      _bossSpawned: bossSpawned,
    };
  },

  exit(game) {
    // Sync credits back to playerState
    if (CB.PlayScreen.world) {
      game.playerState.credits = CB.PlayScreen.world.player.credits || 0;
    }
  },

  update(dt, game) {
    if (CB.PlayScreen._paused) return;

    const world = CB.PlayScreen.world;
    if (!world) return;

    const player = world.player;

    // Handle pause
    if (CB.Input.wasPressed('pause')) {
      CB.PlayScreen._togglePause(game);
      return;
    }

    // Debug toggle
    if (CB.Input.wasPressed('debug')) {
      game.debug = !game.debug;
    }

    // Mouse wheel weapon switch
    if (CB.Input.mouse.wheel !== 0) {
      const dir = CB.Input.mouse.wheel > 0 ? 1 : -1;
      player.activeSlot = ((player.activeSlot + dir) % 3 + 3) % 3;
    }

    // 1. Player update
    CB.Player.update(player, dt, world);

    // 2. Enemy updates
    for (const e of world.enemies) {
      if (!e.dead) CB.Enemy.update(e, dt, world, player);
    }

    // 3. Projectile updates
    for (const p of world.projectiles) {
      if (!p.dead) CB.Projectile.update(p, dt, world);
    }

    // 4. Pickup updates
    for (const p of world.pickups) {
      if (!p.dead) {
        CB.Pickup.update(p, dt, player);
        // Handle credits pickup
        if (p.dead && p._creditsValue) {
          player.credits = (player.credits || 0) + p._creditsValue;
          game.playerState.credits = player.credits;
          game.campaignStats.totalCreditsEarned += p._creditsValue;
        }
      }
    }

    // 5. Particle updates
    for (const p of world.particles) {
      if (!p.dead) CB.Particle.update(p, dt);
    }

    // 6. Drain credits and kill count earned during combat
    if (world.creditsToAdd > 0) {
      player.credits = (player.credits || 0) + world.creditsToAdd;
      game.playerState.credits = player.credits;
      game.campaignStats.totalCreditsEarned += world.creditsToAdd;
      world.creditsToAdd = 0;
    }
    if (world.stats.kills > 0) {
      game.campaignStats.totalKills += world.stats.kills;
      world.stats.kills = 0;
    }

    // 7. Objectives
    CB.Objectives.update(world.objectives, world);
    world.objectives._enemies = world.enemies;
    world.stats._enemies = world.enemies;

    // 8. Camera follow
    CB.Camera.follow(world.camera, player, world.tilemap.pixelWidth(), world.tilemap.pixelHeight());

    // 9. Screen shake decay
    if (world.screenShake > 0) {
      world.screenShake = Math.max(0, world.screenShake - dt * 10);
    }

    // 10. Cull dead entities
    world.projectiles = world.projectiles.filter(p => !p.dead);
    world.pickups = world.pickups.filter(p => !p.dead);
    world.particles = world.particles.filter(p => !p.dead);

    // 11. State transitions
    if (player.dying && player.deathTimer > 1.0) {
      // Save before transitioning
      game.playerState.weapons = player.weapons.map(w => w ? { kind: w.kind, ammo: w.ammo } : null);
      game.playerState.activeSlot = player.activeSlot;
      game.playerState.armor = player.armor;
      game.playerState.credits = player.credits;
      const elapsed = (Date.now() - world.stats.startTime) / 1000;
      game.campaignStats.totalTimeSec += elapsed;
      game.saveProgress();
      game.setScreen('missionFailed', {
        mission: world.mission,
        kills: world.enemies.filter(e => e.dead).length,
        total: world.enemies.length,
        timeSec: elapsed,
      });
      return;
    }

    if (world.objectives.allDone) {
      // Mission complete!
      const elapsed = (Date.now() - world.stats.startTime) / 1000;
      game.campaignStats.totalTimeSec += elapsed;
      // Final sync of credits back to playerState
      game.playerState.credits = player.credits;
      game.playerState.weapons = player.weapons.map(w => w ? { kind: w.kind, ammo: w.ammo } : null);
      game.playerState.activeSlot = player.activeSlot;
      game.playerState.armor = player.armor;
      const killsTotal = world.enemies.filter(e => e.dead).length;
      game.saveProgress();
      game.setScreen('missionComplete', {
        mission: world.mission,
        kills: killsTotal,
        total: world.enemies.length,
        timeSec: elapsed,
        missionReward: world.mission.creditReward,
      });
      return;
    }
  },

  _togglePause(game) {
    CB.PlayScreen._paused = !CB.PlayScreen._paused;
    if (CB.PlayScreen._paused) {
      // Draw pause overlay next render
      CB.PlayScreen._pauseGame = true;
    } else {
      CB.PlayScreen._pauseGame = false;
    }
  },

  render(ctx, game) {
    const world = CB.PlayScreen.world;
    if (!world) return;

    const C = CB.COLORS;

    // Screen shake offset
    let shakeX = 0, shakeY = 0;
    if (world.screenShake > 0) {
      shakeX = (Math.random() * 2 - 1) * world.screenShake;
      shakeY = (Math.random() * 2 - 1) * world.screenShake;
    }

    ctx.save();
    ctx.translate(shakeX, shakeY);
    CB.Renderer.render(ctx, world, world.objectives);
    ctx.restore();

    CB.HUD.draw(ctx, world.player, world.mission, world.stats, world.objectives);

    // Pause overlay
    if (CB.PlayScreen._paused) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, CB.CANVAS_W, CB.CANVAS_H);
      ctx.font = '24px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = C.TEXT_TITLE;
      ctx.fillText('PAUSED', CB.CANVAS_W / 2, 240);
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillStyle = C.TEXT_DIM;
      ctx.fillText('ESC to resume', CB.CANVAS_W / 2, 280);
      ctx.fillText('Q to quit to menu', CB.CANVAS_W / 2, 310);
    }
  },

  onKey(e, game) {
    if (CB.PlayScreen._paused) {
      if (e.key === 'Escape') {
        CB.PlayScreen._paused = false;
      }
      if (e.key === 'q' || e.key === 'Q') {
        game.playerState.weapons = CB.PlayScreen.world.player.weapons.map(w => w ? { kind: w.kind, ammo: w.ammo } : null);
        game.playerState.credits = CB.PlayScreen.world.player.credits || 0;
        game.playerState.armor = CB.PlayScreen.world.player.armor || 0;
        game.saveProgress();
        game.setScreen('title');
      }
    }
  },

  onClick() {},
  onMouseMove() {},

  getDebugInfo(game) {
    const w = CB.PlayScreen.world;
    if (!w) return [];
    const aliveEnemies = w.enemies.filter(e => !e.dead);
    const stateCounts = { IDLE: 0, PATROL: 0, ALERT: 0, CHASE: 0, ATTACK: 0 };
    for (const e of aliveEnemies) stateCounts[e.ai.state] = (stateCounts[e.ai.state] || 0) + 1;
    const p = w.player;
    const elapsed = Math.floor((Date.now() - w.stats.startTime) / 1000);
    return [
      `FPS: ~60`,
      `Enemies: ${aliveEnemies.length}/${w.enemies.length}`,
      `Projectiles: ${w.projectiles.length}`,
      `Particles: ${w.particles.length}`,
      `Player: x=${Math.floor(p.x)} y=${Math.floor(p.y)} hp=${p.hp} armor=${p.armor}`,
      `Credits: ${p.credits}`,
      `Mission: ${w.mission.id}  Time: ${CB.Utils.formatTime(elapsed)}`,
      `AI: idle=${stateCounts.IDLE} patrol=${stateCounts.PATROL} chase=${stateCounts.CHASE} attack=${stateCounts.ATTACK}`,
      `Shake: ${w.screenShake.toFixed(2)}`,
    ];
  },
};
