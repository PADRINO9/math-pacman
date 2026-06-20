#!/usr/bin/env python3
"""Apply the mobile/tablet upgrade to the current Math Maze sources.

The script is deliberately marker-based and fails loudly when the expected
source structure changes. It is safe to run more than once.
"""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
STYLES = ROOT / "styles.css"
GAME = ROOT / "game.js"


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if new in text:
        return text
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected one marker, found {count}")
    return text.replace(old, new, 1)


def patch_index() -> None:
    text = INDEX.read_text(encoding="utf-8")

    text = replace_once(
        text,
        '  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">',
        '''  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1.0">\n  <meta name="theme-color" content="#05070b">\n  <meta name="mobile-web-app-capable" content="yes">\n  <meta name="apple-mobile-web-app-capable" content="yes">\n  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n  <meta name="format-detection" content="telephone=no">''',
        "mobile viewport metadata",
    )

    text = replace_once(
        text,
        '  <link rel="stylesheet" href="styles.css?v=20260619-5">',
        '''  <link rel="stylesheet" href="styles.css?v=20260619-6">\n  <link rel="stylesheet" href="mobile-enhancements.css?v=20260621-1">''',
        "mobile stylesheet",
    )

    replacements = {
        '<div class="metric">\n          <span class="metric-label">תשובות</span>': '<div class="metric metric-answers">\n          <span class="metric-label">תשובות</span>',
        '<div class="metric">\n          <span class="metric-label">שלב</span>': '<div class="metric metric-level">\n          <span class="metric-label">שלב</span>',
        '<div class="metric">\n          <span class="metric-label">ניקוד</span>': '<div class="metric metric-score">\n          <span class="metric-label">ניקוד</span>',
        '<div class="metric">\n          <span class="metric-label">רצף</span>': '<div class="metric metric-combo">\n          <span class="metric-label">רצף</span>',
    }
    for old, new in replacements.items():
        text = replace_once(text, old, new, f"HUD class {new}")

    text = replace_once(
        text,
        '  <script src="game.js?v=20260619-4"></script>',
        '''  <script src="mobile-enhancements.js?v=20260621-1"></script>\n  <script src="game.js?v=20260621-1"></script>''',
        "mobile runtime script",
    )

    INDEX.write_text(text, encoding="utf-8")


def patch_styles() -> None:
    text = STYLES.read_text(encoding="utf-8")
    marker = "/* Mobile runtime integration */"
    if marker in text:
        return

    text += '''\n\n/* Mobile runtime integration */\nhtml[data-game-viewport="phone-portrait"] #game-canvas,\nhtml[data-game-viewport="phone-landscape"] #game-canvas,\nhtml[data-game-viewport="tablet"] #game-canvas {\n  will-change: contents;\n}\n\n@media (pointer: coarse) {\n  .metric,\n  .icon-button,\n  .dialog-inner,\n  .screen-panel,\n  .difficulty-options span,\n  .primary-button {\n    border-radius: 12px;\n  }\n}\n'''
    STYLES.write_text(text, encoding="utf-8")


