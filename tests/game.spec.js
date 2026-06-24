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
  await page.locator("#player-name-input").fill(playerName);
  await page.locator("#start-button").click();
  await expect(page.locator("#start-screen")).toBeHidden();
  await expect(page.locator("#end-screen")).toBeHidden();
  await expect(page.locator("#pause-button")).toHaveText("Ⅱ");
}

test("empty player name stays on the start screen", async ({ page }) => {
  const errors = collectRuntimeErrors(page);
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.locator("#start-button").click();
  await expect(page.locator("#start-screen")).toBeVisible();
  await expect(page.locator("#name-error")).toContainText("צריך שם");
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
  await expect(page.locator("#pause-button")).toHaveText("Ⅱ");

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
  await expect(page.locator("#pause-button")).toHaveText("Ⅱ");
  expect(await page.evaluate(() => window.__mathMazeRuntime.errors)).toEqual([]);
  expect(errors).toEqual([]);
});

test("the game does not replace native Map methods", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const source = await page.evaluate(() => Function.prototype.toString.call(Map.prototype.set));
  expect(source).toContain("[native code]");
});
