#!/usr/bin/env python3
"""Reduce the mobile camera zoom to a balanced, readable level."""

from pathlib import Path

GAME = Path(__file__).resolve().parents[1] / "game.js"


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if new in text:
        return text
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected one marker, found {count}")
    return text.replace(old, new, 1)


def main() -> None:
    text = GAME.read_text(encoding="utf-8")
    text = replace_once(
        text,
        'zoom = window.innerWidth < 390 ? 2.0 : 1.88;',
        'zoom = window.innerWidth < 390 ? 1.32 : 1.26;',
        "phone portrait zoom",
    )
    text = replace_once(
        text,
        'zoom = window.innerHeight < 430 ? 1.42 : 1.32;',
        'zoom = window.innerHeight < 430 ? 1.18 : 1.12;',
        "phone landscape zoom",
    )
    text = replace_once(
        text,
        'zoom = portrait ? 1.15 : 1.08;',
        'zoom = portrait ? 1.06 : 1.03;',
        "tablet zoom",
    )
    GAME.write_text(text, encoding="utf-8")
    print("Balanced mobile camera zoom applied.")


if __name__ == "__main__":
    main()
