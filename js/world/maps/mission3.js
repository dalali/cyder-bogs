// Mission 3: The Vault — 20x20 tiles (L-shaped corridors, more cover)
// Tile IDs: 0=Floor, 1=Wall, 2=Exit, 3=Cover/Crate, 4=Door, 5=PlayerSpawn, 6=EnemySpawn
window.CB = window.CB || {};
window.CB.MAPS = window.CB.MAPS || {};

window.CB.MAPS[3] = {
  id: 3,
  width: 20,
  height: 20,
  tiles: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],  // row 0
    [1,5,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],  // row 1 — player, then wall block
    [1,0,0,3,0,0,4,0,0,0,0,0,0,0,0,0,0,3,0,1],  // row 2
    [1,0,0,0,6,0,1,0,0,3,6,0,0,3,0,6,0,0,0,1],  // row 3 — grunts
    [1,3,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1],  // row 4
    [1,0,0,0,0,0,4,0,6,0,3,0,3,0,6,0,0,0,0,1],  // row 5 — grunts + cover
    [1,1,1,4,1,1,1,1,1,1,1,1,1,1,1,4,1,1,1,1],  // row 6 — horizontal wall
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],  // row 7
    [1,0,6,0,3,0,0,0,0,0,0,0,0,0,3,0,6,0,0,1],  // row 8 — heavies
    [1,0,0,0,0,0,0,3,0,0,0,0,3,0,0,0,0,0,0,1],  // row 9
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],  // row 10
    [1,1,1,4,1,1,1,1,1,1,1,1,1,1,1,1,4,1,1,1],  // row 11 — wall
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],  // row 12
    [1,0,6,0,0,0,3,0,0,0,0,0,3,0,0,0,6,0,0,1],  // row 13 — snipers
    [1,0,0,0,3,0,0,0,6,0,0,6,0,0,0,3,0,0,0,1],  // row 14 — heavies
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],  // row 15
    [1,1,4,1,1,1,1,1,1,1,1,4,1,1,1,1,1,1,1,1],  // row 16 — wall
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,1],  // row 17
    [1,0,0,3,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,1],  // row 18 — heavy
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1],  // row 19 — exit col 18
  ],
  spawns: {
    player: { tx: 1, ty: 1 },
    enemies: [
      { type: 'grunt',  tx: 4,  ty: 3 },
      { type: 'grunt',  tx: 10, ty: 3 },
      { type: 'grunt',  tx: 15, ty: 3 },
      { type: 'grunt',  tx: 8,  ty: 5 },
      { type: 'grunt',  tx: 14, ty: 5 },
      { type: 'heavy',  tx: 2,  ty: 8, patrol: [{tx:2,ty:8},{tx:4,ty:8}] },
      { type: 'heavy',  tx: 16, ty: 8, patrol: [{tx:16,ty:8},{tx:14,ty:8}] },
      { type: 'heavy',  tx: 8,  ty: 14 },
      { type: 'sniper', tx: 2,  ty: 13 },
      { type: 'sniper', tx: 16, ty: 13 },
    ],
    pickups: [
      { type: 'medkit_small', tx: 10, ty: 7 },
      { type: 'ammo',         tx: 5,  ty: 15 },
      { type: 'credits',      tx: 15, ty: 15 },
      { type: 'medkit_small', tx: 10, ty: 17 },
    ],
  },
  exit: { tx: 18, ty: 19 },
};
