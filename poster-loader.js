(() => {
  "use strict";

  const root = document.documentElement;
  const startScreen = document.getElementById("start-screen");
  const playerForm = document.getElementById("player-form");
  const pauseButton = document.getElementById("pause-button");
  const poster = document.getElementById("start-poster-image");
  let startupGuardUntil = 0;

  // start-screen-poster-fit.css intentionally uses display:grid!important.
  // This more-specific rule restores the native hidden state when gameplay starts.
  const stateStyle = document.createElement("style");
  stateStyle.id = "game-screen-state-fix";
  stateStyle.textContent = `
    html #start-screen[hidden],
    html #end-screen[hidden],
    html #question-dialog[hidden],
    html #leaderboard-dialog[hidden],
    html #publish-score-panel[hidden],
    html #winner-trophy[hidden] {
      display: none !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }
  `;
  document.head.appendChild(stateStyle);

  const syncStartScreenState = () => {
    if (!startScreen) {
      return;
    }

    const isOpen = !startScreen.hidden;
    root.classList.toggle("start-screen-open", isOpen && window.matchMedia("(hover: none), (pointer: coarse)").matches);
    startScreen.setAttribute("aria-hidden", String(!isOpen));

    if (isOpen) {
      startScreen.style.removeProperty("display");
      startScreen.style.removeProperty("visibility");
      startScreen.style.removeProperty("pointer-events");
    } else {
      startScreen.classList.remove("screen-visible");
      startScreen.style.setProperty("display", "none", "important");
      startScreen.style.setProperty("visibility", "hidden", "important");
      startScreen.style.setProperty("pointer-events", "none", "important");
    }
  };

  if (startScreen) {
    new MutationObserver(syncStartScreenState).observe(startScreen, {
      attributes: true,
      attributeFilter: ["hidden", "class"]
    });
    window.addEventListener("pageshow", syncStartScreenState);
    window.addEventListener("orientationchange", () => window.setTimeout(syncStartScreenState, 120), { passive: true });
    syncStartScreenState();
  }

  // game.js pauses on every window blur. Closing the mobile keyboard or moving
  // focus from the name field to the game can emit a transient blur while the
  // page is still visible, causing the first frame to open already paused.
  // Intercept only that short startup blur; real backgrounding is still handled
  // by game.js through the visibilitychange event.
  window.addEventListener("blur", (event) => {
    if (performance.now() < startupGuardUntil && document.visibilityState === "visible") {
      event.stopImmediatePropagation();
    }
  }, true);

  if (playerForm && pauseButton && startScreen) {
    playerForm.addEventListener("submit", () => {
      startupGuardUntil = performance.now() + 1800;

      // A second safeguard repairs browsers that delivered blur before the
      // capture listener could suppress it. It runs only during initial launch.
      [60, 180, 420].forEach((delay) => {
        window.setTimeout(() => {
          const gameHasStarted = startScreen.hidden;
          const pausedImmediately = pauseButton.textContent.trim() === "▶";
          if (gameHasStarted && pausedImmediately && document.visibilityState === "visible") {
            pauseButton.click();
          }
        }, delay);
      });
    }, true);
  }

  if (!poster) {
    return;
  }

  // Block and invalidate the obsolete poster loader that used to be bundled
  // into nabatick-directional.js and could restore the old poster from storage.
  window.__keflulPosterLoaderInstalled = true;
  try {
    sessionStorage.removeItem("keflul-start-poster-webp-v3");
  } catch {
    // Session storage may be unavailable in private browsing.
  }

  const sourceParts = Array.from(
    { length: 8 },
    (_, index) => `assets/poster-source/keflul-mobile-${String(index).padStart(2, "0")}.txt`
  );

  const showReadyPoster = (source) => {
    const verificationImage = new Image();
    verificationImage.decoding = "async";
    verificationImage.onload = () => {
      poster.src = source;
      poster.classList.remove("poster-loading", "poster-fallback", "poster-error");
      poster.classList.add("poster-ready");
    };
    verificationImage.onerror = () => {
      poster.classList.remove("poster-loading", "poster-ready", "poster-fallback");
      poster.classList.add("poster-error");
      poster.removeAttribute("src");
    };
    verificationImage.src = source;
  };

  Promise.all(
    sourceParts.map(async (path) => {
      const response = await fetch(`${path}?v=20260623-3`, { cache: "reload" });
      if (!response.ok) {
        throw new Error(`Poster source failed: ${response.status}`);
      }
      return response.text();
    })
  )
    .then((parts) => {
      const base64 = parts.join("").replace(/\s+/g, "");
      if (base64.length !== 80144 || !base64.startsWith("UklGR")) {
        throw new Error("Poster source is incomplete");
      }

      const binary = atob(base64);
      if (binary.length !== 60108 || binary.slice(0, 4) !== "RIFF" || binary.slice(8, 12) !== "WEBP") {
        throw new Error("Poster binary failed validation");
      }

      showReadyPoster(`data:image/webp;base64,${base64}`);
    })
    .catch((error) => {
      console.error("The current Keflul poster could not be loaded.", error);
      poster.classList.remove("poster-loading", "poster-ready", "poster-fallback");
      poster.classList.add("poster-error");
      poster.removeAttribute("src");
    });
})();
