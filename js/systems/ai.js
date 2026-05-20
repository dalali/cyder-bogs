window.CB = window.CB || {};

CB.AI = {
  setState(enemy, state) {
    enemy.ai.state = state;
    enemy.ai.stateTime = 0;
    if (state === 'ALERT') {
      enemy.ai.alertCueRemaining = 0.6;
    }
  },

  update(enemy, dt, world, player) {
    const ai = enemy.ai;
    ai.stateTime += dt;
    // weapon cooldown is on enemy root (checked by tryFireEnemy)
    enemy.weaponCooldown = Math.max(0, (enemy.weaponCooldown || 0) - dt);

    // Throttled LOS check
    ai.losCheckTimer = (ai.losCheckTimer || 0) - dt;
    if (ai.losCheckTimer <= 0) {
      ai.losClear = CB.Utils.hasLineOfSight(enemy, player, world.tilemap);
      ai.losCheckTimer = 0.2;
    }

    const d = CB.Utils.dist(enemy, player);

    switch (ai.state) {
      case 'IDLE':
        if (d < ai.detectionRange && ai.losClear) {
          CB.AI.setState(enemy, 'ALERT');
        } else if (ai.patrolWaypoints && ai.patrolWaypoints.length > 0) {
          CB.AI.setState(enemy, 'PATROL');
        }
        break;

      case 'PATROL':
        CB.AI._moveTowardWaypoint(enemy, dt, world);
        if (d < ai.detectionRange && ai.losClear) {
          CB.AI.setState(enemy, 'ALERT');
        }
        break;

      case 'ALERT':
        ai.alertCueRemaining -= dt;
        // Face toward last known position
        if (ai.losClear) {
          ai.target = { x: player.x, y: player.y };
          enemy.angle = CB.Utils.angleTo(enemy, player);
        }
        if (ai.stateTime >= 0.6) {
          CB.AI.setState(enemy, 'CHASE');
        }
        break;

      case 'CHASE': {
        const targetX = ai.target ? ai.target.x : player.x;
        const targetY = ai.target ? ai.target.y : player.y;
        // Update target if LOS
        if (ai.losClear) {
          ai.target = { x: player.x, y: player.y };
        }
        CB.AI._moveTowardWithSteering(enemy, targetX, targetY, dt, world);
        if (d <= ai.attackRange && ai.losClear) {
          CB.AI.setState(enemy, 'ATTACK');
        } else if (d > ai.breakRange && !ai.losClear) {
          const nextState = (ai.patrolWaypoints && ai.patrolWaypoints.length > 0) ? 'PATROL' : 'IDLE';
          CB.AI.setState(enemy, nextState);
        }
        break;
      }

      case 'ATTACK':
        enemy.angle = CB.Utils.angleTo(enemy, player);
        ai.target = { x: player.x, y: player.y };

        // tryFireEnemy checks and sets enemy.weaponCooldown internally
        if (ai.losClear) {
          CB.AI._fireAtPlayer(enemy, player, world);
        }

        if (d > ai.attackRange || !ai.losClear) {
          CB.AI.setState(enemy, 'CHASE');
        }
        break;
    }
  },

  _fireAtPlayer(enemy, player, world) {
    const angle = CB.Utils.angleTo(enemy, player);
    CB.Weapons.tryFireEnemy(enemy, world, angle);
  },

  _moveTowardWaypoint(enemy, dt, world) {
    const ai = enemy.ai;
    if (!ai.patrolWaypoints || ai.patrolWaypoints.length === 0) return;

    const wp = ai.patrolWaypoints[ai.patrolIndex || 0];
    const wx = wp.tx * CB.TILE_SIZE + CB.TILE_SIZE / 2;
    const wy = wp.ty * CB.TILE_SIZE + CB.TILE_SIZE / 2;
    const dist = CB.Utils.dist(enemy, { x: wx, y: wy });

    if (dist < 8) {
      ai.patrolIndex = ((ai.patrolIndex || 0) + 1) % ai.patrolWaypoints.length;
    } else {
      CB.AI._moveTowardWithSteering(enemy, wx, wy, dt, world);
    }
  },

  _moveTowardWithSteering(enemy, tx, ty, dt, world) {
    const baseAngle = Math.atan2(ty - enemy.y, tx - enemy.x);
    const speed = CB.ENEMY_DEFS[enemy.subtype] ? CB.ENEMY_DEFS[enemy.subtype].moveSpeed : 60;
    const tryAngles = [0, Math.PI / 4, -Math.PI / 4, Math.PI / 2, -Math.PI / 2];

    for (const offset of tryAngles) {
      const a = baseAngle + offset;
      const dx = Math.cos(a) * speed * dt;
      const dy = Math.sin(a) * speed * dt;
      if (CB.Collision.canMoveTo(enemy, enemy.x + dx, enemy.y + dy, world.tilemap)) {
        enemy.x += dx;
        enemy.y += dy;
        if (offset === 0) enemy.angle = a; // only update angle when moving directly
        return;
      }
    }
    // all blocked — stay put
  },
};
