#!/usr/bin/env python3
"""Fix mobile enemy movement/chasing and slightly enlarge game characters."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GAME = ROOT / "game.js"
INDEX = ROOT / "index.html"


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if new and new in text:
        return text
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected one marker, found {count}")
    return text.replace(old, new, 1)


def patch_game() -> None:
    text = GAME.read_text(encoding="utf-8")

    text = replace_once(
        text,
        '''    if (coarse && portrait && window.innerWidth <= 600) {
      mode = "phone-portrait";
      zoom = window.innerWidth < 390 ? 1.32 : 1.26;
    } else if (coarse && !portrait && window.innerHeight <= 700) {
      mode = "phone-landscape";
      zoom = window.innerHeight < 430 ? 1.18 : 1.12;
    } else if (coarse) {
      mode = "tablet";
      zoom = portrait ? 1.06 : 1.03;
    }''',
        '''    if (coarse && portrait && window.innerWidth <= 600) {
      mode = "phone-portrait";
      zoom = 1;
    } else if (coarse && !portrait && window.innerHeight <= 700) {
      mode = "phone-landscape";
      zoom = 1;
    } else if (coarse) {
      mode = "tablet";
      zoom = 1;
    }''',
        "remove mobile camera zoom",
    )

    old_update = '''  function updateEnemies(dt) {
    const playerCell = toCell(state.player.x, state.player.y);
    for (const enemy of state.enemies) {
      enemy.pathCooldown -= dt;
      enemy.spawnFlash = Math.max(0, enemy.spawnFlash - dt);
      enemy.wobble += dt * 4;

      const cell = toCell(enemy.x, enemy.y);
      const center = centerOfCell(cell.x, cell.y);
      const nearCenter = Math.abs(enemy.x - center.x) < 2.6 && Math.abs(enemy.y - center.y) < 2.6;
      const blocked = !canMove(enemy, enemy.direction, 3.2);

      if (nearCenter || blocked || enemy.pathCooldown <= 0) {
        enemy.x = nearCenter ? center.x : enemy.x;
        enemy.y = nearCenter ? center.y : enemy.y;
        const target = getEnemyTarget(enemy, playerCell);
        enemy.direction = findNextDirection(cell, target, enemy.direction);
        enemy.pathCooldown = 0.18 + Math.random() * 0.16;
      }

      moveActor(enemy, enemy.direction, enemy.speed * dt);
    }
  }'''

    new_update = '''  function updateEnemies(dt) {
    const playerCell = toCell(state.player.x, state.player.y);
    for (const enemy of state.enemies) {
      enemy.pathCooldown -= dt;
      enemy.spawnFlash = Math.max(0, enemy.spawnFlash - dt);
      enemy.wobble += dt * 4;

      const beforeX = enemy.x;
      const beforeY = enemy.y;
      const cell = toCell(enemy.x, enemy.y);
      const center = centerOfCell(cell.x, cell.y);
      const centerTolerance = Math.max(2.6, enemy.speed * dt + 0.8);
      const nearCenter = Math.abs(enemy.x - center.x) <= centerTolerance
        && Math.abs(enemy.y - center.y) <= centerTolerance;
      const blocked = !canMove(enemy, enemy.direction, Math.max(3.2, enemy.speed * dt + 1));

      // Choose a route only at a lane center or when a wall blocks movement.
      // Re-routing in the middle of a corridor could wedge enemies on phones
      // where frame intervals are larger and less consistent.
      if (nearCenter || blocked) {
        enemy.x = center.x;
        enemy.y = center.y;
        enemy.direction = findNextDirection(
          cell,
          getEnemyTarget(enemy, playerCell),
          enemy.direction
        );
        enemy.pathCooldown = 0.14 + Math.random() * 0.12;
      }

      moveActor(enemy, enemy.direction, enemy.speed * dt);

      let movedDistance = Math.hypot(enemy.x - beforeX, enemy.y - beforeY);
      if (movedDistance < 0.05) {
        const stuckCell = toCell(enemy.x, enemy.y);
        const stuckCenter = centerOfCell(stuckCell.x, stuckCell.y);
        enemy.x = stuckCenter.x;
        enemy.y = stuckCenter.y;
        enemy.direction = findNextDirection(
          stuckCell,
          getEnemyTarget(enemy, playerCell),
          enemy.direction
        );
        moveActor(enemy, enemy.direction, Math.max(1.5, enemy.speed * dt));
        movedDistance = Math.hypot(enemy.x - stuckCenter.x, enemy.y - stuckCenter.y);
      }

      enemy.stuckTime = movedDistance < 0.05 ? (enemy.stuckTime || 0) + dt : 0;
      if (enemy.stuckTime > 0.35) {
        const stuckCell = toCell(enemy.x, enemy.y);
        const stuckCenter = centerOfCell(stuckCell.x, stuckCell.y);
        enemy.x = stuckCenter.x;
        enemy.y = stuckCenter.y;
        enemy.direction = findNextDirection(
          stuckCell,
          getEnemyTarget(enemy, playerCell),
          OPPOSITE[enemy.direction] || enemy.direction
        );
        enemy.pathCooldown = 0;
        enemy.stuckTime = 0;
      }
    }
  }'''
    text = replace_once(text, old_update, new_update, "robust enemy movement")

    text = replace_once(
        text,
        '''    const scatterWindow = state.clock > 10 && cycle > 18;''',
        '''    const scatterWindow = !MOBILE_RUNTIME.coarse && state.clock > 10 && cycle > 18;''',
        "mobile chase mode",
    )

    text = replace_once(
        text,
        '''    if (enemy.personality === 3 && distanceCells(toCell(enemy.x, enemy.y), playerCell) < 7) {
      return normalizeTargetCell(enemy.scatter);
    }''',
        '''    if (!MOBILE_RUNTIME.coarse
      && enemy.personality === 3
      && distanceCells(toCell(enemy.x, enemy.y), playerCell) < 7) {
      return normalizeTargetCell(enemy.scatter);
    }''',
        "mobile personality chase",
    )

    text = replace_once(
        text,
        '''    const displaySize = playerState.radius * theme.renderScale;''',
        '''    const mobileCharacterScale = MOBILE_RUNTIME.coarse ? 1.12 : 1;
    const displaySize = playerState.radius * theme.renderScale * mobileCharacterScale;''',
        "mobile player scale",
    )

    text = replace_once(
        text,
        '''    const displaySize = enemy.radius * GAME_THEME.enemies.renderScale * sizeVariation;''',
        '''    const mobileCharacterScale = MOBILE_RUNTIME.coarse ? 1.12 : 1;
    const displaySize = enemy.radius * GAME_THEME.enemies.renderScale * sizeVariation * mobileCharacterScale;''',
        "mobile enemy scale",
    )

    GAME.write_text(text, encoding="utf-8")


def patch_index() -> None:
    text = INDEX.read_text(encoding="utf-8")
    text = replace_once(
        text,
        '  <script src="mobile-camera-fit-runtime.js?v=20260621-6"></script>\n',
        '',
        "remove obsolete camera runtime",
    )
    text = replace_once(
        text,
        '  <script src="game.js?v=20260621-6"></script>',
        '  <script src="game.js?v=20260621-8"></script>',
        "bump game cache version",
    )
    INDEX.write_text(text, encoding="utf-8")


def main() -> None:
    patch_game()
    patch_index()
    print("Mobile enemy movement and character scale fix applied.")


if __name__ == "__main__":
    main()
