# Product Requirements Document: cyder-bogs MVP

**Version:** 1.0  
**Date:** 2026-05-20  
**Author:** Systems Analyst  
**Status:** Draft

---

## 1. Overview & Goals

### What We Are Building

cyder-bogs is a browser-based single-player clone of Cyberdogs (1994, Jonric Software). It is a top-down 2D shooter where the player controls a cybernetically enhanced mercenary dog, completes a linear sequence of missions, earns credits, and upgrades their loadout between missions in a shop.

The game runs entirely in the browser from a static `index.html` — no server, no backend, no installation required.

### Why We Are Building It

To deliver a faithful, completable, and replayable recreation of the Cyberdogs experience that works on any modern device with a browser. The focus is on fast-to-start, fun-to-master gameplay with enough mechanical depth (weapon variety, enemy behavior, loadout choice) to sustain multiple playthroughs.

### Goals

1. A player can open `index.html` and start playing within 10 seconds, with no installation or login.
2. The game is completable — there is a final mission, a win screen, and the player can start over.
3. The game is fun — enemy AI is reactive, weapons feel distinct, and difficulty ramps meaningfully across missions.
4. The codebase is clean enough that a solo developer can add a new weapon or mission in under two hours.

### Non-Goals (MVP)

- Multiplayer of any kind.
- Procedurally generated levels — all maps are hand-authored.
- Mobile touch controls (keyboard + mouse only in MVP).
- Leaderboards, save-to-server, or cloud sync.
- Cutscenes, voiced dialogue, or story text beyond brief mission briefings.
- A level editor.
- Sound effects or music (audio is a stretch goal, not MVP).
- The full Cyberdogs weapon roster — MVP ships a curated subset.

---

## 2. Player Experience

### Session Flow

```
Title Screen
    → [New Game]
        → Mission Briefing (text overlay)
            → Gameplay (top-down mission)
                → Mission Complete (credits awarded)
                    → Shop (buy/sell gear)
                        → Next Mission Briefing → ...
                → Mission Failed (player died)
                    → Retry Mission (no credit penalty) | Return to Title
    → [Continue] (loads from localStorage, if present)
    → [Credits]
```

### Core Loop

1. Read the mission briefing (5–10 seconds of reading).
2. Play the mission: navigate the map, kill enemies, complete objectives, reach the exit.
3. See the post-mission summary: credits earned, kills, time.
4. Open the shop: spend credits on better weapons or restocking ammo.
5. Advance to the next mission with a harder map and tougher enemies.
6. After completing Mission 5 (final), see the win screen with total stats.

### Player Character

- Top-down sprite with a directional indicator (snout faces the mouse cursor).
- Movement: WASD (strafe in all 4 directions, no rotation lock).
- Aiming: mouse cursor determines facing and shot direction.
- Shooting: left mouse button (or Space for keyboard-only fallback).
- One primary weapon equipped at a time; player can carry up to 3 weapons total and switch with 1/2/3 keys.

### Camera

- Camera is centered on the player.
- Map tiles outside the canvas edge are clipped.
- No zoom. Canvas resolution: 800x600 logical pixels, scaled to fill the browser window while preserving aspect ratio.

---

## 3. Game Mechanics

### Movement

| Parameter | Value |
|---|---|
| Player walk speed | 120 px/s |
| Diagonal speed | 120 px/s (normalized, no speed boost) |
| Tile size | 32x32 px |
| Player hitbox | 20x20 px (centered on sprite) |

Movement is tile-collision-based: walls block movement. Enemies block movement if the player walks into them. No smooth sliding around corners (MVP keeps collision simple).

### Coordinate System

- World space: pixels, origin top-left.
- Tile grid: derived from world space (tile = Math.floor(px / 32)).
- The player and all entities operate in world-pixel space; the tile grid is used only for collision lookup and map rendering.

### Shooting

- Shots travel in a straight line from the player's barrel position toward the mouse cursor.
- Shots are rectangular projectiles (visual: colored rectangle or sprite).
- Shots collide with walls (destroyed on contact) and enemies (apply damage, then destroyed unless piercing).
- Friendly fire: player cannot damage themselves with their own shots.
- Shots are not simulated as physics objects — they travel at a fixed pixel-per-second speed until they hit something or exceed max range.

### Health & Armor

