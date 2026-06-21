#!/usr/bin/env python3
"""Fix the enemy center-lock bug and make mobile enemies pursue the player directly."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GAME = ROOT / "game.js"
INDEX = ROOT / "index.html"


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if new in text:
        return text
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected one marker, found {count}")
    return text.replace(old, new, 1)


def main() -> None:
    game = GAME.read_text(encoding="utf-8")

    game = replace_once(
        game,
        '''      if (nearCenter || blocked) {
        enemy.x = center.x;
        enemy.y = center.y;
        enemy.direction = findNextDirection(
          cell,
          getEnemyTarget(enemy, playerCell),
          enemy.direction
        );
        enemy.pathCooldown = 0.14 + Math.random() * 0.12;
      }''',
        '''      // Do not snap back to the same cell center on every animation frame.
      // On phones an enemy moves only about 1-2 logical pixels per frame, so the
      // old unconditional nearCenter branch continuously reset its position and
      // made it look frozen. The cooldown now lets it leave the intersection.
      if (blocked || (nearCenter && enemy.pathCooldown <= 0)) {
        enemy.x = center.x;
        enemy.y = center.y;
        enemy.direction = findNextDirection(
          cell,
          getEnemyTarget(enemy, playerCell),
          enemy.direction
        );
        enemy.pathCooldown = Math.max(0.12, (TILE * 0.55) / Math.max(enemy.speed, 1));
      }''',
        "enemy center-lock fix",
    )

    game = replace_once(
        game,
        '''  function getEnemyTarget(enemy, playerCell) {
    const player = state.player;
    const playerDir = DIRS[player.direction] || DIRS.right;
    const cycle = state.clock % 24;''',
        '''  function getEnemyTarget(enemy, playerCell) {
    const player = state.player;

    // Touch devices use a clear, direct pursuit model so every black enemy
    // visibly hunts the main character instead of appearing to wander.
    if (MOBILE_RUNTIME.coarse) {
      return normalizeTargetCell(playerCell);
    }

    const playerDir = DIRS[player.direction] || DIRS.right;
    const cycle = state.clock % 24;''',
        "direct mobile pursuit target",
    )

    game = replace_once(
        game,
        '''    const withoutReverse = options.filter((dir) => dir !== OPPOSITE[currentDirection]);
    const firstMoves = shuffle(withoutReverse.length > 0 ? withoutReverse : options);''',
        '''    const withoutReverse = options.filter((dir) => dir !== OPPOSITE[currentDirection]);
    const candidateMoves = MOBILE_RUNTIME.coarse
      ? options
      : (withoutReverse.length > 0 ? withoutReverse : options);
    const firstMoves = MOBILE_RUNTIME.coarse ? candidateMoves : shuffle(candidateMoves);''',
        "allow shortest-path reversal on mobile",
    )

    GAME.write_text(game, encoding="utf-8")

    index = INDEX.read_text(encoding="utf-8")
    index = replace_once(
        index,
        '  <script src="game.js?v=20260621-8"></script>',
        '  <script src="game.js?v=20260621-9"></script>',
        "game cache version",
    )
    INDEX.write_text(index, encoding="utf-8")

    print("Mobile enemy center-lock and direct pursuit fixes applied.")


if __name__ == "__main__":
    main()

# Workflow trigger: center-lock hotfix rerun.
