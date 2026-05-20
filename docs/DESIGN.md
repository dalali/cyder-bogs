# Design Specification: cyder-bogs

**Version:** 1.0
**Date:** 2026-05-20
**Author:** UI/UX Designer
**Status:** Draft

---

## 1. Visual Style

### Design Philosophy

cyder-bogs is a **modern tribute**, not a pixel-perfect port. The aesthetic channels the gritty, utilitarian feel of 1994 DOS military shooters — dark facilities, harsh lighting, sparse UI — but rendered clearly enough for a modern browser. No anti-aliasing. No gradients. No drop shadows. Every element is made of solid color rectangles, harsh borders, and bitmap text.

The game should feel like it was made by someone who remembers Cyberdogs with love and built it in a weekend. Rough but purposeful.

### Color Palette

#### Primary Colors

| Token | Hex | Usage |
|---|---|---|
| `COLOR_BG` | `#0A0A0A` | Game canvas background, screen base |
| `COLOR_FLOOR` | `#1A1A1A` | Walkable floor tiles |
| `COLOR_WALL` | `#3A3A3A` | Solid wall tiles (face) |
| `COLOR_WALL_DARK` | `#252525` | Wall shadow / alternate tile pass |
| `COLOR_WALL_LIGHT` | `#4E4E4E` | Wall highlight edge (top/left 1px) |
| `COLOR_COVER` | `#5C3D1E` | Crate / cover object face |
| `COLOR_COVER_DARK` | `#3B2510` | Crate shadow edge |
| `COLOR_DOOR` | `#2A2A4A` | Open door frame |
| `COLOR_EXIT_LOCKED` | `#1A1A1A` | Exit tile when objectives incomplete (same as floor, no highlight) |
| `COLOR_EXIT_ACTIVE` | `#004422` | Exit tile base when active |
| `COLOR_EXIT_GLOW` | `#00FF66` | Exit tile pulsing highlight border |

#### HUD Colors

| Token | Hex | Usage |
|---|---|---|
| `COLOR_HUD_BG` | `#050505` | HUD strip background |
| `COLOR_HUD_BORDER` | `#2A2A2A` | HUD border / divider lines |
| `COLOR_HP_BAR` | `#CC2200` | Health bar fill |
| `COLOR_HP_BG` | `#330800` | Health bar empty track |
| `COLOR_ARMOR_ICON` | `#4488CC` | Armor value text / icon |
| `COLOR_CREDIT` | `#FFCC00` | Credits text (gold) |
| `COLOR_WEAPON_ACTIVE` | `#00FF66` | Active weapon slot highlight border |
| `COLOR_WEAPON_INACTIVE` | `#1E1E1E` | Inactive weapon slot background |
| `COLOR_AMMO_TEXT` | `#AAAAAA` | Ammo count text |
| `COLOR_AMMO_LOW` | `#FF6600` | Ammo count when below 25% |
| `COLOR_AMMO_EMPTY` | `#FF2222` | Ammo count when at zero |

#### UI Screen Colors

| Token | Hex | Usage |
|---|---|---|
| `COLOR_UI_BG` | `#0D0D0D` | Full-screen UI backgrounds |
| `COLOR_UI_PANEL` | `#131313` | Panel / card backgrounds |
| `COLOR_UI_BORDER` | `#333333` | Panel borders |
| `COLOR_UI_BORDER_ACCENT` | `#00FF66` | Focused / selected panel borders |
| `COLOR_TEXT_PRIMARY` | `#DDDDDD` | Default body text |
| `COLOR_TEXT_DIM` | `#666666` | Disabled / greyed-out text |
| `COLOR_TEXT_TITLE` | `#FFFFFF` | Screen titles |
| `COLOR_TEXT_LABEL` | `#888888` | Field labels, subheadings |
| `COLOR_ACCENT_GREEN` | `#00FF66` | CTAs, active states, exit tiles, confirmation |
| `COLOR_ACCENT_RED` | `#FF3333` | Danger, death, mission failed, enemy HP |
| `COLOR_ACCENT_GOLD` | `#FFCC00` | Credits, rewards, mission complete highlight |
| `COLOR_ACCENT_BLUE` | `#4488CC` | Armor, info, secondary actions |
| `COLOR_BTN_PRIMARY_BG` | `#00CC55` | Primary button fill |
| `COLOR_BTN_PRIMARY_TEXT` | `#000000` | Primary button label |
| `COLOR_BTN_DANGER_BG` | `#CC2200` | Destructive action button |
| `COLOR_BTN_INACTIVE_BG` | `#1A1A1A` | Greyed button |
| `COLOR_BTN_INACTIVE_TEXT` | `#444444` | Greyed button text |

### Typography

**Primary font:** `Press Start 2P` (Google Fonts)
Load declaration:
```html
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
```

If Google Fonts is unavailable (offline play), fall back to:
```css
font-family: 'Press Start 2P', 'Courier New', monospace;
```

#### Type Scale