| Stat | Default | Max (with upgrades) |
|---|---|---|
| Player max HP | 100 | 100 (no HP upgrades in MVP) |
| Armor | 0 | 50 |

Armor absorbs 50% of incoming damage (rounded down). When armor > 0, damage dealt = floor(raw_damage / 2); armor itself does not deplete — it is a flat multiplier, not a pool, in MVP.

### Death & Retry

- Player HP reaches 0 → death animation (sprite flashes red for 1 second).
- Mission Failed screen appears with options: Retry (restart same mission, same loadout, no credit change) or Main Menu.
- There is no permadeath in MVP. Credits are preserved on retry.

### Collision Detection

- Wall collision: axis-separated AABB. Try X movement first, then Y. This allows sliding along walls.
- Entity collision (enemy vs player): simple AABB overlap. Player is pushed back; no damage from contact — damage only comes from enemy projectiles.
- Projectile vs wall: AABB overlap with tile grid.
- Projectile vs enemy: AABB overlap per enemy.

### Pickups

Items dropped by enemies or placed in maps are picked up automatically on player overlap:

| Pickup | Effect |
|---|---|
| Ammo box | +20 rounds for a random weapon the player carries; if none match, dropped rounds type, ignored |
| Medkit (small) | +25 HP (capped at max) |
| Medkit (large) | +50 HP (capped at max) |
| Credits | +50 credits (fixed drop value for MVP) |

---

## 4. Weapon System

### Weapon Slot Rules

- Player carries up to 3 weapons simultaneously.
- Player starts Mission 1 with: Pistol (primary), no secondary, no tertiary.
- Weapons are switched with keys 1, 2, 3 or mouse wheel.
- Weapons cannot be dropped mid-mission — loadout changes happen in the shop only.
- Ammo is shared per weapon type: each weapon has its own ammo count.

### Weapon Stats Reference

All damage values are per-hit. Fire rate is shots per second. Range is maximum travel distance in pixels. Projectile speed is pixels/second.

| Weapon | Dmg/hit | Fire Rate (shots/s) | Range (px) | Proj Speed (px/s) | Ammo Cap | Starting Ammo | Cost (shop) | Notes |
|---|---|---|---|---|---|---|---|---|
| Pistol | 15 | 3 | 400 | 450 | 30 | 30 | 0 (starting weapon, free) | Hitscan-feel but uses projectile model |
| Machine Gun | 10 | 10 | 350 | 500 | 100 | 100 | 800 | Spread: ±4° random per shot |
| Shotgun | 20 per pellet, 5 pellets | 1.2 | 200 | 350 | 20 | 20 | 600 | 5 pellets, cone spread ±15°; each pellet independent |
| Flamethrower | 8 per tick | 8 ticks/s | 120 | 200 | 60 (fuel units) | 60 | 1200 | Short range; continuous while held; 1 fuel/tick |
| Rocket Launcher | 80 (direct), 40 (splash r=48px) | 0.7 | 600 | 280 | 6 | 6 | 1500 | Splash damages all enemies in radius; rockets are slow and visible |
| Sniper Rifle | 60 | 0.5 | 800 | 900 | 10 | 10 | 1100 | Pierces through enemies (up to 3 hits per shot); no spread |
| Grenade Launcher | 70 (direct), 35 (splash r=64px) | 0.8 | 500 | 240 | 8 | 8 | 1300 | Arc rendered as straight for MVP; splash on wall or enemy contact |
| Laser | 25 | 6 | 500 | 600 | 80 | 80 | 950 | No spread; instant visual feedback (instant travel per frame) |

### Ammo Economy

- Ammo is purchased in the shop per weapon type (see Shop section).
- Enemies do not drop weapon-specific ammo in MVP — only generic ammo boxes (which refill the most-depleted weapon).
- Running out of ammo on all weapons leaves the player unable to shoot. This is an intended risk — the shop exists to prevent it.

### Weapon Feel Guidelines (for implementation)

- Each weapon must have a distinct visual projectile color or shape.
- Screen should flash or shake slightly (1–2 px offset for 2 frames) on Rocket Launcher and Grenade Launcher fire.
- Flamethrower projectiles are short-lived particle-like sprites, not single bullets.

---

## 5. Enemy System

### Enemy Types

#### Grunt (Basic Guard)

