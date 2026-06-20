(() => {
  "use strict";

  const root = document.documentElement;
  const stage = document.querySelector(".stage");
  const joystick = document.getElementById("movement-joystick");
  const joystickContainer = document.querySelector(".mobile-joystick");
  const questionDialog = document.getElementById("question-dialog");
  const answerInput = document.getElementById("answer-input");
  const answerForm = document.getElementById("answer-form");
  const pauseButton = document.getElementById("pause-button");
  const soundButton = document.getElementById("sound-button");
  const hudActions = document.querySelector(".hud-actions");
  const playerForm = document.getElementById("player-form");

  const coarseQuery = window.matchMedia("(hover: none), (pointer: coarse)");
  const CONTROL_KEY = "mathMazeMobileControl";
  let controlMode = localStorage.getItem(CONTROL_KEY) === "swipe" ? "swipe" : "joystick";
  let lastJoystickDirection = "none";

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

  function setControlMode(mode) {
    controlMode = mode === "swipe" ? "swipe" : "joystick";
    localStorage.setItem(CONTROL_KEY, controlMode);
    syncDeviceClasses();
    document.querySelectorAll("[data-control-mode]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.controlMode === controlMode));
    });
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
        <button type="button" data-control-mode="joystick" aria-pressed="false">ג׳ויסטיק</button>
        <button type="button" data-control-mode="swipe" aria-pressed="false">החלקה</button>
      </div>
    `;

    const timeSetting = playerForm.querySelector(".time-limit-setting");
    playerForm.insertBefore(field, timeSetting || playerForm.lastElementChild);

    field.querySelectorAll("[data-control-mode]").forEach((button) => {
      button.addEventListener("click", () => setControlMode(button.dataset.controlMode));
    });

    setControlMode(controlMode);
  }

  function insertDigit(value) {
    if (!answerInput || !answerForm || answerInput.disabled) {
      return;
    }

    const current = answerInput.value.replace(/\D/g, "");
    answerInput.value = `${current}${value}`.slice(0, 4);
    answerInput.dispatchEvent(new Event("input", { bubbles: true }));
    navigator.vibrate?.(7);
  }

  function deleteDigit() {
    if (!answerInput || answerInput.disabled) {
      return;
    }

    answerInput.value = answerInput.value.slice(0, -1);
    answerInput.dispatchEvent(new Event("input", { bubbles: true }));
    navigator.vibrate?.(7);
  }

  function submitAnswer() {
    if (!answerForm || !answerInput || answerInput.disabled || answerInput.value.trim() === "") {
      return;
    }

    navigator.vibrate?.(10);
    answerForm.requestSubmit();
  }

  function injectNumberPad() {
    if (!answerForm || !answerInput || document.querySelector(".mobile-number-pad")) {
      return;
    }

    const pad = document.createElement("div");
    pad.className = "mobile-number-pad";
    pad.setAttribute("aria-label", "לוח מספרים");

    const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
    keys.forEach((digit) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = digit;
      button.addEventListener("click", () => insertDigit(digit));
      pad.appendChild(button);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "key-delete";
    deleteButton.setAttribute("aria-label", "מחיקת ספרה");
    deleteButton.textContent = "⌫";
    deleteButton.addEventListener("click", deleteDigit);
    pad.appendChild(deleteButton);

    const zeroButton = document.createElement("button");
    zeroButton.type = "button";
    zeroButton.textContent = "0";
    zeroButton.addEventListener("click", () => insertDigit("0"));
    pad.appendChild(zeroButton);

    const submitButton = document.createElement("button");
    submitButton.type = "button";
    submitButton.className = "key-submit";
    submitButton.textContent = "שלח";
    submitButton.addEventListener("click", submitAnswer);
    pad.appendChild(submitButton);

    answerForm.closest(".dialog-inner")?.appendChild(pad);
  }

  function configureAnswerInput() {
    if (!answerInput) {
      return;
    }

    if (isTouchLayout()) {
      answerInput.readOnly = true;
      answerInput.inputMode = "none";
      answerInput.setAttribute("aria-describedby", "mobile-keypad-hint");
      window.setTimeout(() => answerInput.blur(), 70);
    } else {
      answerInput.readOnly = false;
      answerInput.inputMode = "numeric";
      answerInput.removeAttribute("aria-describedby");
    }
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
        // Some mobile browsers expose the API but reject programmatic fullscreen.
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
    if (event.target.closest("button, input, label")) {
      return;
    }
    event.stopImmediatePropagation();
  }

  if (stage) {
    stage.addEventListener("pointerdown", blockSwipeWhenJoystickSelected, true);
    stage.addEventListener("pointermove", blockSwipeWhenJoystickSelected, true);
  }

  if (questionDialog) {
    const observer = new MutationObserver(() => {
      configureAnswerInput();
      if (!questionDialog.hidden && isTouchLayout()) {
        window.setTimeout(() => answerInput?.blur(), 70);
      }
    });
    observer.observe(questionDialog, { attributes: true, attributeFilter: ["hidden"] });
  }

  [pauseButton, soundButton].forEach((button) => {
    if (!button) {
      return;
    }
    new MutationObserver(syncActionButtonStates).observe(button, { childList: true, characterData: true, subtree: true });
  });

  coarseQuery.addEventListener?.("change", () => {
    syncDeviceClasses();
    configureAnswerInput();
  });

  window.addEventListener("resize", syncDeviceClasses, { passive: true });
  window.addEventListener("orientationchange", () => window.setTimeout(syncDeviceClasses, 120), { passive: true });
  window.visualViewport?.addEventListener("resize", syncViewportHeight, { passive: true });
  document.addEventListener("fullscreenchange", syncDeviceClasses);

  injectControlSelector();
  injectNumberPad();
  injectFullscreenButton();
  setupJoystickHaptics();
  syncActionButtonStates();
  syncDeviceClasses();
  configureAnswerInput();

  if (joystickContainer) {
    joystickContainer.setAttribute("aria-live", "off");
  }
})();
