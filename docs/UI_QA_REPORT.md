# Kaflul UI QA Report

Date: 2026-06-28
Phase: 1 foundation and cleanup

## Scope

This report covers Phase 1 only. It does not approve Phase 2 redesign work.

## Automated Checks

| Check | Result | Notes |
| --- | --- | --- |
| Direct JS syntax checks | Pass | `kaflul-systems.js`, `game.js`, `mobile-enhancements.js`, `poster-loader.js`, `ui/assets/asset-manifest.js`, `tools/phase1_visual_regression.mjs`. |
| Node systems tests | Pass | 11/11 in `tests/kaflul-systems.test.js`. |
| Phase 1 visual regression | Pass | Five required viewport screenshots captured and compared with Phase 0. |
| Phase 1 smoke acceptance | Pass | Character/mode/difficulty/nickname/sound persistence, sheets, leaderboard, game start, pause/resume, return to menu. |
| Full `pnpm test` | Pass | Node systems tests plus Playwright desktop/mobile projects: 9 passed, 1 intentionally skipped mobile-only assertion in the desktop project. |

## Required Viewport Screenshots

| Viewport | Phase 1 screenshot | Diff ratio vs Phase 0 |
| --- | --- | ---: |
| 390x844 portrait | `docs/phase1-screenshots/phase1-home-390x844-portrait.png` | 0.004639 |
| 430x932 portrait | `docs/phase1-screenshots/phase1-home-430x932-portrait.png` | 0.002356 |
| 844x390 landscape | `docs/phase1-screenshots/phase1-home-844x390-landscape.png` | 0.004417 |
| 1280x720 desktop | `docs/phase1-screenshots/phase1-home-1280x720-desktop.png` | 0.002509 |
| 1440x900 desktop | `docs/phase1-screenshots/phase1-home-1440x900-desktop.png` | 0.002137 |

Report file:

- `docs/phase1-screenshots/phase1-visual-report.json`

## Console And Runtime

The Phase 1 visual/acceptance pass reported:

- Console errors: 0
- Runtime errors: 0
- Document overflow at required viewport sizes: none
- Asset manifest loaded: yes

## Smoke Acceptance Details

All smoke checks passed:

- Character selection persisted.
- Mode selection persisted.
- Difficulty selection persisted.
- Nickname persisted.
- Sound state persisted.
- Mode sheet opened.
- Difficulty sheet opened.
- Settings sheet opened.
- Leaderboard opened.
- Game started.
- Pause/resume worked.
- Return to menu worked.

## Remaining QA Gaps

- Visual comparison currently covers the home/menu baseline and smoke flow, not every secondary screen screenshot.
- Real-device mobile testing is still required before later visual phases.
- Remaining Unicode fallback glyphs should be removed in later phases when the HUD/results redesigns are in scope.

## Phase 2 Home Hub QA Addendum

Date: 2026-06-28
Phase: 2 home screen redesign only

Automated checks:

| Check | Result | Notes |
| --- | --- | --- |
| Direct JS syntax checks | Pass | `kaflul-systems.js`, `game.js`, `mobile-enhancements.js`, `poster-loader.js`, `ui/assets/asset-manifest.js`, `tools/phase1_visual_regression.mjs`, `tools/phase2_home_verification.mjs`. |
| Node systems tests | Pass | 11/11 in `tests/kaflul-systems.test.js`. |
| Phase 2 home verification | Pass | Required screenshots, console/runtime checks, overflow checks, RTL checks, touch, keyboard, persistence, leaderboard, start-game, and return-to-menu checks passed. |
| Local Playwright suite | Blocked | `node_modules/.bin/playwright` is not present in this local workspace and network install is unavailable. The Phase 2 CDP verifier covers the required home-specific browser checks. |

Required Phase 2 screenshots:

| Viewport | Screenshot |
| --- | --- |
| 390x844 portrait | `docs/phase2-screenshots/phase2-home-390x844-portrait.png` |
| 430x932 portrait | `docs/phase2-screenshots/phase2-home-430x932-portrait.png` |
| 844x390 landscape | `docs/phase2-screenshots/phase2-home-844x390-landscape.png` |
| 1280x720 desktop | `docs/phase2-screenshots/phase2-home-1280x720-desktop.png` |
| 1440x900 desktop | `docs/phase2-screenshots/phase2-home-1440x900-desktop.png` |

Report file:

- `docs/phase2-screenshots/phase2-home-report.json`

Phase 2 acceptance checks passed:

- Character selection and persistence.
- Mode selection and persistence.
- Difficulty selection and persistence.
- Nickname edit and persistence.
- Sound toggle and persistence.
- Settings open/close.
- Leaderboard open/close.
- Bottom navigation focus behavior.
- Keyboard focus reaches active controls.
- Touch interactions on mobile-sized viewport.
- Game starts from `שחק עכשיו`.
- Restart returns to the menu.
- Console errors: 0.
- Runtime errors: 0.
- Document overflow: none at all required viewports.
- Text overflow: none in checked home regions.

Manual screenshot inspection notes:

- 390x844 and 430x932 portrait are usable without accidental scrolling or clipped Hebrew.
- 844x390 landscape is dense but remains usable and fully in-bounds.
- 1280x720 and 1440x900 desktop keep the home scene readable with no detected clipping.
- The top player bar required a scoped override for `.home-rank-button.leaderboard-open-button`; the global leaderboard button style uses fixed positioning and would otherwise cover settings on mobile.

Commands run for Phase 2 QA included:

- `node --check` for production and verification scripts.
- `node --test tests/kaflul-systems.test.js`.
- `node tools/phase2_home_verification.mjs --ci`.
- Local Playwright binary check via `node_modules/.bin/playwright`.
