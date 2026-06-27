#!/usr/bin/env python3
"""Switch Nabatick to seamless vector assets and refresh game cache keys."""

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
    game = GAME.read_text(encoding="utf-8")
    game = replace_once(game, 'idle: "assets/nabatick-idle.png"', 'idle: "assets/nabatick-idle-v2.svg"', "idle asset")
    game = replace_once(game, 'eatPrepare: "assets/nabatick-eat-prepare.png"', 'eatPrepare: "assets/nabatick-eat-prepare-v2.svg"', "prepare asset")
    game = replace_once(game, 'eat: "assets/nabatick-eat.png"', 'eat: "assets/nabatick-eat-v2.svg"', "eat asset")
    GAME.write_text(game, encoding="utf-8")

    index = INDEX.read_text(encoding="utf-8")
    index = replace_once(index, 'href="assets/nabatick-idle.png"', 'href="assets/nabatick-idle-v2.svg"', "idle preload")
    index = replace_once(index, 'href="assets/nabatick-eat-prepare.png"', 'href="assets/nabatick-eat-prepare-v2.svg"', "prepare preload")
    index = replace_once(index, 'href="assets/nabatick-eat.png"', 'href="assets/nabatick-eat-v2.svg"', "eat preload")
    index = replace_once(index, 'src="assets/nabatick-idle.png"', 'src="assets/nabatick-idle-v2.svg"', "selector preview")
    index = replace_once(index, 'game.js?v=20260621-10', 'game.js?v=20260621-11', "game cache")
    INDEX.write_text(index, encoding="utf-8")

    print("Character visual fix applied.")


if __name__ == "__main__":
    main()
