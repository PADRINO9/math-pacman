import { chromium } from "playwright";

const baseURL = process.env.TEST_BASE_URL || "http://127.0.0.1:4173";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  hasTouch: true,
  isMobile: true
});
const page = await context.newPage();
const pageErrors = [];
page.on("pageerror", (error) => pageErrors.push(error.message));

async function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

try {
  const response = await page.goto(baseURL, { waitUntil: "networkidle" });
  await assert(response?.ok(), `Start page failed with ${response?.status()}`);

  const characterInputs = page.locator("input[name='character']");
  await assert(await characterInputs.count() === 2, "Expected exactly two character choices");

  for (const asset of [
    "assets/bifly-player.png",
    "assets/nabatick-idle.png",
    "assets/nabatick-eat-prepare.png",
    "assets/nabatick-eat.png"
  ]) {
    const assetResponse = await page.request.get(`${baseURL}/${asset}`);
    await assert(assetResponse.ok(), `Character asset failed to load: ${asset}`);
  }

  const previewsReady = await page.locator(".character-card img").evaluateAll((images) => {
    return images.every((image) => image.complete && image.naturalWidth > 0 && image.naturalHeight > 0);
  });
  await assert(previewsReady, "Character preview images were not ready");

  await page.locator("input[name='character'][value='nabatick']").check();
  await page.locator("#player-name-input").fill("בודק");
  await page.locator("#start-button").click();
  await page.waitForFunction(() => document.getElementById("start-screen")?.hidden === true);

  const selectedCharacter = await page.evaluate(() => ({
    dataset: document.documentElement.dataset.character,
    stored: localStorage.getItem("mathMazeCharacter")
  }));
  await assert(selectedCharacter.dataset === "nabatick", "Nabatick was not activated in the game");
  await assert(selectedCharacter.stored === "nabatick", "Nabatick selection was not persisted");

  const canvasState = await page.locator("#game-canvas").evaluate((canvas) => ({
    width: canvas.width,
    height: canvas.height,
    cssWidth: canvas.getBoundingClientRect().width,
    cssHeight: canvas.getBoundingClientRect().height
  }));
  await assert(canvasState.width > 0 && canvasState.height > 0, "Game canvas has no backing resolution");
  await assert(canvasState.cssWidth > 0 && canvasState.cssHeight > 0, "Game canvas is not visible");

  await page.waitForTimeout(1200);
  await page.reload({ waitUntil: "networkidle" });
  await assert(
    await page.locator("input[name='character'][value='nabatick']").isChecked(),
    "Persisted Nabatick selection was not restored"
  );

  await page.locator("input[name='character'][value='bifly']").check();
  await page.locator("#player-name-input").fill("בודק");
  await page.locator("#start-button").click();
  await page.waitForFunction(() => document.documentElement.dataset.character === "bifly");
  await assert(
    await page.evaluate(() => localStorage.getItem("mathMazeCharacter")) === "bifly",
    "Bifly selection was not persisted"
  );

  await assert(pageErrors.length === 0, `Page errors: ${pageErrors.join(" | ")}`);
  console.log("Character selection mobile E2E passed.");
} finally {
  await browser.close();
}
