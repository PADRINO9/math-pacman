#!/usr/bin/env python3
"""Tighten the phone portrait camera for better readability."""

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
        'zoom = window.innerWidth < 390 ? 1.78 : 1.66;',
        'zoom = window.innerWidth < 390 ? 2.0 : 1.88;',
        "phone portrait zoom",
    )
    text = replace_once(
        text,
        'zoom = window.innerHeight < 430 ? 1.34 : 1.25;',
        'zoom = window.innerHeight < 430 ? 1.42 : 1.32;',
        "phone landscape zoom",
    )
    text = replace_once(
        text,
        'zoom = portrait ? 1.1 : 1.06;',
        'zoom = portrait ? 1.15 : 1.08;',
        "tablet zoom",
    )
    GAME.write_text(text, encoding="utf-8")
    print("Phone camera refinement applied.")


if __name__ == "__main__":
    main()
