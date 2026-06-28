# Kaflul UI Asset Requirements - Phase 0 Inventory

Date: 2026-06-28
Scope: Asset inventory and requirements only. No assets were changed.

## Current Asset Inventory

| Asset | Dimensions | Format/mode | Approx size | Current role |
| --- | ---: | --- | ---: | --- |
| `assets/kaflul-logo-official.png` | 1065x489 | PNG/RGBA | 894 KB | Current official main-menu logo. |
| `assets/kaflul-logo.svg` | vector | SVG | 3 KB | Older/simple logo variant. |
| `assets/math-maze-poster.png` | 1448x1086 | PNG/RGB | 1.85 MB | Background/poster/menu atmosphere. |
| `assets/bifly-menu.png` | 512x512 | PNG/RGBA | 219 KB | Bifly menu render. |
| `assets/bifly-player.png` | 512x512 | PNG/RGBA | 245 KB | Bifly gameplay idle/player sprite. |
| `assets/bifly-eat-prepare.png` | 512x512 | PNG/RGBA | 234 KB | Bifly gameplay prepare/eat state. |
| `assets/bifly-eat.png` | 512x512 | PNG/RGBA | 240 KB | Bifly gameplay eat state. |
| `assets/dark-enemy.png` | 512x512 | PNG/RGBA | 154 KB | Enemy idle/menu sprite. |
| `assets/dark-enemy-angry.png` | 512x512 | PNG/RGBA | 158 KB | Enemy angry state. |
| `assets/dark-enemy-sad.png` | 512x512 | PNG/RGBA | 163 KB | Enemy sad state. |
| `assets/dark-enemy-surprised.png` | 512x512 | PNG/RGBA | 156 KB | Enemy surprised state. |
| `assets/nabatick-idle-reference.png` | 512x512 | PNG/RGBA | 206 KB | Current Nabatick menu/gameplay reference idle. |
| `assets/nabatick-eat-prepare-reference.png` | 512x512 | PNG/RGBA | 170 KB | Current Nabatick prepare/eat reference. |
| `assets/nabatick-eat-reference.png` | 512x512 | PNG/RGBA | 181 KB | Current Nabatick eat reference. |
| `assets/nabatick-idle.png` | 128x128 | PNG/palette | small | Older Nabatick idle fallback/candidate obsolete. |
| `assets/nabatick-eat.png` | 128x128 | PNG/palette | small | Older Nabatick eat fallback/candidate obsolete. |
| `assets/nabatick-eat-prepare.png` | 128x128 | PNG/palette | small | Older Nabatick prepare fallback/candidate obsolete. |
| `assets/nabatick-idle-front.webp` | 160x160 | WebP/RGBA | 8 KB | Older directional fallback/candidate obsolete. |
| `assets/nabatick-idle-left.webp` | 160x160 | WebP/RGBA | 8 KB | Older directional fallback/candidate obsolete. |
| `assets/nabatick-idle-right.webp` | 160x160 | WebP/RGBA | 8 KB | Older directional fallback/candidate obsolete. |
| `assets/nabatick-eat-open.webp` | 160x160 | WebP/RGBA | 10 KB | Older eat fallback/candidate obsolete. |
| `assets/nabatick-eat-prepare.webp` | 160x160 | WebP/RGBA | 7 KB | Older prepare fallback/candidate obsolete. |
| `assets/nabatick-idle-v2.svg` | vector | SVG | 5 KB | Generated/vector candidate. |
| `assets/nabatick-eat-v2.svg` | vector | SVG | 5 KB | Generated/vector candidate. |
| `assets/nabatick-eat-prepare-v2.svg` | vector | SVG | 5 KB | Generated/vector candidate. |
| `assets/nabatick-selection-sheet.svg` | vector | SVG | 7 KB | Generated/vector selection sheet. |

## Current Preload Priority

`index.html` preloads:

- Official logo.
- Bifly menu image.
- Bifly gameplay sprites.
- Nabatick 512 reference sprites.
- Dark enemy sprites.
- Poster image.

Risk: the initial menu loads many large raster assets before the user starts gameplay. Some are necessary for immediate polish, but the order and priority should become explicit in a future asset manifest.

## Current Quality Assessment

Strong:

- Logo is high quality and matches the desired premium direction.
- Bifly, dark enemies, and Nabatick reference files are all 512x512, which is a workable source size.
- Transparent PNGs give flexible placement on canvas and menu.

Weak:

- Nabatick has multiple old generations in the repo, causing ambiguity.
- Menu placement does not use a consistent character safe area, so Nabatick appears too low in the current home layout.
- Official logo and poster are heavy for first paint.
- UI icons are not real assets/components; they are mostly Unicode glyphs.
- There is no documented asset manifest with intended role, safe-area box, crop, preload priority, and replacement status.

