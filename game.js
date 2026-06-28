(() => {
  "use strict";

  const SYSTEMS = window.KaflulSystems;
  if (!SYSTEMS) {
    throw new Error("KaflulSystems failed to load");
  }

  const WIDTH = 960;
  const HEIGHT = 720;
  const TILE = 24;
  const COLS = WIDTH / TILE;
  const ROWS = HEIGHT / TILE;
  const MOBILE_RUNTIME = {
    coarse: false,
    mode: "desktop",
    zoom: 1,
    reducedEffects: false
  };
  const CAMERA = {
    x: WIDTH / 2,
    y: HEIGHT / 2,
    zoom: 1
  };
  const PLAYER_START = { x: 2, y: 2 };
  const CENTER_CELL = { x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) };

  const PLAYER_CHARACTERS = {
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
        idle: "assets/nabatick-idle-reference.png",
        eatPrepare: "assets/nabatick-eat-prepare-reference.png",
        eat: "assets/nabatick-eat-reference.png"
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
    player: PLAYER_CHARACTERS.bifly,
    enemies: {
      spriteSources: {
        idle: "assets/dark-enemy.png",
        angry: "assets/dark-enemy-angry.png",
        surprised: "assets/dark-enemy-surprised.png",
        sad: "assets/dark-enemy-sad.png"
      },
      renderScale: 3.05,
      outlineColor: "rgba(255, 255, 255, 0.64)",
      detailColor: "rgba(255, 255, 255, 0.72)",
      palettes: [
        ["#7b68a6", "#628b72", "#8c7d5b", "#546b92", "#6f7f4f"],
        ["#786b98", "#6e835c", "#8d7761", "#536f78", "#71658a"],
        ["#7f7258", "#668075", "#776792", "#8a805f", "#5f7288"],
        ["#68598d", "#58786a", "#827252", "#586987", "#758158"]
      ]
    },
    collectibles: {
      regularShape: "diamond",
      bonusShape: "plus"
    }
  };

  const GAME_ASSETS = {
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
  for (const [name, image] of Object.entries(GAME_ASSETS.enemies)) {
    image.decoding = "async";
    image.src = GAME_THEME.enemies.spriteSources[name];
  }

  const CONFIG = {
    targetCorrect: 100,
    answersPerLevel: 25,
    initialLives: 3,
    minEnemies: 10,
    missionBonus: 420,
    adaptiveQuestionChance: 0.3,
    recentQuestionMemory: 3,
    questionTimeLimit: 25,
    questionFeedbackDelay: {
      correct: 650,
      wrong: 900
    },
    speed: {
      player: 184,
      enemyBase: 108,
      enemyTierEveryAnswers: 6,
      enemyTierStep: 3,
      enemyTierMax: 42,
      enemyIndexStep: 5
    },
    storageKeys: {
      save: SYSTEMS.SAVE_KEY,
      bestScore: "mathMazeBest",
      sound: "mathMazeSound",
      difficulty: "mathMazeDifficulty",
      character: "mathMazeCharacter",
      mode: "mathMazeMode",
      nickname: "mathMazeNickname",
      playerId: "mathMazePlayerId",
      timeLimit: "mathMazeTimeLimit",
      factStats: "mathMazeFactStats"
    },
    legacyStorageKeys: {
      bestScore: "mathPacmanBest",
      sound: "mathPacmanSound",
      difficulty: "mathPacmanDifficulty",
      timeLimit: "mathPacmanTimeLimit",
      factStats: "mathPacmanFactStats"
    },
    difficulty: SYSTEMS.DIFFICULTIES,
    levels: [
      {
        name: "עולם הקרח",
        shortName: "קרח",
        intro: "שלב 1: עולם הקרח",
        enemyVisualStyle: "ice",
        decor: "snow",
        enemyCountBonus: 0,
        enemySpeedMultiplier: 1,
        wallStops: ["#0d5d9c", "#52dff7", "#d7fbff"],
        backgroundStops: ["#06131f", "#0b2a3d", "#04101d"],
        gridColor: "rgba(170, 244, 255, 0.1)",
        wallGlow: "rgba(146, 240, 255, 0.72)",
        wallStroke: "rgba(232, 253, 255, 0.38)",
        collectibleColor: "#e9fdff",
        bonusCollectibleColor: "#9ef7ff",
        accent: "#9ef7ff",
        decorRgb: "224, 253, 255",
        enemyColors: GAME_THEME.enemies.palettes[0]
      },
      {
        name: "עולם הלבה",
        shortName: "לבה",
        intro: "שלב 2: עולם הלבה",
        enemyVisualStyle: "lava",
        decor: "embers",
        enemyCountBonus: 1,
        enemySpeedMultiplier: 1.08,
        wallStops: ["#7f1d14", "#f97316", "#ffd166"],
        backgroundStops: ["#160506", "#3a0d09", "#090305"],
        gridColor: "rgba(255, 145, 77, 0.1)",
        wallGlow: "rgba(255, 111, 55, 0.78)",
        wallStroke: "rgba(255, 231, 170, 0.34)",
        collectibleColor: "#fff2cf",
        bonusCollectibleColor: "#ff9f1c",
        accent: "#ffb340",
        decorRgb: "255, 144, 66",
        enemyColors: GAME_THEME.enemies.palettes[1]
      },
      {
        name: "עולם העתיקות",
        shortName: "עתיקות",
        intro: "שלב 3: עולם העתיקות",
        enemyVisualStyle: "ancient",
        decor: "runes",
        enemyCountBonus: 2,
        enemySpeedMultiplier: 1.16,
        wallStops: ["#6b5734", "#c2a36a", "#1fb6a6"],
        backgroundStops: ["#100d08", "#241b0e", "#071714"],
        gridColor: "rgba(230, 198, 128, 0.09)",
        wallGlow: "rgba(230, 198, 128, 0.58)",
        wallStroke: "rgba(255, 240, 196, 0.3)",
        collectibleColor: "#ffe8a3",
        bonusCollectibleColor: "#27e0c3",
        accent: "#27e0c3",
        decorRgb: "230, 198, 128",
        enemyColors: GAME_THEME.enemies.palettes[2]
      },
      {
        name: "עולם היהלומים",
        shortName: "יהלומים",
        intro: "שלב 4: עולם היהלומים",
        enemyVisualStyle: "diamond",
        decor: "diamonds",
        enemyCountBonus: 3,
        enemySpeedMultiplier: 1.25,
        wallStops: ["#1836a3", "#55ffd6", "#ff5fd7"],
        backgroundStops: ["#050817", "#101b45", "#070611"],
        gridColor: "rgba(122, 255, 231, 0.1)",
        wallGlow: "rgba(85, 255, 214, 0.7)",
        wallStroke: "rgba(255, 255, 255, 0.36)",
        collectibleColor: "#f8ffff",
        bonusCollectibleColor: "#ff5fd7",
        accent: "#55ffd6",
        decorRgb: "143, 255, 239",
        enemyColors: GAME_THEME.enemies.palettes[3]
      }
    ],
    missions: [
      { type: "correct", target: 10, label: "ענה נכון על 10 שאלות" },
      { type: "combo", target: 5, label: "צבור רצף של 5" },
      { type: "score", target: 200, label: "אסוף 200 נקודות" },
      { type: "safeCorrect", target: 3, label: "ענה נכון על 3 שאלות בלי לאבד חיים" },
      { type: "enemies", target: 5, label: "נצח 5 יריבים" }
    ],
    positiveFeedback: ["נכון!", "מעולה!", "יפה מאוד!", "אלוף!", "בול!", "איזה רצף!", "עבודה חכמה!"],
    supportFeedback: [
      "לא נורא, מתקדמים. התשובה היא {answer}",
      "כמעט! התשובה היא {answer}",
      "טעות קטנה, הראש עובד. התשובה היא {answer}",
      "נשימה ולנסות שוב. התשובה היא {answer}",
      "זה חלק מהאימון. התשובה היא {answer}"
    ],
    leaderboard: {
      endpoint: "/api/champions",
      limit: 50,
      minimumCorrectAnswers: 25,
      requestTimeoutMs: 6000
    }
  };

  const DIRS = {
    none: { x: 0, y: 0 },
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
  };

  const DIR_NAMES = ["up", "down", "left", "right"];
  const OPPOSITE = { up: "down", down: "up", left: "right", right: "left", none: "none" };
  const INPUT_BUFFER_SECONDS = 0.7;
  const TURN_LOOKAHEAD = 7.5;
  const TURN_SNAP_DISTANCE = 8.5;
  const JOYSTICK_DEADZONE = 12;
  const NON_EASY_FACTORS = [3, 4, 5, 6, 7, 8, 9];
  const LEGACY_DIFFICULTY_MAP = {
    easy: "beginner",
    medium: "normal",
    hard: "advanced",
    veryHard: "expert",
    impossible: "expert"
  };
  const LTR_ISOLATE_START = "\u2066";
  const LTR_ISOLATE_END = "\u2069";
  const KEY_TO_DIR = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    w: "up",
    W: "up",
    s: "down",
    S: "down",
    a: "left",
    A: "left",
    d: "right",
    D: "right",
    8: "up",
    2: "down",
    4: "left",
    6: "right",
    7: "up",
    9: "up",
    1: "down",
    3: "down"
  };

  const ENEMY_COLORS = GAME_THEME.enemies.palettes[0];

  const AMBUSH_CELLS = [
    { x: 8, y: 2 },
    { x: 2, y: 8 },
    { x: 11, y: 6 },
    { x: 29, y: 6 },
    { x: 8, y: 18 },
    { x: 31, y: 18 }
  ];

  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");
  const stage = document.querySelector(".stage");

  const els = {
    correct: document.getElementById("correct-answers"),
    targetCorrect: document.getElementById("target-correct"),
    levelNumber: document.getElementById("level-number"),
    worldName: document.getElementById("world-name"),
    score: document.getElementById("score"),
    modeLabel: document.getElementById("mode-label"),
    difficultyLabel: document.getElementById("difficulty-label"),
    combo: document.getElementById("combo"),
    lives: document.getElementById("lives"),
    progress: document.getElementById("progress-fill"),
    progressWrap: document.querySelector(".progress-wrap"),
    missionCard: document.getElementById("mission-card"),
    missionTitle: document.getElementById("mission-title"),
    missionProgress: document.getElementById("mission-progress"),
    pause: document.getElementById("pause-button"),
    sound: document.getElementById("sound-button"),
    menuSound: document.getElementById("menu-sound-button"),
    startScreen: document.getElementById("start-screen"),
    playerForm: document.getElementById("player-form"),
    playerNameInput: document.getElementById("player-name-input"),
    modeInputs: Array.from(document.querySelectorAll("input[name='game-mode']")),
    characterInputs: Array.from(document.querySelectorAll("input[name='character']")),
    difficultyInputs: Array.from(document.querySelectorAll("input[name='difficulty']")),
    timeLimitToggle: document.getElementById("time-limit-toggle"),
    timeLimitState: document.getElementById("time-limit-state"),
    nameError: document.getElementById("name-error"),
    startButton: document.getElementById("start-button"),
    bestScore: document.getElementById("best-score"),
    selectedModeLabel: document.getElementById("selected-mode-label"),
    selectedDifficultyLabel: document.getElementById("selected-difficulty-label"),
    menuSelectionSummary: document.getElementById("menu-selection-summary"),
    menuRankValue: document.getElementById("menu-rank-value"),
    menuPersonalBest: document.getElementById("menu-personal-best"),
    menuNextRank: document.getElementById("menu-next-rank"),
    playerGreeting: document.getElementById("player-greeting"),
    modeControlButton: document.getElementById("mode-control-button"),
    difficultyControlButton: document.getElementById("difficulty-control-button"),
    profileControlButton: document.getElementById("profile-control-button"),
    menuSettingsButton: document.getElementById("menu-settings-button"),
    menuLeaderboardLink: document.getElementById("menu-leaderboard-link"),
    modePanel: document.getElementById("mode-panel"),
    difficultyPanel: document.getElementById("difficulty-panel"),
    settingsPanel: document.getElementById("settings-panel"),
    settingsSaveButton: document.getElementById("settings-save-button"),
    menuSheets: Array.from(document.querySelectorAll(".menu-sheet")),
    panelCloseButtons: Array.from(document.querySelectorAll("[data-close-panel]")),
    endScreen: document.getElementById("end-screen"),
    winnerTrophy: document.getElementById("winner-trophy"),
    newRecordBadge: document.getElementById("new-record-badge"),
    endKicker: document.getElementById("end-kicker"),
    endTitle: document.getElementById("end-title"),
    endCopy: document.getElementById("end-copy"),
    finalScore: document.getElementById("final-score"),
    previousBest: document.getElementById("previous-best"),
    leaderboardRank: document.getElementById("leaderboard-rank"),
    nextRankScore: document.getElementById("next-rank-score"),
    resultMode: document.getElementById("result-mode"),
    resultDifficulty: document.getElementById("result-difficulty"),
    resultStageLabel: document.getElementById("result-stage-label"),
    resultStage: document.getElementById("result-stage"),
    finalCorrect: document.getElementById("final-correct"),
    finalIncorrect: document.getElementById("final-incorrect"),
    finalAccuracy: document.getElementById("final-accuracy"),
    averageAnswerTime: document.getElementById("average-answer-time"),
    maxCombo: document.getElementById("max-combo"),
    remainingLives: document.getElementById("remaining-lives"),
    scoreBreakdownList: document.getElementById("score-breakdown-list"),
    retryButton: document.getElementById("retry-button"),
    restartButton: document.getElementById("restart-button"),
    questionDialog: document.getElementById("question-dialog"),
    questionStatus: document.getElementById("question-status"),
    questionTimer: document.getElementById("question-timer"),
    questionTime: document.getElementById("question-time"),
    questionTitle: document.getElementById("question-title"),
    answerForm: document.getElementById("answer-form"),
    answerInput: document.getElementById("answer-input"),
    submitAnswer: document.getElementById("submit-answer"),
    questionFeedback: document.getElementById("question-feedback"),
    joystick: document.getElementById("movement-joystick"),
    joystickKnob: document.querySelector(".joystick-knob"),
    leaderboardOpen: document.getElementById("leaderboard-open"),
    leaderboardDialog: document.getElementById("leaderboard-dialog"),
    leaderboardClose: document.getElementById("leaderboard-close"),
    leaderboardList: document.getElementById("leaderboard-list"),
    leaderboardStatus: document.getElementById("leaderboard-status"),
    leaderboardRefresh: document.getElementById("leaderboard-refresh"),
    leaderboardModeFilter: document.getElementById("leaderboard-mode-filter"),
    leaderboardDifficultyFilter: document.getElementById("leaderboard-difficulty-filter"),
    endLeaderboardButton: document.getElementById("end-leaderboard-button"),
    publishScorePanel: document.getElementById("publish-score-panel"),
    publishScoreButton: document.getElementById("publish-score-button"),
    publishScoreStatus: document.getElementById("publish-score-status")
  };

  const numberFormat = new Intl.NumberFormat("he-IL");

  const storage = {
    get(key, fallback) {
      try {
        return localStorage.getItem(key) ?? fallback;
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch {
        // Storage can be unavailable in some private browser contexts.
      }
    },
    getMigrated(key, legacyKey, fallback) {
      const current = this.get(key, null);
      if (current !== null) {
        return current;
      }

      const legacy = this.get(legacyKey, null);
      if (legacy !== null) {
        this.set(key, legacy);
        return legacy;
      }

      return fallback;
    }
  };

  const localSave = SYSTEMS.loadSave(window.localStorage, { key: CONFIG.storageKeys.save });

  function createPlayerId() {
    if (window.crypto?.randomUUID) {
      return window.crypto.randomUUID();
    }

    const bytes = new Uint8Array(16);
    if (window.crypto?.getRandomValues) {
      window.crypto.getRandomValues(bytes);
    } else {
      for (let index = 0; index < bytes.length; index += 1) {
        bytes[index] = Math.floor(Math.random() * 256);
      }
    }
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  function getOrCreatePlayerId() {
    const storedId = storage.get(CONFIG.storageKeys.playerId, "");
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(storedId)) {
      return storedId;
    }

    const playerId = createPlayerId();
    storage.set(CONFIG.storageKeys.playerId, playerId);
    return playerId;
  }

  function normalizeDifficulty(value) {
    return SYSTEMS.normalizeDifficulty(LEGACY_DIFFICULTY_MAP[value] || value);
  }

  function normalizeGameMode(value) {
    return SYSTEMS.normalizeGameMode(value);
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

  function getDifficultySettings() {
    return CONFIG.difficulty[state.difficulty] || CONFIG.difficulty.normal;
  }

  function getModeSettings() {
    return SYSTEMS.GAME_MODES[state.mode] || SYSTEMS.GAME_MODES.arcade;
  }

  function getPersonalBestForSelection(mode = state.mode, difficulty = state.difficulty) {
    const localBest = SYSTEMS.getPersonalBest(state.save, mode, difficulty);
    return Math.max(localBest, Number(storage.getMigrated(
      CONFIG.storageKeys.bestScore,
      CONFIG.legacyStorageKeys.bestScore,
      "0"
    )) || 0);
  }

  function getLevelIndexForAnswers(correctAnswers) {
    const levelIndex = Math.floor(correctAnswers / CONFIG.answersPerLevel);
    if (state?.mode === "arcade") {
      return levelIndex % CONFIG.levels.length;
    }
    return clamp(levelIndex, 0, CONFIG.levels.length - 1);
  }

  function getCurrentLevel() {
    return CONFIG.levels[state.levelIndex] || CONFIG.levels[0];
  }

  function getRequiredEnemyCount() {
    const difficulty = getDifficultySettings();
    const level = getCurrentLevel();
    const arcadeBonus = state.mode === "arcade"
      ? Math.min(6, Math.floor(state.correctAnswers / CONFIG.answersPerLevel))
      : 0;
    return (difficulty.enemyCount || CONFIG.minEnemies) + (level.enemyCountBonus || 0) + arcadeBonus;
  }

  function getArcadeWave() {
    return Math.floor(state.correctAnswers / CONFIG.answersPerLevel) + 1;
  }

  function getArcadePressureMultiplier() {
    if (state.mode !== "arcade") {
      return 1;
    }
    const difficulty = getDifficultySettings();
    return 1 + Math.min(0.85, (getArcadeWave() - 1) * 0.045 * (difficulty.progressionSpeed || 1));
  }

  function getAdaptiveQuestionChance() {
    const difficulty = getDifficultySettings();
    return Number.isFinite(difficulty.adaptiveQuestionChance)
      ? difficulty.adaptiveQuestionChance
      : CONFIG.adaptiveQuestionChance;
  }

  function loadFactStats() {
    try {
      const parsed = JSON.parse(storage.getMigrated(
        CONFIG.storageKeys.factStats,
        CONFIG.legacyStorageKeys.factStats,
        "{}"
      ));
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return {};
      }

      return Object.fromEntries(Object.entries(parsed).filter(([, value]) => {
        return value && Number.isFinite(value.wrong) && Number.isFinite(value.correct);
      }));
    } catch {
      return {};
    }
  }

  function saveFactStats() {
    storage.set(CONFIG.storageKeys.factStats, JSON.stringify(state.factStats));
  }

  const initialMode = normalizeGameMode(storage.get(CONFIG.storageKeys.mode, localSave.settings.selectedMode));
  const savedDifficulty = normalizeDifficulty(storage.getMigrated(
    CONFIG.storageKeys.difficulty,
    CONFIG.legacyStorageKeys.difficulty,
    localSave.settings.selectedDifficulty
  ));
  const initialDifficulty = SYSTEMS.isDifficultyUnlocked(localSave, savedDifficulty) ? savedDifficulty : "normal";
  const initialBestScore = Math.max(
    SYSTEMS.getPersonalBest(localSave, initialMode, initialDifficulty),
    Number(storage.getMigrated(
      CONFIG.storageKeys.bestScore,
      CONFIG.legacyStorageKeys.bestScore,
      "0"
    )) || 0
  );

  const state = {
    phase: "start",
    save: localSave,
    mode: initialMode,
    clock: 0,
    lastTime: 0,
    maze: [],
    reachable: new Set(),
    reachableList: [],
    collectibles: new Map(),
    player: null,
    enemies: [],
    particles: [],
    floatingTexts: [],
    pendingSpawns: [],
    backdropStars: [],
    levelIndex: 0,
    levelBanner: null,
    score: 0,
    scoreState: SYSTEMS.createScoreState(),
    combo: 0,
    comboState: SYSTEMS.createComboState(),
    lives: CONFIG.initialLives,
    correctAnswers: 0,
    incorrectAnswers: 0,
    mathStats: SYSTEMS.createMathStats(),
    bestScore: initialBestScore,
    playerName: SYSTEMS.safeNickname(storage.get(CONFIG.storageKeys.nickname, localSave.player.nickname)),
    characterId: normalizeCharacterId(storage.get(CONFIG.storageKeys.character, localSave.settings.selectedCharacter)),
    playerId: getOrCreatePlayerId(),
    difficulty: initialDifficulty,
    timeLimitEnabled: true,
    factStats: loadFactStats(),
    recentQuestionKeys: [],
    mission: null,
    question: null,
    questionStartedAt: null,
    questionTimeRemaining: null,
    questionDeadline: null,
    questionFeedbackTimerId: null,
    currentEnemyId: null,
    answerLocked: false,
    nextEnemyId: 1,
    soundEnabled: storage.getMigrated(
      CONFIG.storageKeys.sound,
      CONFIG.legacyStorageKeys.sound,
      "on"
    ) !== "off",
    audioContext: null,
    shake: 0,
    fireworkTimer: 0,
    leaderboardLoading: false,
    scorePublishing: false,
    sessionStartedAt: null,
    hitsTaken: 0,
    finalResult: null,
    latestLeaderboardEntryId: null,
    lastFocusBeforeLeaderboard: null,
    lastFocusBeforeMenuSheet: null
  };

  function cellKey(x, y) {
    return `${x},${y}`;
  }

  function centerOfCell(x, y) {
    return {
      x: x * TILE + TILE / 2,
      y: y * TILE + TILE / 2
    };
  }

  function toCell(x, y) {
    return {
      x: Math.floor(x / TILE),
      y: Math.floor(y / TILE)
    };
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function distanceCells(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  function distanceSq(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
  }

  function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function shuffle(items) {
    const copy = items.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function resizeCanvas() {
    updateViewportProfile();
    const rect = canvas.getBoundingClientRect();
    const ratioLimit = MOBILE_RUNTIME.reducedEffects ? 1.5 : 2;
    const ratio = Math.min(window.devicePixelRatio || 1, ratioLimit);
    const cssWidth = Math.max(1, rect.width || WIDTH);
    const cssHeight = Math.max(1, rect.height || HEIGHT);
    const pixelWidth = Math.max(1, Math.round(cssWidth * ratio));
    const pixelHeight = Math.max(1, Math.round(cssHeight * ratio));

    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }

    ctx.setTransform(pixelWidth / WIDTH, 0, 0, pixelHeight / HEIGHT, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = MOBILE_RUNTIME.reducedEffects ? "medium" : "high";
  }

  function updateViewportProfile() {
    const coarse = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    const portrait = window.innerHeight >= window.innerWidth;
    let mode = "desktop";
    let zoom = 1;

    if (coarse && portrait && window.innerWidth <= 600) {
      mode = "phone-portrait";
      zoom = 1;
    } else if (coarse && !portrait && window.innerHeight <= 700) {
      mode = "phone-landscape";
      zoom = 1;
    } else if (coarse) {
      mode = "tablet";
      zoom = 1;
    }

    MOBILE_RUNTIME.coarse = coarse;
    MOBILE_RUNTIME.mode = mode;
    MOBILE_RUNTIME.zoom = zoom;
    MOBILE_RUNTIME.reducedEffects = coarse && (window.innerWidth < 900 || window.devicePixelRatio > 2);
    document.documentElement.dataset.gameViewport = mode;
    document.documentElement.classList.toggle("mobile-low-effects", MOBILE_RUNTIME.reducedEffects);
  }

  function updateCamera(dt) {
    const targetZoom = MOBILE_RUNTIME.zoom;
    const zoomEase = dt > 0 ? 1 - Math.exp(-dt * 10) : 1;
    CAMERA.zoom += (targetZoom - CAMERA.zoom) * zoomEase;

    const player = state.player;
    const targetX = player?.x ?? WIDTH / 2;
    const targetY = player?.y ?? HEIGHT / 2;
    const visibleWidth = WIDTH / CAMERA.zoom;
    const visibleHeight = HEIGHT / CAMERA.zoom;
    const minX = visibleWidth / 2;
    const maxX = WIDTH - visibleWidth / 2;
    const minY = visibleHeight / 2;
    const maxY = HEIGHT - visibleHeight / 2;
    const clampedX = clamp(targetX, Math.min(minX, maxX), Math.max(minX, maxX));
    const clampedY = clamp(targetY, Math.min(minY, maxY), Math.max(minY, maxY));
    const followEase = dt > 0 ? 1 - Math.exp(-dt * 7.5) : 1;

    CAMERA.x += (clampedX - CAMERA.x) * followEase;
    CAMERA.y += (clampedY - CAMERA.y) * followEase;
  }

  function applyCameraTransform(renderContext) {
    if (CAMERA.zoom <= 1.001) {
      return;
    }
    renderContext.translate(WIDTH / 2, HEIGHT / 2);
    renderContext.scale(CAMERA.zoom, CAMERA.zoom);
    renderContext.translate(-CAMERA.x, -CAMERA.y);
  }

  function createMaze(levelIndex = 0) {
    const maze = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

    for (let x = 0; x < COLS; x += 1) {
      maze[0][x] = 1;
      maze[ROWS - 1][x] = 1;
    }

    for (let y = 0; y < ROWS; y += 1) {
      maze[y][0] = 1;
      maze[y][COLS - 1] = 1;
    }

    const addBlock = (x, y, w, h) => {
      for (let cy = y; cy < y + h; cy += 1) {
        for (let cx = x; cx < x + w; cx += 1) {
          if (cx > 0 && cx < COLS - 1 && cy > 0 && cy < ROWS - 1) {
            maze[cy][cx] = 1;
          }
        }
      }
    };

    const mirrorBlock = (x, y, w, h) => {
      addBlock(x, y, w, h);
      addBlock(COLS - x - w, y, w, h);
    };

    mirrorBlock(3, 3, 5, 2);
    mirrorBlock(11, 3, 4, 2);
    mirrorBlock(4, 7, 3, 5);
    mirrorBlock(10, 8, 7, 2);
    mirrorBlock(3, 15, 6, 2);
    mirrorBlock(11, 13, 3, 6);
    mirrorBlock(6, 21, 5, 2);
    mirrorBlock(14, 22, 5, 2);
    mirrorBlock(17, 6, 2, 5);
    mirrorBlock(18, 17, 4, 2);
    addBlock(18, 11, 4, 1);
    addBlock(16, 15, 8, 1);
    addBlock(19, 24, 2, 3);
    addLevelMazePattern(levelIndex, addBlock, mirrorBlock);

    clearZone(maze, PLAYER_START.x, PLAYER_START.y, 2);
    clearZone(maze, CENTER_CELL.x, CENTER_CELL.y, 3);
    clearZone(maze, 2, ROWS - 3, 2);
    clearZone(maze, COLS - 3, ROWS - 3, 2);

    return maze;
  }

  function addLevelMazePattern(levelIndex, addBlock, mirrorBlock) {
    const pattern = levelIndex % CONFIG.levels.length;

    if (pattern === 0) {
      mirrorBlock(5, 11, 3, 1);
      mirrorBlock(15, 20, 2, 1);
      addBlock(19, 7, 2, 2);
      return;
    }

    if (pattern === 1) {
      mirrorBlock(8, 11, 1, 4);
      mirrorBlock(13, 5, 2, 3);
      addBlock(18, 20, 4, 1);
      return;
    }

    if (pattern === 2) {
      mirrorBlock(7, 12, 4, 1);
      mirrorBlock(15, 9, 1, 4);
      addBlock(19, 4, 2, 3);
      addBlock(19, 25, 2, 2);
      return;
    }

    mirrorBlock(5, 6, 2, 2);
    mirrorBlock(9, 19, 2, 3);
    mirrorBlock(16, 12, 1, 3);
    addBlock(18, 14, 4, 1);
  }

  function clearZone(maze, cx, cy, radius) {
    for (let y = cy - radius; y <= cy + radius; y += 1) {
      for (let x = cx - radius; x <= cx + radius; x += 1) {
        if (x > 0 && x < COLS - 1 && y > 0 && y < ROWS - 1) {
          maze[y][x] = 0;
        }
      }
    }
  }

  function isWallCell(x, y) {
    if (x < 0 || y < 0 || x >= COLS || y >= ROWS) {
      return true;
    }

    return state.maze[y][x] === 1;
  }

  function isWalkableCell(x, y) {
    return !isWallCell(x, y);
  }

  function circleRectCollision(cx, cy, radius, rx, ry, rw, rh) {
    const closestX = clamp(cx, rx, rx + rw);
    const closestY = clamp(cy, ry, ry + rh);
    const dx = cx - closestX;
    const dy = cy - closestY;
    return dx * dx + dy * dy < radius * radius;
  }

  function circleHitsWall(x, y, radius) {
    const left = Math.floor((x - radius) / TILE);
    const right = Math.floor((x + radius) / TILE);
    const top = Math.floor((y - radius) / TILE);
    const bottom = Math.floor((y + radius) / TILE);

    for (let cy = top; cy <= bottom; cy += 1) {
      for (let cx = left; cx <= right; cx += 1) {
        if (isWallCell(cx, cy)) {
          const rx = cx * TILE;
          const ry = cy * TILE;
          if (circleRectCollision(x, y, radius, rx, ry, TILE, TILE)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  function computeReachable(start) {
    const reachable = new Set();
    const queue = [start];
    reachable.add(cellKey(start.x, start.y));

    for (let i = 0; i < queue.length; i += 1) {
      const cell = queue[i];
      for (const dir of DIR_NAMES) {
        const next = {
          x: cell.x + DIRS[dir].x,
          y: cell.y + DIRS[dir].y
        };
        const key = cellKey(next.x, next.y);
        if (!reachable.has(key) && isWalkableCell(next.x, next.y)) {
          reachable.add(key);
          queue.push(next);
        }
      }
    }

    return {
      reachable,
      list: queue
    };
  }

  function seedCollectibles() {
    state.collectibles.clear();
    for (const cell of state.reachableList) {
      const nearPlayer = distanceCells(cell, PLAYER_START) <= 2;
      const nearCenter = distanceCells(cell, CENTER_CELL) <= 2;
      if (nearPlayer || nearCenter) {
        continue;
      }

      if ((cell.x + cell.y) % 2 === 0 || Math.random() < 0.32) {
        const pos = centerOfCell(cell.x, cell.y);
        state.collectibles.set(cellKey(cell.x, cell.y), {
          x: pos.x,
          y: pos.y,
          phase: Math.random() * Math.PI * 2,
          radius: Math.random() < 0.08 ? 4.5 : 2.6,
          value: Math.random() < 0.08 ? 30 : 10
        });
      }
    }
  }

  function refillCollectibles() {
    if (state.collectibles.size > 60) {
      return;
    }

    const playerCell = toCell(state.player.x, state.player.y);
    const candidates = shuffle(state.reachableList).filter((cell) => {
      const key = cellKey(cell.x, cell.y);
      return !state.collectibles.has(key) && distanceCells(cell, playerCell) > 3 && distanceCells(cell, CENTER_CELL) > 2;
    });

    for (const cell of candidates.slice(0, 90)) {
      const pos = centerOfCell(cell.x, cell.y);
      state.collectibles.set(cellKey(cell.x, cell.y), {
        x: pos.x,
        y: pos.y,
        phase: Math.random() * Math.PI * 2,
        radius: Math.random() < 0.1 ? 4.5 : 2.6,
        value: Math.random() < 0.1 ? 30 : 10
      });
    }
  }

  function createPlayer() {
    const pos = centerOfCell(PLAYER_START.x, PLAYER_START.y);
    return {
      x: pos.x,
      y: pos.y,
      radius: 10.2,
      speed: CONFIG.speed.player,
      direction: "right",
      desiredDirection: "right",
      directionRequestTime: 0,
      visualPulse: 0.25,
      eatAnimation: 0,
      eatDirection: "right",
      eatEffect: null,
      invulnerable: 0,
      trail: []
    };
  }

  function createEnemy(index) {
    const cell = chooseEnemySpawnCell(index);
    const pos = centerOfCell(cell.x, cell.y);
    const direction = randomItem(DIR_NAMES);
    const difficulty = getDifficultySettings();
    const level = getCurrentLevel();
    const enemyColors = level.enemyColors || ENEMY_COLORS;
    const speedTier = Math.min(
      CONFIG.speed.enemyTierMax,
      Math.floor(state.correctAnswers / CONFIG.speed.enemyTierEveryAnswers) * CONFIG.speed.enemyTierStep
    );
    const speed = (
      CONFIG.speed.enemyBase +
      speedTier +
      (index % 4) * CONFIG.speed.enemyIndexStep
    ) * difficulty.enemySpeedMultiplier * (level.enemySpeedMultiplier || 1) * getArcadePressureMultiplier();

    return {
      id: state.nextEnemyId,
      x: pos.x,
      y: pos.y,
      radius: 10.4,
      speed,
      direction,
      color: enemyColors[index % enemyColors.length],
      visualStyle: level.enemyVisualStyle || "neutral",
      visualVariant: index % 4,
      scatter: scatterCornerFor(index),
      personality: index % 4,
      pathCooldown: 0,
      spawnFlash: 0.8,
      wobble: Math.random() * Math.PI * 2,
      expressionOffset: index * 0.47 + Math.random() * 0.8
    };
  }

  function scatterCornerFor(index) {
    const corners = [
      { x: 2, y: 2 },
      { x: COLS - 3, y: 2 },
      { x: 2, y: ROWS - 3 },
      { x: COLS - 3, y: ROWS - 3 }
    ];
    return corners[index % corners.length];
  }

  function chooseEnemySpawnCell(index) {
    const playerCell = state.player ? toCell(state.player.x, state.player.y) : PLAYER_START;
    const centerOptions = [
      CENTER_CELL,
      { x: CENTER_CELL.x - 2, y: CENTER_CELL.y },
      { x: CENTER_CELL.x + 2, y: CENTER_CELL.y },
      { x: CENTER_CELL.x, y: CENTER_CELL.y - 2 },
      { x: CENTER_CELL.x, y: CENTER_CELL.y + 2 }
    ];

    const corner = scatterCornerFor(index);
    const ambushOptions = AMBUSH_CELLS.slice(index % AMBUSH_CELLS.length)
      .concat(AMBUSH_CELLS.slice(0, index % AMBUSH_CELLS.length));
    const closeButFair = ambushOptions.filter((cell) => {
      const distance = distanceCells(cell, playerCell);
      return state.reachable.has(cellKey(cell.x, cell.y)) && distance >= 5 && distance <= 13;
    });
    const ordered = shuffle(closeButFair.concat(centerOptions, [corner])).filter((cell) => {
      return state.reachable.has(cellKey(cell.x, cell.y)) && distanceCells(cell, playerCell) > 4;
    });

    if (ordered.length > 0) {
      return ordered[0];
    }

    const farCells = state.reachableList.filter((cell) => distanceCells(cell, playerCell) > 10);
    return randomItem(farCells.length ? farCells : state.reachableList);
  }

  function scheduleEnemySpawn(delay) {
    state.pendingSpawns.push({
      delay,
      index: state.nextEnemyId
    });
  }

  function ensureEnemyCount() {
    const minEnemies = getRequiredEnemyCount();
    const totalIncoming = state.enemies.length + state.pendingSpawns.length;
    for (let i = totalIncoming; i < minEnemies; i += 1) {
      scheduleEnemySpawn(0.25 + i * 0.08);
    }
  }

  function spawnEnemy(index) {
    const enemy = createEnemy(index);
    state.nextEnemyId += 1;
    state.enemies.push(enemy);
    addBurst(enemy.x, enemy.y, enemy.color, 18, 90);
  }

  function enterLevel(levelIndex, options = {}) {
    state.levelIndex = clamp(levelIndex, 0, CONFIG.levels.length - 1);
    state.maze = createMaze(state.levelIndex);
    const reachability = computeReachable(PLAYER_START);
    state.reachable = reachability.reachable;
    state.reachableList = reachability.list;
    state.player = createPlayer();
    state.enemies = [];
    state.pendingSpawns = [];
    state.particles = [];
    state.floatingTexts = [];
    seedCollectibles();
    seedBackdrop();

    const minEnemies = getRequiredEnemyCount();
    for (let i = 0; i < minEnemies; i += 1) {
      spawnEnemy(i);
    }

    if (options.announce) {
      state.player.invulnerable = 2.4;
      showLevelBanner(options.awardedLife);
      addBurst(state.player.x, state.player.y, getCurrentLevel().accent, 42, 145);
      if (options.awardedLife) {
        addFloatingText(state.player.x, state.player.y - 28, "+חיים", "#ff5f9f");
      }
    }

    updateHud();
  }

  function setupGame() {
    clearQuestionFeedbackTimer();
    state.clock = 0;
    state.lastTime = performance.now();
    state.levelIndex = 0;
    state.levelBanner = null;
    state.scoreState = SYSTEMS.createScoreState();
    state.comboState = SYSTEMS.createComboState();
    state.score = 0;
    state.combo = 0;
    state.lives = getDifficultySettings().initialLives || CONFIG.initialLives;
    state.correctAnswers = 0;
    state.incorrectAnswers = 0;
    state.mathStats = SYSTEMS.createMathStats();
    state.recentQuestionKeys = [];
    state.question = null;
    state.questionStartedAt = null;
    state.questionTimeRemaining = null;
    state.questionDeadline = null;
    state.currentEnemyId = null;
    state.answerLocked = false;
    state.nextEnemyId = 1;
    state.shake = 0;
    state.fireworkTimer = 0;
    state.sessionStartedAt = performance.now();
    state.hitsTaken = 0;
    state.finalResult = null;
    state.latestLeaderboardEntryId = null;
    assignMission();
    enterLevel(0);

    updateHud();
    if (state.phase === "playing") {
      els.answerInput.blur();
      stage.focus({ preventScroll: true });
    }
  }

  function seedBackdrop() {
    state.backdropStars = Array.from({ length: MOBILE_RUNTIME.reducedEffects ? 42 : 90 }, (_, index) => ({
      x: (index * 137.31) % WIDTH,
      y: (index * 91.77) % HEIGHT,
      size: 0.6 + ((index * 17) % 10) / 13,
      phase: (index * 0.73) % (Math.PI * 2)
    }));
  }

  function showLevelBanner(awardedLife = false) {
    const level = getCurrentLevel();
    const nextGoal = Math.min(CONFIG.targetCorrect, (state.levelIndex + 1) * CONFIG.answersPerLevel);
    state.levelBanner = {
      title: level.intro,
      subtitle: awardedLife
        ? `עוד עולם נפתח, וקיבלת חיים. היעד הבא: ${nextGoal} תשובות`
        : `היעד הבא: ${nextGoal} תשובות נכונות`,
      color: level.accent,
      life: 2.25,
      maxLife: 2.25
    };
    playMissionSound();
  }

  function updateLevelBanner(dt) {
    if (!state.levelBanner) {
      return;
    }

    state.levelBanner.life -= dt;
    if (state.levelBanner.life <= 0) {
      state.levelBanner = null;
    }
  }

  function normalizePlayerName(value) {
    return SYSTEMS.validateNickname(value);
  }

  function persistSave() {
    state.save.player.nickname = SYSTEMS.safeNickname(state.playerName || els.playerNameInput.value || state.save.player.nickname);
    state.save.settings.selectedCharacter = state.characterId;
    state.save.settings.selectedDifficulty = state.difficulty;
    state.save.settings.selectedMode = state.mode;
    state.save.settings.soundEnabled = state.soundEnabled;
    state.save.settings.timeLimitEnabled = state.timeLimitEnabled;
    SYSTEMS.persistSave(window.localStorage, state.save, { key: CONFIG.storageKeys.save });
  }

  function updateBestScorePreview() {
    state.bestScore = getPersonalBestForSelection();
    if (els.bestScore) {
      els.bestScore.textContent = numberFormat.format(state.bestScore);
    }
    if (els.menuPersonalBest) {
      els.menuPersonalBest.textContent = numberFormat.format(state.bestScore);
    }
  }

  function characterLabel(characterId = state.characterId) {
    return PLAYER_CHARACTERS[normalizeCharacterId(characterId)]?.name || "ביפלי";
  }

  function scoreMultiplierLabel(difficulty = getDifficultySettings()) {
    const multiplier = Math.max(0, Number(difficulty.scoreMultiplierPct) || 100) / 100;
    return `×${Number.isInteger(multiplier) ? multiplier : multiplier.toFixed(1)}`;
  }

  function updatePlayerGreeting() {
    if (!els.playerGreeting) {
      return;
    }
    els.playerGreeting.textContent = SYSTEMS.safeNickname(state.playerName || state.save.player.nickname);
  }

  function updateMenuLeaderboardPreview() {
    if (!els.menuRankValue && !els.menuNextRank && !els.menuPersonalBest) {
      return;
    }

    const mode = state.mode;
    const difficulty = state.difficulty;
    const personalBest = getPersonalBestForSelection(mode, difficulty);
    const entries = SYSTEMS.getLeaderboardEntries(state.save, {
      mode,
      difficulty,
      limit: CONFIG.leaderboard.limit
    });
    const playerEntryIndex = entries.findIndex((entry) => (
      entry.playerId === state.playerId
      || (entry.nickname === state.playerName && entry.score === personalBest)
      || entry.id === state.latestLeaderboardEntryId
    ));
    const playerEntry = playerEntryIndex >= 0 ? entries[playerEntryIndex] : null;
    const rank = playerEntryIndex >= 0 ? playerEntryIndex + 1 : null;

    if (els.menuPersonalBest) {
      els.menuPersonalBest.textContent = numberFormat.format(personalBest);
    }
    if (els.menuRankValue) {
      els.menuRankValue.textContent = rank ? String(rank) : "-";
    }
    if (!els.menuNextRank) {
      return;
    }

    if (!entries.length) {
      els.menuNextRank.textContent = "עוד אין שיאים בקטגוריה הזאת.";
      return;
    }
    if (!playerEntry) {
      els.menuNextRank.textContent = personalBest > 0
        ? "שחק סיבוב כדי לשמור את השיא בטבלה המקומית."
        : "הסיבוב הראשון שלך יפתח דירוג חדש.";
      return;
    }
    if (rank === 1) {
      els.menuNextRank.textContent = "אתה מוביל את הקטגוריה הזאת.";
      return;
    }

    const nextScore = entries[playerEntryIndex - 1]?.score || playerEntry.score;
    const needed = Math.max(1, nextScore - playerEntry.score + 1);
    els.menuNextRank.textContent = `חסרות ${numberFormat.format(needed)} נקודות למקום ${rank - 1}`;
  }

  function syncMenuSummary() {
    const mode = getModeSettings();
    const difficulty = getDifficultySettings();
    if (els.selectedModeLabel) {
      els.selectedModeLabel.textContent = mode.shortLabel;
    }
    if (els.selectedDifficultyLabel) {
      els.selectedDifficultyLabel.textContent = difficulty.label;
    }
    if (els.menuSelectionSummary) {
      els.menuSelectionSummary.textContent = `${characterLabel()} · ${difficulty.label} ${scoreMultiplierLabel(difficulty)} · ${mode.shortLabel}`;
    }
    updatePlayerGreeting();
    updateBestScorePreview();
    updateMenuLeaderboardPreview();
  }

  function getSelectedMode() {
    const selected = els.modeInputs.find((input) => input.checked);
    return normalizeGameMode(selected?.value || state.mode);
  }

  function setMode(value, persist = true) {
    state.mode = normalizeGameMode(value);
    if (persist) {
      storage.set(CONFIG.storageKeys.mode, state.mode);
      persistSave();
    }
    syncModeInputs();
    syncTimeLimitToggle();
    syncMenuSummary();
  }

  function syncModeInputs() {
    for (const input of els.modeInputs) {
      input.checked = input.value === state.mode;
    }
  }

  function getSelectedCharacterId() {
    const selected = els.characterInputs.find((input) => input.checked);
    return normalizeCharacterId(selected?.value || state.characterId);
  }

  function setCharacter(value, persist = true) {
    const nextCharacterId = normalizeCharacterId(value);
    const changed = state.characterId !== nextCharacterId;
    state.characterId = nextCharacterId;
    if (persist && changed) {
      storage.set(CONFIG.storageKeys.character, state.characterId);
      persistSave();
    }
    document.documentElement.dataset.character = state.characterId;
    syncCharacterInputs();
    syncMenuSummary();
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

  function setDifficulty(value, persist = true) {
    const nextDifficulty = normalizeDifficulty(value);
    state.difficulty = SYSTEMS.isDifficultyUnlocked(state.save, nextDifficulty) ? nextDifficulty : "normal";
    state.timeLimitEnabled = true;
    if (persist) {
      storage.set(CONFIG.storageKeys.difficulty, state.difficulty);
      persistSave();
    }
    syncDifficultyInputs();
    syncMenuSummary();
  }

  function syncDifficultyInputs() {
    for (const input of els.difficultyInputs) {
      const isLocked = input.value === "legendary" && !SYSTEMS.isDifficultyUnlocked(state.save, "legendary");
      input.disabled = isLocked;
      input.closest("label")?.classList.toggle("difficulty-locked", isLocked);
      input.closest("label")?.setAttribute("title", isLocked ? SYSTEMS.LEGENDARY_UNLOCK_RULE.label : "");
      input.checked = input.value === state.difficulty;
    }
  }

  function setTimeLimitEnabled(enabled, persist = true) {
    state.timeLimitEnabled = Boolean(enabled);
    if (persist) {
      storage.set(CONFIG.storageKeys.timeLimit, state.timeLimitEnabled ? "on" : "off");
      persistSave();
    }
    syncTimeLimitToggle();
  }

  function toggleTimeLimit() {
    setTimeLimitEnabled(!state.timeLimitEnabled);
  }

  function syncTimeLimitToggle() {
    if (!els.timeLimitToggle || !els.timeLimitState) {
      return;
    }

    const enabled = state.timeLimitEnabled;
    els.timeLimitToggle.setAttribute("aria-pressed", String(enabled));
    els.timeLimitToggle.setAttribute(
      "aria-label",
      enabled ? "בטל הגבלת זמן לכל תרגיל" : "הפעל הגבלת זמן של 25 שניות לכל תרגיל"
    );
    els.timeLimitState.textContent = state.mode === "arcade"
      ? `${getQuestionTimeLimit()} שניות בארקייד`
      : (enabled ? `${getQuestionTimeLimit()} שניות` : "ללא זמן");
  }

  function getMenuSheetTrigger(sheet) {
    if (sheet === els.modePanel) {
      return els.modeControlButton;
    }
    if (sheet === els.difficultyPanel) {
      return els.difficultyControlButton;
    }
    if (sheet === els.settingsPanel) {
      return els.profileControlButton || els.menuSettingsButton;
    }
    return null;
  }

  function closeMenuSheets(options = {}) {
    const { restoreFocus = true } = options;
    for (const sheet of els.menuSheets) {
      sheet.hidden = true;
      getMenuSheetTrigger(sheet)?.setAttribute("aria-expanded", "false");
    }
    if (restoreFocus && state.lastFocusBeforeMenuSheet instanceof HTMLElement) {
      state.lastFocusBeforeMenuSheet.focus({ preventScroll: true });
    }
    state.lastFocusBeforeMenuSheet = null;
  }

  function focusMenuSheet(sheet) {
    const target = sheet.querySelector("input:checked:not(:disabled)")
      || sheet.querySelector("input:not(:disabled)")
      || sheet.querySelector("button:not([data-close-panel])")
      || sheet.querySelector("[data-close-panel]");
    window.setTimeout(() => target?.focus({ preventScroll: true }), 0);
  }

  function openMenuSheet(sheet, trigger) {
    if (!sheet) {
      return;
    }
    state.lastFocusBeforeMenuSheet = trigger || document.activeElement;
    closeMenuSheets({ restoreFocus: false });
    sheet.hidden = false;
    getMenuSheetTrigger(sheet)?.setAttribute("aria-expanded", "true");
    focusMenuSheet(sheet);
  }

  function saveNicknameFromSettings() {
    const nickname = normalizePlayerName(els.playerNameInput.value);
    if (!nickname.ok) {
      els.nameError.textContent = nickname.error;
      els.playerNameInput.focus();
      return;
    }

    state.playerName = nickname.value;
    state.save.player.nickname = nickname.value;
    storage.set(CONFIG.storageKeys.nickname, nickname.value);
    persistSave();
    els.nameError.textContent = "";
    syncMenuSummary();
    closeMenuSheets();
  }

  function setLeaderboardStatus(message, isError = false) {
    if (!els.leaderboardStatus) {
      return;
    }

    els.leaderboardStatus.textContent = message;
    els.leaderboardStatus.style.color = isError ? "var(--red)" : "";
  }

  function modeLabel(modeId) {
    return SYSTEMS.GAME_MODES[SYSTEMS.normalizeGameMode(modeId)]?.shortLabel || "ארקייד";
  }

  function difficultyLabel(difficultyId) {
    return CONFIG.difficulty[normalizeDifficulty(difficultyId)]?.label || "רגיל";
  }

  function openLeaderboard() {
    if (!els.leaderboardDialog) {
      return;
    }

    state.lastFocusBeforeLeaderboard = document.activeElement;
    if (els.leaderboardModeFilter && !els.leaderboardModeFilter.value) {
      els.leaderboardModeFilter.value = state.mode;
    }
    if (els.leaderboardDifficultyFilter && !els.leaderboardDifficultyFilter.value) {
      els.leaderboardDifficultyFilter.value = state.difficulty;
    }
    els.leaderboardDialog.hidden = false;
    loadLeaderboard();
    window.setTimeout(() => els.leaderboardClose?.focus(), 0);
  }

  function closeLeaderboard() {
    if (!els.leaderboardDialog) {
      return;
    }

    els.leaderboardDialog.hidden = true;
    const focusTarget = state.lastFocusBeforeLeaderboard instanceof HTMLElement
      ? state.lastFocusBeforeLeaderboard
      : els.leaderboardOpen;
    focusTarget?.focus();
  }

  function renderLeaderboard(scores) {
    if (!els.leaderboardList) {
      return;
    }

    els.leaderboardList.replaceChildren();
    if (!Array.isArray(scores) || scores.length === 0) {
      const empty = document.createElement("li");
      empty.className = "leaderboard-placeholder";
      empty.textContent = "עדיין אין שיאים. אפשר להיות הראשון בטבלה.";
      els.leaderboardList.append(empty);
      return;
    }

    scores.slice(0, CONFIG.leaderboard.limit).forEach((entry, index) => {
      const item = document.createElement("li");
      const rank = document.createElement("span");
      const player = document.createElement("span");
      const details = document.createElement("small");
      const score = document.createElement("strong");
      const entryModeLabel = modeLabel(entry.mode || entry.gameMode);
      const entryDifficultyLabel = difficultyLabel(entry.difficulty);
      const stageLabel = (entry.mode || entry.gameMode) === "adventure" ? "שלב" : "גל";

      item.classList.toggle("is-current-player", entry.id === state.latestLeaderboardEntryId || entry.playerId === state.playerId);
      rank.className = "leaderboard-rank";
      rank.textContent = String(index + 1);
      player.className = "leaderboard-player";
      player.textContent = entry.nickname || entry.playerName;
      details.textContent = `${entryModeLabel} · ${entryDifficultyLabel} · ${stageLabel} ${entry.reachedStage || entry.levelReached || 1} · רצף ${entry.maxCombo || 0} · דיוק ${entry.accuracy || 0}%`;
      score.className = "leaderboard-score";
      score.textContent = numberFormat.format(entry.score);

      player.append(details);
      item.append(rank, player, score);
      els.leaderboardList.append(item);
    });
  }

  async function leaderboardRequest(options = {}) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), CONFIG.leaderboard.requestTimeoutMs);

    try {
      const response = await fetch(CONFIG.leaderboard.endpoint, {
        ...options,
        headers: {
          Accept: "application/json",
          ...(options.headers || {})
        },
        signal: controller.signal
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        const error = new Error(payload?.message || "Leaderboard request failed");
        error.code = payload?.code || "leaderboard_request_failed";
        throw error;
      }
      return payload;
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  function toRemoteDifficulty(difficultyId) {
    return {
      beginner: "easy",
      normal: "medium",
      advanced: "hard",
      expert: "veryHard",
      legendary: "veryHard"
    }[normalizeDifficulty(difficultyId)] || "medium";
  }

  async function loadLeaderboard() {
    if (!els.leaderboardList || state.leaderboardLoading) {
      return;
    }

    state.leaderboardLoading = true;
    if (els.leaderboardRefresh) {
      els.leaderboardRefresh.disabled = true;
    }

    const entries = SYSTEMS.getLeaderboardEntries(state.save, {
      mode: els.leaderboardModeFilter?.value || "all",
      difficulty: els.leaderboardDifficultyFilter?.value || "all",
      limit: CONFIG.leaderboard.limit
    });
    renderLeaderboard(entries);
    setLeaderboardStatus(entries.length ? "הטבלה המקומית מעודכנת." : "עדיין אין שיאים בקטגוריה הזאת.");
    state.leaderboardLoading = false;
    if (els.leaderboardRefresh) {
      els.leaderboardRefresh.disabled = false;
    }
  }

  function updatePublishScorePanel() {
    if (!els.publishScorePanel || !els.publishScoreButton || !els.publishScoreStatus) {
      return;
    }

    const eligible = state.correctAnswers >= CONFIG.leaderboard.minimumCorrectAnswers;
    els.publishScorePanel.hidden = !eligible;
    els.publishScoreButton.disabled = false;
    els.publishScoreButton.textContent = "פרסם את השיא";
    els.publishScoreStatus.textContent = "";
    els.publishScoreStatus.style.color = "";
  }

  async function publishScore() {
    if (
      state.scorePublishing
      || state.phase !== "ended"
      || state.correctAnswers < CONFIG.leaderboard.minimumCorrectAnswers
    ) {
      return;
    }

    state.scorePublishing = true;
    els.publishScoreButton.disabled = true;
    els.publishScoreButton.textContent = "מפרסם...";
    els.publishScoreStatus.textContent = "שומר את השיא בטבלה הציבורית...";
    els.publishScoreStatus.style.color = "";

    try {
      const payload = await leaderboardRequest({
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          playerId: state.playerId,
          playerName: state.playerName,
          score: state.score,
          correctAnswers: state.correctAnswers,
          levelReached: getLevelIndexForAnswers(state.correctAnswers) + 1,
          difficulty: toRemoteDifficulty(state.difficulty),
          timeLimitEnabled: state.timeLimitEnabled
        })
      });

      els.publishScoreButton.textContent = "השיא פורסם";
      els.publishScoreStatus.textContent = payload?.improved === false
        ? "השיא הקודם שלך בטבלה עדיין גבוה יותר."
        : "השיא נשמר בהצלחה באלוף האלופים.";
      els.publishScoreStatus.style.color = "var(--green)";
      await loadLeaderboard();
    } catch (error) {
      els.publishScoreButton.disabled = false;
      els.publishScoreButton.textContent = "נסה לפרסם שוב";
      if (error?.code === "leaderboard_not_configured") {
        els.publishScoreStatus.textContent = "מסד הנתונים עדיין לא הוגדר ב־Vercel.";
      } else if (error?.code === "rate_limited") {
        els.publishScoreStatus.textContent = "כבר ניסית לפרסם עכשיו. חכה כמה שניות ונסה שוב.";
      } else {
        els.publishScoreStatus.textContent = "לא הצלחנו לפרסם את השיא כרגע.";
      }
      els.publishScoreStatus.style.color = "var(--red)";
    } finally {
      state.scorePublishing = false;
    }
  }

  const PHASE_TO_GAME_STATE = {
    start: "mainMenu",
    playing: "playing",
    question: "question",
    paused: "paused",
    ended: "results"
  };

  function setPhase(nextPhase, options = {}) {
    const fromState = PHASE_TO_GAME_STATE[state.phase] || state.phase;
    const toState = PHASE_TO_GAME_STATE[nextPhase] || nextPhase;
    if (!options.force && !SYSTEMS.canTransition(fromState, toState)) {
      console.warn(`Invalid game phase transition ignored by audit: ${fromState} -> ${toState}`);
    }
    state.phase = nextPhase;
    document.documentElement.dataset.gameState = toState;
  }

  function startGame(event) {
    event?.preventDefault();
    if (state.phase === "playing" || state.phase === "question") {
      return;
    }

    const playerName = normalizePlayerName(els.playerNameInput.value);

    if (!playerName.ok) {
      els.nameError.textContent = playerName.error;
      els.playerNameInput.focus();
      return;
    }

    state.playerName = playerName.value;
    state.save.player.nickname = state.playerName;
    state.timeLimitEnabled = true;
    setMode(getSelectedMode());
    setCharacter(getSelectedCharacterId());
    setDifficulty(getSelectedDifficulty());
    persistSave();
    closeMenuSheets({ restoreFocus: false });
    els.nameError.textContent = "";
    setupGame();
    setPhase("playing");
    els.startScreen.hidden = true;
    els.startScreen.classList.remove("screen-visible");
    els.endScreen.hidden = true;
    els.leaderboardDialog.hidden = true;
    if (els.publishScorePanel) {
      els.publishScorePanel.hidden = true;
    }
    els.pause.textContent = "Ⅱ";
    stage.focus({ preventScroll: true });
    resumeAudio();
    playTone(420, 0.08, "triangle", 0.04);
  }

  function showStartScreen() {
    setPhase("start", { force: true });
    state.playerName = SYSTEMS.safeNickname(state.save.player.nickname);
    els.endScreen.hidden = true;
    els.questionDialog.hidden = true;
    els.startScreen.hidden = false;
    els.startScreen.classList.add("screen-visible");
    els.winnerTrophy.hidden = true;
    if (els.newRecordBadge) {
      els.newRecordBadge.hidden = true;
    }
    els.playerNameInput.value = state.playerName;
    els.nameError.textContent = "";
    els.pause.textContent = "Ⅱ";
    syncModeInputs();
    syncCharacterInputs();
    syncDifficultyInputs();
    syncTimeLimitToggle();
    syncMenuSummary();
    closeMenuSheets({ restoreFocus: false });
    setupGame();
    focusPlayerNameWhenUseful();
  }

  function retryGame() {
    const nickname = SYSTEMS.safeNickname(state.playerName || state.save.player.nickname);
    els.playerNameInput.value = nickname;
    startGame();
  }

  function togglePause() {
    if (state.phase === "playing") {
      setPhase("paused");
      resetJoystick();
      els.pause.textContent = "▶";
      playTone(220, 0.06, "sine", 0.035);
      return;
    }

    if (state.phase === "paused") {
      setPhase("playing");
      els.pause.textContent = "Ⅱ";
      state.lastTime = performance.now();
      playTone(440, 0.06, "sine", 0.035);
    }
  }

  function toggleSound() {
    state.soundEnabled = !state.soundEnabled;
    storage.set(CONFIG.storageKeys.sound, state.soundEnabled ? "on" : "off");
    persistSave();
    updateSoundButton();
    if (state.soundEnabled) {
      resumeAudio();
      playTone(520, 0.08, "triangle", 0.04);
    }
  }

  function updateSoundButton() {
    const label = state.soundEnabled ? "צלילים פועלים" : "צלילים כבויים";
    const text = state.soundEnabled ? "♪" : "×";
    if (els.sound) {
      els.sound.textContent = text;
      els.sound.setAttribute("aria-label", label);
    }
    if (els.menuSound) {
      const icon = els.menuSound.querySelector("span") || els.menuSound;
      icon.textContent = text;
      els.menuSound.setAttribute("aria-label", label);
    }
  }

  function resumeAudio() {
    if (!state.soundEnabled) {
      return;
    }

    if (!state.audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        return;
      }
      state.audioContext = new AudioContextClass();
    }

    if (state.audioContext.state === "suspended") {
      state.audioContext.resume();
    }
  }

  function playTone(frequency, duration, type = "sine", gainValue = 0.035) {
    if (!state.soundEnabled || !state.audioContext) {
      return;
    }

    const now = state.audioContext.currentTime;
    const oscillator = state.audioContext.createOscillator();
    const gain = state.audioContext.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(gainValue, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain);
    gain.connect(state.audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  }

  function playCorrectSound() {
    playTone(520, 0.08, "triangle", 0.04);
    setTimeout(() => playTone(740, 0.09, "triangle", 0.035), 55);
  }

  function playMissionSound() {
    playTone(660, 0.07, "triangle", 0.035);
    setTimeout(() => playTone(880, 0.08, "triangle", 0.03), 60);
    setTimeout(() => playTone(990, 0.09, "triangle", 0.025), 120);
  }

  function playWrongSound() {
    playTone(160, 0.16, "sawtooth", 0.035);
  }

  function setDirection(direction) {
    if (!DIRS[direction] || !state.player || state.phase !== "playing") {
      return;
    }

    state.player.desiredDirection = direction;
    state.player.directionRequestTime = state.clock;
    tryApplyPlayerDirection(state.player, direction);
  }

  function awardScore(event, options = {}) {
    const comboMultiplierPct = options.comboMultiplierPct ?? state.comboState.multiplierPct ?? 100;
    const award = SYSTEMS.applyScoreEvent(state.scoreState, event, {
      difficulty: getDifficultySettings(),
      comboMultiplierPct
    });
    state.score = state.scoreState.total;
    return award;
  }

  function applyCombo(eventName) {
    SYSTEMS.applyComboEvent(state.comboState, eventName, getDifficultySettings());
    state.combo = state.comboState.count;
    return state.comboState;
  }

  function formatSeconds(ms) {
    if (!ms) {
      return "0.0ש׳";
    }
    return `${(ms / 1000).toFixed(1)}ש׳`;
  }

  function updateHud() {
    const level = getCurrentLevel();
    const mode = getModeSettings();
    const difficulty = getDifficultySettings();
    const arcadeWave = getArcadeWave();
    els.correct.textContent = state.correctAnswers;
    els.targetCorrect.textContent = state.mode === "arcade" ? `/גל ${arcadeWave}` : `/${CONFIG.targetCorrect}`;
    if (els.levelNumber) {
      els.levelNumber.textContent = state.mode === "arcade" ? `${arcadeWave}` : `${state.levelIndex + 1}`;
    }
    if (els.worldName) {
      els.worldName.textContent = level.shortName;
      els.worldName.setAttribute("aria-label", level.name);
    }
    if (els.modeLabel) {
      els.modeLabel.textContent = mode.shortLabel;
    }
    if (els.difficultyLabel) {
      els.difficultyLabel.textContent = difficulty.label;
    }
    els.score.textContent = numberFormat.format(state.score);
    els.combo.textContent = state.comboState.multiplierPct > 100
      ? `${state.combo} · ×${(state.comboState.multiplierPct / 100).toFixed(1)}`
      : String(state.combo);
    const hearts = "♥".repeat(Math.max(0, state.lives));
    els.lives.textContent = hearts || "0";
    els.lives.setAttribute("aria-label", `${state.lives} חיים`);
    const progressPercent = state.mode === "arcade"
      ? (state.correctAnswers % CONFIG.answersPerLevel) / CONFIG.answersPerLevel * 100
      : state.correctAnswers / CONFIG.targetCorrect * 100;
    els.progress.style.width = `${Math.min(100, progressPercent)}%`;
    els.bestScore.textContent = numberFormat.format(state.bestScore);
    updateMissionHud();
  }

  function updateMissionHud() {
    if (!state.mission) {
      els.missionTitle.textContent = "משימה חדשה בדרך";
      els.missionProgress.textContent = "";
      return;
    }

    const progress = getMissionProgress();
    els.missionTitle.textContent = state.mission.label;
    els.missionProgress.textContent = `${Math.min(progress, state.mission.target)}/${state.mission.target}`;
    els.missionCard.setAttribute("aria-label", `משימה: ${state.mission.label}, ${progress} מתוך ${state.mission.target}`);
  }

  function assignMission() {
    const previousType = state.mission?.type;
    const pool = CONFIG.missions.filter((mission) => mission.type !== previousType);
    const template = randomItem(pool.length ? pool : CONFIG.missions);
    state.mission = {
      ...template,
      progress: 0,
      startScore: state.score
    };
  }

  function getMissionProgress() {
    if (!state.mission) {
      return 0;
    }

    if (state.mission.type === "combo") {
      return state.combo;
    }

    if (state.mission.type === "score") {
      return Math.max(0, state.score - state.mission.startScore);
    }

    return state.mission.progress;
  }

  function updateMission(eventName, amount = 1) {
    if (!state.mission) {
      return;
    }

    if (
      (eventName === "score" && state.mission.type === "score") ||
      (eventName === "correctAnswer" && state.mission.type === "combo")
    ) {
      pulseElement(els.missionCard, "metric-pulse");
      if (getMissionProgress() >= state.mission.target) {
        completeMission();
      }
      return;
    }

    const before = getMissionProgress();

    if (eventName === "wrongAnswer" && state.mission.type === "safeCorrect") {
      state.mission.progress = 0;
    }

    if (eventName === "correctAnswer" && (state.mission.type === "correct" || state.mission.type === "safeCorrect")) {
      state.mission.progress += amount;
    }

    if (eventName === "enemyDefeated" && state.mission.type === "enemies") {
      state.mission.progress += amount;
    }

    const after = getMissionProgress();
    if (after !== before) {
      pulseElement(els.missionCard, "metric-pulse");
    }

    if (after >= state.mission.target) {
      completeMission();
    }
  }

  function completeMission() {
    const award = awardScore({ type: "mission", value: CONFIG.missionBonus });
    playMissionSound();
    pulseElement(els.missionCard, "metric-pulse");
    pulseElement(els.progressWrap, "progress-pulse");

    if (state.player) {
      addFloatingText(state.player.x, state.player.y - 34, `משימה +${award.total}`, "#67f08b");
      addBurst(state.player.x, state.player.y, "#67f08b", 18, 110);
    }

    assignMission();
    updateHud();
  }

  function pulseElement(element, className) {
    if (!element) {
      return;
    }

    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
  }

  function update(dt) {
    state.clock += dt;
    state.shake = Math.max(0, state.shake - dt);
    updateCamera(dt);

    if (state.phase === "playing") {
      updatePlaying(dt);
    } else {
      if (state.phase === "question") {
        updateQuestionTimer();
      }
      updateAmbient(dt);
    }

    updateLevelBanner(dt);
  }

  function updatePlaying(dt) {
    updateSpawns(dt);
    updatePlayer(dt);
    collectItems();
    updateEnemies(dt);
    checkEnemyCollision();
    refillCollectibles();
    updateParticles(dt);
    updateFloatingTexts(dt);
    ensureEnemyCount();
  }

  function updateAmbient(dt) {
    if (state.player) {
      state.player.visualPulse = 0.24 + Math.abs(Math.sin(state.clock * 8)) * 0.32;
      updatePlayerVisualState(state.player, dt);
    }

    if (state.phase === "ended") {
      updateFireworks(dt);
    }

    updateParticles(dt);
    updateFloatingTexts(dt);
  }

  function updateSpawns(dt) {
    for (let i = state.pendingSpawns.length - 1; i >= 0; i -= 1) {
      const pending = state.pendingSpawns[i];
      pending.delay -= dt;
      if (pending.delay <= 0) {
        spawnEnemy(pending.index);
        state.pendingSpawns.splice(i, 1);
      }
    }
  }

  function updatePlayer(dt) {
    const player = state.player;
    player.invulnerable = Math.max(0, player.invulnerable - dt);
    player.visualPulse = 0.24 + Math.abs(Math.sin(state.clock * 10)) * 0.34;
    updatePlayerVisualState(player, dt);

    const hasFreshDirection = state.clock - player.directionRequestTime <= INPUT_BUFFER_SECONDS;

    if (hasFreshDirection) {
      tryApplyPlayerDirection(player, player.desiredDirection);
    }

    const moved = moveActor(player, player.direction, player.speed * dt);

    if (!moved && hasFreshDirection && tryApplyPlayerDirection(player, player.desiredDirection)) {
      moveActor(player, player.direction, player.speed * dt);
    }

    player.trail.unshift({ x: player.x, y: player.y, life: 0.28 });
    player.trail = player.trail.filter((point) => {
      point.life -= dt;
      return point.life > 0;
    }).slice(0, 14);
  }

  function updatePlayerVisualState(player, dt) {
    player.eatAnimation = Math.max(0, player.eatAnimation - dt);
    if (player.eatEffect) {
      player.eatEffect.life -= dt;
      if (player.eatEffect.life <= 0) {
        player.eatEffect = null;
      }
    }
  }

  function tryApplyPlayerDirection(player, direction) {
    if (!DIRS[direction] || direction === "none") {
      return false;
    }

    const turnPosition = getPlayerTurnPosition(player, direction);
    if (!turnPosition) {
      return false;
    }

    const vector = DIRS[direction];
    const nextX = turnPosition.x + vector.x * TURN_LOOKAHEAD;
    const nextY = turnPosition.y + vector.y * TURN_LOOKAHEAD;

    if (circleHitsWall(nextX, nextY, player.radius)) {
      return false;
    }

    player.x = turnPosition.x;
    player.y = turnPosition.y;
    player.direction = direction;
    return true;
  }

  function getPlayerTurnPosition(player, direction) {
    const vector = DIRS[direction];
    const turnPosition = { x: player.x, y: player.y };

    if (vector.x !== 0) {
      const laneY = nearestLaneCenter(player.y);
      if (Math.abs(player.y - laneY) > TURN_SNAP_DISTANCE) {
        return null;
      }
      turnPosition.y = laneY;
    }

    if (vector.y !== 0) {
      const laneX = nearestLaneCenter(player.x);
      if (Math.abs(player.x - laneX) > TURN_SNAP_DISTANCE) {
        return null;
      }
      turnPosition.x = laneX;
    }

    return turnPosition;
  }

  function nearestLaneCenter(value) {
    return Math.round((value - TILE / 2) / TILE) * TILE + TILE / 2;
  }

  function canMove(actor, direction, distance) {
    const vector = DIRS[direction];
    if (!vector) {
      return false;
    }

    const aligned = alignedPosition(actor, direction);
    return !circleHitsWall(aligned.x + vector.x * distance, aligned.y + vector.y * distance, actor.radius);
  }

  function moveActor(actor, direction, distance) {
    const vector = DIRS[direction];
    if (!vector || direction === "none") {
      return false;
    }

    const aligned = alignedPosition(actor, direction);
    actor.x = aligned.x;
    actor.y = aligned.y;

    let moved = false;
    let remaining = distance;
    const step = TILE / 5;

    while (remaining > 0) {
      const amount = Math.min(step, remaining);
      const nextX = actor.x + vector.x * amount;
      const nextY = actor.y + vector.y * amount;

      if (circleHitsWall(nextX, nextY, actor.radius)) {
        return moved;
      }

      actor.x = nextX;
      actor.y = nextY;
      remaining -= amount;
      moved = true;
    }

    return moved;
  }

  function alignedPosition(actor, direction) {
    const vector = DIRS[direction];
    const result = { x: actor.x, y: actor.y };
    const cell = toCell(actor.x, actor.y);
    const center = centerOfCell(cell.x, cell.y);
    const snapDistance = 4.8;

    if (vector.x !== 0 && Math.abs(actor.y - center.y) < snapDistance) {
      result.y = center.y;
    }

    if (vector.y !== 0 && Math.abs(actor.x - center.x) < snapDistance) {
      result.x = center.x;
    }

    return result;
  }

  function collectItems() {
    const player = state.player;
    let collected = 0;

    for (const [key, collectible] of state.collectibles) {
      const dx = collectible.x - player.x;
      const dy = collectible.y - player.y;
      const hitRadius = player.radius + collectible.radius + 1.4;
      if (dx * dx + dy * dy <= hitRadius * hitRadius) {
        state.collectibles.delete(key);
        const award = awardScore({
          type: "collectible",
          value: collectible.value
        });
        collected += 1;
        player.eatAnimation = GAME_THEME.player.eatAnimationDuration;
        player.eatDirection = player.direction;
        player.eatEffect = {
          x: collectible.x,
          y: collectible.y,
          value: collectible.value,
          color: collectible.value > 10
            ? getCurrentLevel().bonusCollectibleColor
            : getCurrentLevel().collectibleColor,
          life: GAME_THEME.player.eatAnimationDuration,
          maxLife: GAME_THEME.player.eatAnimationDuration
        };
        if (collectible.value > 10) {
          addBurst(collectible.x, collectible.y, "#ffd84a", 12, 70);
          addFloatingText(collectible.x, collectible.y - 12, `+${award.total}`, "#ffd84a");
        } else if (Math.random() < 0.2) {
          addBurst(collectible.x, collectible.y, "#f7fbff", 4, 42);
        }
      }
    }

    if (collected > 0) {
      playTone(620 + Math.min(collected, 4) * 40, 0.035, "square", 0.012);
      updateMission("score");
      updateHud();
    }
  }

  function updateEnemies(dt) {
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
      // Do not snap back to the same cell center on every animation frame.
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
  }

  function getEnemyTarget(enemy, playerCell) {
    const player = state.player;

    // Touch devices use a clear, direct pursuit model so every black enemy
    // visibly hunts the main character instead of appearing to wander.
    if (MOBILE_RUNTIME.coarse) {
      return normalizeTargetCell(playerCell);
    }

    const playerDir = DIRS[player.direction] || DIRS.right;
    const cycle = state.clock % 24;
    const aggression = getDifficultySettings().enemyAiAggressiveness || 1;
    const scatterWindow = !MOBILE_RUNTIME.coarse && state.clock > 10 && cycle > 18 + clamp((aggression - 1) * 5, 0, 4);

    if (player.invulnerable > 0 || scatterWindow) {
      return normalizeTargetCell(enemy.scatter);
    }

    if (enemy.personality === 1) {
      return normalizeTargetCell({
        x: playerCell.x + playerDir.x * Math.round(3 + aggression),
        y: playerCell.y + playerDir.y * Math.round(3 + aggression)
      });
    }

    if (enemy.personality === 2) {
      const side = state.clock % 6 < 3 ? { x: playerDir.y, y: -playerDir.x } : { x: -playerDir.y, y: playerDir.x };
      return normalizeTargetCell({
        x: playerCell.x + side.x * 5,
        y: playerCell.y + side.y * 5
      });
    }

    if (!MOBILE_RUNTIME.coarse
      && enemy.personality === 3
      && distanceCells(toCell(enemy.x, enemy.y), playerCell) < 7) {
      return normalizeTargetCell(enemy.scatter);
    }

    return normalizeTargetCell(playerCell);
  }

  function normalizeTargetCell(cell) {
    const clampedCell = {
      x: clamp(cell.x, 1, COLS - 2),
      y: clamp(cell.y, 1, ROWS - 2)
    };

    if (state.reachable.has(cellKey(clampedCell.x, clampedCell.y))) {
      return clampedCell;
    }

    let best = PLAYER_START;
    let bestDistance = Infinity;
    for (const reachable of state.reachableList) {
      const dx = reachable.x - clampedCell.x;
      const dy = reachable.y - clampedCell.y;
      const d = dx * dx + dy * dy;
      if (d < bestDistance) {
        best = reachable;
        bestDistance = d;
      }
    }

    return best;
  }

  function findNextDirection(start, target, currentDirection) {
    const options = DIR_NAMES.filter((dir) => {
      const next = {
        x: start.x + DIRS[dir].x,
        y: start.y + DIRS[dir].y
      };
      return state.reachable.has(cellKey(next.x, next.y));
    });

    if (options.length === 0) {
      return OPPOSITE[currentDirection] || "right";
    }

    const withoutReverse = options.filter((dir) => dir !== OPPOSITE[currentDirection]);
    const candidateMoves = MOBILE_RUNTIME.coarse
      ? options
      : (withoutReverse.length > 0 ? withoutReverse : options);
    const firstMoves = MOBILE_RUNTIME.coarse ? candidateMoves : shuffle(candidateMoves);
    const visited = new Set([cellKey(start.x, start.y)]);
    const queue = [];

    for (const dir of firstMoves) {
      const next = {
        x: start.x + DIRS[dir].x,
        y: start.y + DIRS[dir].y
      };
      const key = cellKey(next.x, next.y);
      visited.add(key);
      queue.push({ cell: next, first: dir });
    }

    let fallback = firstMoves[0];
    let fallbackScore = Infinity;

    for (let i = 0; i < queue.length; i += 1) {
      const item = queue[i];
      const score = distanceCells(item.cell, target);
      if (score < fallbackScore) {
        fallback = item.first;
        fallbackScore = score;
      }

      if (item.cell.x === target.x && item.cell.y === target.y) {
        return item.first;
      }

      for (const dir of DIR_NAMES) {
        const next = {
          x: item.cell.x + DIRS[dir].x,
          y: item.cell.y + DIRS[dir].y
        };
        const key = cellKey(next.x, next.y);
        if (!visited.has(key) && state.reachable.has(key)) {
          visited.add(key);
          queue.push({ cell: next, first: item.first });
        }
      }
    }

    return fallback;
  }

  function checkEnemyCollision() {
    if (state.player.invulnerable > 0 || state.phase !== "playing") {
      return;
    }

    const player = state.player;
    const enemy = state.enemies.find((candidate) => {
      const dx = candidate.x - player.x;
      const dy = candidate.y - player.y;
      const radius = candidate.radius + player.radius - 1.5;
      return dx * dx + dy * dy < radius * radius;
    });

    if (enemy) {
      openQuestion(enemy);
    }
  }

  function generateQuestion() {
    const difficulty = getDifficultySettings();
    const reviewQuestion = Math.random() < getAdaptiveQuestionChance() ? createReviewQuestion(difficulty) : null;
    const question = reviewQuestion || createRandomQuestion();
    rememberQuestionKey(question.key);
    return question;
  }

  function createRandomQuestion() {
    const difficulty = getDifficultySettings();
    let { a, b } = createFactorPair(difficulty);

    for (let attempt = 0; attempt < 12 && hasRecentQuestion(factKey(a, b)); attempt += 1) {
      ({ a, b } = createFactorPair(difficulty));
    }

    return makeMultiplicationQuestion(a, b);
  }

  function createFactorPair(difficulty) {
    if (difficulty.questionMode === "table") {
      return {
        a: randomInt(1, 10),
        b: randomInt(1, 10)
      };
    }

    if (difficulty.questionMode === "filteredTable") {
      return {
        a: randomItem(NON_EASY_FACTORS),
        b: randomItem(NON_EASY_FACTORS)
      };
    }

    if (difficulty.questionMode === "twoByOne") {
      return {
        a: randomInt(11, 99),
        b: randomItem(NON_EASY_FACTORS)
      };
    }

    if (difficulty.questionMode === "legendary") {
      return {
        a: randomInt(12, 99),
        b: randomInt(12, 99)
      };
    }

    return {
      a: randomInt(11, 99),
      b: randomInt(11, 99)
    };
  }

  function createReviewQuestion(difficulty) {
    const candidates = Object.entries(state.factStats)
      .map(([key, stats]) => ({
        key,
        factors: parseFactKey(key),
        stats,
        weight: Math.max(0, stats.wrong * 2 - stats.correct)
      }))
      .filter((candidate) => {
        return candidate.factors
          && candidate.weight > 0
          && !hasRecentQuestion(candidate.key)
          && isFactAllowedForDifficulty(candidate.factors.a, candidate.factors.b, difficulty);
      });

    if (candidates.length === 0) {
      return null;
    }

    const candidate = weightedRandom(candidates);
    const factors = candidate.factors;

    return makeMultiplicationQuestion(factors.a, factors.b);
  }

  function isFactAllowedForDifficulty(a, b, difficulty) {
    if (difficulty.questionMode === "table") {
      return isBetween(a, 1, 10) && isBetween(b, 1, 10);
    }

    if (difficulty.questionMode === "filteredTable") {
      return NON_EASY_FACTORS.includes(a) && NON_EASY_FACTORS.includes(b);
    }

    if (difficulty.questionMode === "twoByOne") {
      return isBetween(a, 11, 99) && NON_EASY_FACTORS.includes(b);
    }

    if (difficulty.questionMode === "legendary") {
      return isBetween(a, 12, 99) && isBetween(b, 12, 99);
    }

    return isBetween(a, 11, 99) && isBetween(b, 11, 99);
  }

  function isBetween(value, min, max) {
    return value >= min && value <= max;
  }

  function makeMultiplicationQuestion(a, b) {
    return {
      key: factKey(a, b),
      text: formatQuestion(a, "×", b),
      answer: a * b
    };
  }

  function formatQuestion(left, operator, right) {
    return `${LTR_ISOLATE_START}${left} ${operator} ${right} = ?${LTR_ISOLATE_END}`;
  }

  function factKey(a, b) {
    return `${a}×${b}`;
  }

  function parseFactKey(key) {
    const match = /^(\d+)×(\d+)$/.exec(key);
    if (!match) {
      return null;
    }

    return {
      a: Number(match[1]),
      b: Number(match[2])
    };
  }

  function hasRecentQuestion(key) {
    return state.recentQuestionKeys.includes(key);
  }

  function rememberQuestionKey(key) {
    state.recentQuestionKeys.unshift(key);
    state.recentQuestionKeys = state.recentQuestionKeys.slice(0, CONFIG.recentQuestionMemory);
  }

  function weightedRandom(items) {
    const total = items.reduce((sum, item) => sum + item.weight, 0);
    let cursor = Math.random() * total;

    for (const item of items) {
      cursor -= item.weight;
      if (cursor <= 0) {
        return item;
      }
    }

    return items[items.length - 1];
  }

  function recordFactResult(question, correct) {
    if (!question?.key) {
      return;
    }

    const stats = state.factStats[question.key] || { wrong: 0, correct: 0 };
    if (correct) {
      stats.correct += 1;
    } else {
      stats.wrong += 1;
    }

    state.factStats[question.key] = stats;
    saveFactStats();
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function positiveFeedback() {
    return randomItem(CONFIG.positiveFeedback);
  }

  function supportFeedback(answer) {
    return randomItem(CONFIG.supportFeedback).replace("{answer}", String(answer));
  }

  function timeExpiredFeedback(answer) {
    return `נגמר הזמן. התשובה היא ${answer}`;
  }

  function openQuestion(enemy) {
    clearQuestionFeedbackTimer();
    setPhase("question");
    resetJoystick();
    state.question = generateQuestion();
    state.questionStartedAt = performance.now();
    state.currentEnemyId = enemy.id;
    state.answerLocked = false;
    els.questionStatus.textContent = `יריב ${state.combo > 2 ? "ברצף" : "נתפס"}`;
    els.questionTitle.dir = "ltr";
    els.questionTitle.textContent = state.question.text;
    els.questionFeedback.textContent = "";
    els.questionFeedback.style.color = "";
    els.answerInput.value = "";
    els.answerInput.disabled = false;
    els.submitAnswer.disabled = false;
    els.questionDialog.hidden = false;
    startQuestionTimer();
    playTone(310, 0.08, "triangle", 0.035);
    setTimeout(() => els.answerInput.focus(), 30);
  }

  function startQuestionTimer() {
    if (!isQuestionTimerEnabled()) {
      state.questionTimeRemaining = null;
      state.questionDeadline = null;
      updateQuestionTimerDisplay();
      return;
    }

    state.questionDeadline = performance.now() + getQuestionTimeLimit() * 1000;
    state.questionTimeRemaining = getQuestionTimeRemaining();
    updateQuestionTimerDisplay();
  }

  function isQuestionTimerEnabled() {
    return getQuestionTimeLimit() > 0;
  }

  function getQuestionTimeLimit() {
    return getDifficultySettings().answerTimeLimit || CONFIG.questionTimeLimit;
  }

  function updateQuestionTimer() {
    if (!isQuestionTimerEnabled() || state.answerLocked || !state.question || state.questionDeadline === null) {
      return;
    }

    state.questionTimeRemaining = getQuestionTimeRemaining();
    updateQuestionTimerDisplay();

    if (state.questionTimeRemaining <= 0) {
      expireQuestionTimer();
    }
  }

  function suspendQuestionTimer() {
    if (
      state.phase !== "question"
      || !isQuestionTimerEnabled()
      || state.answerLocked
      || state.questionDeadline === null
    ) {
      return;
    }

    state.questionTimeRemaining = getQuestionTimeRemaining();
    state.questionDeadline = null;
  }

  function resumeQuestionTimer() {
    if (
      state.phase !== "question"
      || !isQuestionTimerEnabled()
      || state.answerLocked
      || state.questionDeadline !== null
      || state.questionTimeRemaining === null
    ) {
      return;
    }

    if (state.questionTimeRemaining <= 0) {
      expireQuestionTimer();
      return;
    }

    state.questionDeadline = performance.now() + state.questionTimeRemaining * 1000;
    updateQuestionTimerDisplay();
  }

  function getQuestionTimeRemaining() {
    if (state.questionDeadline === null) {
      return null;
    }

    return Math.max(0, (state.questionDeadline - performance.now()) / 1000);
  }

  function updateQuestionTimerDisplay() {
    if (!els.questionTimer || !els.questionTime) {
      return;
    }

    const hasTimer = isQuestionTimerEnabled() && state.questionDeadline !== null && state.questionTimeRemaining !== null;
    els.questionTimer.hidden = !hasTimer;
    if (!hasTimer) {
      return;
    }

    const seconds = Math.ceil(state.questionTimeRemaining);
    els.questionTime.textContent = String(seconds);
    els.questionTimer.classList.toggle("question-timer-low", seconds <= 5);
  }

  function expireQuestionTimer() {
    if (state.answerLocked || !state.question) {
      return;
    }

    state.answerLocked = true;
    els.answerInput.disabled = true;
    els.submitAnswer.disabled = true;
    recordFactResult(state.question, false);
    SYSTEMS.recordMathAnswer(state.mathStats, {
      correct: false,
      responseMs: getQuestionTimeLimit() * 1000
    });
    state.incorrectAnswers = state.mathStats.incorrectAnswers;
    state.questionDeadline = null;
    els.questionFeedback.textContent = timeExpiredFeedback(state.question.answer);
    els.questionFeedback.style.color = "#ff4c5f";
    scheduleQuestionFinish(false, {
      responseMs: getQuestionTimeLimit() * 1000,
      timedOut: true
    });
  }

  function clearQuestionFeedbackTimer() {
    if (!state.questionFeedbackTimerId) {
      return;
    }

    clearTimeout(state.questionFeedbackTimerId);
    state.questionFeedbackTimerId = null;
  }

  function scheduleQuestionFinish(correct, answerContext = {}) {
    clearQuestionFeedbackTimer();
    state.questionFeedbackTimerId = setTimeout(
      () => finishQuestion(correct, answerContext),
      correct ? CONFIG.questionFeedbackDelay.correct : CONFIG.questionFeedbackDelay.wrong
    );
  }

  function finishQuestion(correct, answerContext = {}) {
    state.questionFeedbackTimerId = null;
    state.questionTimeRemaining = null;
    state.questionDeadline = null;
    updateQuestionTimerDisplay();
    els.questionDialog.hidden = true;
    state.answerLocked = false;
    els.answerInput.disabled = false;
    els.submitAnswer.disabled = false;

    if (correct) {
      applyCorrectAnswer(answerContext);
    } else {
      applyWrongAnswer(answerContext);
    }

    updateHud();
  }

  function applyCorrectAnswer(answerContext = {}) {
    const enemy = state.enemies.find((candidate) => candidate.id === state.currentEnemyId);
    const previousLevelIndex = state.levelIndex;
    state.correctAnswers = state.mathStats.correctAnswers;
    applyCombo("success");
    const award = awardScore({
      type: "correctAnswer",
      responseMs: answerContext.responseMs,
      timeLimitMs: isQuestionTimerEnabled() ? getQuestionTimeLimit() * 1000 : 0,
      questionMode: getDifficultySettings().questionMode,
      enemyDefeated: Boolean(enemy)
    });
    state.shake = 0.07;
    playCorrectSound();
    pulseElement(els.progressWrap, "progress-pulse");
    pulseElement(els.combo.closest(".metric"), "metric-pulse");

    if (enemy) {
      addBurst(enemy.x, enemy.y, enemy.color, 36, 150);
      addFloatingText(enemy.x, enemy.y - 24, `+${award.total}`, "#67f08b");
      state.enemies = state.enemies.filter((candidate) => candidate.id !== enemy.id);
      scheduleEnemySpawn(0.9);
      updateMission("enemyDefeated");
    }

    if (state.player) {
      addFloatingText(state.player.x, state.player.y - 44, positiveFeedback(), getCurrentLevel().accent);
    }

    updateMission("correctAnswer");

    const awardedLife = state.correctAnswers % CONFIG.answersPerLevel === 0;
    if (awardedLife) {
      const stageAward = awardScore({
        type: "stageComplete",
        mode: state.mode
      });
      state.lives += 1;
      addFloatingText(state.player.x, state.player.y - 28, `גל +${stageAward.total}`, "#ffd84a");
      addFloatingText(state.player.x, state.player.y - 10, "+חיים", "#ff5f9f");
      playTone(880, 0.12, "triangle", 0.04);
    }

    if (state.mode === "adventure" && state.correctAnswers >= CONFIG.targetCorrect) {
      showEndScreen(true);
      return;
    }

    const nextLevelIndex = getLevelIndexForAnswers(state.correctAnswers);
    setPhase("playing");
    state.currentEnemyId = null;
    state.question = null;

    if (nextLevelIndex !== previousLevelIndex) {
      enterLevel(nextLevelIndex, { announce: true, awardedLife });
      return;
    }

    ensureEnemyCount();
  }

  function applyWrongAnswer() {
    state.lives -= 1;
    state.incorrectAnswers = state.mathStats.incorrectAnswers;
    state.hitsTaken += 1;
    applyCombo("lifeLost");
    state.shake = 0.28;
    playWrongSound();
    updateMission("wrongAnswer");
    pulseElement(stage, "stage-hit");
    pulseElement(els.lives.closest(".metric"), "life-hit");
    addBurst(state.player.x, state.player.y, "#ff4c5f", 26, 130);
    addFloatingText(state.player.x, state.player.y - 44, "מנסים שוב", "#ffd84a");
    addFloatingText(state.player.x, state.player.y - 26, "-חיים", "#ff4c5f");

    if (state.lives <= 0) {
      showEndScreen(false);
      return;
    }

    resetPositionsAfterHit();
    state.player.invulnerable = 2.6;
    setPhase("playing");
    state.currentEnemyId = null;
    state.question = null;
  }

  function resetPositionsAfterHit() {
    const playerPos = centerOfCell(PLAYER_START.x, PLAYER_START.y);
    state.player.x = playerPos.x;
    state.player.y = playerPos.y;
    state.player.direction = "right";
    state.player.desiredDirection = "right";
    state.player.directionRequestTime = state.clock;
    state.player.eatAnimation = 0;
    state.player.eatEffect = null;
    state.player.trail = [];

    state.enemies.forEach((enemy, index) => {
      const cell = chooseEnemySpawnCell(index);
      const pos = centerOfCell(cell.x, cell.y);
      enemy.x = pos.x;
      enemy.y = pos.y;
      enemy.direction = randomItem(DIR_NAMES);
      enemy.pathCooldown = 0;
      enemy.spawnFlash = 0.8;
    });
  }

  function applyFinalScoreBonuses(won) {
    const accuracy = SYSTEMS.getAccuracy(state.mathStats);
    if (state.lives > 0) {
      awardScore({ type: "lifeRemaining", count: state.lives }, { comboMultiplierPct: 100 });
    }
    if (state.hitsTaken === 0 && state.mathStats.totalQuestions > 0) {
      awardScore({ type: "noHitBonus" }, { comboMultiplierPct: 100 });
    }
    if (state.mathStats.totalQuestions >= 5) {
      awardScore({ type: "accuracyBonus", accuracy }, { comboMultiplierPct: 100 });
    }
    if (won && state.sessionStartedAt) {
      const elapsedSeconds = Math.max(0, (performance.now() - state.sessionStartedAt) / 1000);
      const timeBonus = Math.max(0, Math.floor(SYSTEMS.SCORE_CONFIG.timeBonusMax - elapsedSeconds * 6));
      awardScore({ type: "timeBonus", value: timeBonus }, { comboMultiplierPct: 100 });
    }
  }

  function finalizeSession(won) {
    if (state.finalResult) {
      return state.finalResult;
    }

    applyFinalScoreBonuses(won);

    const mode = state.mode;
    const difficulty = state.difficulty;
    const accuracy = SYSTEMS.getAccuracy(state.mathStats);
    const averageAnswerTimeMs = SYSTEMS.getAverageAnswerTime(state.mathStats);
    const reachedStage = mode === "arcade" ? getArcadeWave() : getLevelIndexForAnswers(state.correctAnswers) + 1;
    const previousBest = getPersonalBestForSelection(mode, difficulty);
    const score = state.scoreState.total;
    const resultDate = new Date().toISOString();

    const bestResult = SYSTEMS.recordPersonalBest(state.save, {
      mode,
      difficulty,
      score,
      reachedStage,
      maxCombo: state.comboState.max,
      accuracy,
      date: resultDate
    });
    const newRecord = score > previousBest;

    const entry = SYSTEMS.createLeaderboardEntry({
      playerId: state.playerId,
      nickname: state.playerName || state.save.player.nickname,
      score,
      mode,
      difficulty,
      reachedStage,
      selectedCharacter: state.characterId,
      maxCombo: state.comboState.max,
      accuracy,
      date: resultDate,
      gameVersion: SYSTEMS.GAME_VERSION
    });
    const leaderboardResult = SYSTEMS.addLocalLeaderboardEntry(state.save, entry, {
      limit: CONFIG.leaderboard.limit
    });
    state.latestLeaderboardEntryId = leaderboardResult.entry?.id || null;

    const completionKey = `${mode}:${difficulty}`;
    const previousCompletion = state.save.completedLevels[completionKey] || { reachedStage: 0, won: false };
    state.save.completedLevels[completionKey] = {
      reachedStage: Math.max(previousCompletion.reachedStage || 0, reachedStage),
      won: previousCompletion.won || won,
      updatedAt: resultDate
    };

    const unlocksLegendary = SYSTEMS.shouldUnlockLegendary(state.save, {
      mode,
      difficulty,
      won,
      score
    });
    if (unlocksLegendary) {
      SYSTEMS.unlockDifficulty(state.save, "legendary");
      playMissionSound();
    }

    state.save.player.nickname = state.playerName || state.save.player.nickname;
    state.save.settings.selectedMode = mode;
    state.save.settings.selectedDifficulty = difficulty;
    state.save.settings.selectedCharacter = state.characterId;
    SYSTEMS.persistSave(window.localStorage, state.save, { key: CONFIG.storageKeys.save });

    if (newRecord) {
      state.bestScore = score;
      storage.set(CONFIG.storageKeys.bestScore, String(score));
      els.bestScore.textContent = numberFormat.format(score);
    } else {
      state.bestScore = Math.max(previousBest, bestResult.current);
    }

    state.finalResult = {
      won,
      score,
      previousBest,
      newRecord,
      leaderboardRank: leaderboardResult.rank,
      scoreToNextRank: leaderboardResult.scoreToNextRank,
      mode,
      difficulty,
      reachedStage,
      correctAnswers: state.mathStats.correctAnswers,
      incorrectAnswers: state.mathStats.incorrectAnswers,
      totalQuestions: state.mathStats.totalQuestions,
      accuracy,
      averageAnswerTimeMs,
      fastestAnswerMs: state.mathStats.fastestAnswerMs,
      maxCombo: state.comboState.max,
      remainingLives: state.lives,
      breakdown: { ...state.scoreState.breakdown },
      unlocksLegendary
    };

    return state.finalResult;
  }

  function renderScoreBreakdown(breakdown) {
    if (!els.scoreBreakdownList) {
      return;
    }

    const rows = [
      ["נקודות משחק", breakdown.gameplay],
      ["נקודות מתמטיקה", breakdown.math],
      ["בונוס מהירות", breakdown.speed],
      ["ניצחון על יריבים", breakdown.enemy],
      ["משימות", breakdown.mission],
      ["השלמת שלב או גל", breakdown.completion],
      ["חיים שנשארו", breakdown.lives],
      ["בונוס ללא פגיעה", breakdown.noHit],
      ["בונוס דיוק", breakdown.accuracy],
      ["בונוס זמן", breakdown.time],
      [`מכפיל קושי ×${(getDifficultySettings().scoreMultiplierPct / 100).toFixed(1)}`, breakdown.difficulty],
      ["תרומת רצף", breakdown.combo]
    ];

    els.scoreBreakdownList.replaceChildren();
    rows.forEach(([label, value]) => {
      const item = document.createElement("li");
      const name = document.createElement("span");
      const amount = document.createElement("strong");
      name.textContent = label;
      amount.textContent = numberFormat.format(Math.max(0, Math.floor(value || 0)));
      item.append(name, amount);
      els.scoreBreakdownList.append(item);
    });
  }

  function renderResults(result) {
    const playerName = state.playerName || "שחקן";
    els.winnerTrophy.hidden = !(result.won || result.newRecord);
    if (els.newRecordBadge) {
      els.newRecordBadge.hidden = !result.newRecord;
    }
    els.endKicker.textContent = result.newRecord ? `שיא חדש, ${playerName}` : (result.won ? `כל הכבוד ${playerName}` : "עוד סיבוב");
    els.endTitle.textContent = result.won
      ? `${playerName} ניצח!`
      : (state.mode === "arcade" ? "המרדף נגמר" : "המשחק נגמר");
    els.endCopy.textContent = result.unlocksLegendary
      ? "פתחת את רמת אגדי. עכשיו מתחיל המבחן האמיתי."
      : (state.mode === "arcade"
        ? `הגעת לגל ${result.reachedStage} ושמרת שיא מקומי בהיכל.`
        : (result.won ? "השלמת את מסלול ההרפתקה." : "לא נורא, חוזרים חזקים יותר."));
    els.finalScore.textContent = numberFormat.format(result.score);
    els.previousBest.textContent = numberFormat.format(result.previousBest);
    els.leaderboardRank.textContent = result.leaderboardRank ? `#${result.leaderboardRank}` : "-";
    els.nextRankScore.textContent = result.scoreToNextRank === 0
      ? "בפסגה"
      : (result.scoreToNextRank ? `+${numberFormat.format(result.scoreToNextRank)}` : "-");
    els.resultMode.textContent = modeLabel(result.mode);
    els.resultDifficulty.textContent = difficultyLabel(result.difficulty);
    els.resultStageLabel.firstChild.textContent = result.mode === "arcade" ? "גל " : "שלב ";
    els.resultStage.textContent = result.reachedStage;
    els.finalCorrect.textContent = result.correctAnswers;
    els.finalIncorrect.textContent = result.incorrectAnswers;
    els.finalAccuracy.textContent = `${result.accuracy}%`;
    els.averageAnswerTime.textContent = formatSeconds(result.averageAnswerTimeMs);
    els.maxCombo.textContent = result.maxCombo;
    els.remainingLives.textContent = result.remainingLives;
    renderScoreBreakdown(result.breakdown);
  }

  function showEndScreen(won) {
    const result = finalizeSession(won);
    setPhase("ended");
    resetJoystick();
    state.currentEnemyId = null;
    state.question = null;
    els.questionDialog.hidden = true;
    els.endScreen.hidden = false;
    renderResults(result);

    updatePublishScorePanel();

    if (won || result.newRecord) {
      state.fireworkTimer = 0;
      for (let i = 0; i < 7; i += 1) {
        spawnFirework(90 + i * 120, 90 + Math.random() * 210);
      }
    }
  }

  function updateFireworks(dt) {
    state.fireworkTimer -= dt;
    if (state.fireworkTimer <= 0) {
      spawnFirework(80 + Math.random() * (WIDTH - 160), 80 + Math.random() * 260);
      state.fireworkTimer = 0.28 + Math.random() * 0.35;
    }
  }

  function addBurst(x, y, color, count, speed) {
    const effectiveCount = MOBILE_RUNTIME.reducedEffects ? Math.max(3, Math.ceil(count * 0.45)) : count;
    for (let i = 0; i < effectiveCount; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = speed * (0.35 + Math.random() * 0.9);
      state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        color,
        radius: 1.4 + Math.random() * 2.8,
        life: 0.45 + Math.random() * 0.45,
        maxLife: 0.9
      });
    }
  }

  function spawnFirework(x, y) {
    const level = getCurrentLevel();
    const color = randomItem([level.accent, level.bonusCollectibleColor, "#ffd84a", "#67f08b", "#ff5f9f"]);
    addBurst(x, y, color, 58, 210);
    playTone(560 + Math.random() * 260, 0.08, "triangle", 0.018);
  }

  function addFloatingText(x, y, text, color) {
    state.floatingTexts.push({
      x,
      y,
      text,
      color,
      life: 0.9,
      maxLife: 0.9
    });
  }

  function updateParticles(dt) {
    state.particles = state.particles.filter((particle) => {
      particle.life -= dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vx *= 0.985;
      particle.vy *= 0.985;
      return particle.life > 0;
    });
  }

  function updateFloatingTexts(dt) {
    state.floatingTexts = state.floatingTexts.filter((item) => {
      item.life -= dt;
      item.y -= 28 * dt;
      return item.life > 0;
    });
  }

  function render() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    ctx.save();
    if (state.shake > 0) {
      const amount = state.shake * 12;
      ctx.translate((Math.random() - 0.5) * amount, (Math.random() - 0.5) * amount);
    }
    applyCameraTransform(ctx);
    drawBackdrop();
    drawMaze();
    drawCollectibles();
    drawPlayerCharacter(ctx, state.player);
    drawEnemies();
    drawParticles();
    drawFloatingTexts();
    ctx.restore();

    drawLevelBanner();
    if (state.phase === "paused") {
      drawPaused();
    }
  }

  function drawBackdrop() {
    const level = getCurrentLevel();
    const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
    const stops = level.backgroundStops || ["#02050c", "#061020", "#02040a"];
    gradient.addColorStop(0, stops[0]);
    gradient.addColorStop(0.55, stops[1]);
    gradient.addColorStop(1, stops[2]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.strokeStyle = level.gridColor || "rgba(104, 231, 255, 0.08)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= WIDTH; x += TILE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y <= HEIGHT; y += TILE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(WIDTH, y);
      ctx.stroke();
    }
    ctx.restore();

    const decorationStep = MOBILE_RUNTIME.reducedEffects ? 2 : 1;
    for (let index = 0; index < state.backdropStars.length; index += decorationStep) {
      drawLevelDecoration(state.backdropStars[index], level);
    }
  }

  function drawLevelDecoration(item, level) {
    const alpha = 0.14 + Math.sin(state.clock * 1.8 + item.phase) * 0.08;
    const rgb = level.decorRgb || "255, 255, 255";

    ctx.save();
    ctx.globalAlpha = clamp(alpha, 0.05, 0.28);
    ctx.strokeStyle = `rgba(${rgb}, 0.9)`;
    ctx.fillStyle = `rgba(${rgb}, 0.9)`;

    if (level.decor === "snow") {
      const radius = item.size * 3.2;
      ctx.translate(item.x, item.y);
      ctx.rotate(item.phase);
      for (let i = 0; i < 3; i += 1) {
        ctx.rotate(Math.PI / 3);
        ctx.beginPath();
        ctx.moveTo(-radius, 0);
        ctx.lineTo(radius, 0);
        ctx.stroke();
      }
    } else if (level.decor === "embers") {
      const y = (item.y - state.clock * 18 * (0.4 + item.size)) % HEIGHT;
      ctx.beginPath();
      ctx.arc(item.x + Math.sin(state.clock + item.phase) * 8, y < 0 ? y + HEIGHT : y, item.size * 1.7, 0, Math.PI * 2);
      ctx.fill();
    } else if (level.decor === "runes") {
      ctx.lineWidth = 1.4;
      ctx.strokeRect(item.x - item.size * 3, item.y - item.size * 3, item.size * 6, item.size * 6);
      ctx.beginPath();
      ctx.moveTo(item.x - item.size * 4, item.y + item.size * 3);
      ctx.lineTo(item.x + item.size * 4, item.y - item.size * 3);
      ctx.stroke();
    } else if (level.decor === "diamonds") {
      drawDiamond(item.x, item.y, item.size * 4.5);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(item.x, item.y, item.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawMaze() {
    const level = getCurrentLevel();
    ctx.save();
    ctx.shadowColor = level.wallGlow || "rgba(66, 217, 255, 0.65)";
    ctx.shadowBlur = MOBILE_RUNTIME.reducedEffects ? 6 : 14;

    const wallGradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
    const stops = level.wallStops || ["#1235b8", "#0b7ec3", "#6f36ff"];
    wallGradient.addColorStop(0, stops[0]);
    wallGradient.addColorStop(0.45, stops[1]);
    wallGradient.addColorStop(1, stops[2]);
    ctx.fillStyle = wallGradient;

    for (let y = 0; y < ROWS; y += 1) {
      for (let x = 0; x < COLS; x += 1) {
        if (state.maze[y][x] !== 1) {
          continue;
        }

        const px = x * TILE;
        const py = y * TILE;
        roundedRect(px + 2, py + 2, TILE - 4, TILE - 4, 5);
        ctx.fill();
      }
    }

    ctx.shadowBlur = 0;
    ctx.strokeStyle = level.wallStroke || "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1;
    for (let y = 0; y < ROWS; y += 1) {
      for (let x = 0; x < COLS; x += 1) {
        if (state.maze[y][x] === 1) {
          ctx.strokeRect(x * TILE + 3.5, y * TILE + 3.5, TILE - 7, TILE - 7);
          drawWallMotif(x, y, level);
        }
      }
    }

    ctx.restore();
  }

  function drawWallMotif(cellX, cellY, level) {
    if ((cellX * 7 + cellY * 11 + state.levelIndex * 5) % 19 !== 0) {
      return;
    }

    const x = cellX * TILE + TILE / 2;
    const y = cellY * TILE + TILE / 2;
    ctx.save();
    ctx.globalAlpha = 0.52;
    ctx.strokeStyle = level.accent;
    ctx.fillStyle = level.accent;
    ctx.lineWidth = 1.4;

    if (level.enemyVisualStyle === "ice") {
      ctx.beginPath();
      ctx.moveTo(x - 5, y);
      ctx.lineTo(x + 5, y);
      ctx.moveTo(x, y - 5);
      ctx.lineTo(x, y + 5);
      ctx.stroke();
    } else if (level.enemyVisualStyle === "lava") {
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (level.enemyVisualStyle === "ancient") {
      ctx.beginPath();
      ctx.moveTo(x - 5, y + 4);
      ctx.lineTo(x, y - 5);
      ctx.lineTo(x + 5, y + 4);
      ctx.stroke();
    } else {
      drawDiamond(x, y, 5);
      ctx.stroke();
    }

    ctx.restore();
  }

  function roundedRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function drawCollectibles() {
    const level = getCurrentLevel();
    ctx.save();
    ctx.shadowColor = level.bonusCollectibleColor || "rgba(255, 216, 74, 0.6)";
    ctx.shadowBlur = 8;
    for (const collectible of state.collectibles.values()) {
      const pulse = 1 + Math.sin(state.clock * 5 + collectible.phase) * 0.18;
      const radius = collectible.radius * pulse;
      ctx.fillStyle = collectible.value > 10 ? level.bonusCollectibleColor : level.collectibleColor;

      if (collectible.value > 10) {
        drawPlusSymbol(collectible.x, collectible.y, radius + 2, state.clock + collectible.phase);
      } else {
        drawDiamond(collectible.x, collectible.y, radius * 1.15);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function drawPlusSymbol(cx, cy, radius, rotation = 0) {
    const arm = radius * 0.34;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation * 0.18);
    ctx.fillRect(-arm, -radius, arm * 2, radius * 2);
    ctx.fillRect(-radius, -arm, radius * 2, arm * 2);
    ctx.restore();
  }

  function drawDiamond(cx, cy, radius) {
    ctx.beginPath();
    ctx.moveTo(cx, cy - radius);
    ctx.lineTo(cx + radius * 0.82, cy);
    ctx.lineTo(cx, cy + radius);
    ctx.lineTo(cx - radius * 0.82, cy);
    ctx.closePath();
  }

  function drawPlayerCharacter(renderContext, playerState) {
    if (!playerState) {
      return;
    }

    const theme = getPlayerTheme();
    const playerAssets = getPlayerAssets();
    const animation = getPlayerAnimationFrame(playerState);
    const sprite = playerAssets[animation.frame] || playerAssets.idle;
    const spriteReady = isImageReady(sprite);
    const mobileCharacterScale = MOBILE_RUNTIME.coarse ? 1.12 : 1;
    const displaySize = playerState.radius * theme.renderScale * mobileCharacterScale;
    renderContext.save();
    for (let index = 0; index < playerState.trail.length; index += MOBILE_RUNTIME.reducedEffects ? 6 : 3) {
      const point = playerState.trail[index];
      const alpha = Math.max(0, point.life / 0.28) * 0.24;
      const trailSize = displaySize * (0.68 + alpha);
      renderContext.globalAlpha = alpha;
      if (isImageReady(playerAssets.idle)) {
        renderContext.drawImage(
          playerAssets.idle,
          point.x - trailSize / 2,
          point.y - trailSize / 2,
          trailSize,
          trailSize
        );
      } else {
        renderContext.fillStyle = `rgba(${theme.trailColor}, ${alpha})`;
        renderContext.fillRect(
          point.x - trailSize * 0.34,
          point.y - trailSize * 0.34,
          trailSize * 0.68,
          trailSize * 0.68
        );
      }
    }

    renderContext.globalAlpha = 1;
    const flicker = playerState.invulnerable > 0 && Math.floor(state.clock * 16) % 2 === 0;
    if (flicker) {
      renderContext.globalAlpha = 0.55;
    }

    const angle = directionAngle(playerState.direction);
    const pulseScale = 0.96 + playerState.visualPulse * 0.07;
    renderContext.translate(playerState.x, playerState.y);
    renderContext.scale(pulseScale, pulseScale);
    if (!animation.active) {
      renderContext.rotate(Math.sin(angle) * 0.045);
    }
    renderContext.shadowColor = theme.glowColor;
    renderContext.shadowBlur = 13;

    drawPlayerEatEffect(renderContext, playerState, displaySize);

    if (spriteReady) {
      renderContext.save();
      if (animation.active && playerState.eatDirection === "left") {
        renderContext.scale(-1, 1);
      }
      renderContext.drawImage(
        sprite,
        -displaySize / 2,
        -displaySize / 2,
        displaySize,
        displaySize
      );
      renderContext.restore();
    } else {
      const fallbackSize = playerState.radius * 1.65;
      const bodyGradient = renderContext.createLinearGradient(
        -fallbackSize,
        -fallbackSize,
        fallbackSize,
        fallbackSize
      );
      bodyGradient.addColorStop(0, theme.primaryColor);
      bodyGradient.addColorStop(1, theme.secondaryColor);
      renderContext.fillStyle = bodyGradient;
      renderContext.fillRect(
        -fallbackSize / 2,
        -fallbackSize / 2,
        fallbackSize,
        fallbackSize
      );
    }
    renderContext.restore();
  }

  function getPlayerAnimationFrame(playerState) {
    if (playerState.eatAnimation <= 0) {
      return { frame: "idle", active: false };
    }

    const duration = getPlayerTheme().eatAnimationDuration;
    const progress = 1 - playerState.eatAnimation / duration;
    if (progress < 0.28 || progress > 0.82) {
      return { frame: "eatPrepare", active: true };
    }
    return { frame: "eat", active: true };
  }

  function drawPlayerEatEffect(renderContext, playerState, displaySize) {
    const effect = playerState.eatEffect;
    if (!effect) {
      return;
    }

    const progress = 1 - effect.life / effect.maxLife;
    const startDistance = displaySize * 0.78;
    const direction = DIRS[playerState.eatDirection] || DIRS.right;
    const mouthX = playerState.eatDirection === "left"
      ? -displaySize * 0.2
      : displaySize * 0.2;
    const mouthY = 0;
    const startX = direction.x * startDistance;
    const startY = direction.y * startDistance;
    const x = startX + (mouthX - startX) * progress;
    const y = startY + (mouthY - startY) * progress;
    const size = (effect.value > 10 ? 4.6 : 2.8) * (1 - progress * 0.56);

    renderContext.save();
    renderContext.globalAlpha = clamp(1 - progress * 0.76, 0, 1);
    renderContext.fillStyle = effect.color;
    renderContext.shadowColor = effect.color;
    renderContext.shadowBlur = 10;
    if (effect.value > 10) {
      drawPlusAtContext(renderContext, x, y, size);
    } else {
      drawDiamondAtContext(renderContext, x, y, size);
    }
    renderContext.restore();
  }

  function drawDiamondAtContext(renderContext, x, y, radius) {
    renderContext.beginPath();
    renderContext.moveTo(x, y - radius);
    renderContext.lineTo(x + radius * 0.82, y);
    renderContext.lineTo(x, y + radius);
    renderContext.lineTo(x - radius * 0.82, y);
    renderContext.closePath();
    renderContext.fill();
  }

  function drawPlusAtContext(renderContext, x, y, radius) {
    const arm = radius * 0.34;
    renderContext.fillRect(x - arm, y - radius, arm * 2, radius * 2);
    renderContext.fillRect(x - radius, y - arm, radius * 2, arm * 2);
  }

  function isImageReady(image) {
    return image?.complete && image.naturalWidth > 0;
  }

  function directionAngle(direction) {
    if (direction === "left") {
      return Math.PI;
    }
    if (direction === "up") {
      return -Math.PI / 2;
    }
    if (direction === "down") {
      return Math.PI / 2;
    }
    return 0;
  }

  function drawEnemies() {
    state.enemies.forEach((enemy, enemyIndex) => {
      drawEnemyCharacter(ctx, enemy, enemyIndex, {
        clock: state.clock,
        spawning: enemy.spawnFlash > 0
      });
    });
  }

  function drawEnemyCharacter(renderContext, enemy, enemyIndex, enemyState) {
    const variant = enemy.visualVariant ?? enemyIndex % 4;
    const expression = getEnemyExpression(enemy, enemyState);
    const sprite = GAME_ASSETS.enemies[expression] || GAME_ASSETS.enemies.idle;
    const spriteReady = isImageReady(sprite);
    const sizeVariation = [1, 0.94, 1.04, 0.98][variant];
    const mobileCharacterScale = MOBILE_RUNTIME.coarse ? 1.12 : 1;
    const displaySize = enemy.radius * GAME_THEME.enemies.renderScale * sizeVariation * mobileCharacterScale;
    const direction = DIRS[enemy.direction] || DIRS.none;
    const bob = Math.sin(enemy.wobble) * 1.25;
    const lean = direction.x * 0.075 + Math.sin(enemy.wobble * 0.55) * 0.025;

    renderContext.save();
    renderContext.translate(enemy.x, enemy.y + bob);
    renderContext.rotate(lean);
    renderContext.shadowColor = enemy.color;
    renderContext.shadowBlur = MOBILE_RUNTIME.reducedEffects ? 7 : 15;

    if (spriteReady) {
      renderContext.drawImage(
        sprite,
        -displaySize / 2,
        -displaySize / 2,
        displaySize,
        displaySize
      );
    } else {
      renderContext.fillStyle = enemy.color;
      renderContext.beginPath();
      renderContext.arc(0, 0, enemy.radius, 0, Math.PI * 2);
      renderContext.fill();
    }

    if (enemyState.spawning) {
      const progress = clamp(enemy.spawnFlash / 0.8, 0, 1);
      renderContext.globalAlpha = progress * 0.7;
      renderContext.strokeStyle = enemy.color;
      renderContext.lineWidth = 1.4;
      renderContext.beginPath();
      renderContext.arc(
        0,
        0,
        displaySize * (0.52 + (1 - progress) * 0.22),
        0,
        Math.PI * 2
      );
      renderContext.stroke();
    }
    renderContext.restore();
  }

  function getEnemyExpression(enemy, enemyState) {
    if (enemyState.spawning) {
      return "surprised";
    }

    if (state.player?.invulnerable > 0) {
      return "sad";
    }

    if (state.phase === "question" && state.currentEnemyId === enemy.id) {
      return "surprised";
    }

    if (state.player) {
      const dx = state.player.x - enemy.x;
      const dy = state.player.y - enemy.y;
      if (dx * dx + dy * dy < (TILE * 5.5) ** 2) {
        return "angry";
      }
    }

    const cycle = Math.floor((enemyState.clock + enemy.expressionOffset) / 0.72) % 6;
    if (cycle === 2 || cycle === 3) {
      return "angry";
    }
    if (cycle === 5) {
      return "surprised";
    }
    return "idle";
  }

  function drawParticles() {
    ctx.save();
    for (const particle of state.particles) {
      const alpha = clamp(particle.life / particle.maxLife, 0, 1);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius * (0.7 + alpha), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawFloatingTexts() {
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "700 20px Arial, sans-serif";
    for (const item of state.floatingTexts) {
      const alpha = clamp(item.life / item.maxLife, 0, 1);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = item.color;
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
      ctx.shadowBlur = 6;
      ctx.fillText(item.text, item.x, item.y);
    }
    ctx.restore();
  }

  function drawLevelBanner() {
    if (!state.levelBanner) {
      return;
    }

    const banner = state.levelBanner;
    const alpha = clamp(banner.life / banner.maxLife, 0, 1);
    const ease = Math.sin(alpha * Math.PI);
    ctx.save();
    ctx.globalAlpha = clamp(alpha + 0.08, 0, 1);
    ctx.fillStyle = "rgba(0, 0, 0, 0.48)";
    ctx.fillRect(0, HEIGHT * 0.32, WIDTH, 132);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = banner.color;
    ctx.shadowBlur = 22 * ease;
    ctx.fillStyle = banner.color;
    ctx.font = "700 44px Arial, sans-serif";
    ctx.fillText(banner.title, WIDTH / 2, HEIGHT * 0.32 + 48);

    ctx.shadowBlur = 0;
    ctx.fillStyle = "#f7fbff";
    ctx.font = "700 20px Arial, sans-serif";
    ctx.fillText(banner.subtitle, WIDTH / 2, HEIGHT * 0.32 + 92);
    ctx.restore();
  }

  function drawPaused() {
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.42)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffd84a";
    ctx.shadowColor = "rgba(255, 216, 74, 0.42)";
    ctx.shadowBlur = 18;
    ctx.font = "700 54px Arial, sans-serif";
    ctx.fillText("השהיה", WIDTH / 2, HEIGHT / 2);
    ctx.restore();
  }

  function gameLoop(now) {
    const dt = Math.min(0.033, Math.max(0, (now - state.lastTime) / 1000 || 0));
    state.lastTime = now;
    update(dt);
    render();
    requestAnimationFrame(gameLoop);
  }

  document.addEventListener("keydown", (event) => {
    if (state.phase === "question") {
      return;
    }

    if (state.phase === "start") {
      if (event.key === "Escape" && els.menuSheets.some((sheet) => !sheet.hidden)) {
        event.preventDefault();
        closeMenuSheets();
      }
      return;
    }

    if (event.key === " " || event.key === "Escape") {
      event.preventDefault();
      togglePause();
      return;
    }

    const direction = KEY_TO_DIR[event.key];
    if (direction) {
      event.preventDefault();
      setDirection(direction);
    }
  });

  function shouldAvoidMobileKeyboard() {
    return window.matchMedia("(hover: none), (pointer: coarse), (max-width: 760px)").matches;
  }

  function focusPlayerNameWhenUseful() {
    if (shouldAvoidMobileKeyboard()) {
      return;
    }

    setTimeout(() => els.startButton?.focus({ preventScroll: true }), 30);
  }

  let joystickPointerId = null;

  function updateJoystick(event) {
    if (!els.joystick || !els.joystickKnob) {
      return;
    }

    event.preventDefault();
    const rect = els.joystick.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = event.clientX - centerX;
    const dy = event.clientY - centerY;
    const distance = Math.hypot(dx, dy);
    const limit = rect.width * 0.27;
    const knobX = distance > 0 ? dx / distance * Math.min(limit, distance) : 0;
    const knobY = distance > 0 ? dy / distance * Math.min(limit, distance) : 0;

    els.joystickKnob.style.setProperty("--knob-x", `${knobX}px`);
    els.joystickKnob.style.setProperty("--knob-y", `${knobY}px`);

    if (state.phase !== "playing" || distance < JOYSTICK_DEADZONE) {
      return;
    }

    setDirection(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
  }

  function resetJoystick() {
    joystickPointerId = null;
    if (!els.joystick || !els.joystickKnob) {
      return;
    }

    els.joystick.classList.remove("is-active");
    els.joystickKnob.style.setProperty("--knob-x", "0px");
    els.joystickKnob.style.setProperty("--knob-y", "0px");
  }

  if (els.joystick) {
    els.joystick.addEventListener("pointerdown", (event) => {
      joystickPointerId = event.pointerId;
      els.joystick.setPointerCapture?.(event.pointerId);
      els.joystick.classList.add("is-active");
      updateJoystick(event);
    });

    els.joystick.addEventListener("pointermove", (event) => {
      if (event.pointerId !== joystickPointerId) {
        return;
      }

      updateJoystick(event);
    });

    els.joystick.addEventListener("pointerup", (event) => {
      if (event.pointerId === joystickPointerId) {
        resetJoystick();
      }
    });

    els.joystick.addEventListener("pointercancel", resetJoystick);
    els.joystick.addEventListener("lostpointercapture", resetJoystick);
  }

  let pointerStart = null;
  stage.addEventListener("pointerdown", (event) => {
    if (state.phase !== "playing" || event.target.closest("button, input")) {
      return;
    }

    pointerStart = { x: event.clientX, y: event.clientY };
  });

  stage.addEventListener("pointermove", (event) => {
    if (!pointerStart || state.phase !== "playing") {
      return;
    }

    const dx = event.clientX - pointerStart.x;
    const dy = event.clientY - pointerStart.y;
    if (Math.hypot(dx, dy) < 28) {
      return;
    }

    setDirection(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
    pointerStart = { x: event.clientX, y: event.clientY };
  });

  stage.addEventListener("pointerup", () => {
    pointerStart = null;
  });

  stage.addEventListener("pointercancel", () => {
    pointerStart = null;
  });

  els.answerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (state.answerLocked || !state.question) {
      return;
    }

    const raw = els.answerInput.value.trim();
    if (raw === "") {
      return;
    }

    const answer = Number(raw);
    const correct = Number.isFinite(answer) && answer === state.question.answer;
    const responseMs = Math.max(0, performance.now() - (state.questionStartedAt || performance.now()));
    state.answerLocked = true;
    els.answerInput.disabled = true;
    els.submitAnswer.disabled = true;
    recordFactResult(state.question, correct);
    SYSTEMS.recordMathAnswer(state.mathStats, { correct, responseMs });
    state.correctAnswers = state.mathStats.correctAnswers;
    state.incorrectAnswers = state.mathStats.incorrectAnswers;
    els.questionFeedback.textContent = correct ? positiveFeedback() : supportFeedback(state.question.answer);
    els.questionFeedback.style.color = correct ? "#67f08b" : "#ff4c5f";
    scheduleQuestionFinish(correct, { responseMs });
  });

  els.pause.addEventListener("click", togglePause);
  els.sound.addEventListener("click", toggleSound);
  els.menuSound?.addEventListener("click", toggleSound);
  els.playerForm.addEventListener("submit", startGame);
  els.playerNameInput.addEventListener("input", () => {
    els.nameError.textContent = "";
  });
  els.answerInput.addEventListener("input", () => {
    const digitsOnly = els.answerInput.value.replace(/\D/g, "");
    if (els.answerInput.value !== digitsOnly) {
      els.answerInput.value = digitsOnly;
    }
  });
  els.characterInputs.forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) {
        setCharacter(input.value);
      }
    });
  });
  els.modeInputs.forEach((input) => {
    input.addEventListener("change", () => {
      setMode(input.value);
      closeMenuSheets();
    });
  });
  els.difficultyInputs.forEach((input) => {
    input.addEventListener("change", () => {
      setDifficulty(input.value);
      closeMenuSheets();
    });
  });
  els.timeLimitToggle?.addEventListener("click", toggleTimeLimit);
  els.modeControlButton?.addEventListener("click", () => openMenuSheet(els.modePanel, els.modeControlButton));
  els.difficultyControlButton?.addEventListener("click", () => openMenuSheet(els.difficultyPanel, els.difficultyControlButton));
  els.profileControlButton?.addEventListener("click", () => openMenuSheet(els.settingsPanel, els.profileControlButton));
  els.menuSettingsButton?.addEventListener("click", () => openMenuSheet(els.settingsPanel, els.menuSettingsButton));
  els.settingsSaveButton?.addEventListener("click", saveNicknameFromSettings);
  els.panelCloseButtons.forEach((button) => {
    button.addEventListener("click", () => closeMenuSheets());
  });
  els.menuSheets.forEach((sheet) => {
    sheet.addEventListener("click", (event) => {
      if (event.target === sheet) {
        closeMenuSheets();
      }
    });
  });
  els.leaderboardOpen?.addEventListener("click", openLeaderboard);
  els.menuLeaderboardLink?.addEventListener("click", openLeaderboard);
  els.leaderboardClose?.addEventListener("click", closeLeaderboard);
  els.leaderboardDialog?.addEventListener("click", (event) => {
    if (event.target === els.leaderboardDialog) {
      closeLeaderboard();
    }
  });
  els.leaderboardRefresh?.addEventListener("click", loadLeaderboard);
  els.leaderboardModeFilter?.addEventListener("change", loadLeaderboard);
  els.leaderboardDifficultyFilter?.addEventListener("change", loadLeaderboard);
  els.publishScoreButton?.addEventListener("click", publishScore);
  els.retryButton?.addEventListener("click", retryGame);
  els.endLeaderboardButton?.addEventListener("click", openLeaderboard);
  els.restartButton.addEventListener("click", showStartScreen);
  window.addEventListener("resize", resizeCanvas, { passive: true });
  window.addEventListener("orientationchange", () => window.setTimeout(resizeCanvas, 120), { passive: true });
  window.visualViewport?.addEventListener("resize", resizeCanvas, { passive: true });
  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(resizeCanvas).observe(stage);
  }
  window.addEventListener("blur", () => {
    if (state.phase === "playing") {
      togglePause();
    }
  });

  setPhase("start", { force: true });
  resizeCanvas();
  setMode(state.mode, false);
  setCharacter(state.characterId, false);
  syncDifficultyInputs();
  syncTimeLimitToggle();
  els.playerNameInput.value = state.playerName;
  syncMenuSummary();
  setupGame();
  updateSoundButton();
  focusPlayerNameWhenUseful();
  requestAnimationFrame(gameLoop);
})();
