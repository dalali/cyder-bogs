window.CB = window.CB || {};

CB.Projectile = {
  update(p, dt, world) {
    if (p.dead) return;
    p.age += dt;

    // Flamethrower lifetime check
    if (p.maxAge !== undefined && p.age >= p.maxAge) {
      p.dead = true;
      return;
    }

    const dx = p.vx * dt;
    const dy = p.vy * dt;
    const newX = p.x + dx;
    const newY = p.y + dy;
    const step = Math.sqrt(dx * dx + dy * dy);

    // Wall collision — check all 4 corners of projectile bounding box
    const hw = (p.w || 4) / 2;
    const hh = (p.h || 4) / 2;
    const wallHit = world.tilemap.isSolidAtWorld(newX - hw, newY - hh)
      || world.tilemap.isSolidAtWorld(newX + hw, newY - hh)
      || world.tilemap.isSolidAtWorld(newX - hw, newY + hh)
      || world.tilemap.isSolidAtWorld(newX + hw, newY + hh);
    if (wallHit) {
      if (p.splashRadius > 0) {
        CB.Weapons.explode(p, world);
      }
      CB.Particle.spawnMuzzleFlash(p.x, p.y, p.angle, world.particles);
      p.dead = true;
      return;
    }

    // Hit test against enemies (player projectiles only)
    if (p.ownerType === 'player') {
      for (const e of world.enemies) {
        if (e.dead) continue;
        if (!CB.Utils.aabbOverlap(p, e)) continue;

        // Hit!
        e.hp -= p.damage;

        // Flamethrower: ignite the enemy
        if (p.isFlame) {
          e.onFire = true;
          e.fireTicks = 3.0;
        }

        if (e.hp <= 0) {
          CB.Enemy.onKill(e, world);
        } else {
          // Alert enemy that was hit
          if (e.ai.state === 'IDLE' || e.ai.state === 'PATROL') {
            CB.AI.setState(e, 'ALERT');
          }
        }

        if (p.pierce > 0 && p.piercedCount < p.pierce) {
          p.piercedCount = (p.piercedCount || 0) + 1;
          // continue traveling, don't kill projectile
        } else {
          if (p.splashRadius > 0) {
            CB.Weapons.explode(p, world);
          }
          p.dead = true;
          return;
        }
      }
    }

    // Hit test against player (enemy projectiles only)
    if (p.ownerType === 'enemy') {
      if (CB.Utils.aabbOverlap(p, world.player) && !world.player.dying) {
        CB.Player.applyDamage(world.player, p.damage);
        if (p.splashRadius > 0) {
          CB.Weapons.explode(p, world);
        }
        p.dead = true;
        return;
      }
    }

    p.x = newX;
    p.y = newY;
    p.traveled += step;

    if (p.traveled >= p.range) {
      if (p.splashRadius > 0) {
        CB.Weapons.explode(p, world);
      }
      p.dead = true;
    }
  },

  render(p, ctx, camera) {
    const sx = p.x - camera.x;
    const sy = p.y - camera.y;

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(p.angle);

    // Color by kind
    let color = '#FFFF88';
    switch (p.kind) {
      case CB.PK.BULLET_YELLOW:  color = '#FFFF88'; break;
      case CB.PK.BULLET_MG:      color = '#FFCC44'; break;
      case CB.PK.BULLET_ORANGE:  color = '#FF8844'; break;
      case CB.PK.FLAME: {
        // Fade alpha over lifetime
        if (p.maxAge) {
          ctx.globalAlpha = 1 - (p.age / p.maxAge) * 0.7;
        }
        color = '#FF4400';
        break;
      }
      case CB.PK.ROCKET_PROJ:    color = '#FF6600'; break;
      case CB.PK.SNIPER_BEAM:    color = '#88FFFF'; break;
      case CB.PK.GRENADE_PROJ:   color = '#99CC22'; break;
      case CB.PK.LASER_BEAM:     color = '#FF00FF'; break;
    }

    ctx.fillStyle = color;
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);

    // Rocket tip highlight
    if (p.kind === CB.PK.ROCKET_PROJ) {
      ctx.fillStyle = '#FFAA00';
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, 2);
    }

    ctx.restore();
  },
};