| Role | Size | Usage |
|---|---|---|
| `TYPE_TITLE` | 24px | Game title on title screen |
| `TYPE_HEADING` | 16px | Screen headings (MISSION COMPLETE, SHOP, etc.) |
| `TYPE_SUBHEADING` | 12px | Section labels, weapon names |
| `TYPE_BODY` | 10px | General body text, stats, mission briefing text |
| `TYPE_LABEL` | 8px | HUD labels (HP, ARMOR, CR:), small annotations |
| `TYPE_TINY` | 8px | Objective tracker, kill counter |

All text is rendered in `image-rendering: pixelated` context. Line height: 1.8x font size. Letter spacing: 0 (Press Start 2P handles its own spacing).

### Pixel Art Style Guidelines

- **No anti-aliasing.** Canvas `imageSmoothingEnabled = false`. CSS `image-rendering: pixelated` on the canvas element.
- **Sprites are programmatic** for MVP. Every entity is drawn with `ctx.fillRect()` calls — no external PNG assets required.
- **Sprites are 16x16 px** for all entities (player, all enemy types). Rendered at native pixel scale within the 32x32 tile grid (centered with 8px margin on each side).
- **Wall tiles use a 2-pass render:** fill with `COLOR_WALL`, then add a 1px top edge and 1px left edge in `COLOR_WALL_LIGHT` to simulate isometric-lite depth.
- **No smooth movement interpolation** between tiles — movement is continuous pixel-by-pixel but rendered without any sub-pixel smoothing.
- **Projectiles are 4x4 px rectangles** (or 2x8 for sniper/laser beams) with weapon-specific colors.

---

## 2. Game Canvas Layout

### Dimensions

```
Logical canvas size: 800 x 600 px
HUD height:          80 px
Game viewport:       800 x 520 px (canvas top portion)
HUD strip:           800 x 80 px (canvas bottom portion)
```

The canvas is scaled to fill the browser window while preserving the 4:3 aspect ratio (800:600). Scaling is integer where possible (1x, 2x, 3x) — use CSS `width: 100vmin` with `aspect-ratio: 4/3` to let the browser handle it. The canvas itself is always rendered at exactly 800x600 internal resolution.

### Viewport Scrolling

The map is larger than the viewport. The camera is always centered on the player. The visible world area is 800x520 px, meaning:

```
Visible tiles horizontally: ceil(800 / 32) + 1 = 26 tiles
Visible tiles vertically:   ceil(520 / 32) + 1 = 17 tiles
```

The camera is clamped at map edges: if the player is within 400px of the left edge, the camera locks to x=0. Same logic applies for all four edges.

### Layer Draw Order

```
1. Floor tiles         (bottom)
2. Exit tile
3. Cover / crate tiles
4. Pickups (items on ground)
5. Enemy sprites
6. Player sprite
7. Projectiles
8. Particle effects (flamethrower smoke, explosion flash)
9. Enemy alert icons (! marks)
10. HUD overlay        (top)
```

---

## 3. HUD Design

The HUD is a fixed 800x80 px strip at the bottom of the canvas. It never scrolls with the map.

### Top Bar (in-game overlay, top of game viewport)

Two slim info lines at the very top of the viewport (y=0 to y=20, semi-transparent black backing):

```
Left:   MISSION 2: SECTOR 7
Center: KILLS: 3 / 8
Right:  [ ] KILL ALL ENEMIES   [ ] REACH EXIT
```

### Bottom HUD Strip Layout

```
+-----------------------------------------------------------------------------------+
| 800 x 80 px HUD  (#050505 background, 1px top border #2A2A2A)                    |
|                                                                                   |
|  HP SECTION         WEAPON SLOTS (3)                         CREDITS              |
|  (x:0, w:160)       (x:180, w:440)                           (x:660, w:140)       |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

### ASCII Mockup — Full HUD Strip

```
+------------------------------------------------------------------------+--------+
|  HP  [==========-----------]  75/100  |  [1: PISTOL    30/30 ] |      | CR     |
|  ARMOR: 25                  (blue)   |  [2: SHOTGUN   14/20 ] |      | 1,240  |
|                                       |  [3: ----      --/-- ] |      |        |
+------------------------------------------------------------------------+--------+
   160px                                       440px (3 slots)             140px
