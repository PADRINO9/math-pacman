(() => {
  "use strict";

  const root = document.documentElement;
  const startScreen = document.getElementById("start-screen");
  const coarseQuery = window.matchMedia("(hover: none), (pointer: coarse)");
  const nabatickSelectionPortrait = startScreen?.querySelector(
    'input[name="character"][value="nabatick"] + .character-card img'
  );

  function syncNabatickSelectionPortrait() {
    if (!nabatickSelectionPortrait) {
      return;
    }

    const exactPortraitSource = "assets/nabatick-selection-sheet.svg";
    if (!nabatickSelectionPortrait.getAttribute("src")?.endsWith(exactPortraitSource)) {
      nabatickSelectionPortrait.src = exactPortraitSource;
    }
  }

  function syncStartScreenState() {
    const isOpen = Boolean(startScreen && !startScreen.hidden);
    const isTouch = coarseQuery.matches;
    root.classList.toggle("start-screen-open", isOpen && isTouch);

    syncNabatickSelectionPortrait();

    if (isOpen && isTouch) {
      startScreen.scrollTop = 0;
      const panel = startScreen.querySelector(".screen-panel");
      if (panel) {
        panel.scrollTop = 0;
      }
    }
  }

  if (startScreen) {
    new MutationObserver(syncStartScreenState).observe(startScreen, {
      attributes: true,
      attributeFilter: ["hidden", "class"]
    });
  }

  coarseQuery.addEventListener?.("change", syncStartScreenState);
  window.addEventListener("pageshow", syncStartScreenState);
  window.addEventListener("orientationchange", () => window.setTimeout(syncStartScreenState, 120), { passive: true });

  syncNabatickSelectionPortrait();
  syncStartScreenState();
})();
