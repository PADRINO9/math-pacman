const { test, expect } = require("@playwright/test");

function collectRuntimeErrors(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  return errors;
}

async function startGame(page, playerName = "בודק") {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#start-screen")).toBeVisible();
  if (playerName) {
    await setNickname(page, playerName);
  }
  await page.locator("#start-button").click();
  await expect(page.locator("#start-screen")).toBeHidden();
  await expect(page.locator("#end-screen")).toBeHidden();
  await expect(page.locator("#pause-button")).toHaveAttribute("data-icon", "pause");
}

async function setNickname(page, playerName) {
  await page.locator("#menu-settings-button").click();
  await expect(page.locator("#settings-panel")).toBeVisible();
  await page.locator("#player-name-input").fill(playerName);
  await page.locator("#settings-save-button").click();
  await expect(page.locator("#settings-panel")).toBeHidden();
}

test("empty player name in settings stays on the start screen", async ({ page }) => {
  const errors = collectRuntimeErrors(page);
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#start-screen")).toBeVisible();
  await page.locator("#menu-settings-button").click();
  await expect(page.locator("#settings-panel")).toBeVisible();
  await page.locator("#player-name-input").fill("   ");
  await page.locator("#settings-save-button").click();
  await expect(page.locator("#start-screen")).toBeVisible();
  await expect(page.locator("#settings-panel")).toBeVisible();
  await expect(page.locator("#name-error")).toContainText("כינוי קצר");
  expect(errors).toEqual([]);
});

test("start button enters a running game and visible blur does not pause it", async ({ page }) => {
  const errors = collectRuntimeErrors(page);
  await startGame(page);

  const firstFrame = await page.locator("#game-canvas").evaluate((canvas) => canvas.toDataURL());
  await page.waitForTimeout(450);
  const secondFrame = await page.locator("#game-canvas").evaluate((canvas) => canvas.toDataURL());
  expect(secondFrame).not.toBe(firstFrame);

  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await page.waitForTimeout(150);
  await expect(page.locator("#pause-button")).toHaveAttribute("data-icon", "pause");

  const runtime = await page.evaluate(() => window.__mathMazeRuntime);
  expect(runtime.startTransitions).toBeGreaterThan(0);
  expect(runtime.errors).toEqual([]);
  expect(errors).toEqual([]);
});

test("mobile uses one native numeric input and starts without a stale overlay", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("mobile"), "Mobile-only assertion");
  const errors = collectRuntimeErrors(page);
  await startGame(page, "נייד");

  await expect(page.locator(".mobile-number-pad")).toHaveCount(0);
  await expect(page.locator("#answer-input")).not.toHaveAttribute("readonly", "");
  await expect(page.locator("#start-screen")).toBeHidden();

  const hiddenStyle = await page.locator("#start-screen").evaluate((element) => ({
    display: getComputedStyle(element).display,
    visibility: getComputedStyle(element).visibility,
    pointerEvents: getComputedStyle(element).pointerEvents
  }));
  expect(hiddenStyle).toEqual({ display: "none", visibility: "hidden", pointerEvents: "none" });

  await page.waitForTimeout(500);
  await expect(page.locator("#pause-button")).toHaveAttribute("data-icon", "pause");
  expect(await page.evaluate(() => window.__mathMazeRuntime.errors)).toEqual([]);
  expect(errors).toEqual([]);
});

test("the game does not replace native Map methods", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const source = await page.evaluate(() => Function.prototype.toString.call(Map.prototype.set));
  expect(source).toContain("[native code]");
});

