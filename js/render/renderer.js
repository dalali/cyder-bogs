window.CB = window.CB || {};

// Top-level render dispatch — used by PlayScreen
CB.Renderer = {
  render(ctx, world, objState) {
    const camera = world.camera;

    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    // 1. Floor tiles (and all tiles including exit/cover)
    CB.Tiles.renderAll(ctx, world.tilemap, camera, objState);

    // 2. Pickups
    for (const p of world.pickups) {
      if (!p.dead) CB.Pickup.render(p, ctx, camera);
    }

    // 3. Enemies
    for (const e of world.enemies) {
      if (!e.dead) CB.Enemy.render(e, ctx, camera);
    }

    // 4. Player
    if (world.player) {
      CB.Player.render(world.player, ctx, camera);
    }

    // 5. Projectiles
    for (const p of world.projectiles) {
      if (!p.dead) CB.Projectile.render(p, ctx, camera);
    }

    // 6. Particles
    for (const p of world.particles) {
      if (!p.dead) CB.Particle.render(p, ctx, camera);
    }

    // 7. Floating texts (combo, credits)
    if (world.floatingTexts && world.floatingTexts.length > 0) {
      ctx.save();
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      for (const ft of world.floatingTexts) {
        const progress = ft.age / ft.maxAge;
        const alpha = 1 - progress * progress; // ease-out fade
        const sx = ft.x - camera.x;
        const sy = (ft.y - camera.y) - ft.age * 40; // float upward
        ctx.globalAlpha = alpha;
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, sx, sy);
      }
      ctx.globalAlpha = 1;
      ctx.textAlign = 'left';
      ctx.restore();
    }

    ctx.restore();
  },
};