| Stat | Value |
|---|---|
| HP | 40 |
| Move speed | 60 px/s |
| Weapon | Pistol (10 dmg/shot, 1.5 shots/s) |
| Detection range | 200 px |
| Attack range | 250 px |
| Credits dropped | 30 |
| Pickup drop chance | 20% ammo box |

#### Heavy (Armored Soldier)

| Stat | Value |
|---|---|
| HP | 100 |
| Move speed | 40 px/s |
| Weapon | Machine Gun (8 dmg/shot, 6 shots/s, spread ±6°) |
| Detection range | 180 px |
| Attack range | 220 px |
| Credits dropped | 80 |
| Pickup drop chance | 30% ammo box, 10% small medkit |

#### Sniper

| Stat | Value |
|---|---|
| HP | 30 |
| Move speed | 50 px/s |
| Weapon | Sniper (45 dmg/shot, 0.4 shots/s) |
| Detection range | 400 px |
| Attack range | 450 px |
| Credits dropped | 60 |
| Pickup drop chance | 15% credits pickup |

#### Berserker (Melee Charger)

| Stat | Value |
|---|---|
| HP | 70 |
| Move speed | 110 px/s (charge speed when alerted) |
| Weapon | Melee — deals 25 dmg on player contact (1 hit/s cooldown) |
| Detection range | 150 px |
| Attack range | 32 px (contact) |
| Credits dropped | 50 |
| Pickup drop chance | 25% small medkit |

#### Boss (Mission 5 only — Final Boss)

| Stat | Value |
|---|---|
| HP | 500 |
| Move speed | 70 px/s |
| Weapon | Alternates: Rocket Launcher (60 dmg, 0.5/s) and Machine Gun (12 dmg, 8/s, burst of 5) |
| Detection range | Entire map (always alerted) |
| Attack range | 400 px |
| Credits dropped | 500 |
| Pickup drop chance | 100% large medkit on death |

### Enemy AI States

Each enemy runs a finite state machine with four states:

```
IDLE → (player enters detection range) → ALERT
ALERT → (line-of-sight confirmed) → CHASE
ALERT → (player exits range, no LOS) → IDLE (after 4 seconds)
CHASE → (within attack range) → ATTACK
ATTACK → (player exits attack range) → CHASE
CHASE → (player exits detection range * 1.5 AND no LOS) → PATROL (if waypoints exist) or IDLE
```

#### State Behaviors

**IDLE:** Enemy stands still. Facing direction is fixed (set at spawn). No scanning or rotation.

**ALERT:** Enemy plays a brief visual cue (exclamation mark sprite above head for 0.6 seconds). Faces toward last known player position. Transitions to CHASE after the alert cue.

**CHASE:** Enemy moves toward the player's current position using direct pathfinding (straight line, wall-avoiding). Wall avoidance uses a simple steering behavior: if blocked, try turning 45° left or right each frame for up to 3 frames before giving up and moving as close as possible.

**ATTACK:** Enemy stops moving. Fires at player using its weapon stats. Continues attacking as long as the player is within attack range. Breaks back to CHASE if player moves out of range.

**PATROL (optional, for Grunt and Heavy only):** Enemy moves between up to 4 waypoints defined in the map data. Cycles in a loop. Transitions to ALERT if player enters detection range.

### Line of Sight

LOS check: cast a ray from enemy center to player center. If the ray intersects any solid tile, LOS is blocked. LOS is checked once per enemy per 200ms (not every frame) to keep performance manageable.

### Enemy Difficulty Scaling by Mission

| Mission | Enemy Count | Enemy Types |
|---|---|---|
| 1 | 6 Grunts | Grunt only |
| 2 | 8 enemies | 6 Grunts, 2 Heavies |
| 3 | 10 enemies | 5 Grunts, 3 Heavies, 2 Snipers |
| 4 | 12 enemies | 4 Grunts, 4 Heavies, 2 Snipers, 2 Berserkers |
| 5 | 8 enemies + Boss | 4 Grunts, 2 Heavies, 2 Berserkers, 1 Boss |

---

## 6. Mission System

### Mission Structure

Each mission is defined as a JSON data file (or inline JS object) containing:

```
{
  id: number,
  title: string,
  briefing: string (max 200 chars),
  mapFile: string (path to map data),
  objectives: Objective[],
  creditReward: number (flat bonus on completion),
  timeLimit: null | number (seconds; null = no limit in MVP)
}
```

