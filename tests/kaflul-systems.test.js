const test = require("node:test");
const assert = require("node:assert/strict");

const systems = require("../kaflul-systems");
const championsHandler = require("../api/champions");

function memoryStorage(initial = {}) {
  const store = new Map(Object.entries(initial));
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    }
  };
}

function createMockResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: "",
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(name, value) {
      this.headers[String(name).toLowerCase()] = value;
    },
    end(body = "") {
      this.body = body;
    }
  };
}

function withLeaderboardEnv(env, callback) {
  const keys = ["SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  keys.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(env, key)) {
      process.env[key] = env[key];
    } else {
      delete process.env[key];
    }
  });

  return Promise.resolve()
    .then(callback)
    .finally(() => {
      keys.forEach((key) => {
        if (previous[key] === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = previous[key];
        }
      });
    });
}

test("difficulty configuration exposes five stable Hebrew difficulties", () => {
  assert.deepEqual(Object.keys(systems.DIFFICULTIES), [
    "beginner",
    "normal",
    "advanced",
    "expert",
    "legendary"
  ]);
  assert.equal(systems.DIFFICULTIES.beginner.label, "מתחילים");
  assert.equal(systems.DIFFICULTIES.legendary.scoreMultiplierPct, 500);
  assert.equal(systems.normalizeDifficulty("veryHard"), "expert");
});

test("default save locks legendary until a configured achievement", () => {
  const save = systems.createDefaultSave();
  assert.equal(systems.isDifficultyUnlocked(save, "expert"), true);
  assert.equal(systems.isDifficultyUnlocked(save, "legendary"), false);
  assert.equal(systems.shouldUnlockLegendary(save, {
    mode: "arcade",
    difficulty: "expert",
    score: systems.LEGENDARY_UNLOCK_RULE.expertArcadeScore
  }), true);
});

test("score calculation applies difficulty and combo exactly once", () => {
  const score = systems.createScoreState();
  const award = systems.applyScoreEvent(score, {
    type: "correctAnswer",
    responseMs: 2000,
    timeLimitMs: 25000,
    questionMode: "filteredTable",
    enemyDefeated: true
  }, {
    difficulty: systems.DIFFICULTIES.normal,
    comboMultiplierPct: 150
  });

  assert.equal(award.rawPoints, 800);
  assert.equal(award.difficultyBonus, 400);
  assert.equal(award.comboBonus, 600);
  assert.equal(award.total, 1800);
  assert.equal(score.total, 1800);
});

test("math answer speed bonus uses configured thresholds", () => {
  assert.equal(systems.getSpeedBonus(2000, 20000), 220);
  assert.equal(systems.getSpeedBonus(9000, 20000), 130);
  assert.equal(systems.getSpeedBonus(14000, 20000), 60);
  assert.equal(systems.getSpeedBonus(19000, 20000), 0);
});

test("combo progression and reset are centralized", () => {
  const combo = systems.createComboState();
  systems.applyComboEvent(combo, "success");
  systems.applyComboEvent(combo, "success");
  systems.applyComboEvent(combo, "success");
  assert.equal(combo.count, 3);
  assert.equal(combo.multiplierPct, 120);

  systems.applyComboEvent(combo, "success");
  systems.applyComboEvent(combo, "success");
  assert.equal(combo.multiplierPct, 150);

  systems.applyComboEvent(combo, "lifeLost", systems.DIFFICULTIES.normal);
  assert.equal(combo.count, 0);
  assert.equal(combo.multiplierPct, 100);
  assert.equal(combo.max, 5);
});

test("math performance tracks accuracy, average time, fastest answer and streak", () => {
  const stats = systems.createMathStats();
  systems.recordMathAnswer(stats, { correct: true, responseMs: 1800 });
  systems.recordMathAnswer(stats, { correct: true, responseMs: 900 });
  systems.recordMathAnswer(stats, { correct: false, responseMs: 5000 });

  assert.equal(stats.totalQuestions, 3);
  assert.equal(stats.correctAnswers, 2);
  assert.equal(stats.incorrectAnswers, 1);
  assert.equal(stats.fastestAnswerMs, 900);
  assert.equal(stats.maxStreak, 2);
  assert.equal(systems.getAccuracy(stats), 67);
  assert.equal(systems.getAverageAnswerTime(stats), 2567);
});

test("leaderboard entries sort and filter by mode and difficulty", () => {
  const save = systems.createDefaultSave();
  const low = systems.createLeaderboardEntry({
    nickname: "אחד",
    score: 200,
    mode: "arcade",
    difficulty: "normal",
    reachedStage: 1
  });
  const high = systems.createLeaderboardEntry({
    nickname: "שתיים",
    score: 900,
    mode: "arcade",
    difficulty: "normal",
    reachedStage: 2
  });
  const adventure = systems.createLeaderboardEntry({
    nickname: "שלוש",
    score: 700,
    mode: "adventure",
    difficulty: "normal",
    reachedStage: 4
  });

  systems.addLocalLeaderboardEntry(save, low);
  systems.addLocalLeaderboardEntry(save, high);
  systems.addLocalLeaderboardEntry(save, adventure);

  const arcade = systems.getLeaderboardEntries(save, { mode: "arcade", difficulty: "normal" });
  assert.equal(arcade.length, 2);
  assert.equal(arcade[0].score, 900);

  const adventureOnly = systems.getLeaderboardEntries(save, { mode: "adventure" });
  assert.equal(adventureOnly.length, 1);
  assert.equal(adventureOnly[0].mode, "adventure");
});