```

### Detailed HUD Section Specs

#### HP Section (x:8, y:HUD+8, w:152, h:64)

```
+------------------------------------------+
|  HP  [################--------]  75/100  |
|       green->red gradient bar  8px tall  |
|                                          |
|  ARMOR: 25          (COLOR_ARMOR_ICON)   |
+------------------------------------------+
```

- Label `HP` at 8px font, `COLOR_TEXT_LABEL`, x:8 y:+8
- Bar track: w:120 h:8 px, fill `COLOR_HP_BG`
- Bar fill: w:proportional h:8 px, fill `COLOR_HP_BAR`
  - Bar color shifts: >50 HP = `#CC2200`, 25-50 HP = `#FF6600`, <25 HP = `#FF2222` (flashing at 1Hz)
- HP text `75/100` at 8px font, right of bar, `COLOR_TEXT_PRIMARY`
- Armor line below: `ARMOR: 25` at 8px font, `COLOR_ARMOR_ICON` (#4488CC)
  - If armor is 0: text dim, `ARMOR: --`

#### Weapon Slots (x:180, w:440)

Three equal-width slots, side by side. Each slot is 140x64 px with a 4px gap between.

```
+----------------+ +------------------+ +------------------+
|  [1]           | |  [2]             | |  [3]             |
|  SHOTGUN       | |  PISTOL          | |  ----            |
|  14 / 20       | |  30 / 30         | |                  |
|  (active, lit) | |  (inactive, dim) | |  (empty slot)    |
+----------------+ +------------------+ +------------------+
```

- Active slot: border `COLOR_WEAPON_ACTIVE` (2px), background `#0D1A0D`
- Inactive slot: border `COLOR_WEAPON_INACTIVE` (1px), background `#0A0A0A`
- Empty slot: border `#1A1A1A` (1px dashed pattern), text `----`
- Slot number (`[1]`, `[2]`, `[3]`) at top-left corner in 8px font, `COLOR_TEXT_DIM`
- Weapon name at 8px font, `COLOR_TEXT_PRIMARY` (or `COLOR_TEXT_DIM` if empty)
- Ammo `current / max`:
  - Normal: `COLOR_AMMO_TEXT`
  - Below 25%: `COLOR_AMMO_LOW`
  - Zero: `COLOR_AMMO_EMPTY`

#### Credits (x:660, w:140)

```
+-------------------+
|  CR               |
|  1,240            |
+-------------------+
```

- Label `CR` at 8px font, `COLOR_TEXT_LABEL`
- Amount at 16px font, `COLOR_ACCENT_GOLD` (#FFCC00)
- Right-aligned within the section

### Top Overlay (y:0, h:20)

Semi-transparent backing: `rgba(0,0,0,0.7)`, full canvas width.

```
MISSION 2: SECTOR 7          KILLS: 3 / 8          [x] KILL ALL   [ ] REACH EXIT
```

- Mission name: 8px font, `#888888`, x:8
- Kill counter: 8px font, `COLOR_TEXT_PRIMARY`, centered
- Objectives: 8px font, checked=`COLOR_ACCENT_GREEN`, unchecked=`#555555`, right-aligned at x:790

---

## 4. Shop Screen Design

The shop fills the full 800x600 canvas. Background: `COLOR_UI_BG`.

### Layout Structure

```
+------------------------------------------------------------------------+
|                     SHOP — BETWEEN MISSIONS                            |
|  CREDITS: 1,240  (gold)           [  DEPLOY TO NEXT MISSION  ]         |
+--------------------+-----------------------------------+----------------+
|                    |                                   |                |
|   YOUR LOADOUT     |        ITEMS FOR SALE             |   ITEM DETAIL  |
|   (3 weapon slots) |   WEAPONS | AMMO | ARMOR  (tabs) |   (on hover)   |
|                    |                                   |                |
|   Slot 1 [PISTOL ] |   [Machine Gun       800cr]  own |                |
|   Slot 2 [SHOTGUN] |   [Shotgun           600cr]  own |   > SHOTGUN    |
|   Slot 3 [------] |   [Flamethrower     1200cr]       |   Dmg:  100    |
|                    |   [Rocket Launcher  1500cr]       |   Rate: 1.2/s  |
|   Sell buttons:    |   [Sniper Rifle     1100cr]       |   Range: 200px |
|   [SELL SHOTGUN]   |   [Grenade Launcher 1300cr]       |   Ammo: 14/20  |
|    (returns 300cr) |   [Laser             950cr]       |                |
|                    |                                   |   Cost: 600cr  |
|                    |                                   |                |
+--------------------+-----------------------------------+----------------+
```

### ASCII Mockup — Full Shop Screen

```
+============================================================================+
|  C Y D E R - B O G S  ::  S H O P                            [8px title]  |
|  CREDITS AVAILABLE:  1,240                [  DEPLOY TO MISSION 3  ]        |
+===========+===================================+==========================+
|                     |                                   |                  |
| YOUR LOADOUT        |  WEAPONS          AMMO   ARMOR    | ITEM DETAIL      |
|                     |  (active tab)                     |                  |
| +--------------+    | [Machine Gun       800]  [OWNED]  | FLAMETHROWER     |
| | 1  PISTOL    |    | [Shotgun           600]  [OWNED]  |                  |
| |    30/30 ammo|    | [Flamethrower    1,200]           | Dmg:  8/tick     |
| +--------------+    | [Rocket Launcher 1,500]           | Rate: 8 ticks/s  |
|                     | [Sniper Rifle    1,100]           | Range: 120px     |
| +--------------+    | [Grenade Launcher1,300]           | Ammo:  60 fuel   |
| | 2  SHOTGUN   |    | [Laser             950]  [OWNED]  |                  |
| |    14/20 ammo|    |                                   | Cost:  1,200 cr  |
| +--------------+    |                                   |                  |
|  [SELL  300cr ]     |                                   | [  BUY  1,200  ] |
|                     |                                   |                  |
| +--------------+    |                                   | (not enough cr)  |
| | 3  --------  |    |                                   |                  |
| |              |    |                                   |                  |
| +--------------+    |                                   |                  |
|                     |                                   |                  |
+=====================+===================================+==================+
```

### Shop Panel Specs

#### Header Bar (y:0, h:48)

- Background: `#0D0D0D`, border-bottom: 1px `COLOR_UI_BORDER`
- Left: `SHOP` at 16px, `COLOR_TEXT_TITLE`
- Center: `CREDITS AVAILABLE: 1,240` at 12px, `COLOR_ACCENT_GOLD`
- Right: `[DEPLOY TO MISSION 3]` button, `COLOR_BTN_PRIMARY_BG` fill, 12px font

#### Left Panel — Your Loadout (x:0, w:200, y:48, h:552)

- Background: `COLOR_UI_PANEL`
- Border-right: 1px `COLOR_UI_BORDER`
- Header `YOUR LOADOUT` at 10px, `COLOR_TEXT_LABEL`
- Three weapon slots, each 160x64 px with 8px vertical gap:
  - Slot number + weapon name at 10px
  - Ammo `current/max` at 8px, color-coded as per HUD rules
  - SELL button below: `[SELL — 300cr]` in `COLOR_ACCENT_RED` text; hidden for Pistol (pistol cannot be sold)
  - Empty slot shows `[--- EMPTY ---]` at `COLOR_TEXT_DIM`

#### Center Panel — Items for Sale (x:200, w:380, y:48, h:552)

- Background: `COLOR_UI_BG`
- Three tabs at top: `WEAPONS`, `AMMO`, `ARMOR`
  - Active tab: bottom border 2px `COLOR_ACCENT_GREEN`, text `COLOR_TEXT_PRIMARY`
  - Inactive tab: text `COLOR_TEXT_DIM`
- Item list: each row 40px tall, alternating background `#0D0D0D` / `#101010`
- Row layout: `[Name .............. Cost]  [STATUS]`
  - Name at 10px, `COLOR_TEXT_PRIMARY`
  - Cost at 10px, `COLOR_ACCENT_GOLD`
  - Status badge: `OWNED` in `#334433` box with `#00AA44` text; `LOW CR` in `#331111` box with `#AA2222` text; nothing if affordable and not owned
  - Greyed-out rows (owned or can't afford): text `COLOR_TEXT_DIM`, cost `#555500`
- Clicking a row selects it and updates the right panel

#### Right Panel — Item Detail (x:580, w:220, y:48, h:552)

- Background: `COLOR_UI_PANEL`
- Border-left: 1px `COLOR_UI_BORDER`
- Shows selected item's stats:
  - Name at 12px, `COLOR_TEXT_TITLE`
  - Divider line 1px `COLOR_UI_BORDER`
  - Stats table: label (8px, `COLOR_TEXT_LABEL`) + value (8px, `COLOR_TEXT_PRIMARY`)
  - Cost at 12px, `COLOR_ACCENT_GOLD`
  - BUY button at bottom: `COLOR_BTN_PRIMARY_BG` if affordable, `COLOR_BTN_INACTIVE_BG` if not
  - If can't afford: `NOT ENOUGH CR` at 8px, `COLOR_ACCENT_RED` below button

#### Slot Full Modal

When player tries to buy a 4th weapon, a centered modal appears:

```
+--------------------------------------+
|  SLOTS FULL                          |
|  Select a weapon to replace:         |
|                                      |
|  [ Pistol        0cr sell value ]    |
|  [ Shotgun     300cr sell value ]    |
|  [ ----         empty          ]     |
|                                      |
|  [CANCEL]         [CONFIRM SWAP]     |
+--------------------------------------+
```

- Modal background: `COLOR_UI_PANEL`, border: 2px `COLOR_ACCENT_RED`
- Overlay: `rgba(0,0,0,0.8)` covering the rest of the screen

---

## 5. Mission Briefing Screen

Appears before each mission. Full-screen, dark background.

### ASCII Mockup

```
+============================================================================+
|                                                                            |
|  MISSION 2                                                   [10px dim]   |
|  S E C T O R   7                                             [24px title] |
|  ________________________________________________________________________  |
|                                                                            |
|  SITUATION:                                                  [10px label] |
|                                                                            |
|  Enemy forces have fortified a mid-sector processing plant. [10px body]   |
|  Eliminate all hostiles and extract through the east gate.                 |
|  Intel suggests armored units are present. Proceed with                    |
|  caution.                                                                  |
|                                                                            |
|  OBJECTIVES:                                                               |
|  [x] Eliminate all enemies                                                 |
|  [x] Reach the extraction point                                            |
|                                                                            |
|  REWARD: 350 CREDITS on completion                           [gold text]  |
|                                                                            |
|  ________________________________________________________________________  |
|                                                                            |
|  CURRENT LOADOUT:                                                          |
|  [1: PISTOL  30/30]   [2: SHOTGUN  14/20]   [3: --------]                 |
|                                                                            |
|                            [  D E P L O Y  ]                              |
|                                                                            |
+============================================================================+
```

### Briefing Screen Specs

- Full canvas background: `COLOR_UI_BG`
- Mission number: 10px, `COLOR_TEXT_DIM`, top-left quadrant
- Mission title: 24px, `COLOR_TEXT_TITLE`, spaced letters (simulate DOS uppercase feel)
- Divider: 1px horizontal line, `COLOR_UI_BORDER`, full width
- Situation header: `SITUATION:` at 8px, `COLOR_TEXT_LABEL`
- Briefing body: 10px, `COLOR_TEXT_PRIMARY`, max 200 chars, word-wrapped at ~70 chars/line
- Objectives section:
  - Header `OBJECTIVES:` at 8px, `COLOR_TEXT_LABEL`
  - Each objective: checkbox `[x]` prefixed, 10px, `COLOR_TEXT_PRIMARY`
  - Checkbox style: `[ ]` unchecked in `COLOR_TEXT_DIM`, `[x]` checked in `COLOR_ACCENT_GREEN`
- Reward line: `REWARD: 350 CREDITS on completion`, 10px, `COLOR_ACCENT_GOLD`
- Loadout display (read-only): same slot widget as HUD but smaller (120x48 px each)
- DEPLOY button: centered, `COLOR_BTN_PRIMARY_BG`, 12px font, 200x40 px
- Pressing ENTER or clicking DEPLOY starts the mission

---

## 6. Game Over Screen (Mission Failed)

### ASCII Mockup

```
+============================================================================+
|                                                                            |
|                                                                            |
|            M I S S I O N   F A I L E D                                    |
|            _______________________________________________                  |
|                                                                            |
|            STATUS:   E L I M I N A T E D                                  |
|                                                                            |
|            MISSION:  Sector 7                                              |
|            KILLS:    3 of 8                                                |
|            TIME:     2:14                                                  |
|                                                                            |
|            YOUR LOADOUT AND CREDITS ARE PRESERVED.                         |
|            RETRY FROM THE START OF THIS MISSION.                           |
|                                                                            |
|                                                                            |
|            [  RETRY MISSION  ]           [  MAIN MENU  ]                  |
|                                                                            |
|                                                                            |
+============================================================================+
```

### Mission Failed Screen Specs

- Full canvas background: `COLOR_UI_BG` with a full-canvas red vignette overlay:
  `rgba(180,0,0,0.08)` — subtle red wash, not distracting
- `MISSION FAILED` title: 24px, `COLOR_ACCENT_RED` (#FF3333), centered, letter-spaced
- Divider: 1px `#331111`
- `ELIMINATED` status: 16px, `COLOR_ACCENT_RED`, spaced letters
- Stats block: 10px, `COLOR_TEXT_PRIMARY`
  - Mission name, kills, time elapsed in this attempt
- Preservation notice: 10px, `COLOR_TEXT_DIM`
- Two buttons at bottom-center:
  - `RETRY MISSION`: `COLOR_BTN_PRIMARY_BG` fill, 160x40 px
  - `MAIN MENU`: `COLOR_BTN_INACTIVE_BG` fill, `COLOR_TEXT_DIM` text, 160x40 px
- 10px gap between buttons
- Enter key triggers RETRY

---

## 7. Victory Screen

### Mission Complete Screen (between missions)

Appears immediately after completing a mission's objectives and reaching the exit.

```
+============================================================================+
|                                                                            |
|            M I S S I O N   C O M P L E T E                                |
|            _______________________________________________                  |
|                                                                            |
|            SECTOR 7                                                        |
|                                                                            |
|            KILLS:          8 / 8           +240 cr                         |
|            MISSION REWARD:                 +350 cr                         |
|            ─────────────────────────────────────                           |
|            TOTAL EARNED:                   590 cr                          |
|                                                                            |
|            TIME:           3:42                                            |
|                                                                            |
|                                                                            |
|                         [  ENTER SHOP  ]                                   |
|                                                                            |
+============================================================================+
```

- Background: `COLOR_UI_BG` with a subtle green vignette: `rgba(0,180,60,0.06)`
- `MISSION COMPLETE` title: 24px, `COLOR_ACCENT_GREEN`, centered
- Mission name: 12px, `COLOR_TEXT_PRIMARY`
- Stats rows: 10px, label in `COLOR_TEXT_LABEL`, value in `COLOR_TEXT_PRIMARY`
- Credit gains: right-aligned, `COLOR_ACCENT_GOLD`
- Divider above total: 1px `COLOR_UI_BORDER`
- `TOTAL EARNED`: bold treatment — 10px but full `COLOR_ACCENT_GOLD`
- `ENTER SHOP` button: `COLOR_BTN_PRIMARY_BG`, centered, 200x40 px

### Campaign Complete (Win) Screen

Appears after completing Mission 5.

```
+============================================================================+
|                                                                            |
|                                                                            |
|         O P E R A T I O N   C O M P L E T E                               |
|                                                                            |
|         All objectives achieved. The compound is clear.                    |
|                                                                            |
|         _______________________________________________                     |
|                                                                            |
|         FINAL STATS                                                        |
|                                                                            |
|         TOTAL KILLS:         47                                            |
|         TOTAL CREDITS EARNED: 3,940                                        |
|         TOTAL TIME:           28:14                                        |
|         MISSIONS COMPLETED:   5 / 5                                        |
|                                                                            |
|         _______________________________________________                     |
|                                                                            |
|                       [  P L A Y   A G A I N  ]                           |
|                                                                            |
+============================================================================+
```

- Background: `COLOR_UI_BG`
- `OPERATION COMPLETE` title: 24px, `COLOR_ACCENT_GOLD`, letter-spaced
- Flavor text line: 10px, `COLOR_TEXT_DIM`, italics-feel (same font, just dimmed)
- Divider: 1px `COLOR_ACCENT_GOLD` (gold line, not grey — this is celebratory)
- `FINAL STATS` header: 12px, `COLOR_TEXT_LABEL`
- Stat rows: 10px, label `COLOR_TEXT_LABEL`, value `COLOR_TEXT_PRIMARY`
- Divider: 1px `COLOR_UI_BORDER`
- `PLAY AGAIN` button: `COLOR_BTN_PRIMARY_BG`, 200x40 px, centered
  - Clicking this wipes all localStorage state and returns to title

---

## 8. Tile & Sprite Design

All sprites are drawn programmatically using Canvas 2D API rectangles. No external image assets. Pixel dimensions refer to the sprite's internal draw size within the 32x32 tile grid.

### Tile Descriptions

#### Floor Tile (ID: 0) — 32x32 px

- Base fill: `COLOR_FLOOR` (#1A1A1A)
- No border, no texture in MVP
- Occasional subtle variation (optional, post-MVP): 1-in-8 tiles get a 1px speck at #222222

#### Wall Tile (ID: 1) — 32x32 px

- Base fill: `COLOR_WALL` (#3A3A3A)
- Top edge (y=0, h=1): `COLOR_WALL_LIGHT` (#4E4E4E) — simulates top-lit concrete
- Left edge (x=0, w=1): `COLOR_WALL_LIGHT` (#4E4E4E)
- Bottom edge (y=31, h=1): `COLOR_WALL_DARK` (#252525)
- Right edge (x=31, w=1): `COLOR_WALL_DARK` (#252525)
- Net effect: 3D-lite appearance suggesting square concrete blocks

#### Cover / Crate Tile (ID: 3) — 32x32 px

- Base fill: `COLOR_COVER` (#5C3D1E) — dark wood/metal crate
- Top edge 2px: `#7A5228` (lighter wood grain)
- Right + bottom edge 2px: `COLOR_COVER_DARK` (#3B2510)
- Inner detail: 4px inset rectangle in `#4A3015` — suggests paneling
- Occupies full tile; player and enemies cannot pass

#### Door Tile (ID: 4, open) — 32x32 px

- Frame: 4px border in `COLOR_DOOR` (#2A2A4A) on left and right edges
- Center: `COLOR_FLOOR` (#1A1A1A) — passable
- Top 4px arch bar: `COLOR_DOOR`
- Visual reads as an open doorway; no interactive mechanic in MVP

#### Exit Tile (ID: 2) — 32x32 px, animated

Two states:

**Locked (objectives incomplete):**
- Rendered same as floor; no visible difference. Player cannot trigger it.

**Active (all objectives complete):**
- Base: `COLOR_EXIT_ACTIVE` (#004422)
- Border: 2px `COLOR_EXIT_GLOW` (#00FF66)
- Pulsing: border opacity oscillates 0.5→1.0 at 1Hz using `Date.now()` in render loop
- Arrow indicator: two 4px-wide arrow shapes pointing inward, rendered in `#00FF66`, centered

#### Spawn Tiles (ID: 5, 6) — 32x32 px

- Rendered identically to Floor (ID: 0). Invisible at runtime.

### Player Sprite — 16x16 px (centered in 32x32 tile)

Drawn as a top-down dog silhouette using rectangles:

```
  Component layout (16x16 grid, all fills):

  Body:      centered 10x10 rect, fill #8888AA (blue-grey armored suit)
  Head:      top-center 6x6 rect, fill #9999BB
  Snout:     2x3 rect extending from head toward mouse direction, fill #AAAACC
  Tail:      2x4 rect extending from body opposite to snout, fill #777799
  Legs:      4 corner 2x2 rects, fill #666688
  Direction: The snout side always faces the mouse cursor.
             Rotate the entire 16x16 sprite drawing around center point.
```

Implementation note: store the 16x16 draw routine, then apply `ctx.save() / ctx.rotate(angle) / ctx.restore()` around it. Angle = `Math.atan2(mouse.y - player.y, mouse.x - player.x)`.

**Death state:** Player sprite flashes by alternating between normal render and full fill `#FF2222` at 10Hz for 1 second before Mission Failed screen appears.

### Enemy Sprites — 16x16 px (centered in 32x32 tile)

#### Grunt — 16x16 px

```
  Body:   10x10 rect, fill #664422 (dark tan uniform)
  Head:   6x6 rect, fill #885533
  Detail: 2x2 rect at center of body, fill #443311 (weapon suggestion)
```

#### Heavy — 16x16 px

```
  Body:   12x12 rect, fill #444444 (grey armored bulk)
  Head:   7x7 rect, fill #555555
  Shoulder pads: 2x3 rects on left/right of body top, fill #333333
  Highlight: 1px top edge on body, fill #666666
```

#### Sniper — 16x16 px

```
  Body:   8x12 rect, fill #335522 (slim camo green)
  Head:   5x5 rect, fill #446633
  Rifle:  1x8 rect extending in facing direction, fill #222222 (long barrel)
```

#### Berserker — 16x16 px

```
  Body:   12x12 rect, fill #661111 (red-tinted, aggressive)
  Head:   8x8 rect, fill #882222
  Arms:   3x2 rects on sides, fill #550000 (spread as if charging)
```

#### Boss — 24x24 px (larger sprite, still centered in 32x32)

```
  Body:   20x20 rect, fill #222244 (dark armored exosuit)
  Head:   10x10 rect, fill #333355
  Shoulder cannon: 4x8 rect top-right, fill #111133
  Border highlight: 1px top and left, fill #4444AA (blue-purple glow)
  HP bar: 4px tall bar below sprite, 24px wide, red fill. Always visible.
```

Boss is the only enemy with a visible HP bar above/below the sprite.

### Alert Icon — 8x12 px

When an enemy transitions to ALERT state, an exclamation mark icon appears above the sprite for 0.6 seconds:

```
  "!" shape drawn with:
  Top bar: 4x7 rect, fill #FFFF00 (yellow)
  Gap:     4x1 gap
  Dot:     4x3 rect, fill #FFFF00
```

### Pickup Sprites — 12x12 px (centered in 32x32 tile)

| Pickup | Visual |
|---|---|
| Ammo box | 12x10 rect `#556622` with 2px border `#88AA33`; `A` character in 8px centered |
| Small medkit | 10x10 rect `#CC0000` with white cross (2x6 + 6x2 centered) |
| Large medkit | 12x12 rect `#EE0000` with white cross (2x8 + 8x2 centered) |
| Credits | 10x10 rect `#AA8800` with `$` character in 8px centered |

### Projectile Sprites

| Weapon | Projectile | Size | Color |
|---|---|---|---|
| Pistol | Rectangle | 4x4 px | `#FFFF88` (pale yellow) |
| Machine Gun | Rectangle | 3x3 px | `#FFCC44` (orange-yellow) |
| Shotgun | Rectangle | 4x4 px | `#FF8844` (orange), one per pellet |
| Flamethrower | Rectangle | 6x6 px | `#FF4400` (deep orange), fades alpha over lifetime |
| Rocket Launcher | Rectangle | 6x10 px | `#FF6600` with 2px `#FFAA00` tip — visibly large |
| Sniper Rifle | Rectangle | 2x16 px | `#88FFFF` (cyan beam, elongated) |
| Grenade Launcher | Rectangle | 8x8 px | `#99CC22` (green-yellow) |
| Laser | Rectangle | 2x24 px | `#FF00FF` (magenta beam, instantaneous) |

Rocket splash and Grenade splash: on impact, render a 2-frame circle explosion.
- Frame 1: circle radius=splash radius, stroke `#FFAA00`, 2px, alpha 0.8
- Frame 2: circle radius=splash radius+8, stroke `#FF4400`, 2px, alpha 0.4
- Duration: 2 frames (~33ms each)

---

## 9. Color Coding

A consistent semantic color layer so players learn the visual language quickly.

| Color | Hex | Meaning |
|---|---|---|
| Green `COLOR_ACCENT_GREEN` | `#00FF66` | Safe, go, exit active, objective complete, primary CTA |
| Red `COLOR_ACCENT_RED` | `#FF3333` | Danger, death, mission failed, HP critical, enemy HP bar |
| Gold `COLOR_ACCENT_GOLD` | `#FFCC00` | Credits, rewards, campaign complete |
| Blue `COLOR_ARMOR_ICON` | `#4488CC` | Armor, info, non-danger stats |
| Yellow `#FFFF00` | `#FFFF00` | Alert state indicator (enemy ! mark) |
| Orange `#FF6600` | `#FF6600` | Ammo low, heat/fire weapons, rockets |
| Cyan `#88FFFF` | `#88FFFF` | Sniper rifle beam, precision/long range |
| Magenta `#FF00FF` | `#FF00FF` | Laser weapon — distinct, sci-fi |
| Grey `COLOR_TEXT_DIM` | `#666666` | Inactive, disabled, greyed-out states |
| White `COLOR_TEXT_TITLE` | `#FFFFFF` | Titles, emphasis, bright highlights |

### Color Rule Summary

- **Enemies are always visible** against the dark floor. All enemy sprites use colors significantly lighter or more saturated than `#1A1A1A`.
- **The player sprite** (blue-grey) is distinct from all enemy sprite colors (tan, grey armored, green, red). No confusion is possible.
- **Health is always the red bar.** Nothing else uses a persistent red bar in the HUD.
- **Credits are always gold.** No other game value uses gold.
- **The exit tile pulses green.** Green means go.

---

## 10. Title Screen

```
+============================================================================+
|                                                                            |
|                                                                            |
|              C Y D E R - B O G S                                           |
|              ________________________________                               |
|              A  C Y B E R D O G S  T R I B U T E                          |
|                                                                            |
|                                                                            |
|                       [  N E W  G A M E  ]                                 |
|                                                                            |
|                       [  C O N T I N U E  ]          (dim if no save)     |
|                                                                            |
|                       [     C R E D I T S     ]                            |
|                                                                            |
|                                                                            |
|                                                     v1.0 — MVP            |
+============================================================================+
```

- Background: `COLOR_BG` (#0A0A0A)
- Title `CYDER-BOGS`: 24px, `COLOR_TEXT_TITLE`, letter-spaced, centered
- Subtitle `A CYBERDOGS TRIBUTE`: 10px, `COLOR_TEXT_DIM`, centered
- Divider: 1px `COLOR_UI_BORDER`, width 300px centered
- Button stack: vertical, 48px tall each, 8px gap, 240px wide, centered
  - `NEW GAME`: `COLOR_BTN_PRIMARY_BG`, `COLOR_BTN_PRIMARY_TEXT`, 10px font
  - `CONTINUE`: same style if save exists; `COLOR_BTN_INACTIVE_BG` + `COLOR_BTN_INACTIVE_TEXT` if no save
  - `CREDITS`: `COLOR_BTN_INACTIVE_BG` + `COLOR_TEXT_DIM`
- Version string: 8px, `COLOR_TEXT_DIM`, bottom-right corner
- No animation in MVP. Cursor blink on the active button selection (keyboard nav): 1px border cycles `COLOR_ACCENT_GREEN` at 1Hz.

---

## 11. Accessibility

### Minimum Font Sizes

| Context | Minimum | Recommended |
|---|---|---|
| HUD labels | 8px | 8px (Press Start 2P is designed for legibility at 8px) |
| HUD values | 8px | 10–16px for critical values (HP, credits) |
| Body text (briefings, shop) | 10px | 10px |
| Screen titles | 16px | 24px |
| Buttons | 10px | 12px |

Press Start 2P is not a condensed font — each character is fully legible at 8px on a 2x scaled display. At a typical laptop resolution with the game scaled up, 8px logical = 16px physical.

### Contrast Requirements

All text must meet a minimum contrast ratio of 4.5:1 against its background (WCAG AA).

| Pair | Foreground | Background | Ratio (approx) |
|---|---|---|---|
| Primary text on HUD | `#DDDDDD` on `#050505` | ~14:1 — passes AAA |
| Gold credits on dark | `#FFCC00` on `#0D0D0D` | ~14:1 — passes AAA |
| Green accent on dark | `#00FF66` on `#050505` | ~13:1 — passes AAA |
| Red accent on dark | `#FF3333` on `#0D0D0D` | ~5.5:1 — passes AA |
| Dim text (disabled) | `#666666` on `#0D0D0D` | ~4.9:1 — passes AA |
| Button text (black on green) | `#000000` on `#00CC55` | ~8.5:1 — passes AAA |

### Keyboard Navigation

All screens that have buttons must support:
- `Tab` / `Shift+Tab` to cycle between buttons
- `Enter` to activate the focused button
- `Escape` to go back / cancel where applicable
- Focused button: 2px `COLOR_ACCENT_GREEN` border added around the button

### Additional Accessibility Notes

- Game canvas uses `role="img"` and `aria-label="Cyder-Bogs game canvas"` in the HTML.
- All screen transitions (title → briefing → game → shop) are instant — no timed auto-advances that could disorient users.
- The HUD HP bar includes a text readout (`75/100`) in addition to the visual bar, so colorblind players can read their health numerically.
- Ammo state is communicated via both color (orange/red) and position (value always visible as text).
- No purely color-coded information that lacks a text alternative.

---

## 12. Implementation Notes for Developers

### Canvas Setup

```javascript
const canvas = document.getElementById('game');
canvas.width = 800;
canvas.height = 600;
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
```

CSS scaling:
```css
#game {
  image-rendering: pixelated;
  width: 100vmin;
  height: 75vmin; /* maintains 4:3 */
  display: block;
  margin: auto;
}
```

### Font Loading

Load Press Start 2P from Google Fonts in `<head>`. In canvas, set:
```javascript
ctx.font = '10px "Press Start 2P"';
ctx.fillStyle = '#DDDDDD';
```

Verify the font has loaded before rendering text (use `document.fonts.ready`).

### Color Constants

Define all palette colors as a single `COLORS` object at the top of your rendering module. Never hardcode hex strings in drawing calls — always reference `COLORS.HP_BAR`, `COLORS.ACCENT_GREEN`, etc. This makes palette swaps trivial.

### HUD Rendering

Render the HUD last, after the game world, as a fixed overlay:
```javascript
function drawHUD(ctx, player, mission) {
  // 1. Draw HUD background bar at y=520, h=80
  // 2. Draw HP section
  // 3. Draw weapon slots
  // 4. Draw credits
}
```

The top overlay (mission name, kill counter, objectives) renders at y=0 before entity drawing, so entities draw over it if they move to the top of the viewport. This is acceptable — top of screen is rarely occupied by the player.

### Sprite Rotation

Rotate sprites around their center point. The player sprite center is always at `(player.x, player.y)` in world space. Apply the camera offset before rotating:

```javascript
const screenX = player.x - camera.x;
const screenY = player.y - camera.y;
ctx.save();
ctx.translate(screenX, screenY);
ctx.rotate(player.angle);
drawPlayerSprite(ctx); // draws centered at 0,0
ctx.restore();
```

### Exit Tile Pulse

```javascript
const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 500); // 0→1 at 1Hz
ctx.globalAlpha = 0.5 + 0.5 * pulse;
// draw border
ctx.globalAlpha = 1.0;
```

---

*End of Design Specification*
