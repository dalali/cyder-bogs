// Mission 2: Sector 7 — 15x20 tiles (medium grid layout with rooms)
// Tile IDs: 0=Floor, 1=Wall, 2=Exit, 3=Cover/Crate, 4=Door, 5=PlayerSpawn, 6=EnemySpawn
window.CB = window.CB || {};
window.CB.MAPS = window.CB.MAPS || {};

window.CB.MAPS[2] = {
  id: 2,
  width: 15,
  height: 20,
  tiles: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],  // row 0
    [1,5,0,0,0,0,1,0,0,0,0,0,0,0,1],  // row 1 — player spawn
    [1,0,0,3,0,0,1,0,0,3,0,0,0,0,1],  // row 2
    [1,0,0,0,0,0,4,0,0,0,0,0,0,0,1],  // row 3 — door
    [1,0,0,0,6,0,1,0,6,0,0,0,0,0,1],  // row 4 — grunts
    [1,1,4,1,1,1,1,1,1,4,1,1,0,0,1],  // row 5 — horizontal wall with doors
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],  // row 6
    [1,0,3,0,6,0,0,0,6,0,0,3,0,0,1],  // row 7 — grunts+cover
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],  // row 8
    [1,1,1,4,1,1,1,1,1,4,1,1,1,1,1],  // row 9 — wall crossing
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],  // row 10
    [1,0,6,0,3,0,0,0,3,0,6,0,0,0,1],  // row 11 — heavies
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],  // row 12
    [1,0,0,3,0,0,0,0,0,0,3,0,0,0,1],  // row 13
    [1,1,4,1,1,1,1,1,1,1,1,4,1,1,1],  // row 14 — wall
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],  // row 15
    [1,0,6,0,0,6,0,0,0,6,0,0,6,0,1],  // row 16 — more enemies
    [1,0,0,3,0,0,0,3,0,0,0,3,0,0,1],  // row 17
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],  // row 18
    [1,1,1,1,1,1,1,1,1,1,1,1,1,2,1],  // row 19 — exit col 13
  ],
  spawns: {
    player: { tx: 1, ty: 1 },
    enemies: [
      { type: 'grunt', tx: 4, ty: 4 },
      { type: 'grunt', tx: 8, ty: 4 },
      { type: 'grunt', tx: 4, ty: 7 },
      { type: 'grunt', tx: 8, ty: 7 },
      { type: 'grunt', tx: 2, ty: 11, patrol: [{tx:2,ty:11},{tx:5,ty:11}] },
      { type: 'grunt', tx: 10, ty: 11, patrol: [{tx:10,ty:11},{tx:12,ty:11}] },
      { type: 'heavy', tx: 2, ty: 16 },
      { type: 'heavy', tx: 12, ty: 16 },
    ],
    pickups: [
      { type: 'medkit_small', tx: 12, ty: 2 },
      { type: 'ammo',         tx: 6, ty: 10 },
      { type: 'credits',      tx: 6, ty: 6 },
    ],
  },
  exit: { tx: 13, ty: 19 },
};
