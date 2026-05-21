window.CB = window.CB || {};

CB.Weapons = {
  DEFS: null,  // will reference CB.WEAPON_DEFS after init

  tryFire(owner, world) {
    if (!CB.Weapons.DEFS) CB.Weapons.DEFS = CB.WEAPON_DEFS;

    const slot = owner.weapons[owner.activeSlot];
    if (!slot) return false;
    const def = CB.Weapons.DEFS[slot.kind];
    if (!def) return false;
    if (slot.cooldown > 0) return false;
    if (slot.ammo <= 0) return false;

    slot.ammo--;
    slot.cooldown = 1 / def.fireRate;

    // --- Escalating recoil for weapons with spread ---
    let effectiveSpread = def.spread || 0;
    if (def.spread > 0) {
      const now = performance.now ? performance.now() / 1000 : Date.now() / 1000;
      const BURST_PAUSE = 0.3; // seconds without firing = burst reset

      if (!slot.lastFireTime || (now - slot.lastFireTime) > BURST_PAUSE) {
        slot.burstShots = 0;
      }
      slot.lastFireTime = now;
      slot.burstShots = (slot.burstShots || 0) + 1;

      // Each consecutive shot adds 20% spread, cap at 3x base
      const multiplier = Math.min(1 + 0.2 * (slot.burstShots - 1), 3.0);
      effectiveSpread = def.spread * multiplier;
    }

    const angle = CB.Weapons.computeAimAngle(owner, world);

    switch (def.fireBehavior) {
      case 'single':
      case 'pierce': {
        const jitter = effectiveSpread ? (Math.random() * 2 - 1) * effectiveSpread : 0;
        CB.Weapons._spawnProjectile(owner, def, angle + jitter, world);
        break;
      }

      case 'spread':
        for (let i = 0; i < def.pellets; i++) {
          const spread = (Math.random() * 2 - 1) * effectiveSpread;
          CB.Weapons._spawnProjectile(owner, def, angle + spread, world);
        }
        break;

      case 'continuous': {
        // Flamethrower — spread per flame particle
        const spread = (Math.random() * 2 - 1) * effectiveSpread;
        CB.Weapons._spawnProjectile(owner, def, angle + spread, world);
        break;
      }
    }

    // Screen shake
    if (def.shake && def.shake > 0 && world.screenShake !== undefined) {
      world.screenShake = Math.max(world.screenShake || 0, def.shake);
    }

    // Sound-triggered AI wakeup: loud weapons (shake > 0 or splashRadius > 0)
    if ((def.shake > 0 || def.splashRadius > 0) && world && CB.AI) {
      CB.AI.alertNearby(owner.x, owner.y, 300, world);
    }

    return true;
  },

  tryFireEnemy(owner, world, targetAngle) {
    if (!CB.Weapons.DEFS) CB.Weapons.DEFS = CB.WEAPON_DEFS;

    const ai = owner.ai;
    const eDef = CB.ENEMY_DEFS[owner.subtype];
    if (!eDef) return false;
    if (owner.weaponCooldown > 0) return false;

    owner.weaponCooldown = 1 / eDef.weaponRate;

    let angle = targetAngle;
    // Apply accuracy multiplier from difficulty — only if enemy has a spread defined
    const diffAccuracy = CB.currentDifficulty
      ? (CB.DIFFICULTY[CB.currentDifficulty].enemyAccuracy || 1)
      : 1;
    if (eDef.weaponSpread) {
      // Higher accuracy = less spread; at EASY (0.7) spread is wider
      const accuracySpread = eDef.weaponSpread * (2 - diffAccuracy);
      angle += (Math.random() * 2 - 1) * accuracySpread;
    } else {
      // Enemies without explicit spread still get a small jitter scaled by difficulty
      const baseJitter = 3 * Math.PI / 180; // 3 degrees base jitter
      angle += (Math.random() * 2 - 1) * baseJitter * (2 - diffAccuracy);
    }

    // Berserker: melee only — no projectile
    if (eDef.weapon === 'melee') return false;

    // Boss alternates modes
    let dmg = eDef.weaponDmg;
    // Apply difficulty damage multiplier
    const damageMult = CB.currentDifficulty
      ? (CB.DIFFICULTY[CB.currentDifficulty].enemyDamageMult || 1)
      : 1;
    dmg = Math.ceil(dmg * damageMult);

    // Slow, visible bullets — matching original Cyberdogs feel (dodgeable)
    let speed = 180;
    let range = 300;
    let projKind = CB.PK.BULLET_YELLOW;
    let projW = 4, projH = 4;

    if (owner.subtype === 'boss') {
      if (owner.ai.weaponMode === 'rocket') {
        speed = 140; range = 500; projKind = CB.PK.ROCKET_PROJ;
        projW = 6; projH = 10; dmg = Math.ceil(60 * damageMult);
        CB.Weapons._spawnEnemyProjectile(owner, angle, dmg, speed, range, projKind, projW, projH, 48, 30, world);
        return true;
      } else {
        // MG burst — slightly faster than pistol
        speed = 240; range = 320; projKind = CB.PK.BULLET_MG;
        projW = 3; projH = 3; dmg = Math.ceil(12 * damageMult);
      }
    } else if (owner.subtype === 'sniper') {
      // Sniper is faster but still visible
      speed = 350; range = 420; projKind = CB.PK.SNIPER_BEAM;
      projW = 2; projH = 16;
    } else if (owner.subtype === 'heavy') {
      speed = 220; range = 300; projKind = CB.PK.BULLET_MG;
      projW = 3; projH = 3;
    } else {
      // Grunt — slowest, very dodgeable
      speed = 180; range = 260; projKind = CB.PK.BULLET_YELLOW;
    }

    CB.Weapons._spawnEnemyProjectile(owner, angle, dmg, speed, range, projKind, projW, projH, 0, 0, world);
    return true;
  },

  _spawnEnemyProjectile(owner, angle, dmg, speed, range, projKind, projW, projH, splashRadius, splashDmg, world) {
    const p = {
      id: CB.Game.nextId(),
      type: 'projectile',
      ownerId: owner.id,
      ownerType: 'enemy',
      x: owner.x,
      y: owner.y,
      w: projW, h: projH,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      damage: dmg,
      range: range,
      traveled: 0,
      pierce: 0,
      splashRadius: splashRadius,
      splashDmg: splashDmg,
      kind: projKind,
      dead: false,
      age: 0,
      angle: angle,
    };
    world.projectiles.push(p);
  },

  _spawnProjectile(owner, def, angle, world) {
    const p = {
      id: CB.Game.nextId(),
      type: 'projectile',
      ownerId: owner.id,
      ownerType: owner.type,
      x: owner.x + Math.cos(angle) * 12,
      y: owner.y + Math.sin(angle) * 12,
      w: def.projW, h: def.projH,
      vx: Math.cos(angle) * def.projSpeed,
      vy: Math.sin(angle) * def.projSpeed,
      damage: def.dmg,
      range: def.range,
      traveled: 0,
      pierce: def.pierce || 0,
      piercedCount: 0,
      splashRadius: def.splashRadius || 0,
      splashDmg: def.splashDmg || 0,
      kind: def.projectileKind,
      dead: false,
      age: 0,
      angle: angle,
      // Tag flamethrower projectiles
      isFlame: (def.fireBehavior === 'continuous'),
    };

    // Flamethrower: short lifetime
    if (def.fireBehavior === 'continuous') {
      p.lifetime = 0.3 + Math.random() * 0.15;
      p.maxAge = p.lifetime;
    }

    world.projectiles.push(p);
  },

  computeAimAngle(owner) {
    return owner.angle;
  },

  explode(p, world) {
    // Damage all enemies in splash radius
    if (p.ownerType === 'player') {
      for (const e of world.enemies) {
        if (e.dead) continue;
        const d = CB.Utils.dist(p, e);
        if (d <= p.splashRadius) {
          const falloff = 1 - d / p.splashRadius;
          e.hp -= Math.ceil(p.splashDmg * falloff);
          if (e.hp <= 0) {
            CB.Enemy.onKill(e, world);
          }
        }
      }
      // Also alert nearby enemies from the explosion sound
      if (CB.AI) {
        CB.AI.alertNearby(p.x, p.y, 300, world);
      }
    } else {
      // Enemy rocket/splash hits player
      const d = CB.Utils.dist(p, world.player);
      if (d <= p.splashRadius) {
        const falloff = 1 - d / p.splashRadius;
        CB.Player.applyDamage(world.player, Math.ceil(p.splashDmg * falloff));
      }
    }

    // Spawn explosion particle
    CB.Particle.spawnExplosion(p.x, p.y, p.splashRadius, world.particles);
  },
};
