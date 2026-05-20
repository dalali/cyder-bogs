# DECISIONS.md — cyder-bogs

Architectural and design choices made during implementation that were not fully specified in the PRD/ARCHITECTURE/DESIGN docs.

## Boss AI: Direct Projectile Spawning

The boss bypasses `tryFireEnemy` and directly calls `CB.Weapons._spawnEnemyProjectile` for its rocket and machine-gun burst modes. This avoids the single-cooldown limitation of `tryFireEnemy` and allows independent timing for each mode (2s between rockets; 0.12s between MG burst shots with 1.5s inter-burst pause).

## Enemy Patrol → IDLE Initialization

Enemies with patrol waypoints start in `PATROL` state (not `IDLE`) to begin patrolling immediately without waiting for an IDLE→PATROL transition. This matches visual intent without adding extra state logic.

## Shop: OWNED Badge for Ammo When Full

In the ammo tab, a weapon's ammo purchase shows `OWNED` when the weapon is already at max ammo. This is the most intuitive indicator to the player (nothing to buy = already full).

## Credits Tracking

Enemy kill credits are accumulated in `world.creditsToAdd` during each update tick and drained once per tick into `player.credits`. This avoids adding credits directly from deep inside enemy/projectile update code. Mission reward credits are applied in `MissionCompleteScreen.enter`.

## alertCueRemaining Lives on ai, Not Entity Root

The alert icon timer (`alertCueRemaining`) lives on `enemy.ai` rather than the entity root. Rendering checks `enemy.ai.alertCueRemaining > 0`. This keeps all AI state together.

## No Pause Screen Object

Pause is handled entirely inside `PlayScreen` with a flag (`_paused`) and an overlay rendered in `PlayScreen.render`. No separate `PauseScreen` object is needed since no state machine transitions occur — the game is frozen in place.

## KILL_TARGET (Mission 5): Only Boss Must Die

The `REACH_EXIT` objective becomes active as soon as the boss is dead. Other enemies (grunts, heavies, berserkers in mission 5) do not need to be eliminated. This matches the PRD which specifies `KILL_TARGET` not `KILL_ALL` for mission 5.

---

## Gameplay Improvements (2026-05-20)

### WASD Aim vs Mouse Aim Threshold
Mouse aim is considered "active" if mouse was moved within the last 1.5 seconds. If no mouse movement occurs, WASD movement direction sets player aim. This threshold was chosen to be long enough that casual mouse nudges don't immediately override WASD feel, but short enough that switching back to mouse is responsive.

### Auto-Aim Snap Strength
Auto-aim applies 40% blend toward the nearest enemy per frame (not a hard snap). This is subtle enough not to override player intent but noticeable when an enemy is nearly in the crosshair. Range 120px and ±25° cone are tight enough to feel like a natural assist, not a cheat.

### Player Velocity Parameters
Acceleration: 900 px/s², top speed: 160px/s, friction: `pow(0.01, dt)`. The friction constant gives a ~10ms time constant (very fast stop). This was tuned to feel snappy like the original while avoiding floaty movement. The top speed (160px/s) is slightly faster than the original `CB.PLAYER_SPEED = 120` to compensate for the momentum startup time.

### Investigate State Transition Condition
INVESTIGATE only triggers when `d > ai.breakRange && !ai.losClear` (same condition as the previous PATROL/IDLE fallback). If the player is far but visible, CHASE continues. This avoids the enemy prematurely giving up when the player ducks behind cover briefly.

### Enemy Accuracy on Difficulty
Enemies without an explicit `weaponSpread` in their def receive a 3-degree base jitter scaled by difficulty, rather than inheriting the large heavy/grunt spread. This keeps sniper and grunt shots distinct while still applying difficulty scaling.

### Combo Timer Uses `comboTimer` Decay in Update
The combo timer (`world.comboTimer`) decays in `playScreen.update` step 5b, separate from the particle loop. This is cleaner than running it inside `onKill`. The combo resets to 0 when the timer expires.

### Screen Shake Decay
Changed from `screenShake -= dt * 10` (linear, same duration regardless of magnitude) to `screenShake *= pow(0.82, dt * 60)` (exponential decay). With this formula, a rocket shake of 6 persists ~6 frames before dropping below 3, whereas the old code would clear in the same 0.6s for any shake value.

### Difficulty Persists as Global
`CB.currentDifficulty` is a global string on the `CB` namespace (not per-save). This means starting a new game always uses the currently selected difficulty. The save system does not serialize difficulty since it is a per-session preference like volume.
