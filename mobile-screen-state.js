(() => {
  "use strict";

  const startScreen = document.getElementById("start-screen");
  const coarseQuery = window.matchMedia("(hover: none), (pointer: coarse)");

  function syncSupplementaryMobileState() {
    if (!startScreen || startScreen.hidden || !coarseQuery.matches) {
      return;
    }

    startScreen.scrollTop = 0;
    const panel = startScreen.querySelector(".screen-panel");
    if (panel) {
      panel.scrollTop = 0;
    }
  }

  if (startScreen) {
    new MutationObserver(syncSupplementaryMobileState).observe(startScreen, {
      attributes: true,
      attributeFilter: ["hidden"]
    });
  }

  coarseQuery.addEventListener?.("change", syncSupplementaryMobileState);
  window.addEventListener("pageshow", syncSupplementaryMobileState);
  window.addEventListener(
    "orientationchange",
    () => window.setTimeout(syncSupplementaryMobileState, 120),
    { passive: true }
  );

  syncSupplementaryMobileState();
})();
