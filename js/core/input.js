window.CB = window.CB || {};

CB.Input = {
  keys: {},
  keysPressed: {},
  _keysHeld: {},

  mouse: {
    x: 0, y: 0,
    worldX: 0, worldY: 0,
    left: false, right: false,
    leftPressed: false, rightPressed: false,
    wheel: 0,
  },

  BIND: {
    moveUp:    ['w', 'W', 'ArrowUp'],
    moveDown:  ['s', 'S', 'ArrowDown'],
    moveLeft:  ['a', 'A', 'ArrowLeft'],
    moveRight: ['d', 'D', 'ArrowRight'],
    fire:      [' '],
    weapon1:   ['1'],
    weapon2:   ['2'],
    weapon3:   ['3'],
    pause:     ['Escape'],
    debug:     ['`'],
  },

  init(canvas) {
    window.addEventListener('keydown', (e) => {
      const k = e.key;
      if (!CB.Input._keysHeld[k]) {
        CB.Input.keysPressed[k] = true;
      }
      CB.Input._keysHeld[k] = true;
      CB.Input.keys[k] = true;
      // Prevent default for game keys
      const gameKeys = [' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
      if (gameKeys.includes(k)) e.preventDefault();
    });

    window.addEventListener('keyup', (e) => {
      const k = e.key;
      CB.Input._keysHeld[k] = false;
      CB.Input.keys[k] = false;
    });

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      CB.Input.mouse.x = (e.clientX - rect.left) * (canvas.width / rect.width);
      CB.Input.mouse.y = (e.clientY - rect.top) * (canvas.height / rect.height);
    });

    canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        CB.Input.mouse.left = true;
        CB.Input.mouse.leftPressed = true;
      }
      if (e.button === 2) {
        CB.Input.mouse.right = true;
        CB.Input.mouse.rightPressed = true;
      }
    });

    canvas.addEventListener('mouseup', (e) => {
      if (e.button === 0) CB.Input.mouse.left = false;
      if (e.button === 2) CB.Input.mouse.right = false;
    });

    canvas.addEventListener('wheel', (e) => {
      CB.Input.mouse.wheel += e.deltaY > 0 ? 1 : -1;
      e.preventDefault();
    }, { passive: false });

    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  },

  isDown(action) {
    const binds = CB.Input.BIND[action];
    if (!binds) return false;
    for (const k of binds) {
      if (CB.Input.keys[k]) return true;
    }
    return false;
  },

  wasPressed(action) {
    const binds = CB.Input.BIND[action];
    if (!binds) return false;
    for (const k of binds) {
      if (CB.Input.keysPressed[k]) return true;
    }
    return false;
  },

  // Call once per frame at end of update to clear edge-triggered flags
  poll(camera) {
    CB.Input.keysPressed = {};
    CB.Input.mouse.leftPressed = false;
    CB.Input.mouse.rightPressed = false;
    CB.Input.mouse.wheel = 0;
    if (camera) {
      CB.Input.mouse.worldX = CB.Input.mouse.x + camera.x;
      CB.Input.mouse.worldY = CB.Input.mouse.y + camera.y;
    }
  },
};
