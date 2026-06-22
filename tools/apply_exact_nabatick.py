#!/usr/bin/env python3
"""Use only the exact Nabatick portrait cropped from the user-provided character sheet."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GAME = ROOT / "game.js"
INDEX = ROOT / "index.html"


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if new in text:
        return text
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected one occurrence, found {count}")
    return text.replace(old, new, 1)


def main() -> None:
    exact_asset = "assets/nabatick-selection-sheet.svg"

    game = GAME.read_text(encoding="utf-8")
    game = replace_once(game, 'idle: "assets/nabatick-idle-v2.svg"', f'idle: "{exact_asset}"', "idle sprite")
    game = replace_once(game, 'eatPrepare: "assets/nabatick-eat-prepare-v2.svg"', f'eatPrepare: "{exact_asset}"', "prepare sprite")
    game = replace_once(game, 'eat: "assets/nabatick-eat-v2.svg"', f'eat: "{exact_asset}"', "eat sprite")
    GAME.write_text(game, encoding="utf-8")

    index = INDEX.read_text(encoding="utf-8")
    index = replace_once(index, '<link rel="preload" href="assets/nabatick-idle-v2.svg" as="image">\n  <link rel="preload" href="assets/nabatick-eat-prepare-v2.svg" as="image">\n  <link rel="preload" href="assets/nabatick-eat-v2.svg" as="image">', '<link rel="preload" href="assets/nabatick-selection-sheet.svg" as="image">', "Nabatick preloads")
    index = replace_once(index, 'src="assets/nabatick-idle-v2.svg"', 'src="assets/nabatick-selection-sheet.svg"', "selection portrait")
    index = replace_once(index, 'game.js?v=20260621-11', 'game.js?v=20260622-12', "game cache key")
    INDEX.write_text(index, encoding="utf-8")

    print("Exact Nabatick character-sheet asset applied to all player states.")


if __name__ == "__main__":
    main()
