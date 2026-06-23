(() => {
  "use strict";

  const root = document.documentElement;
  const startScreen = document.getElementById("start-screen");
  const endScreen = document.getElementById("end-screen");
  const playerForm = document.getElementById("player-form");
  const playerNameInput = document.getElementById("player-name-input");
  const pauseButton = document.getElementById("pause-button");
  const poster = document.getElementById("start-poster-image");
  let startupGuardUntil = 0;
  let startupRecoveryScheduled = false;

  // Some responsive start-screen rules intentionally use !important. Restore
  // the native hidden state explicitly so the poster cannot cover the game.
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

  const gameScreenIsOpen = () => Boolean(
    startScreen?.hidden
    && (!endScreen || endScreen.hidden)
  );

  const gameLooksPaused = () => pauseButton?.textContent.trim() === "▶";

  const resumeFalseStartupPause = () => {
    if (
      performance.now() >= startupGuardUntil
      || document.visibilityState !== "visible"
      || !gameScreenIsOpen()
      || !gameLooksPaused()
    ) {
      return;
    }

    pauseButton.click();
  };

  const scheduleStartupRecovery = () => {
    if (startupRecoveryScheduled) {
      return;
    }

    startupRecoveryScheduled = true;
    requestAnimationFrame(() => {
      startupRecoveryScheduled = false;
      resumeFalseStartupPause();
    });
  };

  const syncStartScreenState = () => {
    if (!startScreen) {
      return;
    }

    const isOpen = !startScreen.hidden;
    root.classList.toggle(
      "start-screen-open",
      isOpen && window.matchMedia("(hover: none), (pointer: coarse)").matches
    );
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
      scheduleStartupRecovery();
    }
  };

  if (startScreen) {
    new MutationObserver(syncStartScreenState).observe(startScreen, {
      attributes: true,
      attributeFilter: ["hidden", "class"]
    });
    window.addEventListener("pageshow", syncStartScreenState);
    window.addEventListener(
      "orientationchange",
      () => window.setTimeout(syncStartScreenState, 120),
      { passive: true }
    );
    syncStartScreenState();
  }

  // game.js historically paused on every window blur. Submitting the start form
  // can briefly blur the window while the name keyboard closes or focus moves to
  // the canvas, so the first playable frame was immediately changed to "paused".
  // This capture listener runs before game.js and blocks only visible-page blur
  // events during the launch transition. Real tab/app backgrounding is handled
  // below with the Page Visibility API.
  window.addEventListener("blur", (event) => {
    if (
      performance.now() < startupGuardUntil
      && document.visibilityState === "visible"
    ) {
      event.stopImmediatePropagation();
      scheduleStartupRecovery();
    }
  }, true);

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      scheduleStartupRecovery();
    }
  }, true);

  window.addEventListener("focus", scheduleStartupRecovery, true);

  if (playerForm) {
    playerForm.addEventListener("submit", () => {
      // Do not arm the recovery guard for an invalid empty-name submission.
      if (!playerNameInput?.value.trim()) {
        return;
      }

      startupGuardUntil = performance.now() + 2200;
      [0, 40, 120, 260, 520, 900, 1500, 2100].forEach((delay) => {
        window.setTimeout(resumeFalseStartupPause, delay);
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
      const response = await fetch(`${path}?v=20260623-5`, { cache: "reload" });
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
