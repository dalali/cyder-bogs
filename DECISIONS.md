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
