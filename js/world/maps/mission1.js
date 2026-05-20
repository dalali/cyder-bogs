// Mission 1: Night Breach — 10x15 tiles (small linear facility)
// Tile IDs: 0=Floor, 1=Wall, 2=Exit, 3=Cover/Crate, 4=Door, 5=PlayerSpawn, 6=EnemySpawn
window.CB = window.CB || {};
window.CB.MAPS = window.CB.MAPS || {};

window.CB.MAPS[1] = {
  id: 1,
  width: 10,
  height: 15,
  tiles: [
    [1,1,1,1,1,1,1,1,1,1],  // row 0
    [1,5,0,0,0,0,0,0,0,1],  // row 1 — player spawn col 1
    [1,0,0,3,0,0,0,0,0,1],  // row 2
    [1,0,0,0,0,6,0,0,0,1],  // row 3 — grunt
    [1,0,3,0,0,0,0,3,0,1],  // row 4
    [1,0,0,0,0,0,0,0,0,1],  // row 5
    [1,1,1,4,1,1,4,1,1,1],  // row 6 — door corridor
    [1,0,0,0,0,0,0,0,0,1],  // row 7
    [1,0,6,0,0,0,0,6,0,1],  // row 8 — 2 grunts
    [1,0,0,3,0,0,3,0,0,1],  // row 9
    [1,0,0,0,0,0,0,0,0,1],  // row 10
    [1,1,1,4,1,1,4,1,1,1],  // row 11 — door
    [1,0,6,0,0,0,0,6,0,1],  // row 12 — 2 grunts
    [1,0,0,0,3,0,0,0,0,1],  // row 13
    [1,1,1,1,1,1,1,2,1,1],  // row 14 — exit col 7
  ],
  spawns: {
    player: { tx: 1, ty: 1 },
    enemies: [
      { type: 'grunt', tx: 5, ty: 3 },
      { type: 'grunt', tx: 2, ty: 8 },
      { type: 'grunt', tx: 7, ty: 8 },
      { type: 'grunt', tx: 2, ty: 12, patrol: [{tx:2,ty:12},{tx:7,ty:12}] },
      { type: 'grunt', tx: 7, ty: 12, patrol: [{tx:7,ty:12},{tx:2,ty:12}] },
      { type: 'grunt', tx: 4, ty: 10 },
    ],
    pickups: [
      { type: 'medkit_small', tx: 4, ty: 5 },
      { type: 'ammo',         tx: 7, ty: 2 },
    ],
  },
  exit: { tx: 7, ty: 14 },
};