test("phase 2 home summary and bottom navigation stay interactive", async ({ page }) => {
  const errors = collectRuntimeErrors(page);
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#start-screen")).toBeVisible();

  await page.locator("#character-control-button").click();
  await expect(page.locator("#hero-gallery")).toBeVisible();
  await page.locator("#hero-gallery-back").click();
  await expect(page.locator("#hero-gallery")).toBeHidden();

  await page.locator("#mode-control-button").click();
  await expect(page.locator("#mode-panel")).toBeVisible();
  await page.locator("#mode-panel [data-close-panel]").click();
  await expect(page.locator("#mode-panel")).toBeHidden();

  await page.locator("#difficulty-control-button").click();
  await expect(page.locator("#difficulty-panel")).toBeVisible();
  await page.locator("#difficulty-panel [data-close-panel]").click();
  await expect(page.locator("#difficulty-panel")).toBeHidden();

  await page.locator("#home-nav-progress").click();
  expect(await page.evaluate(() => document.activeElement?.classList.contains("home-progress-card"))).toBe(true);

  await page.locator("#home-nav-game").click();
  expect(await page.evaluate(() => document.activeElement?.id)).toBe("start-button");

  await page.locator("#home-nav-champions").click();
  await expect(page.locator("#leaderboard-dialog")).toBeVisible();
  await page.locator("#leaderboard-close").click();
  await expect(page.locator("#leaderboard-dialog")).toBeHidden();

  expect(errors).toEqual([]);
});

test("phase 3 hero gallery selects characters and returns to the home hub", async ({ page }) => {
  const errors = collectRuntimeErrors(page);
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#start-screen")).toBeVisible();

  await page.locator("#home-nav-characters").click();
  await expect(page.locator("#hero-gallery")).toBeVisible();
  await expect(page.locator("#hero-gallery-name")).toContainText("ביפלי");

  await page.locator("#hero-gallery-next").click();
  await expect(page.locator("#hero-gallery-name")).toContainText("נבטיק");
  await page.locator("#hero-gallery-select").click();
  await expect(page.locator("input[name='character'][value='nabatick']")).toBeChecked();
  await expect(page.locator("#selected-character-label")).toContainText("נבטיק");

  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#hero-gallery-name")).toContainText("ביפלי");
  await page.keyboard.press("Enter");
  await expect(page.locator("input[name='character'][value='bifly']")).toBeChecked();

  await page.locator("#hero-gallery-home").click();
  await expect(page.locator("#hero-gallery")).toBeHidden();
  await expect(page.locator("#start-button")).toBeVisible();

  await page.locator("#home-nav-characters").click();
  await page.locator("#hero-gallery-next").click();
  await page.locator("#hero-gallery-select").click();
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("input[name='character'][value='nabatick']")).toBeChecked();
  await expect(page.locator("#selected-character-label")).toContainText("נבטיק");

  expect(errors).toEqual([]);
});

test("menu selections, nickname and sound state persist across reloads", async ({ page }) => {
  const errors = collectRuntimeErrors(page);
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#start-screen")).toBeVisible();

  await page.locator(".menu-character-nabatick").click();
  await expect(page.locator("input[name='character'][value='nabatick']")).toBeChecked();

  await page.locator("#mode-control-button").click();
  await expect(page.locator("#mode-panel")).toBeVisible();
  await page.locator("#mode-panel label", { hasText: "הרפתקה" }).click();
  await expect(page.locator("input[name='game-mode'][value='adventure']")).toBeChecked();

  await page.locator("#difficulty-control-button").click();
  await expect(page.locator("#difficulty-panel")).toBeVisible();
  await page.locator("#difficulty-panel label", { hasText: "מתקדם" }).click();
  await expect(page.locator("input[name='difficulty'][value='advanced']")).toBeChecked();

  await page.locator("#menu-settings-button").click();
  await expect(page.locator("#settings-panel")).toBeVisible();
  await page.locator("#player-name-input").fill("שומר");
  await page.locator("#settings-save-button").click();
  await expect(page.locator("#settings-panel")).toBeHidden();

  await page.locator("#menu-sound-button").click();
  await expect(page.locator("#menu-sound-button")).toHaveAttribute("data-icon", "sound-off");

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("input[name='character'][value='nabatick']")).toBeChecked();
  await expect(page.locator("input[name='game-mode'][value='adventure']")).toBeChecked();
  await expect(page.locator("input[name='difficulty'][value='advanced']")).toBeChecked();
  await expect(page.locator("#player-name-input")).toHaveValue("שומר");
  await expect(page.locator("#menu-sound-button")).toHaveAttribute("data-icon", "sound-off");
  expect(errors).toEqual([]);
});
