window.CB = window.CB || {};

CB.Pickup = {
  create(opts) {
    return Object.assign({
      type: 'pickup',
      subtype: 'ammo',  // 'ammo' | 'medkit_small' | 'medkit_large' | 'credits'
      x: 0, y: 0,
      w: 16, h: 16,
      dead: false,
      age: 0,
    }, opts);
  },

  spawnFromEnemy(enemy, world) {
    const def = CB.ENEMY_DEFS[enemy.subtype];
    if (!def) return;
    const r = Math.random();
    let subtype = null;
    if (r < def.dropAmmoChance) {
      subtype = 'ammo';
    } else if (r < def.dropAmmoChance + def.dropMedkitChance) {
      subtype = 'medkit_small';
    } else if (r < def.dropAmmoChance + def.dropMedkitChance + def.dropCreditChance) {
      subtype = 'credits';
    }
    // Boss always drops large medkit
    if (def.isBoss) subtype = 'medkit_large';

    if (subtype) {
      world.pickups.push(CB.Pickup.create({
        subtype,
        x: enemy.x,
        y: enemy.y,
      }));
    }
  },

  update(p, dt, player) {
    p.age += dt;
    if (CB.Utils.aabbOverlap(p, player)) {
      CB.Pickup._apply(p, player);
      p.dead = true;
    }
  },

  _apply(p, player) {
    switch (p.subtype) {
      case 'medkit_small':
        player.hp = Math.min(player.hpMax, player.hp + 25);
        break;
      case 'medkit_large':
        player.hp = Math.min(player.hpMax, player.hp + 50);
        break;
      case 'credits':
        // Credits are applied via world.player.credits (stored in game.playerState)
        // We'll signal it via a flag
        p._creditsValue = 50;
        break;
      case 'ammo': {
        // Refill most-depleted weapon
        const weapons = player.weapons;
        let worstSlot = -1;
        let worstRatio = 1;
        for (let i = 0; i < weapons.length; i++) {
          const w = weapons[i];
          if (!w) continue;
          const def = CB.WEAPON_DEFS[w.kind];
          if (!def) continue;
          const ratio = w.ammo / def.ammoMax;
          if (ratio < worstRatio) {
            worstRatio = ratio;
            worstSlot = i;
          }
        }
        if (worstSlot >= 0) {
          const w = weapons[worstSlot];
          const def = CB.WEAPON_DEFS[w.kind];
          w.ammo = Math.min(def.ammoMax, w.ammo + 20);
        }
        break;
      }
    }
  },

  render(p, ctx, camera) {
    const sx = p.x - camera.x;
    const sy = p.y - camera.y;

    // Gentle bob animation
    const bob = Math.sin(p.age * 3) * 2;

    ctx.save();
    switch (p.subtype) {
      case 'ammo': {
        // Green ammo box
        ctx.fillStyle = '#556622';
        ctx.fillRect(sx - 6, sy - 5 + bob, 12, 10);
        ctx.strokeStyle = '#88AA33';
        ctx.lineWidth = 1;
        ctx.strokeRect(sx - 6, sy - 5 + bob, 12, 10);
        ctx.fillStyle = '#CCDD88';
        ctx.font = '6px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('A', sx, sy + 3 + bob);
        break;
      }
      case 'medkit_small': {
        ctx.fillStyle = '#CC0000';
        ctx.fillRect(sx - 5, sy - 5 + bob, 10, 10);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(sx - 1, sy - 4 + bob, 2, 8);
        ctx.fillRect(sx - 4, sy - 1 + bob, 8, 2);
        break;
      }
      case 'medkit_large': {
        ctx.fillStyle = '#EE0000';
        ctx.fillRect(sx - 6, sy - 6 + bob, 12, 12);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(sx - 1, sy - 5 + bob, 2, 10);
        ctx.fillRect(sx - 5, sy - 1 + bob, 10, 2);
        break;
      }
      case 'credits': {
        ctx.fillStyle = '#AA8800';
        ctx.fillRect(sx - 5, sy - 5 + bob, 10, 10);
        ctx.fillStyle = '#FFCC00';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('$', sx, sy + 4 + bob);
        break;
      }
    }
    ctx.restore();
  },
};
