const { chromium } = require("/Users/eliran/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

async function inspect(page, path) {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(String(error)));
  await page.goto("http://127.0.0.1:5178", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const metrics = await page.evaluate(() => {
    const layout = document.querySelector(".start-layout").getBoundingClientRect();
    const poster = document.querySelector(".start-poster-frame").getBoundingClientRect();
    const panel = document.querySelector(".start-layout .screen-panel").getBoundingClientRect();
    const button = document.querySelector("#start-button").getBoundingClientRect();
    return {
      viewport: { width: innerWidth, height: innerHeight },
      document: {
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight
      },
      layout: layout.toJSON(),
      poster: poster.toJSON(),
      panel: panel.toJSON(),
      startButtonVisible: button.top >= 0 && button.bottom <= innerHeight
    };
  });
  await page.screenshot({ path, fullPage: true });
  return { metrics, errors };
}

async function run() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  });

  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const desktop = await inspect(await desktopContext.newPage(), "/tmp/math-maze-elegant-desktop.png");
  await desktopContext.close();

  const laptopContext = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const laptop = await inspect(await laptopContext.newPage(), "/tmp/math-maze-elegant-laptop.png");
  await laptopContext.close();

  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    screen: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });
  const mobile = await inspect(await mobileContext.newPage(), "/tmp/math-maze-elegant-mobile.png");
  await mobileContext.close();

  await browser.close();
  process.stdout.write(JSON.stringify({ desktop, laptop, mobile }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
