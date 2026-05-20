window.CB = window.CB || {};

CB.Enemy = {
  create(opts) {
    const subtype = opts.type || opts.subtype || 'grunt';
    const def = CB.ENEMY_DEFS[subtype];
    if (!def) throw new Error('Unknown enemy type: ' + subtype);

    const x = (opts.tx !== undefined) ? opts.tx * CB.TILE_SIZE + CB.TILE_SIZE / 2 : (opts.x || 0);
    const y = (opts.ty !== undefined) ? opts.ty * CB.TILE_SIZE + CB.TILE_SIZE / 2 : (opts.y || 0);

    const e = CB.Entity.create({
      type: 'enemy',
      subtype,
      x, y,
      w: def.w, h: def.h,
      hp: def.hp,
      hpMax: def.hp,
      angle: 0,
      solid: true,
      weaponCooldown: Math.random() * (1 / def.weaponRate),  // stagger initial shot
      ai: {
        state: 'IDLE',
        stateTime: 0,
        target: null,
        losClear: false,
        losCheckTimer: Math.random() * 0.2,  // stagger LOS checks
        patrolWaypoints: opts.patrol ? opts.patrol.map(wp => ({ tx: wp.tx, ty: wp.ty })) : [],
        patrolIndex: 0,
        detectionRange: def.detectionRange,
        attackRange: def.attackRange,
        breakRange: def.breakRange,
        alertCueRemaining: 0,
        fireDelay: 0,
        lastKnownX: undefined,
        lastKnownY: undefined,
        // Coward flag: 30% of grunts flee before engaging
        isCoward: (subtype === 'grunt') ? (Math.random() < 0.3) : false,
        // Boss-specific
        weaponMode: 'rocket',
        modeTimer: 4,
        burstShotsRemaining: 0,
        burstTimer: 0,
      },
    });

    // If enemy has patrol waypoints, start in patrol state
    if (e.ai.patrolWaypoints.length > 0) {
      e.ai.state = 'PATROL';
    }

    return e;
  },

  update(enemy, dt, world, player) {
    if (enemy.dead) return;
    enemy.age += dt;

    if (enemy.subtype === 'boss') {
      CB.Enemy._updateBoss(enemy, dt, world, player);
    } else {
      CB.AI.update(enemy, dt, world, player);
    }

    // Berserker melee attack with knockback
    if (enemy.subtype === 'berserker' && enemy.ai.state === 'ATTACK') {
      if (enemy.weaponCooldown <= 0) {
        const d = CB.Utils.dist(enemy, player);
        if (d < enemy.ai.attackRange) {
          // Apply difficulty damage mult
          const damageMult = CB.currentDifficulty
            ? (CB.DIFFICULTY[CB.currentDifficulty].enemyDamageMult || 1)
            : 1;
          CB.Player.applyDamage(player, Math.ceil(CB.ENEMY_DEFS.berserker.weaponDmg * damageMult));
          enemy.weaponCooldown = 1 / CB.ENEMY_DEFS.berserker.weaponRate;

          // Knockback: push player away from berserker
          const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
          player.vx = (player.vx || 0) + Math.cos(angle) * 120;
          player.vy = (player.vy || 0) + Math.sin(angle) * 120;
        }
      }
    }

    // Entity-vs-entity push (enemy vs player)
    if (CB.Utils.aabbOverlap(enemy, player)) {
      CB.Utils.resolveOverlap(enemy, player);
    }
  },

  _updateBoss(boss, dt, world, player) {
    // Boss always in ALERT/ATTACK mode (detection range = map)
    const ai = boss.ai;
    ai.stateTime += dt;

    // Throttled LOS
    ai.losCheckTimer = (ai.losCheckTimer || 0) - dt;
    if (ai.losCheckTimer <= 0) {
      ai.losClear = CB.Utils.hasLineOfSight(boss, player, world.tilemap);
      ai.losCheckTimer = 0.2;
    }

    const d = CB.Utils.dist(boss, player);

    if (d <= ai.attackRange) {
      // ATTACK state
      boss.angle = CB.Utils.angleTo(boss, player);

      // Mode alternation timer
      ai.modeTimer -= dt;
      if (ai.modeTimer <= 0) {
        ai.weaponMode = ai.weaponMode === 'rocket' ? 'mg_burst' : 'rocket';
        ai.modeTimer = 4;
        ai.burstShotsRemaining = (ai.weaponMode === 'mg_burst') ? 5 : 0;
        ai.burstTimer = 0;
      }

      ai.weaponCooldown = Math.max(0, (ai.weaponCooldown || 0) - dt);

      if (ai.weaponMode === 'rocket') {
        if (ai.weaponCooldown <= 0 && ai.losClear) {
          CB.Enemy._bossFireRocket(boss, player, world);
          ai.weaponCooldown = 2.0;  // 0.5 shots/s
        }
      } else {
        // MG burst: 5 shots rapidly
        ai.burstTimer -= dt;
        if (ai.burstShotsRemaining > 0 && ai.burstTimer <= 0 && ai.losClear) {
          CB.Enemy._bossFireMG(boss, player, world);
          ai.burstShotsRemaining--;
          ai.burstTimer = 0.12;
          if (ai.burstShotsRemaining === 0) {
            ai.weaponCooldown = 1.5;
          }
        }
        if (ai.burstShotsRemaining === 0 && ai.weaponCooldown <= 0) {
          ai.burstShotsRemaining = 5;
          ai.burstTimer = 0;
        }
      }
    } else {
      // Move toward player
      CB.AI._moveTowardWithSteering(boss, player.x, player.y, dt, world);
    }
  },

  _bossFireRocket(boss, player, world) {
    const angle = CB.Utils.angleTo(boss, player);
    CB.Weapons._spawnEnemyProjectile(boss, angle, 60, 280, 600, CB.PK.ROCKET_PROJ, 6, 10, 48, 30, world);
    world.screenShake = Math.max(world.screenShake || 0, 2);
  },

  _bossFireMG(boss, player, world) {
    const angle = CB.Utils.angleTo(boss, player) + (Math.random() * 2 - 1) * (6 * Math.PI / 180);
    CB.Weapons._spawnEnemyProjectile(boss, angle, 12, 500, 400, CB.PK.BULLET_MG, 3, 3, 0, 0, world);
  },

  onKill(enemy, world) {
    enemy.dead = true;
    world.stats.kills++;

    // Credit award goes through world.creditsToAdd
    const def = CB.ENEMY_DEFS[enemy.subtype];
    if (def) {
      world.creditsToAdd = (world.creditsToAdd || 0) + def.credits;
    }

    // Drop pickups
    CB.Pickup.spawnFromEnemy(enemy, world);
  },

  render(enemy, ctx, camera) {
    const sx = enemy.x - camera.x;
    const sy = enemy.y - camera.y;

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(enemy.angle);

    CB.Sprites.drawEnemy(ctx, enemy.subtype, 0, 0);

    ctx.restore();

    // Boss HP bar
    if (enemy.subtype === 'boss') {
      const barW = 24;
      const barH = 4;
      const bx = sx - barW / 2;
      const by = sy - 20;
      ctx.fillStyle = '#330800';
      ctx.fillRect(bx, by, barW, barH);
      ctx.fillStyle = '#FF3333';
      ctx.fillRect(bx, by, barW * (enemy.hp / enemy.hpMax), barH);
    }

    // Alert icon
    if (enemy.ai.alertCueRemaining > 0) {
      CB.Enemy._drawAlertIcon(ctx, sx, sy - 20);
    }
  },

  _drawAlertIcon(ctx, x, y) {
    ctx.fillStyle = '#FFFF00';
    ctx.fillRect(x - 2, y - 12, 4, 7);
    // gap
    ctx.fillRect(x - 2, y - 3, 4, 3);
  },
};
