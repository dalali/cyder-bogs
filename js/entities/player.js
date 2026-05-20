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

    // 8-directional keyboard movement — movement direction IS aim direction
    let mx = 0, my = 0;
    if (CB.Input.isDown('moveUp'))    my -= 1;
    if (CB.Input.isDown('moveDown'))  my += 1;
    if (CB.Input.isDown('moveLeft'))  mx -= 1;
    if (CB.Input.isDown('moveRight')) mx += 1;

    if (mx !== 0 || my !== 0) {
      player.angle = Math.atan2(my, mx);
      const len = Math.sqrt(mx * mx + my * my);
      const SPEED = 140;
      CB.Collision.moveAndCollide(player, (mx / len) * SPEED * dt, (my / len) * SPEED * dt, world.tilemap);
    }

    // Knockback velocity (from melee hits) — decays quickly
    if (player.vx || player.vy) {
      CB.Collision.moveAndCollide(player, player.vx * dt, player.vy * dt, world.tilemap);
      player.vx *= Math.pow(0.005, dt);
      player.vy *= Math.pow(0.005, dt);
      if (Math.abs(player.vx) < 0.5) player.vx = 0;
      if (Math.abs(player.vy) < 0.5) player.vy = 0;
    }

    // Shooting — Space bar only
    if (CB.Input.isDown('fire')) {
      CB.Weapons.tryFire(player, world);
    }

    // Ensure activeSlot is on a valid weapon (cycle if empty)
    CB.Player._normalizeSlot(player);
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