def patch_game() -> None:
    text = GAME.read_text(encoding="utf-8")

    text = replace_once(
        text,
        "  const ROWS = HEIGHT / TILE;\n",
        '''  const ROWS = HEIGHT / TILE;\n  const MOBILE_RUNTIME = {\n    coarse: false,\n    mode: "desktop",\n    zoom: 1,\n    reducedEffects: false\n  };\n  const CAMERA = {\n    x: WIDTH / 2,\n    y: HEIGHT / 2,\n    zoom: 1\n  };\n''',
        "mobile runtime constants",
    )

    old_resize = '''  function resizeCanvas() {\n    const ratio = Math.min(window.devicePixelRatio || 1, 2);\n    canvas.width = Math.round(WIDTH * ratio);\n    canvas.height = Math.round(HEIGHT * ratio);\n    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);\n  }\n'''
    new_resize = '''  function resizeCanvas() {\n    updateViewportProfile();\n    const rect = canvas.getBoundingClientRect();\n    const ratioLimit = MOBILE_RUNTIME.reducedEffects ? 1.5 : 2;\n    const ratio = Math.min(window.devicePixelRatio || 1, ratioLimit);\n    const cssWidth = Math.max(1, rect.width || WIDTH);\n    const cssHeight = Math.max(1, rect.height || HEIGHT);\n    const pixelWidth = Math.max(1, Math.round(cssWidth * ratio));\n    const pixelHeight = Math.max(1, Math.round(cssHeight * ratio));\n\n    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {\n      canvas.width = pixelWidth;\n      canvas.height = pixelHeight;\n    }\n\n    ctx.setTransform(pixelWidth / WIDTH, 0, 0, pixelHeight / HEIGHT, 0, 0);\n    ctx.imageSmoothingEnabled = true;\n    ctx.imageSmoothingQuality = MOBILE_RUNTIME.reducedEffects ? "medium" : "high";\n  }\n\n  function updateViewportProfile() {\n    const coarse = window.matchMedia("(hover: none), (pointer: coarse)").matches;\n    const portrait = window.innerHeight >= window.innerWidth;\n    let mode = "desktop";\n    let zoom = 1;\n\n    if (coarse && portrait && window.innerWidth <= 600) {\n      mode = "phone-portrait";\n      zoom = window.innerWidth < 390 ? 1.78 : 1.66;\n    } else if (coarse && !portrait && window.innerHeight <= 700) {\n      mode = "phone-landscape";\n      zoom = window.innerHeight < 430 ? 1.34 : 1.25;\n    } else if (coarse) {\n      mode = "tablet";\n      zoom = portrait ? 1.1 : 1.06;\n    }\n\n    MOBILE_RUNTIME.coarse = coarse;\n    MOBILE_RUNTIME.mode = mode;\n    MOBILE_RUNTIME.zoom = zoom;\n    MOBILE_RUNTIME.reducedEffects = coarse && (window.innerWidth < 900 || window.devicePixelRatio > 2);\n    document.documentElement.dataset.gameViewport = mode;\n    document.documentElement.classList.toggle("mobile-low-effects", MOBILE_RUNTIME.reducedEffects);\n  }\n\n  function updateCamera(dt) {\n    const targetZoom = MOBILE_RUNTIME.zoom;\n    const zoomEase = dt > 0 ? 1 - Math.exp(-dt * 10) : 1;\n    CAMERA.zoom += (targetZoom - CAMERA.zoom) * zoomEase;\n\n    const player = state.player;\n    const targetX = player?.x ?? WIDTH / 2;\n    const targetY = player?.y ?? HEIGHT / 2;\n    const visibleWidth = WIDTH / CAMERA.zoom;\n    const visibleHeight = HEIGHT / CAMERA.zoom;\n    const minX = visibleWidth / 2;\n    const maxX = WIDTH - visibleWidth / 2;\n    const minY = visibleHeight / 2;\n    const maxY = HEIGHT - visibleHeight / 2;\n    const clampedX = clamp(targetX, Math.min(minX, maxX), Math.max(minX, maxX));\n    const clampedY = clamp(targetY, Math.min(minY, maxY), Math.max(minY, maxY));\n    const followEase = dt > 0 ? 1 - Math.exp(-dt * 7.5) : 1;\n\n    CAMERA.x += (clampedX - CAMERA.x) * followEase;\n    CAMERA.y += (clampedY - CAMERA.y) * followEase;\n  }\n\n  function applyCameraTransform(renderContext) {\n    if (CAMERA.zoom <= 1.001) {\n      return;\n    }\n    renderContext.translate(WIDTH / 2, HEIGHT / 2);\n    renderContext.scale(CAMERA.zoom, CAMERA.zoom);\n    renderContext.translate(-CAMERA.x, -CAMERA.y);\n  }\n'''
    text = replace_once(text, old_resize, new_resize, "responsive canvas and camera")

    text = replace_once(
        text,
        '''  function update(dt) {\n    state.clock += dt;\n    state.shake = Math.max(0, state.shake - dt);\n''',
        '''  function update(dt) {\n    state.clock += dt;\n    state.shake = Math.max(0, state.shake - dt);\n    updateCamera(dt);\n''',
        "camera update",
    )

    old_render = '''  function render() {\n    ctx.save();\n    ctx.clearRect(0, 0, WIDTH, HEIGHT);\n\n    if (state.shake > 0) {\n      const amount = state.shake * 12;\n      ctx.translate((Math.random() - 0.5) * amount, (Math.random() - 0.5) * amount);\n    }\n\n    drawBackdrop();\n    drawMaze();\n    drawCollectibles();\n    drawPlayerCharacter(ctx, state.player);\n    drawEnemies();\n    drawParticles();\n    drawFloatingTexts();\n    drawLevelBanner();\n\n    if (state.phase === "paused") {\n      drawPaused();\n    }\n\n    ctx.restore();\n  }\n'''
    new_render = '''  function render() {\n    ctx.clearRect(0, 0, WIDTH, HEIGHT);\n\n    ctx.save();\n    if (state.shake > 0) {\n      const amount = state.shake * 12;\n      ctx.translate((Math.random() - 0.5) * amount, (Math.random() - 0.5) * amount);\n    }\n    applyCameraTransform(ctx);\n    drawBackdrop();\n    drawMaze();\n    drawCollectibles();\n    drawPlayerCharacter(ctx, state.player);\n    drawEnemies();\n    drawParticles();\n    drawFloatingTexts();\n    ctx.restore();\n\n    drawLevelBanner();\n    if (state.phase === "paused") {\n      drawPaused();\n    }\n  }\n'''
    text = replace_once(text, old_render, new_render, "camera-aware render")

    text = replace_once(
        text,
        "    state.backdropStars = Array.from({ length: 90 }, (_, index) => ({",
        "    state.backdropStars = Array.from({ length: MOBILE_RUNTIME.reducedEffects ? 42 : 90 }, (_, index) => ({",
        "mobile backdrop density",
    )

    text = replace_once(
        text,
        '''    for (const star of state.backdropStars) {\n      drawLevelDecoration(star, level);\n    }''',
        '''    const decorationStep = MOBILE_RUNTIME.reducedEffects ? 2 : 1;\n    for (let index = 0; index < state.backdropStars.length; index += decorationStep) {\n      drawLevelDecoration(state.backdropStars[index], level);\n    }''',
        "mobile decoration density",
    )

    text = replace_once(
        text,
        '''  function drawMaze() {\n    const level = getCurrentLevel();\n    ctx.save();\n    ctx.shadowColor = level.wallGlow || "rgba(66, 217, 255, 0.65)";\n    ctx.shadowBlur = 14;''',
        '''  function drawMaze() {\n    const level = getCurrentLevel();\n    ctx.save();\n    ctx.shadowColor = level.wallGlow || "rgba(66, 217, 255, 0.65)";\n    ctx.shadowBlur = MOBILE_RUNTIME.reducedEffects ? 6 : 14;''',
        "mobile wall glow",
    )

    text = replace_once(
        text,
        "    for (let index = 0; index < playerState.trail.length; index += 3) {",
        "    for (let index = 0; index < playerState.trail.length; index += MOBILE_RUNTIME.reducedEffects ? 6 : 3) {",
        "mobile trail density",
    )

    text = replace_once(
        text,
        "    renderContext.shadowBlur = 15;",
        "    renderContext.shadowBlur = MOBILE_RUNTIME.reducedEffects ? 7 : 15;",
        "mobile enemy glow",
    )

    text = replace_once(
        text,
        '''  function addBurst(x, y, color, count, speed) {\n    for (let i = 0; i < count; i += 1) {''',
        '''  function addBurst(x, y, color, count, speed) {\n    const effectiveCount = MOBILE_RUNTIME.reducedEffects ? Math.max(3, Math.ceil(count * 0.45)) : count;\n    for (let i = 0; i < effectiveCount; i += 1) {''',
        "mobile particle density",
    )

    text = replace_once(
        text,
        '''  window.addEventListener("resize", resizeCanvas);\n  window.addEventListener("blur", () => {''',
        '''  window.addEventListener("resize", resizeCanvas, { passive: true });\n  window.addEventListener("orientationchange", () => window.setTimeout(resizeCanvas, 120), { passive: true });\n  window.visualViewport?.addEventListener("resize", resizeCanvas, { passive: true });\n  if (typeof ResizeObserver !== "undefined") {\n    new ResizeObserver(resizeCanvas).observe(stage);\n  }\n  window.addEventListener("blur", () => {''',
        "mobile resize observers",
    )

    GAME.write_text(text, encoding="utf-8")


def main() -> None:
    patch_index()
    patch_styles()
    patch_game()
    print("Mobile upgrade applied successfully.")


if __name__ == "__main__":
    main()
