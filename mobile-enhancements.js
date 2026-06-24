(() => {
  "use strict";

  const root = document.documentElement;
  const stage = document.querySelector(".stage");
  const joystick = document.getElementById("movement-joystick");
  const joystickContainer = document.querySelector(".mobile-joystick");
  const pauseButton = document.getElementById("pause-button");
  const soundButton = document.getElementById("sound-button");
  const hudActions = document.querySelector(".hud-actions");
  const playerForm = document.getElementById("player-form");
  const coarseQuery = window.matchMedia("(hover: none), (pointer: coarse)");
  const CONTROL_KEY = "mathMazeMobileControl";
  let lastJoystickDirection = "none";

  function storageGet(key, fallback) {
    try {
      return localStorage.getItem(key) ?? fallback;
    } catch {
      return fallback;
    }
  }

  function storageSet(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Storage may be unavailable in private browsing.
    }
  }

  let controlMode = storageGet(CONTROL_KEY, "joystick") === "swipe" ? "swipe" : "joystick";

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
    root.classList.toggle("control-swipe", touch && controlMode === "swipe");
    root.classList.toggle("control-joystick", touch && controlMode === "joystick");
    syncViewportHeight();
  }

  function syncControlButtons() {
    document.querySelectorAll("[data-control-mode]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.controlMode === controlMode));
    });
  }

  function setControlMode(mode) {
    controlMode = mode === "swipe" ? "swipe" : "joystick";
    storageSet(CONTROL_KEY, controlMode);
    syncDeviceClasses();
    syncControlButtons();
  }

  function injectControlSelector() {
    if (!playerForm || playerForm.querySelector(".control-field")) {
      return;
    }

    const field = document.createElement("fieldset");
    field.className = "control-field";
    field.innerHTML = `
      <legend>שליטה במשחק</legend>
      <div class="control-options">
        <button type="button" data-control-mode="joystick">ג׳ויסטיק</button>
        <button type="button" data-control-mode="swipe">החלקה</button>
      </div>
    `;

    const timeSetting = playerForm.querySelector(".time-limit-setting");
    playerForm.insertBefore(field, timeSetting || playerForm.lastElementChild);
    field.querySelectorAll("[data-control-mode]").forEach((button) => {
      button.addEventListener("click", () => setControlMode(button.dataset.controlMode));
    });
    syncControlButtons();
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

  function directionFromPointer(event) {
    if (!joystick) {
      return "none";
    }
    const rect = joystick.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    if (Math.hypot(dx, dy) < rect.width * 0.14) {
      return "none";
    }
    return Math.abs(dx) > Math.abs(dy)
      ? (dx > 0 ? "right" : "left")
      : (dy > 0 ? "down" : "up");
  }

  function setupJoystickHaptics() {
    if (!joystick) {
      return;
    }

    joystick.addEventListener("pointerdown", (event) => {
      lastJoystickDirection = directionFromPointer(event);
      navigator.vibrate?.(8);
    });
    joystick.addEventListener("pointermove", (event) => {
      if (event.buttons === 0 && event.pointerType === "mouse") {
        return;
      }
      const nextDirection = directionFromPointer(event);
      if (nextDirection !== "none" && nextDirection !== lastJoystickDirection) {
        lastJoystickDirection = nextDirection;
        navigator.vibrate?.(6);
      }
    });
    const reset = () => {
      lastJoystickDirection = "none";
    };
    joystick.addEventListener("pointerup", reset);
    joystick.addEventListener("pointercancel", reset);
  }

  function blockSwipeWhenJoystickSelected(event) {
    if (!isTouchLayout() || controlMode !== "joystick") {
      return;
    }
    const target = event.target;
    if (target instanceof Element && target.closest("button, input, label, form, .dialog")) {
      return;
    }
    event.stopImmediatePropagation();
  }

  if (stage) {
    stage.addEventListener("pointerdown", blockSwipeWhenJoystickSelected, true);
    stage.addEventListener("pointermove", blockSwipeWhenJoystickSelected, true);
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

  coarseQuery.addEventListener?.("change", syncDeviceClasses);
  window.addEventListener("resize", syncDeviceClasses, { passive: true });
  window.addEventListener("orientationchange", () => window.setTimeout(syncDeviceClasses, 120), { passive: true });
  window.visualViewport?.addEventListener("resize", syncViewportHeight, { passive: true });
  document.addEventListener("fullscreenchange", syncDeviceClasses);

  // Native numeric input is the only answer mechanism. Remove leftovers from
  // earlier versions that injected a second keypad and fought over focus state.
  document.querySelectorAll(".mobile-number-pad").forEach((pad) => pad.remove());

  injectControlSelector();
  injectFullscreenButton();
  setupJoystickHaptics();
  syncActionButtonStates();
  syncDeviceClasses();

  if (joystickContainer) {
    joystickContainer.setAttribute("aria-live", "off");
  }
})();
