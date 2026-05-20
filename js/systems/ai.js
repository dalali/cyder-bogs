window.CB = window.CB || {};

CB.AI = {
  setState(enemy, state) {
    enemy.ai.state = state;
    enemy.ai.stateTime = 0;
    if (state === 'ALERT') {
      enemy.ai.alertCueRemaining = 0.6;
    }
  },

  // Alert all enemies within radius that are IDLE or PATROL (sound wakeup)
  alertNearby(x, y, radius, world) {
    if (!world || !world.enemies) return;
    for (const e of world.enemies) {
      if (e.dead) continue;
      const s = e.ai.state;
      if (s !== 'IDLE' && s !== 'PATROL') continue;
      const dx = e.x - x;
      const dy = e.y - y;
      if (dx * dx + dy * dy <= radius * radius) {
        CB.AI.setState(e, 'ALERT');
      }
    }
  },

  update(enemy, dt, world, player) {
    const ai = enemy.ai;
    ai.stateTime += dt;
    // weapon cooldown is on enemy root (checked by tryFireEnemy)
    enemy.weaponCooldown = Math.max(0, (enemy.weaponCooldown || 0) - dt);

    // Fire delay countdown (staggered group fire)
    if (ai.fireDelay > 0) {
      ai.fireDelay -= dt;
    }

    // Throttled LOS check
    ai.losCheckTimer = (ai.losCheckTimer || 0) - dt;
    if (ai.losCheckTimer <= 0) {
      ai.losClear = CB.Utils.hasLineOfSight(enemy, player, world.tilemap);
      ai.losCheckTimer = 0.2;
    }

    const d = CB.Utils.dist(enemy, player);

    // Apply difficulty detection range multiplier
    const diffMult = CB.currentDifficulty
      ? (CB.DIFFICULTY[CB.currentDifficulty].detectionMult || 1)
      : 1;

    switch (ai.state) {
      case 'IDLE':
        if (d < ai.detectionRange * diffMult && ai.losClear) {
          CB.AI.setState(enemy, 'ALERT');
        } else if (ai.patrolWaypoints && ai.patrolWaypoints.length > 0) {
          CB.AI.setState(enemy, 'PATROL');
        }
        break;

      case 'PATROL':
        CB.AI._moveTowardWaypoint(enemy, dt, world);
        if (d < ai.detectionRange * diffMult && ai.losClear) {
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

        // Coward grunts flee for 1.5s before engaging
        if (ai.isCoward && ai.stateTime < 1.5) {
          // Move away from player
          const awayAngle = Math.atan2(enemy.y - player.y, enemy.x - player.x);
          const speed = CB.ENEMY_DEFS[enemy.subtype].moveSpeed;
          const dx = Math.cos(awayAngle) * speed * dt;
          const dy = Math.sin(awayAngle) * speed * dt;
          if (CB.Collision.canMoveTo(enemy, enemy.x + dx, enemy.y + dy, world.tilemap)) {
            enemy.x += dx;
            enemy.y += dy;
          }
          break;
        }

        if (ai.stateTime >= 0.6) {
          CB.AI.setState(enemy, 'CHASE');
        }
        break;

      case 'CHASE': {
        const targetX = ai.target ? ai.target.x : player.x;
        const targetY = ai.target ? ai.target.y : player.y;
        // Update last known when LOS is clear
        if (ai.losClear) {
          ai.target = { x: player.x, y: player.y };
          ai.lastKnownX = player.x;
          ai.lastKnownY = player.y;
        }
        CB.AI._moveTowardWithSteering(enemy, targetX, targetY, dt, world);
        if (d <= ai.attackRange && ai.losClear) {
          CB.AI.setState(enemy, 'ATTACK');
        } else if (d > ai.breakRange && !ai.losClear) {
          // Transition to INVESTIGATE if we have a last known position
          if (ai.lastKnownX !== undefined && ai.lastKnownY !== undefined) {
            CB.AI.setState(enemy, 'INVESTIGATE');
          } else {
            const nextState = (ai.patrolWaypoints && ai.patrolWaypoints.length > 0) ? 'PATROL' : 'IDLE';
            CB.AI.setState(enemy, nextState);
          }
        }
        break;
      }

      case 'INVESTIGATE': {
        // Move to last known position
        const lkx = ai.lastKnownX;
        const lky = ai.lastKnownY;
        const distToLK = Math.sqrt((enemy.x - lkx) * (enemy.x - lkx) + (enemy.y - lky) * (enemy.y - lky));

        // Re-engage if player back in LOS
        if (ai.losClear && d <= ai.attackRange * 1.5) {
          ai.lastKnownX = player.x;
          ai.lastKnownY = player.y;
          CB.AI.setState(enemy, 'CHASE');
          break;
        }

        // Reached last known or timed out (4 seconds)
        if (distToLK < 32 || ai.stateTime > 4.0) {
          const nextState = (ai.patrolWaypoints && ai.patrolWaypoints.length > 0) ? 'PATROL' : 'IDLE';
          CB.AI.setState(enemy, nextState);
          break;
        }

        CB.AI._moveTowardWithSteering(enemy, lkx, lky, dt, world);
        break;
      }

      case 'ATTACK':
        enemy.angle = CB.Utils.angleTo(enemy, player);
        ai.target = { x: player.x, y: player.y };
        ai.lastKnownX = player.x;
        ai.lastKnownY = player.y;

        // Retreat at low HP for grunt/sniper
        if ((enemy.subtype === 'grunt' || enemy.subtype === 'sniper') &&
            enemy.hp < enemy.hpMax * 0.3) {
          CB.AI.setState(enemy, 'RETREAT');
          break;
        }

        // Staggered group fire: check if another enemy fired very recently
        if (ai.losClear) {
          if (ai.fireDelay <= 0) {
            const now = performance.now ? performance.now() / 1000 : Date.now() / 1000;
            const lastFire = world.lastEnemyFireTime || 0;
            if (now - lastFire < 0.15 && enemy.weaponCooldown <= 0) {
              // Add a random delay before this enemy fires
              ai.fireDelay = 0.1 + Math.random() * 0.15;
            } else {
              CB.AI._fireAtPlayer(enemy, player, world);
            }
          }
        }

        if (d > ai.attackRange || !ai.losClear) {
          CB.AI.setState(enemy, 'CHASE');
        }
        break;

      case 'RETREAT': {
        // Move directly away from player at 1.2x normal speed
        const awayAngle = Math.atan2(enemy.y - player.y, enemy.x - player.x);
        const retreatSpeed = (CB.ENEMY_DEFS[enemy.subtype].moveSpeed || 60) * 1.2;
        const rdx = Math.cos(awayAngle) * retreatSpeed * dt;
        const rdy = Math.sin(awayAngle) * retreatSpeed * dt;
        if (CB.Collision.canMoveTo(enemy, enemy.x + rdx, enemy.y + rdy, world.tilemap)) {
          enemy.x += rdx;
          enemy.y += rdy;
        }

        // Still face and fire at player during retreat
        enemy.angle = CB.Utils.angleTo(enemy, player);
        if (ai.losClear && ai.fireDelay <= 0) {
          CB.AI._fireAtPlayer(enemy, player, world);
        }

        // After 2 seconds, return to CHASE
        if (ai.stateTime > 2.0) {
          CB.AI.setState(enemy, 'CHASE');
        }
        break;
      }
    }
  },

  _fireAtPlayer(enemy, player, world) {
    const angle = CB.Utils.angleTo(enemy, player);
    CB.Weapons.tryFireEnemy(enemy, world, angle);
    // Record fire time for stagger system
    if (world) {
      world.lastEnemyFireTime = performance.now ? performance.now() / 1000 : Date.now() / 1000;
    }
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
    let speed = CB.ENEMY_DEFS[enemy.subtype] ? CB.ENEMY_DEFS[enemy.subtype].moveSpeed : 60;
    // Fire slows enemy by 30%
    if (enemy.onFire) speed *= 0.7;
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
