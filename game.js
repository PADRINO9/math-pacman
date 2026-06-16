(() => {
  "use strict";

  const WIDTH = 960;
  const HEIGHT = 720;
  const TILE = 24;
  const COLS = WIDTH / TILE;
  const ROWS = HEIGHT / TILE;
  const PLAYER_START = { x: 2, y: 2 };
  const CENTER_CELL = { x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) };

  const CONFIG = {
    targetCorrect: 100,
    answersPerLevel: 25,
    initialLives: 3,
    minGhosts: 10,
    missionBonus: 420,
    adaptiveQuestionChance: 0.3,
    recentQuestionMemory: 3,
    questionFeedbackDelay: {
      correct: 650,
      wrong: 900
    },
    speed: {
      player: 184,
      ghostBase: 108,
      ghostTierEveryAnswers: 6,
      ghostTierStep: 3,
      ghostTierMax: 42,
      ghostIndexStep: 5
    },
    storageKeys: {
      bestScore: "mathPacmanBest",
      sound: "mathPacmanSound",
      difficulty: "mathPacmanDifficulty",
      factStats: "mathPacmanFactStats"
    },
    difficulty: {
      easy: {
        label: "קל",
        ghostCount: 8,
        ghostSpeedMultiplier: 0.9,
        questionTierStep: 24,
        questionMaxOffset: -1,
        questionMode: "classic"
      },
      normal: {
        label: "רגיל",
        ghostCount: 10,
        ghostSpeedMultiplier: 1,
        questionTierStep: 20,
        questionMaxOffset: 0,
        questionMode: "classic"
      },
      hard: {
        label: "קשה",
        ghostCount: 11,
        ghostSpeedMultiplier: 1.1,
        questionTierStep: 16,
        questionMaxOffset: 1,
        questionMode: "classic"
      },
      veryHard: {
        label: "קשה מאוד",
        ghostCount: 12,
        ghostSpeedMultiplier: 1.18,
        questionTierStep: 12,
        questionMaxOffset: 2,
        questionMode: "twoByOne",
        adaptiveQuestionChance: 0
      },
      impossible: {
        label: "הכי קשה בעולם",
        ghostCount: 13,
        ghostSpeedMultiplier: 1.28,
        questionTierStep: 10,
        questionMaxOffset: 3,
        questionMode: "twoByTwo",
        adaptiveQuestionChance: 0
      }
    },
    levels: [
      {
        name: "עולם הקרח",
        shortName: "קרח",
        intro: "שלב 1: עולם הקרח",
        ghostStyle: "ice",
        decor: "snow",
        ghostCountBonus: 0,
        ghostSpeedMultiplier: 1,
        wallStops: ["#0d5d9c", "#52dff7", "#d7fbff"],
        backgroundStops: ["#06131f", "#0b2a3d", "#04101d"],
        gridColor: "rgba(170, 244, 255, 0.1)",
        wallGlow: "rgba(146, 240, 255, 0.72)",
        wallStroke: "rgba(232, 253, 255, 0.38)",
        pelletColor: "#e9fdff",
        powerPelletColor: "#9ef7ff",
        accent: "#9ef7ff",
        decorRgb: "224, 253, 255",
        ghostColors: ["#bdf8ff", "#71e7ff", "#d9feff", "#7dc9ff", "#b7f1ff"]
      },
      {
        name: "עולם הלבה",
        shortName: "לבה",
        intro: "שלב 2: עולם הלבה",
        ghostStyle: "lava",
        decor: "embers",
        ghostCountBonus: 1,
        ghostSpeedMultiplier: 1.08,
        wallStops: ["#7f1d14", "#f97316", "#ffd166"],
        backgroundStops: ["#160506", "#3a0d09", "#090305"],
        gridColor: "rgba(255, 145, 77, 0.1)",
        wallGlow: "rgba(255, 111, 55, 0.78)",
        wallStroke: "rgba(255, 231, 170, 0.34)",
        pelletColor: "#fff2cf",
        powerPelletColor: "#ff9f1c",
        accent: "#ffb340",
        decorRgb: "255, 144, 66",
        ghostColors: ["#ff4c1f", "#ff8a2a", "#ffd166", "#ff3864", "#ffb340"]
      },
      {
        name: "עולם העתיקות",
        shortName: "עתיקות",
        intro: "שלב 3: עולם העתיקות",
        ghostStyle: "ancient",
        decor: "runes",
        ghostCountBonus: 2,
        ghostSpeedMultiplier: 1.16,
        wallStops: ["#6b5734", "#c2a36a", "#1fb6a6"],
        backgroundStops: ["#100d08", "#241b0e", "#071714"],
        gridColor: "rgba(230, 198, 128, 0.09)",
        wallGlow: "rgba(230, 198, 128, 0.58)",
        wallStroke: "rgba(255, 240, 196, 0.3)",
        pelletColor: "#ffe8a3",
        powerPelletColor: "#27e0c3",
        accent: "#27e0c3",
        decorRgb: "230, 198, 128",
        ghostColors: ["#d6bd82", "#c59f5d", "#27e0c3", "#f1d391", "#a88a4b"]
      },
      {
        name: "עולם היהלומים",
        shortName: "יהלומים",
        intro: "שלב 4: עולם היהלומים",
        ghostStyle: "diamond",
        decor: "diamonds",
        ghostCountBonus: 3,
        ghostSpeedMultiplier: 1.25,
        wallStops: ["#1836a3", "#55ffd6", "#ff5fd7"],
        backgroundStops: ["#050817", "#101b45", "#070611"],
        gridColor: "rgba(122, 255, 231, 0.1)",
        wallGlow: "rgba(85, 255, 214, 0.7)",
        wallStroke: "rgba(255, 255, 255, 0.36)",
        pelletColor: "#f8ffff",
        powerPelletColor: "#ff5fd7",
        accent: "#55ffd6",
        decorRgb: "143, 255, 239",
        ghostColors: ["#55ffd6", "#73a7ff", "#ff5fd7", "#f8ffff", "#9d7cff"]
      }
    ],
    missions: [
      { type: "correct", target: 10, label: "ענה נכון על 10 שאלות" },
      { type: "combo", target: 5, label: "צבור רצף של 5" },
      { type: "score", target: 200, label: "אסוף 200 נקודות" },
      { type: "safeCorrect", target: 3, label: "ענה נכון על 3 שאלות בלי לאבד חיים" },
      { type: "ghosts", target: 5, label: "נצח 5 רוחות" }
    ],
    positiveFeedback: ["נכון!", "מעולה!", "יפה מאוד!", "אלוף!", "בול!", "איזה רצף!", "עבודה חכמה!"],
    supportFeedback: [
      "לא נורא, מתקדמים. התשובה היא {answer}",
      "כמעט! התשובה היא {answer}",
      "טעות קטנה, הראש עובד. התשובה היא {answer}",
      "נשימה ולנסות שוב. התשובה היא {answer}",
      "זה חלק מהאימון. התשובה היא {answer}"
    ]
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

  const GHOST_COLORS = [
    "#ff4c5f",
    "#42d9ff",
    "#ffb340",
    "#ff5fd7",
    "#67f08b",
    "#8a7dff",
    "#f7f06a",
    "#ff7a4d",
    "#55ffd6",
    "#c77dff"
  ];

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
    combo: document.getElementById("combo"),
    lives: document.getElementById("lives"),
    progress: document.getElementById("progress-fill"),
    progressWrap: document.querySelector(".progress-wrap"),
    missionCard: document.getElementById("mission-card"),
    missionTitle: document.getElementById("mission-title"),
    missionProgress: document.getElementById("mission-progress"),
    pause: document.getElementById("pause-button"),
    sound: document.getElementById("sound-button"),
    startScreen: document.getElementById("start-screen"),
    playerForm: document.getElementById("player-form"),
    playerNameInput: document.getElementById("player-name-input"),
    difficultyInputs: Array.from(document.querySelectorAll("input[name='difficulty']")),
    nameError: document.getElementById("name-error"),
    startButton: document.getElementById("start-button"),
    bestScore: document.getElementById("best-score"),
    endScreen: document.getElementById("end-screen"),
    winnerTrophy: document.getElementById("winner-trophy"),
    endKicker: document.getElementById("end-kicker"),
    endTitle: document.getElementById("end-title"),
    endCopy: document.getElementById("end-copy"),
    finalScore: document.getElementById("final-score"),
    finalCorrect: document.getElementById("final-correct"),
    restartButton: document.getElementById("restart-button"),
    questionDialog: document.getElementById("question-dialog"),
    questionStatus: document.getElementById("question-status"),
    questionTitle: document.getElementById("question-title"),
    answerForm: document.getElementById("answer-form"),
    answerInput: document.getElementById("answer-input"),
    submitAnswer: document.getElementById("submit-answer"),
    questionFeedback: document.getElementById("question-feedback"),
    joystick: document.getElementById("movement-joystick"),
    joystickKnob: document.querySelector(".joystick-knob")
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
    }
  };

  function normalizeDifficulty(value) {
    return Object.prototype.hasOwnProperty.call(CONFIG.difficulty, value) ? value : "normal";
  }

  function getDifficultySettings() {
    return CONFIG.difficulty[state.difficulty] || CONFIG.difficulty.normal;
  }

  function getLevelIndexForAnswers(correctAnswers) {
    const levelIndex = Math.floor(correctAnswers / CONFIG.answersPerLevel);
    return clamp(levelIndex, 0, CONFIG.levels.length - 1);
  }

  function getCurrentLevel() {
    return CONFIG.levels[state.levelIndex] || CONFIG.levels[0];
  }

  function getRequiredGhostCount() {
    const difficulty = getDifficultySettings();
    const level = getCurrentLevel();
    return (difficulty.ghostCount || CONFIG.minGhosts) + (level.ghostCountBonus || 0);
  }

  function getAdaptiveQuestionChance() {
    const difficulty = getDifficultySettings();
    return Number.isFinite(difficulty.adaptiveQuestionChance)
      ? difficulty.adaptiveQuestionChance
      : CONFIG.adaptiveQuestionChance;
  }

  function loadFactStats() {
    try {
      const parsed = JSON.parse(storage.get(CONFIG.storageKeys.factStats, "{}"));
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

  const state = {
    phase: "start",
    clock: 0,
    lastTime: 0,
    maze: [],
    reachable: new Set(),
    reachableList: [],
    pellets: new Map(),
    player: null,
    ghosts: [],
    particles: [],
    floatingTexts: [],
    pendingSpawns: [],
    backdropStars: [],
    levelIndex: 0,
    levelBanner: null,
    score: 0,
    combo: 0,
    lives: CONFIG.initialLives,
    correctAnswers: 0,
    bestScore: Number(storage.get(CONFIG.storageKeys.bestScore, "0")) || 0,
    playerName: "",
    difficulty: normalizeDifficulty(storage.get(CONFIG.storageKeys.difficulty, "normal")),
    factStats: loadFactStats(),
    recentQuestionKeys: [],
    mission: null,
    question: null,
    currentGhostId: null,
    answerLocked: false,
    nextGhostId: 1,
    soundEnabled: storage.get(CONFIG.storageKeys.sound, "on") !== "off",
    audioContext: null,
    shake: 0,
    fireworkTimer: 0
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
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(WIDTH * ratio);
    canvas.height = Math.round(HEIGHT * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
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

  function seedPellets() {
    state.pellets.clear();
    for (const cell of state.reachableList) {
      const nearPlayer = distanceCells(cell, PLAYER_START) <= 2;
      const nearCenter = distanceCells(cell, CENTER_CELL) <= 2;
      if (nearPlayer || nearCenter) {
        continue;
      }

      if ((cell.x + cell.y) % 2 === 0 || Math.random() < 0.32) {
        const pos = centerOfCell(cell.x, cell.y);
        state.pellets.set(cellKey(cell.x, cell.y), {
          x: pos.x,
          y: pos.y,
          phase: Math.random() * Math.PI * 2,
          radius: Math.random() < 0.08 ? 4.5 : 2.6,
          value: Math.random() < 0.08 ? 30 : 10
        });
      }
    }
  }

  function refillPellets() {
    if (state.pellets.size > 60) {
      return;
    }

    const playerCell = toCell(state.player.x, state.player.y);
    const candidates = shuffle(state.reachableList).filter((cell) => {
      const key = cellKey(cell.x, cell.y);
      return !state.pellets.has(key) && distanceCells(cell, playerCell) > 3 && distanceCells(cell, CENTER_CELL) > 2;
    });

    for (const cell of candidates.slice(0, 90)) {
      const pos = centerOfCell(cell.x, cell.y);
      state.pellets.set(cellKey(cell.x, cell.y), {
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
      mouth: 0.25,
      invulnerable: 0,
      trail: []
    };
  }

  function createGhost(index) {
    const cell = chooseGhostSpawnCell(index);
    const pos = centerOfCell(cell.x, cell.y);
    const direction = randomItem(DIR_NAMES);
    const difficulty = getDifficultySettings();
    const level = getCurrentLevel();
    const ghostColors = level.ghostColors || GHOST_COLORS;
    const speedTier = Math.min(
      CONFIG.speed.ghostTierMax,
      Math.floor(state.correctAnswers / CONFIG.speed.ghostTierEveryAnswers) * CONFIG.speed.ghostTierStep
    );
    const speed = (
      CONFIG.speed.ghostBase +
      speedTier +
      (index % 4) * CONFIG.speed.ghostIndexStep
    ) * difficulty.ghostSpeedMultiplier * (level.ghostSpeedMultiplier || 1);

    return {
      id: state.nextGhostId,
      x: pos.x,
      y: pos.y,
      radius: 10.4,
      speed,
      direction,
      color: ghostColors[index % ghostColors.length],
      style: level.ghostStyle || "classic",
      scatter: scatterCornerFor(index),
      personality: index % 4,
      pathCooldown: 0,
      spawnFlash: 0.8,
      wobble: Math.random() * Math.PI * 2
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

  function chooseGhostSpawnCell(index) {
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

  function scheduleGhostSpawn(delay) {
    state.pendingSpawns.push({
      delay,
      index: state.nextGhostId
    });
  }

  function ensureGhostCount() {
    const minGhosts = getRequiredGhostCount();
    const totalIncoming = state.ghosts.length + state.pendingSpawns.length;
    for (let i = totalIncoming; i < minGhosts; i += 1) {
      scheduleGhostSpawn(0.25 + i * 0.08);
    }
  }

  function spawnGhost(index) {
    const ghost = createGhost(index);
    state.nextGhostId += 1;
    state.ghosts.push(ghost);
    addBurst(ghost.x, ghost.y, ghost.color, 18, 90);
  }

  function enterLevel(levelIndex, options = {}) {
    state.levelIndex = clamp(levelIndex, 0, CONFIG.levels.length - 1);
    state.maze = createMaze(state.levelIndex);
    const reachability = computeReachable(PLAYER_START);
    state.reachable = reachability.reachable;
    state.reachableList = reachability.list;
    state.player = createPlayer();
    state.ghosts = [];
    state.pendingSpawns = [];
    state.particles = [];
    state.floatingTexts = [];
    seedPellets();
    seedBackdrop();

    const minGhosts = getRequiredGhostCount();
    for (let i = 0; i < minGhosts; i += 1) {
      spawnGhost(i);
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
    state.clock = 0;
    state.lastTime = performance.now();
    state.levelIndex = 0;
    state.levelBanner = null;
    state.score = 0;
    state.combo = 0;
    state.lives = CONFIG.initialLives;
    state.correctAnswers = 0;
    state.recentQuestionKeys = [];
    state.question = null;
    state.currentGhostId = null;
    state.answerLocked = false;
    state.nextGhostId = 1;
    state.shake = 0;
    state.fireworkTimer = 0;
    assignMission();
    enterLevel(0);

    updateHud();
    if (state.phase === "playing") {
      els.answerInput.blur();
      stage.focus({ preventScroll: true });
    }
  }

  function seedBackdrop() {
    state.backdropStars = Array.from({ length: 90 }, (_, index) => ({
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
    return value.trim().replace(/\s+/g, " ").slice(0, 18);
  }

  function getSelectedDifficulty() {
    const selected = els.difficultyInputs.find((input) => input.checked);
    return normalizeDifficulty(selected?.value || state.difficulty);
  }

  function setDifficulty(value, persist = true) {
    state.difficulty = normalizeDifficulty(value);
    if (persist) {
      storage.set(CONFIG.storageKeys.difficulty, state.difficulty);
    }
    syncDifficultyInputs();
  }

  function syncDifficultyInputs() {
    for (const input of els.difficultyInputs) {
      input.checked = input.value === state.difficulty;
    }
  }

  function startGame(event) {
    event?.preventDefault();
    const playerName = normalizePlayerName(els.playerNameInput.value);

    if (!playerName) {
      els.nameError.textContent = "צריך שם לפני שמתחילים.";
      els.playerNameInput.focus();
      return;
    }

    state.playerName = playerName;
    setDifficulty(getSelectedDifficulty());
    els.nameError.textContent = "";
    setupGame();
    state.phase = "playing";
    els.startScreen.hidden = true;
    els.startScreen.classList.remove("screen-visible");
    els.endScreen.hidden = true;
    els.pause.textContent = "Ⅱ";
    stage.focus({ preventScroll: true });
    resumeAudio();
    playTone(420, 0.08, "triangle", 0.04);
  }

  function showStartScreen() {
    state.phase = "start";
    state.playerName = "";
    els.endScreen.hidden = true;
    els.questionDialog.hidden = true;
    els.startScreen.hidden = false;
    els.startScreen.classList.add("screen-visible");
    els.winnerTrophy.hidden = true;
    els.playerNameInput.value = "";
    els.nameError.textContent = "";
    els.pause.textContent = "Ⅱ";
    syncDifficultyInputs();
    setupGame();
    focusPlayerNameWhenUseful();
  }

  function togglePause() {
    if (state.phase === "playing") {
      state.phase = "paused";
      resetJoystick();
      els.pause.textContent = "▶";
      playTone(220, 0.06, "sine", 0.035);
      return;
    }

    if (state.phase === "paused") {
      state.phase = "playing";
      els.pause.textContent = "Ⅱ";
      state.lastTime = performance.now();
      playTone(440, 0.06, "sine", 0.035);
    }
  }

  function toggleSound() {
    state.soundEnabled = !state.soundEnabled;
    storage.set(CONFIG.storageKeys.sound, state.soundEnabled ? "on" : "off");
    updateSoundButton();
    if (state.soundEnabled) {
      resumeAudio();
      playTone(520, 0.08, "triangle", 0.04);
    }
  }

  function updateSoundButton() {
    els.sound.textContent = state.soundEnabled ? "♪" : "×";
    els.sound.setAttribute("aria-label", state.soundEnabled ? "צלילים פועלים" : "צלילים כבויים");
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

  function updateHud() {
    const level = getCurrentLevel();
    els.correct.textContent = state.correctAnswers;
    els.targetCorrect.textContent = `/${CONFIG.targetCorrect}`;
    if (els.levelNumber) {
      els.levelNumber.textContent = `${state.levelIndex + 1}`;
    }
    if (els.worldName) {
      els.worldName.textContent = level.shortName;
      els.worldName.setAttribute("aria-label", level.name);
    }
    els.score.textContent = numberFormat.format(state.score);
    els.combo.textContent = state.combo;
    const hearts = "♥".repeat(Math.max(0, state.lives));
    els.lives.textContent = hearts || "0";
    els.lives.setAttribute("aria-label", `${state.lives} חיים`);
    els.progress.style.width = `${Math.min(100, state.correctAnswers / CONFIG.targetCorrect * 100)}%`;
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

    if (eventName === "ghostDefeated" && state.mission.type === "ghosts") {
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
    const bonus = CONFIG.missionBonus;
    state.score += bonus;
    playMissionSound();
    pulseElement(els.missionCard, "metric-pulse");
    pulseElement(els.progressWrap, "progress-pulse");

    if (state.player) {
      addFloatingText(state.player.x, state.player.y - 34, `משימה +${bonus}`, "#67f08b");
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

    if (state.phase === "playing") {
      updatePlaying(dt);
    } else {
      updateAmbient(dt);
    }

    updateLevelBanner(dt);
  }

  function updatePlaying(dt) {
    updateSpawns(dt);
    updatePlayer(dt);
    eatPellets();
    updateGhosts(dt);
    checkGhostCollision();
    refillPellets();
    updateParticles(dt);
    updateFloatingTexts(dt);
    ensureGhostCount();
  }

  function updateAmbient(dt) {
    if (state.player) {
      state.player.mouth = 0.24 + Math.abs(Math.sin(state.clock * 8)) * 0.32;
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
        spawnGhost(pending.index);
        state.pendingSpawns.splice(i, 1);
      }
    }
  }

  function updatePlayer(dt) {
    const player = state.player;
    player.invulnerable = Math.max(0, player.invulnerable - dt);
    player.mouth = 0.24 + Math.abs(Math.sin(state.clock * 10)) * 0.34;

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

  function eatPellets() {
    const player = state.player;
    let eaten = 0;

    for (const [key, pellet] of state.pellets) {
      const dx = pellet.x - player.x;
      const dy = pellet.y - player.y;
      const hitRadius = player.radius + pellet.radius + 1.4;
      if (dx * dx + dy * dy <= hitRadius * hitRadius) {
        state.pellets.delete(key);
        state.score += pellet.value;
        eaten += 1;
        if (pellet.value > 10) {
          addBurst(pellet.x, pellet.y, "#ffd84a", 12, 70);
          addFloatingText(pellet.x, pellet.y - 12, `+${pellet.value}`, "#ffd84a");
        } else if (Math.random() < 0.2) {
          addBurst(pellet.x, pellet.y, "#f7fbff", 4, 42);
        }
      }
    }

    if (eaten > 0) {
      playTone(620 + Math.min(eaten, 4) * 40, 0.035, "square", 0.012);
      updateMission("score");
      updateHud();
    }
  }

  function updateGhosts(dt) {
    const playerCell = toCell(state.player.x, state.player.y);
    for (const ghost of state.ghosts) {
      ghost.pathCooldown -= dt;
      ghost.spawnFlash = Math.max(0, ghost.spawnFlash - dt);
      ghost.wobble += dt * 4;

      const cell = toCell(ghost.x, ghost.y);
      const center = centerOfCell(cell.x, cell.y);
      const nearCenter = Math.abs(ghost.x - center.x) < 2.6 && Math.abs(ghost.y - center.y) < 2.6;
      const blocked = !canMove(ghost, ghost.direction, 3.2);

      if (nearCenter || blocked || ghost.pathCooldown <= 0) {
        ghost.x = nearCenter ? center.x : ghost.x;
        ghost.y = nearCenter ? center.y : ghost.y;
        const target = getGhostTarget(ghost, playerCell);
        ghost.direction = findNextDirection(cell, target, ghost.direction);
        ghost.pathCooldown = 0.18 + Math.random() * 0.16;
      }

      moveActor(ghost, ghost.direction, ghost.speed * dt);
    }
  }

  function getGhostTarget(ghost, playerCell) {
    const player = state.player;
    const playerDir = DIRS[player.direction] || DIRS.right;
    const cycle = state.clock % 24;
    const scatterWindow = state.clock > 10 && cycle > 18;

    if (player.invulnerable > 0 || scatterWindow) {
      return normalizeTargetCell(ghost.scatter);
    }

    if (ghost.personality === 1) {
      return normalizeTargetCell({
        x: playerCell.x + playerDir.x * 4,
        y: playerCell.y + playerDir.y * 4
      });
    }

    if (ghost.personality === 2) {
      const side = state.clock % 6 < 3 ? { x: playerDir.y, y: -playerDir.x } : { x: -playerDir.y, y: playerDir.x };
      return normalizeTargetCell({
        x: playerCell.x + side.x * 5,
        y: playerCell.y + side.y * 5
      });
    }

    if (ghost.personality === 3 && distanceCells(toCell(ghost.x, ghost.y), playerCell) < 7) {
      return normalizeTargetCell(ghost.scatter);
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
    const firstMoves = shuffle(withoutReverse.length > 0 ? withoutReverse : options);
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

  function checkGhostCollision() {
    if (state.player.invulnerable > 0 || state.phase !== "playing") {
      return;
    }

    const player = state.player;
    const ghost = state.ghosts.find((candidate) => {
      const dx = candidate.x - player.x;
      const dy = candidate.y - player.y;
      const radius = candidate.radius + player.radius - 1.5;
      return dx * dx + dy * dy < radius * radius;
    });

    if (ghost) {
      openQuestion(ghost);
    }
  }

  function generateQuestion() {
    const difficulty = getDifficultySettings();
    const canUseReview = difficulty.questionMode === "classic";
    const reviewQuestion = canUseReview && Math.random() < getAdaptiveQuestionChance() ? createReviewQuestion() : null;
    const question = reviewQuestion || createRandomQuestion();
    rememberQuestionKey(question.key);
    return question;
  }

  function createRandomQuestion() {
    const difficulty = getDifficultySettings();
    if (difficulty.questionMode === "twoByOne") {
      return createTwoDigitByOneQuestion();
    }

    if (difficulty.questionMode === "twoByTwo") {
      return createTwoDigitByTwoQuestion();
    }

    const tier = Math.min(4, Math.floor((state.correctAnswers + state.levelIndex * 8) / difficulty.questionTierStep));
    const maxByTier = [9, 10, 12, 12, 12][tier];
    const max = clamp(maxByTier + difficulty.questionMaxOffset, 6, 12);
    const minByTier = tier >= 3 ? 3 : 2;
    const multiplication = Math.random() > 0.42 || state.correctAnswers < 5;
    let a = randomInt(minByTier, max);
    let b = randomInt(2, max);

    for (let attempt = 0; attempt < 8 && hasRecentQuestion(factKey(a, b)); attempt += 1) {
      a = randomInt(minByTier, max);
      b = randomInt(2, max);
    }

    return multiplication ? makeMultiplicationQuestion(a, b) : makeDivisionQuestion(a, b);
  }

  function createTwoDigitByOneQuestion() {
    return createSizedQuestion(12, 99, 2, 9);
  }

  function createTwoDigitByTwoQuestion() {
    return createSizedQuestion(12, 99, 12, 99);
  }

  function createSizedQuestion(aMin, aMax, bMin, bMax) {
    const multiplication = Math.random() > 0.45;
    let a = randomInt(aMin, aMax);
    let b = randomInt(bMin, bMax);

    for (let attempt = 0; attempt < 10 && hasRecentQuestion(factKey(a, b)); attempt += 1) {
      a = randomInt(aMin, aMax);
      b = randomInt(bMin, bMax);
    }

    return multiplication ? makeMultiplicationQuestion(a, b) : makeDivisionQuestion(a, b);
  }

  function createReviewQuestion() {
    const candidates = Object.entries(state.factStats)
      .map(([key, stats]) => ({
        key,
        stats,
        weight: Math.max(0, stats.wrong * 2 - stats.correct)
      }))
      .filter((candidate) => candidate.weight > 0 && !hasRecentQuestion(candidate.key));

    if (candidates.length === 0) {
      return null;
    }

    const candidate = weightedRandom(candidates);
    const factors = parseFactKey(candidate.key);
    if (!factors) {
      return null;
    }

    return Math.random() < 0.55
      ? makeMultiplicationQuestion(factors.a, factors.b)
      : makeDivisionQuestion(factors.a, factors.b);
  }

  function makeMultiplicationQuestion(a, b) {
    return {
      key: factKey(a, b),
      text: formatQuestion(a, "×", b),
      answer: a * b
    };
  }

  function makeDivisionQuestion(a, b) {
    return {
      key: factKey(a, b),
      text: formatQuestion(a * b, "÷", b),
      answer: a
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

  function openQuestion(ghost) {
    state.phase = "question";
    resetJoystick();
    state.question = generateQuestion();
    state.currentGhostId = ghost.id;
    state.answerLocked = false;
    els.questionStatus.textContent = `רוח ${state.combo > 2 ? "ברצף" : "נתפסה"}`;
    els.questionTitle.dir = "ltr";
    els.questionTitle.textContent = state.question.text;
    els.questionFeedback.textContent = "";
    els.questionFeedback.style.color = "";
    els.answerInput.value = "";
    els.answerInput.disabled = false;
    els.submitAnswer.disabled = false;
    els.questionDialog.hidden = false;
    playTone(310, 0.08, "triangle", 0.035);
    setTimeout(() => els.answerInput.focus(), 30);
  }

  function finishQuestion(correct) {
    els.questionDialog.hidden = true;
    state.answerLocked = false;
    els.answerInput.disabled = false;
    els.submitAnswer.disabled = false;

    if (correct) {
      applyCorrectAnswer();
    } else {
      applyWrongAnswer();
    }

    updateHud();
  }

  function applyCorrectAnswer() {
    const ghost = state.ghosts.find((candidate) => candidate.id === state.currentGhostId);
    const previousLevelIndex = state.levelIndex;
    state.correctAnswers += 1;
    state.combo += 1;
    const comboBonus = Math.min(750, state.combo * 35);
    state.score += 260 + comboBonus;
    state.shake = 0.07;
    playCorrectSound();
    pulseElement(els.progressWrap, "progress-pulse");

    if (ghost) {
      addBurst(ghost.x, ghost.y, ghost.color, 36, 150);
      addFloatingText(ghost.x, ghost.y - 24, `+${260 + comboBonus}`, "#67f08b");
      state.ghosts = state.ghosts.filter((candidate) => candidate.id !== ghost.id);
      scheduleGhostSpawn(0.9);
      updateMission("ghostDefeated");
    }

    if (state.player) {
      addFloatingText(state.player.x, state.player.y - 44, positiveFeedback(), getCurrentLevel().accent);
    }

    updateMission("correctAnswer");

    const awardedLife = state.correctAnswers % CONFIG.answersPerLevel === 0;
    if (awardedLife) {
      state.lives += 1;
      addFloatingText(state.player.x, state.player.y - 28, "+חיים", "#ff5f9f");
      playTone(880, 0.12, "triangle", 0.04);
    }

    if (state.correctAnswers >= CONFIG.targetCorrect) {
      showEndScreen(true);
      return;
    }

    const nextLevelIndex = getLevelIndexForAnswers(state.correctAnswers);
    state.phase = "playing";
    state.currentGhostId = null;
    state.question = null;

    if (nextLevelIndex !== previousLevelIndex) {
      enterLevel(nextLevelIndex, { announce: true, awardedLife });
      return;
    }

    ensureGhostCount();
  }

  function applyWrongAnswer() {
    state.lives -= 1;
    state.combo = 0;
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
    state.phase = "playing";
    state.currentGhostId = null;
    state.question = null;
  }

  function resetPositionsAfterHit() {
    const playerPos = centerOfCell(PLAYER_START.x, PLAYER_START.y);
    state.player.x = playerPos.x;
    state.player.y = playerPos.y;
    state.player.direction = "right";
    state.player.desiredDirection = "right";
    state.player.directionRequestTime = state.clock;
    state.player.trail = [];

    state.ghosts.forEach((ghost, index) => {
      const cell = chooseGhostSpawnCell(index);
      const pos = centerOfCell(cell.x, cell.y);
      ghost.x = pos.x;
      ghost.y = pos.y;
      ghost.direction = randomItem(DIR_NAMES);
      ghost.pathCooldown = 0;
      ghost.spawnFlash = 0.8;
    });
  }

  function showEndScreen(won) {
    const playerName = state.playerName || "שחקן";
    state.phase = "ended";
    resetJoystick();
    state.currentGhostId = null;
    state.question = null;
    els.questionDialog.hidden = true;
    els.endScreen.hidden = false;
    els.winnerTrophy.hidden = !won;
    els.endKicker.textContent = won ? `כל הכבוד ${playerName}` : "עוד סיבוב";
    els.endTitle.textContent = won ? `${playerName} ניצח!` : "נגמרו החיים";
    els.endCopy.textContent = won ? `${playerName} השלים 100 תשובות נכונות.` : `${playerName}, השיא הבא מחכה כבר על הלוח.`;
    els.finalScore.textContent = numberFormat.format(state.score);
    els.finalCorrect.textContent = state.correctAnswers;

    if (state.score > state.bestScore) {
      state.bestScore = state.score;
      storage.set(CONFIG.storageKeys.bestScore, String(state.bestScore));
      els.bestScore.textContent = numberFormat.format(state.bestScore);
    }

    if (won) {
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
    for (let i = 0; i < count; i += 1) {
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
    const color = randomItem([level.accent, level.powerPelletColor, "#ffd84a", "#67f08b", "#ff5f9f"]);
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
    ctx.save();
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    if (state.shake > 0) {
      const amount = state.shake * 12;
      ctx.translate((Math.random() - 0.5) * amount, (Math.random() - 0.5) * amount);
    }

    drawBackdrop();
    drawMaze();
    drawPellets();
    drawPlayer();
    drawGhosts();
    drawParticles();
    drawFloatingTexts();
    drawLevelBanner();

    if (state.phase === "paused") {
      drawPaused();
    }

    ctx.restore();
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

    for (const star of state.backdropStars) {
      drawLevelDecoration(star, level);
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
    ctx.shadowBlur = 14;

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

    if (level.ghostStyle === "ice") {
      ctx.beginPath();
      ctx.moveTo(x - 5, y);
      ctx.lineTo(x + 5, y);
      ctx.moveTo(x, y - 5);
      ctx.lineTo(x, y + 5);
      ctx.stroke();
    } else if (level.ghostStyle === "lava") {
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (level.ghostStyle === "ancient") {
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

  function drawPellets() {
    const level = getCurrentLevel();
    ctx.save();
    ctx.shadowColor = level.powerPelletColor || "rgba(255, 216, 74, 0.6)";
    ctx.shadowBlur = 8;
    for (const pellet of state.pellets.values()) {
      const pulse = 1 + Math.sin(state.clock * 5 + pellet.phase) * 0.18;
      const radius = pellet.radius * pulse;
      ctx.fillStyle = pellet.value > 10 ? level.powerPelletColor : level.pelletColor;

      if (pellet.value > 10) {
        drawStar(pellet.x, pellet.y, 5, radius + 2, radius * 0.48, state.clock + pellet.phase);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(pellet.x, pellet.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function drawStar(cx, cy, spikes, outerRadius, innerRadius, rotation = -Math.PI / 2) {
    let rot = rotation;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);

    for (let i = 0; i < spikes; i += 1) {
      rot += step;
      ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
      rot += step;
      ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
    }

    ctx.closePath();
  }

  function drawDiamond(cx, cy, radius) {
    ctx.beginPath();
    ctx.moveTo(cx, cy - radius);
    ctx.lineTo(cx + radius * 0.82, cy);
    ctx.lineTo(cx, cy + radius);
    ctx.lineTo(cx - radius * 0.82, cy);
    ctx.closePath();
  }

  function drawPlayer() {
    const player = state.player;
    if (!player) {
      return;
    }

    ctx.save();
    for (const point of player.trail) {
      const alpha = Math.max(0, point.life / 0.28) * 0.24;
      ctx.fillStyle = `rgba(255, 216, 74, ${alpha})`;
      ctx.beginPath();
      ctx.arc(point.x, point.y, player.radius * (0.7 + alpha), 0, Math.PI * 2);
      ctx.fill();
    }

    const flicker = player.invulnerable > 0 && Math.floor(state.clock * 16) % 2 === 0;
    if (flicker) {
      ctx.globalAlpha = 0.55;
    }

    const angle = directionAngle(player.direction);
    const mouth = player.mouth;
    const bodyGradient = ctx.createRadialGradient(player.x - 4, player.y - 6, 2, player.x, player.y, player.radius + 5);
    bodyGradient.addColorStop(0, "#fff9a2");
    bodyGradient.addColorStop(0.45, "#ffd84a");
    bodyGradient.addColorStop(1, "#f1a900");

    ctx.shadowColor = "rgba(255, 216, 74, 0.62)";
    ctx.shadowBlur = 18;
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.arc(player.x, player.y, player.radius, angle + mouth, angle + Math.PI * 2 - mouth, false);
    ctx.closePath();
    ctx.fill();

    const eyeAngle = player.direction === "left" ? angle + 0.9 : angle - 0.9;
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#191400";
    ctx.beginPath();
    ctx.arc(
      player.x + Math.cos(eyeAngle) * player.radius * 0.48,
      player.y + Math.sin(eyeAngle) * player.radius * 0.48,
      1.8,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();
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

  function drawGhosts() {
    const player = state.player;
    for (const ghost of state.ghosts) {
      ctx.save();
      const flashAlpha = ghost.spawnFlash > 0 ? 0.48 + Math.sin(state.clock * 24) * 0.22 : 1;
      ctx.globalAlpha = clamp(flashAlpha, 0.28, 1);
      ctx.shadowColor = ghost.color;
      ctx.shadowBlur = 16;
      ctx.fillStyle = ghost.color;

      const wobble = Math.sin(ghost.wobble) * 1.5;
      const x = ghost.x;
      const y = ghost.y + wobble;
      const r = ghost.radius;

      drawThemedGhostBody(ghost, x, y, r);

      ctx.shadowBlur = 0;
      const look = player
        ? {
          x: clamp((player.x - ghost.x) / 140, -1, 1),
          y: clamp((player.y - ghost.y) / 140, -1, 1)
        }
        : DIRS[ghost.direction];

      drawGhostEye(x - r * 0.36, y - r * 0.16, r, look);
      drawGhostEye(x + r * 0.36, y - r * 0.16, r, look);
      ctx.restore();
    }
  }

  function drawThemedGhostBody(ghost, x, y, r) {
    const style = ghost.style || "classic";

    if (style === "diamond") {
      drawDiamondGhostBody(ghost, x, y, r);
      return;
    }

    drawClassicGhostBody(x, y, r);

    if (style === "ice") {
      drawIceGhostDetails(x, y, r);
    } else if (style === "lava") {
      drawLavaGhostDetails(x, y, r);
    } else if (style === "ancient") {
      drawAncientGhostDetails(x, y, r);
    }
  }

  function drawClassicGhostBody(x, y, r) {
    ctx.beginPath();
    ctx.moveTo(x - r, y + r);
    ctx.lineTo(x - r, y);
    ctx.arc(x, y, r, Math.PI, 0, false);
    ctx.lineTo(x + r, y + r);

    for (let i = 0; i < 4; i += 1) {
      const waveX = x + r - (i + 0.5) * (r * 2 / 4);
      const nextX = x + r - (i + 1) * (r * 2 / 4);
      ctx.quadraticCurveTo(waveX, y + r - 5, nextX, y + r);
    }

    ctx.closePath();
    ctx.fill();
  }

  function drawIceGhostDetails(x, y, r) {
    ctx.save();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255, 255, 255, 0.62)";
    for (let i = 0; i < 3; i += 1) {
      const spikeX = x - r * 0.58 + i * r * 0.58;
      ctx.beginPath();
      ctx.moveTo(spikeX - 3.2, y + r * 0.78);
      ctx.lineTo(spikeX + 3.2, y + r * 0.78);
      ctx.lineTo(spikeX, y + r * 1.22);
      ctx.closePath();
      ctx.fill();
    }
    ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
    ctx.beginPath();
    ctx.arc(x - r * 0.24, y - r * 0.45, r * 0.2, 0, Math.PI * 1.4);
    ctx.stroke();
    ctx.restore();
  }

  function drawLavaGhostDetails(x, y, r) {
    ctx.save();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255, 230, 128, 0.75)";
    ctx.beginPath();
    ctx.moveTo(x - r * 0.34, y - r * 0.2);
    ctx.quadraticCurveTo(x - r * 0.12, y - r * 0.95, x + r * 0.05, y - r * 0.18);
    ctx.quadraticCurveTo(x + r * 0.3, y - r * 0.75, x + r * 0.42, y - r * 0.06);
    ctx.quadraticCurveTo(x + r * 0.08, y + r * 0.04, x - r * 0.34, y - r * 0.2);
    ctx.fill();
    ctx.strokeStyle = "rgba(80, 12, 8, 0.45)";
    ctx.beginPath();
    ctx.moveTo(x - r * 0.7, y + r * 0.46);
    ctx.lineTo(x + r * 0.64, y + r * 0.18);
    ctx.stroke();
    ctx.restore();
  }

  function drawAncientGhostDetails(x, y, r) {
    ctx.save();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(255, 244, 205, 0.62)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i += 1) {
      const yy = y - r * 0.42 + i * r * 0.42;
      ctx.beginPath();
      ctx.moveTo(x - r * 0.82, yy);
      ctx.lineTo(x + r * 0.72, yy + (i % 2 === 0 ? 3 : -3));
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(39, 224, 195, 0.55)";
    ctx.fillRect(x - 2, y + r * 0.52, 4, 4);
    ctx.restore();
  }

  function drawDiamondGhostBody(ghost, x, y, r) {
    const gradient = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
    gradient.addColorStop(0, "#f8ffff");
    gradient.addColorStop(0.4, ghost.color);
    gradient.addColorStop(1, "#302c9c");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(x, y - r * 1.08);
    ctx.lineTo(x + r * 0.94, y - r * 0.22);
    ctx.lineTo(x + r * 0.72, y + r * 0.9);
    ctx.lineTo(x, y + r * 1.22);
    ctx.lineTo(x - r * 0.72, y + r * 0.9);
    ctx.lineTo(x - r * 0.94, y - r * 0.22);
    ctx.closePath();
    ctx.fill();

    ctx.save();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.46)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y - r * 1.02);
    ctx.lineTo(x, y + r * 1.14);
    ctx.moveTo(x - r * 0.82, y - r * 0.16);
    ctx.lineTo(x + r * 0.82, y - r * 0.16);
    ctx.moveTo(x - r * 0.58, y + r * 0.82);
    ctx.lineTo(x + r * 0.58, y + r * 0.82);
    ctx.stroke();
    ctx.restore();
  }

  function drawGhostEye(x, y, radius, look) {
    ctx.fillStyle = "#f7fbff";
    ctx.beginPath();
    ctx.ellipse(x, y, radius * 0.27, radius * 0.34, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#08111f";
    ctx.beginPath();
    ctx.arc(x + look.x * radius * 0.11, y + look.y * radius * 0.11, radius * 0.12, 0, Math.PI * 2);
    ctx.fill();
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

    setTimeout(() => els.playerNameInput.focus(), 30);
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
    state.answerLocked = true;
    els.answerInput.disabled = true;
    els.submitAnswer.disabled = true;
    recordFactResult(state.question, correct);
    els.questionFeedback.textContent = correct ? positiveFeedback() : supportFeedback(state.question.answer);
    els.questionFeedback.style.color = correct ? "#67f08b" : "#ff4c5f";
    setTimeout(() => finishQuestion(correct), correct ? CONFIG.questionFeedbackDelay.correct : CONFIG.questionFeedbackDelay.wrong);
  });

  els.pause.addEventListener("click", togglePause);
  els.sound.addEventListener("click", toggleSound);
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
  els.difficultyInputs.forEach((input) => {
    input.addEventListener("change", () => setDifficulty(input.value));
  });
  els.restartButton.addEventListener("click", showStartScreen);
  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("blur", () => {
    if (state.phase === "playing") {
      togglePause();
    }
  });

  resizeCanvas();
  syncDifficultyInputs();
  setupGame();
  updateSoundButton();
  focusPlayerNameWhenUseful();
  requestAnimationFrame(gameLoop);
})();