### Objective Types

MVP supports three objective types:

| Type | Description | Completion Condition |
|---|---|---|
| `KILL_ALL` | Eliminate all enemies on the map | Enemy count == 0 |
| `KILL_TARGET` | Kill a specific named enemy (Boss) | Named enemy dead |
| `REACH_EXIT` | Reach the designated exit tile | Player overlaps exit tile |

Each mission has 1–2 objectives. All objectives must be completed before the exit is active (exit tile is locked/highlighted differently until objectives are met). The single exception: Mission 5 has KILL_TARGET (Boss) which simultaneously activates the exit.

### Mission Progression

| Mission | Title | Objectives | Credit Reward | Map Description |
|---|---|---|---|---|
| 1 | "Night Breach" | KILL_ALL, REACH_EXIT | 200 | Small linear facility, 10x15 tiles, low cover |
| 2 | "Sector 7" | KILL_ALL, REACH_EXIT | 350 | Medium grid layout, 15x20 tiles, rooms with doors |
| 3 | "The Vault" | KILL_ALL, REACH_EXIT | 500 | L-shaped corridors, 20x20 tiles, more cover objects |
| 4 | "Extraction" | KILL_ALL, REACH_EXIT | 700 | Open compound + interior, 25x25 tiles, mix of open and tight |
| 5 | "Endgame" | KILL_TARGET (Boss), REACH_EXIT | 1000 | Large arena with pillars, 30x30 tiles |

### Win Condition

Player completes Mission 5 → Mission Complete screen → Win Screen with final stats:
- Total kills
- Total credits earned
- Total time played
- "Play Again" button (restarts from Mission 1, wipes all state)

### Lose Condition

Player dies → Mission Failed screen → Retry or Main Menu. Retrying resets the mission (enemy positions, player HP, pickup state) but preserves loadout and credits.

### Map Format

Maps are defined as 2D arrays of tile IDs. Each map tile is 32x32 pixels.

Tile types:
| ID | Name | Solid | Rendered |
|---|---|---|---|
| 0 | Floor | No | Yes (dark gray) |
| 1 | Wall | Yes | Yes (concrete texture or solid color) |
| 2 | Exit | No | Yes (green highlight) |
| 3 | Cover Object (crate) | Yes | Yes (brown box) |
| 4 | Door (open, passable) | No | Yes (open frame) |
| 5 | Spawn Point (player) | No | No (invisible, floor) |
| 6 | Enemy Spawn | No | No (invisible, floor) |

Enemy spawn tiles carry a metadata tag (enemy type, optional patrol waypoints as tile indices).

---

## 7. Shop / Loadout System

### When the Shop Appears

The shop appears after every successfully completed mission, before the next mission briefing. It does not appear after a failed mission (retry goes straight back to the mission).

### Credits

- Credits are earned by completing missions (flat reward) and killing enemies (per-kill drops).
- Credits persist across missions and are never lost on death.
- Credits are displayed in the HUD during gameplay and prominently in the shop.

### Shop Inventory

The shop always stocks all available items. Nothing sells out.

#### Weapons

| Item | Cost | Notes |
|---|---|---|
| Machine Gun | 800 | Replaces an existing slot if all 3 are full (player chooses) |
| Shotgun | 600 | |
| Flamethrower | 1200 | |
| Rocket Launcher | 1500 | |
| Sniper Rifle | 1100 | |
| Grenade Launcher | 1300 | |
| Laser | 950 | |

Buying a weapon the player already owns is not allowed (greyed out).

#### Ammo

| Item | Cost | Amount |
|---|---|---|
| Pistol ammo (30 rounds) | 50 | Fills Pistol to max (30) |
| Machine Gun ammo (100 rounds) | 120 | Fills MG to max (100) |
| Shotgun ammo (20 shells) | 80 | Fills Shotgun to max (20) |
| Flamethrower fuel (60 units) | 150 | Fills Flamethrower to max |
| Rocket ammo (6 rockets) | 200 | Fills Rocket Launcher to max |
| Sniper ammo (10 rounds) | 180 | Fills Sniper to max |
| Grenade ammo (8 grenades) | 190 | Fills Grenade Launcher to max |
| Laser ammo (80 cells) | 140 | Fills Laser to max |

Ammo purchases only appear if the player owns the corresponding weapon. Ammo purchase fills weapon to its maximum capacity (no partial refills).

