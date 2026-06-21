#!/usr/bin/env python3
"""Add two-character selection and wire both animated sprite sets into Math Maze."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
GAME = ROOT / "game.js"


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if new and new in text:
        return text
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected one marker, found {count}")
    return text.replace(old, new, 1)


def patch_index() -> None:
    text = INDEX.read_text(encoding="utf-8")

    text = replace_once(
        text,
        '''  <link rel="preload" href="assets/bifly-eat.png" as="image">
  <link rel="preload" href="assets/dark-enemy.png" as="image">''',
        '''  <link rel="preload" href="assets/bifly-eat.png" as="image">
  <link rel="preload" href="assets/nabatick-idle.png" as="image">
  <link rel="preload" href="assets/nabatick-eat-prepare.png" as="image">
  <link rel="preload" href="assets/nabatick-eat.png" as="image">
  <link rel="preload" href="assets/dark-enemy.png" as="image">''',
        "Nabatick image preloads",
    )

    text = replace_once(
        text,
        '''  <link rel="stylesheet" href="mobile-final-layout.css?v=20260621-7">
</head>''',
        '''  <link rel="stylesheet" href="mobile-final-layout.css?v=20260621-7">
  <link rel="stylesheet" href="character-selector.css?v=20260621-1">
</head>''',
        "character selector stylesheet",
    )

    text = replace_once(
        text,
        '''              <p id="name-error" class="form-note" aria-live="assertive"></p>
              <fieldset class="difficulty-field">''',
        '''              <p id="name-error" class="form-note" aria-live="assertive"></p>
              <fieldset class="character-field">
                <legend>בחרו דמות</legend>
                <div class="character-options" role="radiogroup" aria-label="בחירת דמות">
                  <label class="character-option">
                    <input type="radio" name="character" value="bifly" checked>
                    <span class="character-card">
                      <img src="assets/bifly-player.png" alt="" aria-hidden="true">
                      <span class="character-copy">
                        <strong>ביפלי</strong>
                        <small>הגיבור הכחול</small>
                      </span>
                      <span class="character-check" aria-hidden="true">✓</span>
                    </span>
                  </label>
                  <label class="character-option">
                    <input type="radio" name="character" value="nabatick">
                    <span class="character-card">
                      <img src="assets/nabatick-idle.png" alt="" aria-hidden="true">
                      <span class="character-copy">
                        <strong>נבטיק</strong>
                        <small>גיבור הנבט הירוק</small>
                      </span>
                      <span class="character-check" aria-hidden="true">✓</span>
                    </span>
                  </label>
                </div>
              </fieldset>
              <fieldset class="difficulty-field">''',
        "character selector markup",
    )

    text = replace_once(
        text,
        '  <script src="game.js?v=20260621-9"></script>',
        '  <script src="game.js?v=20260621-10"></script>',
        "game cache version",
    )

    INDEX.write_text(text, encoding="utf-8")


def patch_game() -> None:
    text = GAME.read_text(encoding="utf-8")

    text = replace_once(
        text,
        '''  const GAME_THEME = {
    title: "Math Maze",
    hebrewTitle: "מבוך הכפל",
    player: {
      name: "Bifly",
      spriteSources: {
        idle: "assets/bifly-player.png",
        eatPrepare: "assets/bifly-eat-prepare.png",
        eat: "assets/bifly-eat.png"
      },
      renderScale: 2.55,
      eatAnimationDuration: 0.34,
      primaryColor: "#35c9b8",
      secondaryColor: "#0f776f",
      detailColor: "#ecfffc",
      trailColor: "53, 201, 184",
      glowColor: "rgba(53, 201, 184, 0.58)"
    },''',
        '''  const PLAYER_CHARACTERS = {
    bifly: {
      id: "bifly",
      name: "ביפלי",
      spriteSources: {
        idle: "assets/bifly-player.png",
        eatPrepare: "assets/bifly-eat-prepare.png",
        eat: "assets/bifly-eat.png"
      },
      renderScale: 2.55,
      eatAnimationDuration: 0.34,
      primaryColor: "#35c9b8",
      secondaryColor: "#0f776f",
      detailColor: "#ecfffc",
      trailColor: "53, 201, 184",
      glowColor: "rgba(53, 201, 184, 0.58)"
    },
    nabatick: {
      id: "nabatick",
      name: "נבטיק",
      spriteSources: {
        idle: "assets/nabatick-idle.png",
        eatPrepare: "assets/nabatick-eat-prepare.png",
        eat: "assets/nabatick-eat.png"
      },
      renderScale: 2.65,
      eatAnimationDuration: 0.34,
      primaryColor: "#a9e629",
      secondaryColor: "#4f8c0c",
      detailColor: "#fff8cf",
      trailColor: "173, 230, 44",
      glowColor: "rgba(171, 240, 35, 0.62)"
    }
  };

  const GAME_THEME = {
    title: "Math Maze",
    hebrewTitle: "מבוך הכפל",
    player: PLAYER_CHARACTERS.bifly,''',
        "player character registry",
    )

    text = replace_once(
        text,
        '''  const GAME_ASSETS = {
    player: {
      idle: new Image(),
      eatPrepare: new Image(),
      eat: new Image()
    },
    enemies: {
      idle: new Image(),
      angry: new Image(),
      surprised: new Image(),
      sad: new Image()
    }
  };
  for (const [name, image] of Object.entries(GAME_ASSETS.player)) {
    image.decoding = "async";
    image.src = GAME_THEME.player.spriteSources[name];
  }
  for (const [name, image] of Object.entries(GAME_ASSETS.enemies)) {''',
        '''  const GAME_ASSETS = {
    players: Object.fromEntries(Object.keys(PLAYER_CHARACTERS).map((characterId) => [
      characterId,
      {
        idle: new Image(),
        eatPrepare: new Image(),
        eat: new Image()
      }
    ])),
    enemies: {
      idle: new Image(),
      angry: new Image(),
      surprised: new Image(),
      sad: new Image()
    }
  };
  for (const [characterId, characterAssets] of Object.entries(GAME_ASSETS.players)) {
    const characterTheme = PLAYER_CHARACTERS[characterId];
    for (const [name, image] of Object.entries(characterAssets)) {
      image.decoding = "async";
      image.src = characterTheme.spriteSources[name];
    }
  }
  for (const [name, image] of Object.entries(GAME_ASSETS.enemies)) {''',
        "multi-character assets",
    )

    text = replace_once(
        text,
        '''      difficulty: "mathMazeDifficulty",
      timeLimit: "mathMazeTimeLimit",''',
        '''      difficulty: "mathMazeDifficulty",
      character: "mathMazeCharacter",
      timeLimit: "mathMazeTimeLimit",''',
        "character storage key",
    )

    text = replace_once(
        text,
        '''    playerNameInput: document.getElementById("player-name-input"),
    difficultyInputs: Array.from(document.querySelectorAll("input[name='difficulty']")),''',
        '''    playerNameInput: document.getElementById("player-name-input"),
    characterInputs: Array.from(document.querySelectorAll("input[name='character']")),
    difficultyInputs: Array.from(document.querySelectorAll("input[name='difficulty']")),''',
        "character input elements",
    )

    text = replace_once(
        text,
        '''  function normalizeDifficulty(value) {
    const mappedValue = LEGACY_DIFFICULTY_MAP[value] || value;
    return Object.prototype.hasOwnProperty.call(CONFIG.difficulty, mappedValue) ? mappedValue : "medium";
  }

  function getDifficultySettings() {''',
        '''  function normalizeDifficulty(value) {
    const mappedValue = LEGACY_DIFFICULTY_MAP[value] || value;
    return Object.prototype.hasOwnProperty.call(CONFIG.difficulty, mappedValue) ? mappedValue : "medium";
  }

  function normalizeCharacterId(value) {
    return Object.prototype.hasOwnProperty.call(PLAYER_CHARACTERS, value) ? value : "bifly";
  }

  function getPlayerTheme() {
    return PLAYER_CHARACTERS[state.characterId] || PLAYER_CHARACTERS.bifly;
  }

  function getPlayerAssets() {
    return GAME_ASSETS.players[state.characterId] || GAME_ASSETS.players.bifly;
  }

  function getDifficultySettings() {''',
        "character helpers",
    )

    text = replace_once(
        text,
        '''    playerName: "",
    difficulty: normalizeDifficulty(storage.getMigrated(''',
        '''    playerName: "",
    characterId: normalizeCharacterId(storage.get(CONFIG.storageKeys.character, "bifly")),
    difficulty: normalizeDifficulty(storage.getMigrated(''',
        "character state",
    )

    text = replace_once(
        text,
        '''  function getSelectedDifficulty() {
    const selected = els.difficultyInputs.find((input) => input.checked);
    return normalizeDifficulty(selected?.value || state.difficulty);
  }

  function setDifficulty(value, persist = true) {''',
        '''  function getSelectedCharacterId() {
    const selected = els.characterInputs.find((input) => input.checked);
    return normalizeCharacterId(selected?.value || state.characterId);
  }

  function setCharacter(value, persist = true) {
    state.characterId = normalizeCharacterId(value);
    if (persist) {
      storage.set(CONFIG.storageKeys.character, state.characterId);
    }
    document.documentElement.dataset.character = state.characterId;
    syncCharacterInputs();
  }

  function syncCharacterInputs() {
    for (const input of els.characterInputs) {
      input.checked = input.value === state.characterId;
    }
  }

  function getSelectedDifficulty() {
    const selected = els.difficultyInputs.find((input) => input.checked);
    return normalizeDifficulty(selected?.value || state.difficulty);
  }

  function setDifficulty(value, persist = true) {''',
        "character selection functions",
    )

    text = replace_once(
        text,
        '''    state.playerName = playerName;
    setDifficulty(getSelectedDifficulty());''',
        '''    state.playerName = playerName;
    setCharacter(getSelectedCharacterId());
    setDifficulty(getSelectedDifficulty());''',
        "apply character on start",
    )

    text = replace_once(
        text,
        '''    els.pause.textContent = "Ⅱ";
    syncDifficultyInputs();
    syncTimeLimitToggle();''',
        '''    els.pause.textContent = "Ⅱ";
    syncCharacterInputs();
    syncDifficultyInputs();
    syncTimeLimitToggle();''',
        "sync character on start screen",
    )

    text = replace_once(
        text,
        '''    const theme = GAME_THEME.player;
    const animation = getPlayerAnimationFrame(playerState);
    const sprite = GAME_ASSETS.player[animation.frame] || GAME_ASSETS.player.idle;''',
        '''    const theme = getPlayerTheme();
    const playerAssets = getPlayerAssets();
    const animation = getPlayerAnimationFrame(playerState);
    const sprite = playerAssets[animation.frame] || playerAssets.idle;''',
        "selected player draw assets",
    )

    text = replace_once(
        text,
        '''      if (isImageReady(GAME_ASSETS.player.idle)) {
        renderContext.drawImage(
          GAME_ASSETS.player.idle,''',
        '''      if (isImageReady(playerAssets.idle)) {
        renderContext.drawImage(
          playerAssets.idle,''',
        "selected player trail",
    )

    text = replace_once(
        text,
        '''    const duration = GAME_THEME.player.eatAnimationDuration;''',
        '''    const duration = getPlayerTheme().eatAnimationDuration;''',
        "selected player animation duration",
    )

    text = replace_once(
        text,
        '''  els.difficultyInputs.forEach((input) => {
    input.addEventListener("change", () => setDifficulty(input.value));
  });''',
        '''  els.characterInputs.forEach((input) => {
    input.addEventListener("change", () => setCharacter(input.value));
  });
  els.difficultyInputs.forEach((input) => {
    input.addEventListener("change", () => setDifficulty(input.value));
  });''',
        "character change listeners",
    )

    text = replace_once(
        text,
        '''  resizeCanvas();
  syncDifficultyInputs();
  syncTimeLimitToggle();''',
        '''  resizeCanvas();
  setCharacter(state.characterId, false);
  syncDifficultyInputs();
  syncTimeLimitToggle();''',
        "initialize selected character",
    )

    GAME.write_text(text, encoding="utf-8")


def main() -> None:
    patch_index()
    patch_game()
    print("Character selection applied successfully.")


if __name__ == "__main__":
    main()