test("public leaderboard UI stays local-only when public backend is unavailable", () => {
  const localOnly = systems.getPublicLeaderboardUiState("localOnly", true);
  assert.equal(localOnly.panelHidden, false);
  assert.equal(localOnly.buttonDisabled, true);
  assert.equal(localOnly.buttonText, "פרסום לא זמין");
  assert.equal(localOnly.title, "השיא נשמר במכשיר הזה");
  assert.equal(localOnly.copy, systems.PUBLIC_LEADERBOARD_LOCAL_ONLY_MESSAGE);
  assert.equal(localOnly.statusText, systems.PUBLIC_LEADERBOARD_LOCAL_ONLY_MESSAGE);
  assert.equal(localOnly.publicChipText, "ציבורי לא פעיל");
  assert.equal(localOnly.publicAvailable, false);

  const ineligible = systems.getPublicLeaderboardUiState("localOnly", false);
  assert.equal(ineligible.panelHidden, true);
  assert.equal(ineligible.buttonDisabled, true);

  const available = systems.getPublicLeaderboardUiState("available", true);
  assert.equal(available.panelHidden, false);
  assert.equal(available.buttonDisabled, false);
  assert.equal(available.publicAvailable, true);
});

test("champions API returns explicit unconfigured status without throwing", async () => {
  await withLeaderboardEnv({}, async () => {
    const response = createMockResponse();
    await championsHandler({
      method: "GET",
      headers: { host: "127.0.0.1:4173" },
      socket: { remoteAddress: "127.0.0.1" }
    }, response);

    assert.equal(response.statusCode, 503);
    assert.equal(response.headers["content-type"], "application/json; charset=utf-8");
    assert.deepEqual(JSON.parse(response.body), {
      code: "leaderboard_not_configured",
      message: "טבלת השיאים עדיין לא הוגדרה."
    });
  });
});

test("champions API capability check stays HTTP 200 when backend is unconfigured", async () => {
  await withLeaderboardEnv({}, async () => {
    const response = createMockResponse();
    await championsHandler({
      method: "GET",
      url: "/api/champions?capability=1",
      headers: { host: "127.0.0.1:4173" },
      socket: { remoteAddress: "127.0.0.1" }
    }, response);

    assert.equal(response.statusCode, 200);
    assert.deepEqual(JSON.parse(response.body), {
      publicAvailable: false,
      code: "leaderboard_not_configured",
      message: "טבלת השיאים עדיין לא הוגדרה."
    });
  });
});

test("nickname validation rejects empty and dangerous input", () => {
  assert.equal(systems.validateNickname("").ok, false);
  assert.equal(systems.validateNickname("<script>").ok, false);
  assert.equal(systems.validateNickname("  כפלול 7  ").value, "כפלול 7");
});

test("local persistence saves, loads, recovers corruption and migrates legacy values", () => {
  const storage = memoryStorage();
  const save = systems.createDefaultSave();
  save.settings.selectedDifficulty = "advanced";
  assert.equal(systems.persistSave(storage, save), true);
  assert.equal(systems.loadSave(storage).settings.selectedDifficulty, "advanced");

  const corruptStorage = memoryStorage({
    [systems.SAVE_KEY]: "{broken"
  });
  assert.equal(systems.loadSave(corruptStorage).recovery, "corrupt_json");

  const legacy = systems.migrateSave({
    selectedDifficulty: "veryHard",
    selectedMode: "adventure",
    nickname: "בודק"
  });
  assert.equal(legacy.settings.selectedDifficulty, "expert");
  assert.equal(legacy.settings.selectedMode, "adventure");
  assert.equal(legacy.player.nickname, "בודק");
});

test("state machine allows start, pause, resume and rejects invalid skips", () => {
  assert.equal(systems.transitionState("mainMenu", "playing"), "playing");
  assert.equal(systems.transitionState("playing", "paused"), "paused");
  assert.equal(systems.transitionState("paused", "playing"), "playing");
  assert.throws(() => systems.transitionState("mainMenu", "results"), /Invalid game state transition/);
});

test("swipe detection filters micro-swipes and returns cardinal directions", () => {
  assert.equal(systems.detectSwipeDirection({ x: 10, y: 10 }, { x: 18, y: 12 }, { threshold: 20 }), "none");
  assert.equal(systems.detectSwipeDirection({ x: 10, y: 10 }, { x: 60, y: 18 }, { threshold: 20 }), "right");
  assert.equal(systems.detectSwipeDirection({ x: 10, y: 10 }, { x: 6, y: 70 }, { threshold: 20 }), "down");
  assert.equal(systems.detectSwipeDirection({ x: 10, y: 10 }, { x: 8, y: -40 }, { threshold: 20 }), "up");
});
