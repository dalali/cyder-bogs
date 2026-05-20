window.CB = window.CB || {};

CB.Objectives = {
  // Initialize objective state for a mission
  init(mission) {
    const state = {
      defs: mission.objectives,   // array of 'KILL_ALL' | 'KILL_TARGET' | 'REACH_EXIT'
      completed: {},              // { KILL_ALL: false, REACH_EXIT: false, ... }
      allDone: false,
    };
    for (const obj of mission.objectives) {
      state.completed[obj] = false;
    }
    return state;
  },

  // Update objective progress each tick
  update(objState, world) {
    const defs = objState.defs;
    let allDone = true;

    for (const obj of defs) {
      if (objState.completed[obj]) continue;

      switch (obj) {
        case 'KILL_ALL':
          if (world.enemies.filter(e => !e.dead).length === 0) {
            objState.completed['KILL_ALL'] = true;
          }
          break;

        case 'KILL_TARGET':
          // Boss is dead (and was ever spawned)
          if (world._bossSpawned &&
              world.enemies.filter(e => !e.dead && e.subtype === 'boss').length === 0) {
            objState.completed['KILL_TARGET'] = true;
          }
          break;

        case 'REACH_EXIT':
          // Only activates once all non-exit objectives are done
          if (!CB.Objectives._otherObjectivesDone(objState, 'REACH_EXIT')) break;
          // Check player overlap with exit tile
          if (world.player && !world.player.dying) {
            const exitTile = world.tilemap.exit;
            if (exitTile) {
              const exitX = exitTile.tx * CB.TILE_SIZE + CB.TILE_SIZE / 2;
              const exitY = exitTile.ty * CB.TILE_SIZE + CB.TILE_SIZE / 2;
              const d = CB.Utils.dist(world.player, { x: exitX, y: exitY });
              if (d < CB.TILE_SIZE) {
                objState.completed['REACH_EXIT'] = true;
              }
            }
          }
          break;
      }
    }

    // allDone = every objective is complete
    allDone = defs.every(obj => objState.completed[obj]);
    objState.allDone = allDone;
    return allDone;
  },

  _otherObjectivesDone(objState, skip) {
    for (const obj of objState.defs) {
      if (obj === skip) continue;
      if (!objState.completed[obj]) return false;
    }
    return true;
  },

  // Is the exit tile currently active (i.e. can player use it)?
  exitActive(objState) {
    return CB.Objectives._otherObjectivesDone(objState, 'REACH_EXIT');
  },

  // Kill count helper for HUD
  getKillCount(world) {
    const total = world.enemies.length;
    const killed = world.enemies.filter(e => e.dead).length;
    return { killed, total };
  },
};