#### Armor

| Item | Cost | Effect |
|---|---|---|
| Light Armor | 400 | Sets armor to 25 (if currently < 25) |
| Heavy Armor | 900 | Sets armor to 50 (if currently < 50) |

Armor cannot be stacked or purchased multiple times if already at max.

#### Consumables (Carried Into Mission)

Not in MVP — consumables are map pickups only, not shop items.

### Sell Back

Weapons can be sold back for 50% of their purchase price (rounded down). The Pistol cannot be sold (starter weapon; player always keeps it). Selling a weapon removes it from the loadout and deletes its ammo.

### Loadout Limits

- Max 3 weapons simultaneously.
- Buying a 4th weapon requires selling one first (shop prompts: "Your slots are full. Sell a weapon to make room?" with a slot selector).
- No limit on armor upgrades (just the max value of 50).

---

## 8. HUD & UI

### In-Mission HUD

The HUD is rendered as a fixed overlay at the bottom of the screen (800x80 px band).

| Element | Position | Description |
|---|---|---|
| HP bar | Bottom-left | Red bar, labeled "HP", shows current/max (e.g., "75/100") |
| Armor value | Below HP bar | Text: "ARMOR: 25" |
| Weapon slots | Bottom-center | 3 slots; active slot highlighted; shows weapon name + ammo (e.g., "SHOTGUN 14/20") |
| Credits | Bottom-right | Text: "CR: 530" |
| Objective tracker | Top-right | Small text list of objectives with checkmarks |
| Mission name | Top-left | Small text: "MISSION 2: SECTOR 7" |
| Kill counter | Top-center | "KILLS: 3/8" (remaining enemies needed for KILL_ALL) |

### Title Screen

- Game title: "CYDER-BOGS"
- Subtitle: "A CYBERDOGS TRIBUTE"
- Buttons: NEW GAME, CONTINUE (greyed out if no save), CREDITS
- Pixel/retro aesthetic: dark background, blocky font, minimal animation

### Mission Briefing Screen

- Mission number and title
- Briefing text (up to 200 characters)
- Objectives listed with icons
- "DEPLOY" button to start mission
- Current loadout displayed (read-only)

### Mission Complete Screen

- "MISSION COMPLETE"
- Credits earned (from kills + mission reward), with subtotals
- Kill count / enemy count
- Time taken
- "ENTER SHOP" button

### Mission Failed Screen

- "MISSION FAILED"
- Cause of death (always "Eliminated" in MVP)
- "RETRY MISSION" button
- "MAIN MENU" button

### Win Screen

- "MISSION ACCOMPLISHED" or "OPERATION COMPLETE"
- Final stats: total kills, total credits, total time
- "PLAY AGAIN" button

### Shop UI

