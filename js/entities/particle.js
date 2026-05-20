window.CB = window.CB || {};

CB.Particle = {
  MAX_PARTICLES: 200,

  create(opts) {
    return Object.assign({
      type: 'particle',
      x: 0, y: 0,
      vx: 0, vy: 0,
      w: 4, h: 4,
      age: 0,
      lifetime: 0.5,
      dead: false,
      color: '#FF4400',
      alpha: 1,
      kind: 'spark',
    }, opts);
  },

  spawnExplosion(x, y, radius, particles) {
    const count = Math.min(12, Math.floor(radius / 8));
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 100;
      const size = 3 + Math.random() * 5;
      particles.push(CB.Particle.create({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        w: size, h: size,
        lifetime: 0.3 + Math.random() * 0.3,
        color: Math.random() > 0.5 ? '#FF6600' : '#FFAA00',
        kind: 'spark',
      }));
    }
    // Explosion ring — stored as a special particle
    particles.push(CB.Particle.create({
      x, y,
      w: radius, h: radius,
      lifetime: 0.07,
      color: '#FFAA00',
      kind: 'explosion_ring',
      radius: radius,
    }));
    CB.Particle._cull(particles);
  },

  spawnMuzzleFlash(x, y, angle, particles) {
    for (let i = 0; i < 3; i++) {
      const spread = (Math.random() - 0.5) * 0.5;
      const speed = 80 + Math.random() * 40;
      particles.push(CB.Particle.create({
        x, y,
        vx: Math.cos(angle + spread) * speed,
        vy: Math.sin(angle + spread) * speed,
        w: 2, h: 2,
        lifetime: 0.08,
        color: '#FFFF88',
        kind: 'spark',
      }));
    }
    CB.Particle._cull(particles);
  },

  _cull(particles) {
    while (particles.length > CB.Particle.MAX_PARTICLES) {
      particles.shift();
    }
  },

  update(p, dt) {
    p.age += dt;
    if (p.age >= p.lifetime) {
      p.dead = true;
      return;
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.alpha = 1 - (p.age / p.lifetime);
  },

  render(p, ctx, camera) {
    const sx = p.x - camera.x;
    const sy = p.y - camera.y;
    ctx.save();
    ctx.globalAlpha = p.alpha;

    if (p.kind === 'explosion_ring') {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sx, sy, p.radius * (p.age / p.lifetime + 0.5), 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.fillStyle = p.color;
      ctx.fillRect(sx - p.w / 2, sy - p.h / 2, p.w, p.h);
    }

    ctx.restore();
  },
};
