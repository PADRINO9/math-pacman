(() => {
  "use strict";

  const root = document.documentElement;
  const stage = document.querySelector(".stage");
  const pauseButton = document.getElementById("pause-button");
  const soundButton = document.getElementById("sound-button");
  const hudActions = document.querySelector(".hud-actions");
  const answerInput = document.getElementById("answer-input");
  const coarseQuery = window.matchMedia("(hover: none), (pointer: coarse)");

  function isTouchLayout() {
    return coarseQuery.matches;
  }

  function syncViewportHeight() {
    const height = window.visualViewport?.height || window.innerHeight;
    root.style.setProperty("--visual-viewport-height", `${Math.round(height)}px`);
  }

  function syncDeviceClasses() {
    const touch = isTouchLayout();
    root.classList.toggle("touch-layout", touch);
    root.classList.toggle("mobile-low-effects", touch && (window.innerWidth < 900 || window.devicePixelRatio > 2));
    root.classList.toggle("control-swipe", touch);
    root.classList.remove("control-joystick");
    syncViewportHeight();
  }

  function removeLegacyTouchControls() {
    document.querySelectorAll(".control-field, [data-control-mode], .mobile-joystick").forEach((element) => element.remove());
    document.querySelectorAll(".mobile-number-pad").forEach((pad) => pad.remove());
  }

  function configureNativeAnswerInput() {
    if (!answerInput) {
      return;
    }

    answerInput.readOnly = false;
    answerInput.inputMode = "numeric";
    answerInput.setAttribute("inputmode", "numeric");
    answerInput.setAttribute("pattern", "[0-9]*");
    answerInput.setAttribute("enterkeyhint", "done");
    answerInput.removeAttribute("aria-describedby");
  }

  function syncActionButtonStates() {
    if (pauseButton) {
      pauseButton.classList.add("mobile-icon-button");
      pauseButton.dataset.mobileState = pauseButton.textContent.includes("▶") ? "play" : "pause";
    }
    if (soundButton) {
      soundButton.classList.add("mobile-icon-button");
      soundButton.dataset.mobileState = soundButton.textContent.includes("×") ? "off" : "on";
    }
  }

  function injectFullscreenButton() {
    if (!hudActions || !document.documentElement.requestFullscreen || hudActions.querySelector(".fullscreen-button")) {
      return;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "icon-button fullscreen-button mobile-icon-button";
    button.setAttribute("aria-label", "מסך מלא");
    button.addEventListener("click", async () => {
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        } else {
          await document.documentElement.requestFullscreen({ navigationUI: "hide" });
        }
      } catch {
        // Fullscreen is optional and may be rejected by the browser.
      }
    });
    hudActions.appendChild(button);
  }

  function keepSwipeAvailable(event) {
    return event;
  }

  if (stage) {
    stage.addEventListener("pointerdown", keepSwipeAvailable, true);
    stage.addEventListener("pointermove", keepSwipeAvailable, true);
  }

  [pauseButton, soundButton].forEach((button) => {
    if (button) {
      new MutationObserver(syncActionButtonStates).observe(button, {
        childList: true,
        characterData: true,
        subtree: true
      });
    }
  });

  new MutationObserver(() => {
    removeLegacyTouchControls();
    configureNativeAnswerInput();
  }).observe(document.body, {
    childList: true,
    subtree: true
  });

  coarseQuery.addEventListener?.("change", () => {
    syncDeviceClasses();
    configureNativeAnswerInput();
  });
  window.addEventListener("resize", syncDeviceClasses, { passive: true });
  window.addEventListener("orientationchange", () => window.setTimeout(syncDeviceClasses, 120), { passive: true });
  window.visualViewport?.addEventListener("resize", syncViewportHeight, { passive: true });
  document.addEventListener("fullscreenchange", syncDeviceClasses);

  removeLegacyTouchControls();
  configureNativeAnswerInput();
  injectFullscreenButton();
  syncActionButtonStates();
  syncDeviceClasses();
})();