## Required UI Asset Set

Phase 1/2 should define or source a consistent UI asset set:

- Settings icon.
- Sound on icon.
- Sound off icon.
- Leaderboard/trophy icon.
- Pause icon.
- Play/start icon if used outside the CTA text.
- Close icon.
- Refresh icon.
- Mode icon.
- Difficulty icon.
- Profile/nickname icon.
- Score/best-score icon.
- Rank icon.
- Lives/heart icon.
- Timer icon.
- Mission/progress icon.
- Correct-answer indicator.
- Wrong-answer indicator.
- Locked/unlocked indicator.

Requirements:

- No emoji or raw Unicode glyphs as final production icons.
- Icons must be legible at 24px, 32px, and 44px touch targets.
- Provide active, inactive, disabled, and pressed states through CSS tokens or asset variants.
- Keep RTL placement explicit.

## Required Character Asset Set

Each playable character should have a consistent asset contract.

Menu states:

- Idle, unselected.
- Idle, selected.
- Pressed/tap feedback.
- Victory/celebration.
- Wrong answer/disappointed.
- Locked/unavailable, if used.
- Small avatar/headshot.

Gameplay states:

- Idle front.
- Move up/down/left/right or directional equivalent.
- Eat prepare.
- Eat open.
- Correct answer.
- Wrong answer.
- Hit/life lost.
- Combo/speed boost.

Technical requirements:

- Consistent transparent canvas size, preferably 512x512 source.
- Documented visual safe area inside the source canvas.
- Web-optimized export variants.
- No state should rely on canvas monkeypatching to choose the correct sprite.

## Required Enemy Asset Set

The dark enemy set should become explicit:

- Idle.
- Angry/chasing.
- Surprised.
- Sad/defeated.
- Optional spawn/vanish frame.
- Small UI icon/avatar if enemies are represented in missions.

Requirements:

- Consistent lighting and scale with Bifly/Nabatick.
- Safe area documented.
- Canvas and menu variants either shared intentionally or exported separately.

## Required Background And World Assets

The master spec references four worlds. The current audit confirms gameplay/world logic exists, but the visual home/menu environment is not yet a documented world-asset system.

Needed later:

- World 1 background/menu card.
- World 2 background/menu card.
- World 3 background/menu card.
- World 4 background/menu card.
- Maze tile style per world or a documented shared tile style.
- Portal/level transition visuals.
- Mission/progress badge assets.

## Required Audio Assets Or Sound Tokens

Current audio is generated through WebAudio tones. That is lightweight, but not yet a branded sound system.

Needed later:

- Named sound tokens for correct, wrong, combo, level complete, mission complete, button press, sheet open/close, pause/resume.
- Volume/mute contract.
- Mobile autoplay-safe behavior.
- Reduced-audio or mute-first behavior preserved.

No external audio files are required in Phase 0.

## Asset Manifest Proposal

Later phases should introduce a manifest file or documented table with:

- Asset ID.
- File path.
- Owner screen/component.
- Dimensions.
- Safe-area box.
- Required states.
- Preload/defer/lazy priority.
- Fallback.
- Replacement status.
- Source-of-truth note.

This manifest should be documentation-first before production code consumes it.

## Phase 1 Manifest Foundation

Phase 1 introduced `ui/assets/asset-manifest.js`.

Current manifest scope:

- Official logo.
- Poster/background image.
- Bifly menu and gameplay sprites.
- Nabatick reference sprites.
- Dark enemy state sprites.
- SVG icon sprite metadata.
- Legacy Nabatick asset candidates.

The manifest is intentionally read-only foundation data. It does not change gameplay asset loading yet. Later phases can move production loading toward this manifest after behavior and visual coverage are stronger.

Phase 1 also introduced `ui/icons.svg` with symbols for:

- settings
- sound on/off
- leaderboard
- profile
- character
- mode
- difficulty
- back
- close
- lives
- score
- combo
- mission
- world
- progress
- lock
- play
- pause
- refresh
- check
- fullscreen

Remaining asset debt:

- Some dynamic gameplay indicators still use text glyphs, especially lives/hearts and fallback symbols.
- The old Nabatick asset generations are still present and must not be deleted until verified.
- No new character animation frames were created in Phase 1.
- No placeholder art was added.

## Missing Asset Priorities

Priority 1:

- Real icon set replacing Unicode menu/control glyphs.
- Correct Nabatick menu safe-area render.
- Selected/unselected character state assets.

Priority 2:

- Complete character animation states for Bifly and Nabatick.
- Explicit enemy state set.
- Web-optimized logo/poster variants.

Priority 3:

- World-specific backgrounds and progression assets.
- Branded sound feedback tokens/assets.
