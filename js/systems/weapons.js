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

    const angle = CB.Weapons.computeAimAngle(owner, world);

    switch (def.fireBehavior) {
      case 'single':
      case 'pierce': {
        const jitter = def.spread ? (Math.random() * 2 - 1) * def.spread : 0;
        CB.Weapons._spawnProjectile(owner, def, angle + jitter, world);
        break;
      }

      case 'spread':
        for (let i = 0; i < def.pellets; i++) {
          const spread = (Math.random() * 2 - 1) * def.spread;
          CB.Weapons._spawnProjectile(owner, def, angle + spread, world);
        }
        break;

      case 'continuous': {
        // Flamethrower — spread per flame particle
        const spread = (Math.random() * 2 - 1) * def.spread;
        CB.Weapons._spawnProjectile(owner, def, angle + spread, world);
        break;
      }
    }

    // Screen shake for rockets and grenades
    if (def.shake && world.screenShake !== undefined) {
      world.screenShake = Math.max(world.screenShake || 0, def.shake);
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
    if (eDef.weaponSpread) {
      angle += (Math.random() * 2 - 1) * eDef.weaponSpread;
    }

    // Berserker: melee only — no projectile
    if (eDef.weapon === 'melee') return false;

    // Boss alternates modes
    let dmg = eDef.weaponDmg;
    let speed = 400;
    let range = 350;
    let projKind = CB.PK.BULLET_YELLOW;
    let projW = 4, projH = 4;

    if (owner.subtype === 'boss') {
      if (owner.ai.weaponMode === 'rocket') {
        speed = 280; range = 600; projKind = CB.PK.ROCKET_PROJ;
        projW = 6; projH = 10; dmg = 60;
        // splash
        CB.Weapons._spawnEnemyProjectile(owner, angle, dmg, speed, range, projKind, projW, projH, 48, 30, world);
        return true;
      } else {
        // MG burst
        speed = 500; range = 400; projKind = CB.PK.BULLET_MG;
        projW = 3; projH = 3; dmg = 12;
      }
    } else if (owner.subtype === 'sniper') {
      speed = 900; range = 450; projKind = CB.PK.SNIPER_BEAM;
      projW = 2; projH = 16;
    } else if (owner.subtype === 'heavy') {
      speed = 500; range = 350; projKind = CB.PK.BULLET_MG;
      projW = 3; projH = 3;
    } else {
      speed = 450; range = 280; projKind = CB.PK.BULLET_YELLOW;
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
    };

    // Flamethrower: short lifetime
    if (def.fireBehavior === 'continuous') {
      p.lifetime = 0.3 + Math.random() * 0.15;
      p.maxAge = p.lifetime;
    }

    world.projectiles.push(p);
  },

  computeAimAngle(owner, world) {
    if (owner.type === 'player') {
      return Math.atan2(
        CB.Input.mouse.worldY - owner.y,
        CB.Input.mouse.worldX - owner.x
      );
    }
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
