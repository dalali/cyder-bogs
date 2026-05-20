window.CB = window.CB || {};

CB.Player = {
  create(x, y, weapons, activeSlot, armor) {
    const p = CB.Entity.create({
      type: 'player',
      subtype: 'player',
      x, y,
      w: 20, h: 20,
      hp: CB.PLAYER_HP,
      hpMax: CB.PLAYER_HP,
      solid: true,
      weapons: weapons || [{ kind: 'pistol', ammo: 30 }, null, null],
      activeSlot: activeSlot || 0,
      armor: armor || 0,
      angle: 0,
      deathTimer: 0,
      dying: false,
      flashTimer: 0,
      // Velocity for momentum-based movement
      vx: 0,
      vy: 0,
    });
    // Ensure weapon cooldowns are initialized
    p.weapons.forEach((w, i) => {
      if (w) w.cooldown = 0;
    });
    return p;
  },

  update(player, dt, world) {
    if (player.dying) {
      player.deathTimer += dt;
      player.flashTimer += dt;
      return; // no movement while dying
    }

    // Weapon cooldowns
    player.weapons.forEach(w => { if (w) w.cooldown = Math.max(0, w.cooldown - dt); });

    // Weapon switch
    if (CB.Input.wasPressed('weapon1')) player.activeSlot = 0;
    if (CB.Input.wasPressed('weapon2')) player.activeSlot = 1;
    if (CB.Input.wasPressed('weapon3')) player.activeSlot = 2;

    // Movement direction
    let mx = 0, my = 0;
    if (CB.Input.isDown('moveUp'))    my -= 1;
    if (CB.Input.isDown('moveDown'))  my += 1;
    if (CB.Input.isDown('moveLeft'))  mx -= 1;
    if (CB.Input.isDown('moveRight')) mx += 1;

    const isMoving = mx !== 0 || my !== 0;
    const usingMouse = CB.Input.isMouseAiming();
    const strafing = CB.Input.isDown('strafe');

    // --- Aim direction ---
    if (usingMouse) {
      // Mouse aim overrides everything
      player.angle = Math.atan2(
        CB.Input.mouse.worldY - player.y,
        CB.Input.mouse.worldX - player.x
      );
    } else if (isMoving && !strafing) {
      // WASD aims: player faces movement direction
      const norm = CB.Utils.normalize(mx, my);
      player.angle = Math.atan2(norm.y, norm.x);
    }
    // Strafe: keep current aim direction while moving freely (do nothing to angle)

    // --- Auto-aim assist when keyboard-only ---
    if (!usingMouse && world.enemies) {
      CB.Player._applyAutoAim(player, world.enemies);
    }

    // --- Velocity-based movement ---
    // Acceleration: snappy feel, top speed ~160px/s
    const ACCEL = 900;
    const TOP_SPEED = 160;
    if (isMoving) {
      const norm = CB.Utils.normalize(mx, my);
      player.vx += norm.x * ACCEL * dt;
      player.vy += norm.y * ACCEL * dt;
      // Clamp to top speed
      const spd = Math.sqrt(player.vx * player.vx + player.vy * player.vy);
      if (spd > TOP_SPEED) {
        player.vx = (player.vx / spd) * TOP_SPEED;
        player.vy = (player.vy / spd) * TOP_SPEED;
      }
    }

    // Friction: very fast stop (~10ms time constant)
    const friction = Math.pow(0.01, dt);
    player.vx *= friction;
    player.vy *= friction;

    // Apply velocity with collision
    const dx = player.vx * dt;
    const dy = player.vy * dt;
    if (Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001) {
      CB.Collision.moveAndCollide(player, dx, dy, world.tilemap);
    }

    // Shooting
    const wantsShoot = CB.Input.isDown('fire') || CB.Input.mouse.left;
    if (wantsShoot) {
      CB.Weapons.tryFire(player, world);
    }

    // Ensure activeSlot is on a valid weapon (cycle if empty)
    CB.Player._normalizeSlot(player);
  },

  // Apply small angle snap toward nearest enemy in ±25° cone, within 120px
  _applyAutoAim(player, enemies) {
    const MAX_DIST = 120;
    const MAX_ANGLE_DIFF = 25 * Math.PI / 180;
    let bestDist = MAX_DIST + 1;
    let bestAngle = null;

    for (const e of enemies) {
      if (e.dead) continue;
      const d = CB.Utils.dist(player, e);
      if (d > MAX_DIST) continue;
      const angleToEnemy = Math.atan2(e.y - player.y, e.x - player.x);
      let angleDiff = angleToEnemy - player.angle;
      // Normalize to [-PI, PI]
      while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
      while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
      if (Math.abs(angleDiff) <= MAX_ANGLE_DIFF && d < bestDist) {
        bestDist = d;
        bestAngle = angleToEnemy;
      }
    }

    if (bestAngle !== null) {
      // Soft snap: blend 40% toward target
      let diff = bestAngle - player.angle;
      while (diff > Math.PI) diff -= 2 * Math.PI;
      while (diff < -Math.PI) diff += 2 * Math.PI;
      player.angle += diff * 0.4;
    }
  },

  _normalizeSlot(player) {
    // If current slot is empty, don't auto-switch (player manages slots)
  },

  applyDamage(player, rawDmg) {
    let dmg = rawDmg;
    if (player.armor > 0) {
      dmg = Math.floor(rawDmg / 2);
    }
    player.hp = Math.max(0, player.hp - dmg);
    if (player.hp <= 0 && !player.dying) {
      player.dying = true;
      player.deathTimer = 0;
      player.flashTimer = 0;
    }
  },

  render(player, ctx, camera) {
    const sx = player.x - camera.x;
    const sy = player.y - camera.y;

    if (player.dying) {
      // Flash red / normal at 10Hz
      const flash = Math.floor(player.flashTimer * 10) % 2 === 0;
      CB.Sprites.drawPlayer(ctx, sx, sy, player.angle, flash);
      return;
    }

    CB.Sprites.drawPlayer(ctx, sx, sy, player.angle, false);
  },
};
