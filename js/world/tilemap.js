window.CB = window.CB || {};

CB.TileMap = {
  create(mapData) {
    const width  = mapData.width;
    const height = mapData.height;
    const tiles  = new Uint8Array(width * height);

    // Flatten 2D array
    for (let ty = 0; ty < height; ty++) {
      for (let tx = 0; tx < width; tx++) {
        tiles[ty * width + tx] = mapData.tiles[ty][tx];
      }
    }

    return {
      width,
      height,
      tiles,
      spawns: mapData.spawns,
      exit: mapData.exit,

      tileAt(tx, ty) {
        if (tx < 0 || ty < 0 || tx >= width || ty >= height) return CB.TILE.WALL;
        return tiles[ty * width + tx];
      },

      isSolid(tx, ty) {
        const id = this.tileAt(tx, ty);
        return CB.TILE_SOLID[id] !== false;
      },

      isSolidAtWorld(wx, wy) {
        const tx = Math.floor(wx / CB.TILE_SIZE);
        const ty = Math.floor(wy / CB.TILE_SIZE);
        return this.isSolid(tx, ty);
      },

      tileToWorld(tx, ty) {
        return {
          x: tx * CB.TILE_SIZE + CB.TILE_SIZE / 2,
          y: ty * CB.TILE_SIZE + CB.TILE_SIZE / 2,
        };
      },

      worldToTile(wx, wy) {
        return {
          tx: Math.floor(wx / CB.TILE_SIZE),
          ty: Math.floor(wy / CB.TILE_SIZE),
        };
      },

      // Returns world pixel dimensions
      pixelWidth()  { return width  * CB.TILE_SIZE; },
      pixelHeight() { return height * CB.TILE_SIZE; },
    };
  },
};