- Top bar: current credit balance
- Left panel: weapon slots (player's current loadout, sell buttons)
- Center panel: items for sale (grid layout, greyed out if owned/can't afford)
- Right panel: item detail on hover/click (name, stats, cost)
- Bottom bar: "DEPLOY" button (advance to next mission briefing)

### Font & Visual Style

- Font: monospace pixel font (e.g., Press Start 2P via Google Fonts, or a bundled bitmap font). No serif or sans-serif system fonts.
- Color palette: dark background (#111), walls (#444), floor (#222), HUD bar (#000 with #222 border), accent green (#00FF66), accent red (#FF3333), text (#EEEEEE).
- Enemy sprites and player sprite: simple 16x16 or 32x32 pixel art (drawn programmatically with canvas shapes in MVP if no artist available — described in implementation notes).

---

## 9. MVP Scope

### In Scope (Must Ship)

- 5 hand-authored missions with distinct maps.
- 8 weapon types with distinct mechanics.
- 4 regular enemy types + 1 boss.
- Enemy AI with 4 states (IDLE, ALERT, CHASE, ATTACK).
- Patrol behavior for Grunt and Heavy.
- Shop between missions (weapons, ammo, armor).
- Credits system (earned, spent, persisted across missions).
- Full session loop: title → missions → shop → win screen.
- Retry on death (no permadeath).
- Save/continue via localStorage (mission index, loadout, credits).
- Keyboard + mouse controls.
- HUD with all elements listed in Section 8.
- Objective system (KILL_ALL + REACH_EXIT + KILL_TARGET).
- Collision detection (walls, enemies, projectiles).
- Pickup system (ammo box, small medkit, large medkit, credits).
- Line-of-sight for enemy detection.
- Canvas-based rendering at 800x600, scaled to browser window.

### Out of Scope (Post-MVP)

- Sound effects and music.
- Mobile / touch controls.
- Multiplayer.
- Procedural map generation.
- More than 5 missions.
- Additional enemy types beyond the 4 + boss.
- Difficulty settings.
- Achievements or leaderboards.
- Weapon mods or upgrades (only buy/sell whole weapons).
- Animated cutscenes.
- Destructible environment.
- Friendly NPCs or escort missions.

### Tech Stack (Constrained)

- Pure HTML/CSS/JavaScript — no build tooling required for MVP.
- Rendering: HTML5 Canvas 2D API.
- No external game engines (no Phaser, no Three.js).
- State management: plain JS objects in memory; localStorage for save data.
- No module bundler required — single `index.html` + vanilla JS files loaded via `<script>` tags.
- Maps stored as JSON files loaded via `fetch()` (or inline as JS constants to avoid CORS issues when opening `index.html` directly from disk).

---

## 10. Success Criteria

The MVP is complete when all of the following are true:

| # | Criterion | How to Verify |
|---|---|---|
| 1 | All 5 missions are playable from start to finish without crashing | Manual playthrough from title to win screen |
| 2 | All 8 weapons fire with correct stats | Per-weapon test: verify damage, fire rate, ammo depletion |
| 3 | All 4 enemy types + boss appear in the correct missions and use correct AI states | Spawn each type, observe state transitions in all 4 states |
| 4 | Shop correctly charges credits, prevents overspending, and persists loadout into next mission | Buy/sell cycle before each mission |
| 5 | Player death triggers Mission Failed screen; retry reloads mission correctly | Die intentionally, verify retry works |
| 6 | Win screen appears after Mission 5 completion | Complete final mission |
| 7 | localStorage save/load works: refresh browser mid-campaign, continue from correct mission | Verify after each mission |
| 8 | HUD displays correct HP, ammo, credits, objectives at all times | Manual spot-check during gameplay |
| 9 | Collision is correct: player cannot walk through walls; projectiles destroy on wall contact | Walk into every wall type; fire at walls |
| 10 | Game runs at ≥30 FPS in Chrome on a mid-range laptop (no profiling required — subjective) | Play-test on target hardware |
| 11 | `index.html` opens in Chrome/Firefox/Safari without a local server (or with `./run.sh start`) | Test both methods |

---

## Appendix A: Open Questions

1. **Sprite art**: Are pixel art sprites being produced by a human artist, or will MVP use programmatically drawn shapes (rectangles + direction indicators)? This affects implementation time significantly. Recommendation: use shapes for MVP, replace with sprites post-MVP.

2. **Map authoring tool**: Will maps be hand-authored as raw JSON arrays, or do we need a minimal tile editor? Recommendation: raw JSON arrays for MVP — a simple spreadsheet can be used to visualize and edit them.

3. **Patrol waypoint format**: Waypoints are described as tile indices in Section 6. Need to decide: array of {x, y} tile coordinates, or a sequence of tile IDs referencing special "waypoint" tiles in the map. Recommendation: array of {x, y} tile coordinates stored in enemy spawn metadata.

4. **Door mechanics**: Tile ID 4 is defined as "door (open)" — are doors interactive (player presses E to open/close)? Recommendation: for MVP, doors are permanently open (just visual), not interactive, to keep collision simple.

5. **Armor semantics**: Current spec says armor is a flat 50% damage reduction, not a depleting pool. This may feel odd (armor never breaks). Consider making armor a depleting pool for realism. Recommendation: keep flat reduction for MVP simplicity; revisit post-MVP.

---

## Appendix B: Assumptions

- No artist is available for MVP, so sprites will be programmatic canvas shapes.
- All 5 missions will be hand-authored by the developer using the tile ID system.
- `localStorage` is sufficient for persistence — no cloud save needed.
- The player always has the Pistol and cannot lose it, ensuring they are never completely unarmed.
- Enemy pathfinding does not need to be full A* for MVP — the simple wall-avoidance steering described in Section 5 is acceptable given small map sizes.
- Screen shake on rocket/grenade fire is a 2-frame, 2px canvas offset only — no physics-based shake.
