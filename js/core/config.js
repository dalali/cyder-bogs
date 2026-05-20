window.CB = window.CB || {};

// Weapon definitions — mirrors PRD section 4
CB.WEAPON_DEFS = {
  pistol: {
    name: 'PISTOL', dmg: 15, fireRate: 3, range: 400, projSpeed: 450,
    ammoMax: 30, ammoStart: 30, cost: 0, sellable: false,
    spread: 0, pellets: 1, pierce: 0, splashRadius: 0, splashDmg: 0,
    projectileKind: CB.PK.BULLET_YELLOW,
    fireBehavior: 'single',
    projW: 4, projH: 4,
    shake: 0,
    ammoPerPurchase: 30, ammoCost: 50,
  },
  machinegun: {
    name: 'MACHINE GUN', dmg: 10, fireRate: 10, range: 350, projSpeed: 500,
    ammoMax: 100, ammoStart: 100, cost: 800, sellable: true,
    spread: 4 * Math.PI / 180, pellets: 1, pierce: 0, splashRadius: 0, splashDmg: 0,
    projectileKind: CB.PK.BULLET_MG,
    fireBehavior: 'single',
    projW: 3, projH: 3,
    shake: 0,
    ammoPerPurchase: 100, ammoCost: 120,
  },
  shotgun: {
    name: 'SHOTGUN', dmg: 20, fireRate: 1.2, range: 200, projSpeed: 350,
    ammoMax: 20, ammoStart: 20, cost: 600, sellable: true,
    spread: 15 * Math.PI / 180, pellets: 5, pierce: 0, splashRadius: 0, splashDmg: 0,
    projectileKind: CB.PK.BULLET_ORANGE,
    fireBehavior: 'spread',
    projW: 4, projH: 4,
    shake: 1,
    ammoPerPurchase: 20, ammoCost: 80,
  },
  flamer: {
    name: 'FLAMETHROWER', dmg: 8, fireRate: 8, range: 120, projSpeed: 200,
    ammoMax: 60, ammoStart: 60, cost: 1200, sellable: true,
    spread: 8 * Math.PI / 180, pellets: 1, pierce: 0, splashRadius: 0, splashDmg: 0,
    projectileKind: CB.PK.FLAME,
    fireBehavior: 'continuous',
    projW: 6, projH: 6,
    shake: 0,
    ammoPerPurchase: 60, ammoCost: 150,
  },
  rocket: {
    name: 'ROCKET LAUNCHER', dmg: 80, fireRate: 0.7, range: 600, projSpeed: 280,
    ammoMax: 6, ammoStart: 6, cost: 1500, sellable: true,
    spread: 0, pellets: 1, pierce: 0, splashRadius: 48, splashDmg: 40,
    projectileKind: CB.PK.ROCKET_PROJ,
    fireBehavior: 'single',
    projW: 6, projH: 10,
    shake: 6,
    ammoPerPurchase: 6, ammoCost: 200,
  },
  sniper: {
    name: 'SNIPER RIFLE', dmg: 60, fireRate: 0.5, range: 800, projSpeed: 900,
    ammoMax: 10, ammoStart: 10, cost: 1100, sellable: true,
    spread: 0, pellets: 1, pierce: 3, splashRadius: 0, splashDmg: 0,
    projectileKind: CB.PK.SNIPER_BEAM,
    fireBehavior: 'pierce',
    projW: 2, projH: 16,
    shake: 2,
    ammoPerPurchase: 10, ammoCost: 180,
  },
  grenade: {
    name: 'GRENADE LAUNCHER', dmg: 70, fireRate: 0.8, range: 500, projSpeed: 240,
    ammoMax: 8, ammoStart: 8, cost: 1300, sellable: true,
    spread: 0, pellets: 1, pierce: 0, splashRadius: 64, splashDmg: 35,
    projectileKind: CB.PK.GRENADE_PROJ,
    fireBehavior: 'single',
    projW: 8, projH: 8,
    shake: 5,
    ammoPerPurchase: 8, ammoCost: 190,
  },
  laser: {
    name: 'LASER', dmg: 25, fireRate: 6, range: 500, projSpeed: 600,
    ammoMax: 80, ammoStart: 80, cost: 950, sellable: true,
    spread: 0, pellets: 1, pierce: 0, splashRadius: 0, splashDmg: 0,
    projectileKind: CB.PK.LASER_BEAM,
    fireBehavior: 'single',
    projW: 2, projH: 24,
    shake: 0,
    ammoPerPurchase: 80, ammoCost: 140,
  },
};

