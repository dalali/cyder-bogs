window.CB = window.CB || {};

CB.COLORS = {
  // Primary
  BG:           '#0A0A0A',
  FLOOR:        '#1A1A1A',
  WALL:         '#3A3A3A',
  WALL_DARK:    '#252525',
  WALL_LIGHT:   '#4E4E4E',
  COVER:        '#5C3D1E',
  COVER_DARK:   '#3B2510',
  DOOR:         '#2A2A4A',
  EXIT_LOCKED:  '#1A1A1A',
  EXIT_ACTIVE:  '#004422',
  EXIT_GLOW:    '#00FF66',

  // HUD
  HUD_BG:           '#050505',
  HUD_BORDER:       '#2A2A2A',
  HP_BAR:           '#CC2200',
  HP_BG:            '#330800',
  ARMOR_ICON:       '#4488CC',
  CREDIT:           '#FFCC00',
  WEAPON_ACTIVE:    '#00FF66',
  WEAPON_INACTIVE:  '#1E1E1E',
  AMMO_TEXT:        '#AAAAAA',
  AMMO_LOW:         '#FF6600',
  AMMO_EMPTY:       '#FF2222',

  // UI Screens
  UI_BG:          '#0D0D0D',
  UI_PANEL:       '#131313',
  UI_BORDER:      '#333333',
  UI_BORDER_ACCENT: '#00FF66',
  TEXT_PRIMARY:   '#DDDDDD',
  TEXT_DIM:       '#666666',
  TEXT_TITLE:     '#FFFFFF',
  TEXT_LABEL:     '#888888',
  ACCENT_GREEN:   '#00FF66',
  ACCENT_RED:     '#FF3333',
  ACCENT_GOLD:    '#FFCC00',
  ACCENT_BLUE:    '#4488CC',
  BTN_PRIMARY_BG:   '#00CC55',
  BTN_PRIMARY_TEXT: '#000000',
  BTN_DANGER_BG:    '#CC2200',
  BTN_INACTIVE_BG:  '#1A1A1A',
  BTN_INACTIVE_TEXT: '#444444',
};

CB.CANVAS_W = 800;
CB.CANVAS_H = 600;
CB.HUD_H    = 80;
CB.VIEWPORT_H = 520; // CANVAS_H - HUD_H

CB.TILE_SIZE = 32;

CB.TILE = {
  FLOOR: 0,
  WALL:  1,
  EXIT:  2,
  COVER: 3,
  DOOR:  4,
  SPAWN_PLAYER: 5,
  SPAWN_ENEMY:  6,
};

CB.TILE_SOLID = {
  0: false,
  1: true,
  2: false,
  3: true,
  4: false,
  5: false,
  6: false,
};

CB.FIXED_DT = 1 / 60;
CB.MAX_UPDATES_PER_FRAME = 5;
CB.MAX_DT = 1 / 15;

CB.PLAYER_SPEED  = 120;
CB.PLAYER_HP     = 100;
CB.PLAYER_HW     = 10; // half-width of hitbox
CB.PLAYER_HH     = 10; // half-height of hitbox

// Weapon kinds
CB.WK = {
  PISTOL:    'pistol',
  MACHINEGUN:'machinegun',
  SHOTGUN:   'shotgun',
  FLAMER:    'flamer',
  ROCKET:    'rocket',
  SNIPER:    'sniper',
  GRENADE:   'grenade',
  LASER:     'laser',
};

// Projectile render kinds
CB.PK = {
  BULLET_YELLOW:  'bullet_yellow',
  BULLET_ORANGE:  'bullet_orange',
  BULLET_MG:      'bullet_mg',
  FLAME:          'flame',
  ROCKET_PROJ:    'rocket_proj',
  SNIPER_BEAM:    'sniper_beam',
  GRENADE_PROJ:   'grenade_proj',
  LASER_BEAM:     'laser_beam',
};

CB.SAVE_KEY = 'cyder-bogs:save:v1';
CB.SAVE_VERSION = 1;
