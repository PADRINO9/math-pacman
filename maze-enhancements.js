(() => {
  "use strict";

  const WIDTH = 960;
  const HEIGHT = 720;
  const TILE = 24;
  const COLS = WIDTH / TILE;
  const ROWS = HEIGHT / TILE;
  const PLAYER_START = { x: 2, y: 2 };
  const CENTER_CELL = { x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) };
  const TAU = Math.PI * 2;

  const gameCanvas = document.getElementById("game-canvas");
  const stage = document.querySelector(".stage");
  if (!gameCanvas || !stage || window.__mazeEnhancementsInstalled) {
    return;
  }
  window.__mazeEnhancementsInstalled = true;

  const originalMapSet = Map.prototype.set;
  const originalMapDelete = Map.prototype.delete;
  const originalMapClear = Map.prototype.clear;
  const originalMapGet = Map.prototype.get;
  const originalMapHas = Map.prototype.has;

  let collectiblesMap = null;
  let activeDiamond = null;
  let nextSpawnIn = randomSeconds();
  let lastFrameTime = performance.now();
  let currentLevelIndex = -1;
  let currentMaze = [];
  const burstParticles = [];

  const overlay = document.createElement("canvas");
  overlay.width = WIDTH;
  overlay.height = HEIGHT;
  overlay.className = "maze-enhancement-layer";
  overlay.setAttribute("aria-hidden", "true");
  Object.assign(overlay.style, {
    position: "absolute",
    inset: "0",
    width: "100%",
    height: "100%",
    pointerEvents: "none"
  });
  gameCanvas.insertAdjacentElement("afterend", overlay);

  const overlayContext = overlay.getContext("2d");
  const mazeLayer = document.createElement("canvas");
  mazeLayer.width = WIDTH;
  mazeLayer.height = HEIGHT;
  const mazeContext = mazeLayer.getContext("2d");

  const themes = [
    {
      panel: "rgba(7, 42, 70, 0.44)",
      inner: "rgba(20, 112, 158, 0.26)",
      line: "rgba(147, 244, 255, 0.82)",
      glow: "rgba(71, 223, 255, 0.72)",
      node: "#d9fbff"
    },
    {
      panel: "rgba(67, 12, 8, 0.48)",
      inner: "rgba(180, 53, 17, 0.24)",
      line: "rgba(255, 188, 91, 0.86)",
      glow: "rgba(255, 91, 37, 0.74)",
      node: "#ffe3a2"
    },
    {
      panel: "rgba(51, 39, 20, 0.48)",
      inner: "rgba(113, 87, 42, 0.27)",
      line: "rgba(244, 213, 142, 0.82)",
      glow: "rgba(39, 224, 195, 0.62)",
      node: "#fff0bd"
    },
    {
      panel: "rgba(15, 23, 83, 0.48)",
      inner: "rgba(61, 41, 132, 0.27)",
      line: "rgba(137, 255, 231, 0.86)",
      glow: "rgba(255, 78, 215, 0.68)",
      node: "#ffffff"
    }
  ];

  function randomSeconds() {
    return 1 + Math.random() * 9;
  }

  function looksLikeCollectible(key, value) {
    return typeof key === "string"
      && /^\d+,\d+$/.test(key)
      && value
      && typeof value === "object"
      && Number.isFinite(value.x)
      && Number.isFinite(value.y)
      && Number.isFinite(value.phase)
      && Number.isFinite(value.radius)
      && Number.isFinite(value.value);
  }

  Map.prototype.set = function enhancedMapSet(key, value) {
    const result = originalMapSet.call(this, key, value);
    if (!collectiblesMap && looksLikeCollectible(key, value)) {
      collectiblesMap = this;
    }
    return result;
  };

  Map.prototype.delete = function enhancedMapDelete(key) {
    const collectedSpecial = this === collectiblesMap
      && activeDiamond
      && key === activeDiamond.key
      && originalMapGet.call(this, key) === activeDiamond.special;
    const result = originalMapDelete.call(this, key);
    if (collectedSpecial) {
      finishDiamond(true);
    }
    return result;
  };

  Map.prototype.clear = function enhancedMapClear() {
    if (this === collectiblesMap) {
      activeDiamond = null;
      nextSpawnIn = randomSeconds();
    }
    return originalMapClear.call(this);
  };

  function getLevelIndex() {
    const worldName = document.getElementById("world-name")?.textContent?.trim();
    const byName = {
      "קרח": 0,
      "לבה": 1,
      "עתיקות": 2,
      "יהלומים": 3
    };
    if (Object.prototype.hasOwnProperty.call(byName, worldName)) {
      return byName[worldName];
    }

    const displayedLevel = Number(document.getElementById("level-number")?.textContent);
    return Number.isFinite(displayedLevel) ? Math.max(0, Math.min(3, displayedLevel - 1)) : 0;
  }

  function isGameActivelyRunning() {
    const startScreen = document.getElementById("start-screen");
    const endScreen = document.getElementById("end-screen");
    const questionDialog = document.getElementById("question-dialog");
    const pauseButton = document.getElementById("pause-button");
    return Boolean(
      startScreen?.hidden
      && endScreen?.hidden
      && questionDialog?.hidden
      && pauseButton?.textContent !== "▶"
    );
  }

  function createMaze(levelIndex) {
    const maze = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

    for (let x = 0; x < COLS; x += 1) {
      maze[0][x] = 1;
      maze[ROWS - 1][x] = 1;
    }
    for (let y = 0; y < ROWS; y += 1) {
      maze[y][0] = 1;
      maze[y][COLS - 1] = 1;
    }

    const addBlock = (x, y, width, height) => {
      for (let cellY = y; cellY < y + height; cellY += 1) {
        for (let cellX = x; cellX < x + width; cellX += 1) {
          if (cellX > 0 && cellX < COLS - 1 && cellY > 0 && cellY < ROWS - 1) {
            maze[cellY][cellX] = 1;
          }
        }
      }
    };
    const mirrorBlock = (x, y, width, height) => {
      addBlock(x, y, width, height);
      addBlock(COLS - x - width, y, width, height);
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

    const pattern = levelIndex % 4;
    if (pattern === 0) {
      mirrorBlock(5, 11, 3, 1);
      mirrorBlock(15, 20, 2, 1);
      addBlock(19, 7, 2, 2);
    } else if (pattern === 1) {
      mirrorBlock(8, 11, 1, 4);
      mirrorBlock(13, 5, 2, 3);
      addBlock(18, 20, 4, 1);
    } else if (pattern === 2) {
      mirrorBlock(7, 12, 4, 1);
      mirrorBlock(15, 9, 1, 4);
      addBlock(19, 4, 2, 3);
      addBlock(19, 25, 2, 2);
    } else {
      mirrorBlock(5, 6, 2, 2);
      mirrorBlock(9, 19, 2, 3);
      mirrorBlock(16, 12, 1, 3);
      addBlock(18, 14, 4, 1);
    }

    clearZone(maze, PLAYER_START.x, PLAYER_START.y, 2);
    clearZone(maze, CENTER_CELL.x, CENTER_CELL.y, 3);
    clearZone(maze, 2, ROWS - 3, 2);
    clearZone(maze, COLS - 3, ROWS - 3, 2);
    return maze;
  }

  function clearZone(maze, centerX, centerY, radius) {
    for (let y = centerY - radius; y <= centerY + radius; y += 1) {
      for (let x = centerX - radius; x <= centerX + radius; x += 1) {
        if (x > 0 && x < COLS - 1 && y > 0 && y < ROWS - 1) {
          maze[y][x] = 0;
        }
      }
    }
  }

  function isWall(maze, x, y) {
    return x >= 0 && y >= 0 && x < COLS && y < ROWS && maze[y][x] === 1;
  }

  function roundedRect(context, x, y, width, height, radius) {
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - radius);
    context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    context.lineTo(x + radius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
  }

  function rebuildMazeLayer(levelIndex) {
    currentLevelIndex = levelIndex;
    currentMaze = createMaze(levelIndex);
    const theme = themes[levelIndex] || themes[0];
    mazeContext.clearRect(0, 0, WIDTH, HEIGHT);

    mazeContext.save();
    mazeContext.lineCap = "round";
    mazeContext.lineJoin = "round";

    mazeContext.strokeStyle = theme.inner;
    mazeContext.lineWidth = 12;
    for (let y = 0; y < ROWS; y += 1) {
      for (let x = 0; x < COLS; x += 1) {
        if (!isWall(currentMaze, x, y)) {
          continue;
        }
        const centerX = x * TILE + TILE / 2;
        const centerY = y * TILE + TILE / 2;
        if (isWall(currentMaze, x + 1, y)) {
          mazeContext.beginPath();
          mazeContext.moveTo(centerX, centerY);
          mazeContext.lineTo(centerX + TILE, centerY);
          mazeContext.stroke();
        }
        if (isWall(currentMaze, x, y + 1)) {
          mazeContext.beginPath();
          mazeContext.moveTo(centerX, centerY);
          mazeContext.lineTo(centerX, centerY + TILE);
          mazeContext.stroke();
        }
      }
    }

    for (let y = 0; y < ROWS; y += 1) {
      for (let x = 0; x < COLS; x += 1) {
        if (!isWall(currentMaze, x, y)) {
          continue;
        }

        const pixelX = x * TILE;
        const pixelY = y * TILE;
        const topOpen = !isWall(currentMaze, x, y - 1);
        const rightOpen = !isWall(currentMaze, x + 1, y);
        const bottomOpen = !isWall(currentMaze, x, y + 1);
        const leftOpen = !isWall(currentMaze, x - 1, y);

        mazeContext.fillStyle = theme.panel;
        roundedRect(mazeContext, pixelX + 4, pixelY + 4, TILE - 8, TILE - 8, 4);
        mazeContext.fill();

        mazeContext.shadowColor = theme.glow;
        mazeContext.shadowBlur = 7;
        mazeContext.strokeStyle = theme.line;
        mazeContext.lineWidth = 1.35;

        if (topOpen) {
          mazeContext.beginPath();
          mazeContext.moveTo(pixelX + 5, pixelY + 4.5);
          mazeContext.lineTo(pixelX + TILE - 5, pixelY + 4.5);
          mazeContext.stroke();
        }
        if (rightOpen) {
          mazeContext.beginPath();
          mazeContext.moveTo(pixelX + TILE - 4.5, pixelY + 5);
          mazeContext.lineTo(pixelX + TILE - 4.5, pixelY + TILE - 5);
          mazeContext.stroke();
        }
        if (bottomOpen) {
          mazeContext.beginPath();
          mazeContext.moveTo(pixelX + 5, pixelY + TILE - 4.5);
          mazeContext.lineTo(pixelX + TILE - 5, pixelY + TILE - 4.5);
          mazeContext.stroke();
        }
        if (leftOpen) {
          mazeContext.beginPath();
          mazeContext.moveTo(pixelX + 4.5, pixelY + 5);
          mazeContext.lineTo(pixelX + 4.5, pixelY + TILE - 5);
          mazeContext.stroke();
        }

        mazeContext.shadowBlur = 0;
        const neighborCount = Number(isWall(currentMaze, x + 1, y))
          + Number(isWall(currentMaze, x - 1, y))
          + Number(isWall(currentMaze, x, y + 1))
          + Number(isWall(currentMaze, x, y - 1));
        const hasNode = neighborCount !== 2 || (x * 13 + y * 17 + levelIndex * 7) % 31 === 0;
        if (hasNode) {
          const centerX = pixelX + TILE / 2;
          const centerY = pixelY + TILE / 2;
          mazeContext.fillStyle = theme.node;
          mazeContext.globalAlpha = 0.58;
          drawSmallDiamond(mazeContext, centerX, centerY, neighborCount > 2 ? 3.1 : 2.2);
          mazeContext.fill();
          mazeContext.globalAlpha = 1;
        }
      }
    }
    mazeContext.restore();
  }

  function spawnDiamond() {
    if (!collectiblesMap || activeDiamond || collectiblesMap.size === 0) {
      return;
    }

    const candidates = Array.from(collectiblesMap.entries()).filter(([key, value]) => {
      return looksLikeCollectible(key, value)
        && !value.__purpleDiamond
        && value.value <= 10
        && value.x > TILE * 2
        && value.x < WIDTH - TILE * 2
        && value.y > TILE * 2
        && value.y < HEIGHT - TILE * 2;
    });
    if (candidates.length === 0) {
      return;
    }

    const [key, original] = candidates[Math.floor(Math.random() * candidates.length)];
    const duration = randomSeconds();
    const special = {
      ...original,
      radius: Math.max(7.4, original.radius),
      value: 10,
      phase: Math.random() * TAU,
      __purpleDiamond: true
    };

    activeDiamond = {
      key,
      original,
      special,
      remaining: duration,
      maxDuration: duration
    };
    originalMapSet.call(collectiblesMap, key, special);
  }

  function finishDiamond(collected) {
    const finished = activeDiamond;
    if (!finished) {
      return;
    }

    if (!collected && collectiblesMap && originalMapGet.call(collectiblesMap, finished.key) === finished.special) {
      originalMapSet.call(collectiblesMap, finished.key, finished.original);
    }

    if (collected) {
      createPurpleBurst(finished.special.x, finished.special.y);
    }
    activeDiamond = null;
    nextSpawnIn = randomSeconds();
  }

  function createPurpleBurst(x, y) {
    for (let index = 0; index < 22; index += 1) {
      const angle = Math.random() * TAU;
      const speed = 42 + Math.random() * 92;
      burstParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 1.5 + Math.random() * 2.6,
        life: 0.45 + Math.random() * 0.45,
        maxLife: 0.9
      });
    }
  }

  function updateDiamondTimer(deltaSeconds) {
    if (!isGameActivelyRunning()) {
      return;
    }

    if (activeDiamond) {
      if (!collectiblesMap || !originalMapHas.call(collectiblesMap, activeDiamond.key)) {
        finishDiamond(true);
        return;
      }
      if (originalMapGet.call(collectiblesMap, activeDiamond.key) !== activeDiamond.special) {
        activeDiamond = null;
        nextSpawnIn = randomSeconds();
        return;
      }
      activeDiamond.remaining -= deltaSeconds;
      if (activeDiamond.remaining <= 0) {
        finishDiamond(false);
      }
      return;
    }

    nextSpawnIn -= deltaSeconds;
    if (nextSpawnIn <= 0) {
      spawnDiamond();
      if (!activeDiamond) {
        nextSpawnIn = 0.75;
      }
    }
  }

  function updateBurstParticles(deltaSeconds) {
    for (let index = burstParticles.length - 1; index >= 0; index -= 1) {
      const particle = burstParticles[index];
      particle.life -= deltaSeconds;
      particle.x += particle.vx * deltaSeconds;
      particle.y += particle.vy * deltaSeconds;
      particle.vx *= 0.975;
      particle.vy *= 0.975;
      if (particle.life <= 0) {
        burstParticles.splice(index, 1);
      }
    }
  }

  function drawDynamicMazeDetails(timeSeconds) {
    if (!currentMaze.length) {
      return;
    }
    const theme = themes[currentLevelIndex] || themes[0];
    overlayContext.save();
    overlayContext.strokeStyle = theme.glow;
    overlayContext.lineWidth = 1.5;
    overlayContext.globalCompositeOperation = "screen";

    for (let index = 0; index < 9; index += 1) {
      const hash = (index * 173 + currentLevelIndex * 67) % (COLS * ROWS);
      const x = hash % COLS;
      const y = Math.floor(hash / COLS);
      if (!isWall(currentMaze, x, y)) {
        continue;
      }
      const alpha = 0.12 + (Math.sin(timeSeconds * 2.2 + index * 0.9) + 1) * 0.09;
      overlayContext.globalAlpha = alpha;
      overlayContext.beginPath();
      overlayContext.arc(x * TILE + TILE / 2, y * TILE + TILE / 2, 5.5, 0, TAU);
      overlayContext.stroke();
    }
    overlayContext.restore();
  }

  function drawPurpleDiamond(timeSeconds) {
    if (!activeDiamond) {
      return;
    }

    const diamond = activeDiamond.special;
    const pulse = 1 + Math.sin(timeSeconds * 6 + diamond.phase) * 0.1;
    const radius = 11.5 * pulse;
    const lifeRatio = Math.max(0, activeDiamond.remaining / activeDiamond.maxDuration);

    overlayContext.save();
    overlayContext.translate(diamond.x, diamond.y);
    overlayContext.rotate(Math.sin(timeSeconds * 1.8 + diamond.phase) * 0.1);
    overlayContext.globalCompositeOperation = "source-over";
    overlayContext.shadowColor = "rgba(187, 92, 255, 0.95)";
    overlayContext.shadowBlur = 20;

    const gradient = overlayContext.createLinearGradient(-radius, -radius, radius, radius);
    gradient.addColorStop(0, "#f4d8ff");
    gradient.addColorStop(0.3, "#cf72ff");
    gradient.addColorStop(0.68, "#8d36e8");
    gradient.addColorStop(1, "#4b148f");
    overlayContext.fillStyle = gradient;
    drawSmallDiamond(overlayContext, 0, 0, radius);
    overlayContext.fill();

    overlayContext.shadowBlur = 0;
    overlayContext.strokeStyle = "rgba(255, 255, 255, 0.88)";
    overlayContext.lineWidth = 1.25;
    drawSmallDiamond(overlayContext, 0, 0, radius);
    overlayContext.stroke();

    overlayContext.strokeStyle = "rgba(255, 230, 255, 0.52)";
    overlayContext.lineWidth = 1;
    overlayContext.beginPath();
    overlayContext.moveTo(0, -radius);
    overlayContext.lineTo(0, radius);
    overlayContext.moveTo(-radius * 0.82, 0);
    overlayContext.lineTo(radius * 0.82, 0);
    overlayContext.moveTo(0, -radius);
    overlayContext.lineTo(radius * 0.82, 0);
    overlayContext.lineTo(0, radius);
    overlayContext.stroke();

    overlayContext.strokeStyle = "rgba(211, 126, 255, 0.8)";
    overlayContext.lineWidth = 2;
    overlayContext.beginPath();
    overlayContext.arc(0, 0, radius + 5, -Math.PI / 2, -Math.PI / 2 + TAU * lifeRatio);
    overlayContext.stroke();
    overlayContext.restore();
  }

  function drawBurstParticles() {
    overlayContext.save();
    overlayContext.fillStyle = "#d27cff";
    overlayContext.shadowColor = "#b64dff";
    overlayContext.shadowBlur = 9;
    for (const particle of burstParticles) {
      overlayContext.globalAlpha = Math.max(0, particle.life / particle.maxLife);
      drawSmallDiamond(overlayContext, particle.x, particle.y, particle.radius);
      overlayContext.fill();
    }
    overlayContext.restore();
  }

  function drawSmallDiamond(context, x, y, radius) {
    context.beginPath();
    context.moveTo(x, y - radius);
    context.lineTo(x + radius * 0.82, y);
    context.lineTo(x, y + radius);
    context.lineTo(x - radius * 0.82, y);
    context.closePath();
  }

  function renderOverlay(timeSeconds) {
    overlayContext.clearRect(0, 0, WIDTH, HEIGHT);
    overlayContext.drawImage(mazeLayer, 0, 0);
    drawDynamicMazeDetails(timeSeconds);
    drawPurpleDiamond(timeSeconds);
    drawBurstParticles();
  }

  function frame(now) {
    const deltaSeconds = Math.min(0.05, Math.max(0, (now - lastFrameTime) / 1000));
    lastFrameTime = now;

    const levelIndex = getLevelIndex();
    if (levelIndex !== currentLevelIndex) {
      rebuildMazeLayer(levelIndex);
    }

    updateDiamondTimer(deltaSeconds);
    updateBurstParticles(deltaSeconds);
    renderOverlay(now / 1000);
    requestAnimationFrame(frame);
  }

  rebuildMazeLayer(getLevelIndex());
  requestAnimationFrame(frame);
})();