// Enemy type definitions — mirrors PRD section 5
CB.ENEMY_DEFS = {
  grunt: {
    name: 'GRUNT', hp: 40, moveSpeed: 60,
    weapon: 'enemy_pistol', weaponDmg: 10, weaponRate: 1.5,
    detectionRange: 200, attackRange: 250, breakRange: 300,
    credits: 30, dropAmmoChance: 0.20, dropMedkitChance: 0, dropCreditChance: 0,
    w: 20, h: 20,
  },
  heavy: {
    name: 'HEAVY', hp: 100, moveSpeed: 40,
    weapon: 'enemy_mg', weaponDmg: 8, weaponRate: 6, weaponSpread: 6 * Math.PI / 180,
    detectionRange: 180, attackRange: 220, breakRange: 270,
    credits: 80, dropAmmoChance: 0.30, dropMedkitChance: 0.10, dropCreditChance: 0,
    w: 20, h: 20,
  },
  sniper: {
    name: 'SNIPER', hp: 30, moveSpeed: 50,
    weapon: 'enemy_sniper', weaponDmg: 45, weaponRate: 0.4,
    detectionRange: 400, attackRange: 450, breakRange: 600,
    credits: 60, dropAmmoChance: 0, dropMedkitChance: 0, dropCreditChance: 0.15,
    w: 20, h: 20,
  },
  berserker: {
    name: 'BERSERKER', hp: 70, moveSpeed: 110,
    weapon: 'melee', weaponDmg: 25, weaponRate: 1,
    detectionRange: 150, attackRange: 36, breakRange: 225,
    credits: 50, dropAmmoChance: 0, dropMedkitChance: 0.25, dropCreditChance: 0,
    w: 20, h: 20,
  },
  boss: {
    name: 'BOSS', hp: 500, moveSpeed: 70,
    weapon: 'boss_combo', weaponDmg: 60, weaponRate: 0.5,
    detectionRange: 99999, attackRange: 400, breakRange: 99999,
    credits: 500, dropAmmoChance: 0, dropMedkitChance: 1.0, dropCreditChance: 0,
    w: 24, h: 24,
    isBoss: true,
  },
};

// Mission metadata
CB.MISSION_DEFS = [
  {
    id: 1, missionIndex: 0,
    title: 'NIGHT BREACH',
    briefing: 'A remote facility has gone dark. Enemy forces have taken control. Eliminate all hostiles and reach the extraction point. Expect light resistance.',
    objectives: ['KILL_ALL', 'REACH_EXIT'],
    creditReward: 200,
    mapId: 1,
  },
  {
    id: 2, missionIndex: 1,
    title: 'SECTOR 7',
    briefing: 'Enemy forces have fortified a mid-sector processing plant. Eliminate all hostiles and extract through the east gate. Intel suggests armored units are present.',
    objectives: ['KILL_ALL', 'REACH_EXIT'],
    creditReward: 350,
    mapId: 2,
  },
  {
    id: 3, missionIndex: 2,
    title: 'THE VAULT',
    briefing: 'Intelligence has located a weapons cache in a fortified vault complex. Eliminate all guards and extract. Snipers reported in the outer corridors.',
    objectives: ['KILL_ALL', 'REACH_EXIT'],
    creditReward: 500,
    mapId: 3,
  },
  {
    id: 4, missionIndex: 3,
    title: 'EXTRACTION',
    briefing: 'A critical asset must be recovered from an enemy compound. The facility has both open grounds and interior sections. Berserker units confirmed inside.',
    objectives: ['KILL_ALL', 'REACH_EXIT'],
    creditReward: 700,
    mapId: 4,
  },
  {
    id: 5, missionIndex: 4,
    title: 'ENDGAME',
    briefing: 'The enemy commander is barricaded in a reinforced arena. Eliminate the target and all support units. There is no retreat. Good luck, soldier.',
    objectives: ['KILL_TARGET', 'REACH_EXIT'],
    creditReward: 1000,
    mapId: 5,
  },
];

// Armor definitions for shop
CB.ARMOR_DEFS = [
  { name: 'LIGHT ARMOR', cost: 400, armorValue: 25 },
  { name: 'HEAVY ARMOR', cost: 900, armorValue: 50 },
];

// Difficulty settings
CB.DIFFICULTY = {
  EASY:   { enemyDamageMult: 0.5,  enemyAccuracy: 0.7, detectionMult: 0.8, label: 'EASY' },
  NORMAL: { enemyDamageMult: 1.0,  enemyAccuracy: 1.0, detectionMult: 1.0, label: 'NORMAL' },
  HARD:   { enemyDamageMult: 1.5,  enemyAccuracy: 1.2, detectionMult: 1.3, label: 'HARD' },
};
CB.currentDifficulty = 'NORMAL';
