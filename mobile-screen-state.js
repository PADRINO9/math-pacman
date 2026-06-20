(() => {
  "use strict";

  const root = document.documentElement;
  const startScreen = document.getElementById("start-screen");
  const coarseQuery = window.matchMedia("(hover: none), (pointer: coarse)");

  function syncStartScreenState() {
    const isOpen = Boolean(startScreen && !startScreen.hidden);
    const isTouch = coarseQuery.matches;
    root.classList.toggle("start-screen-open", isOpen && isTouch);

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

  syncStartScreenState();
})();
