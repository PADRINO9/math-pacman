(() => {
  "use strict";

  // The core engine already renders the complete maze and collectibles.
  // The previous enhancement layer patched Map.prototype globally and ran a
  // second permanent animation loop above the game canvas. That made unrelated
  // state observable by the overlay, increased mobile load and could leave the
  // visible overlay out of sync with the real game. Keep the integration marker
  // for backwards compatibility, but let game.js remain the sole renderer.
  window.__mazeEnhancementsInstalled = true;
})();
