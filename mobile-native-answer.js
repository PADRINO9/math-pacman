(() => {
  "use strict";

  const dialog = document.getElementById("question-dialog");
  const answerInput = document.getElementById("answer-input");
  const coarseQuery = window.matchMedia("(hover: none), (pointer: coarse)");

  function removeCustomKeypad() {
    document.querySelectorAll(".mobile-number-pad").forEach((pad) => pad.remove());
  }

  function enableNativeNumericInput({ blur = false } = {}) {
    if (!answerInput || !coarseQuery.matches) {
      return;
    }

    removeCustomKeypad();
    answerInput.readOnly = false;
    answerInput.inputMode = "numeric";
    answerInput.setAttribute("inputmode", "numeric");
    answerInput.setAttribute("pattern", "[0-9]*");
    answerInput.setAttribute("enterkeyhint", "done");
    answerInput.removeAttribute("aria-describedby");

    if (blur) {
      answerInput.blur();
    }
  }

  function syncDialog() {
    const isOpen = Boolean(dialog && !dialog.hidden);
    if (!isOpen) {
      return;
    }

    // The older mobile helper configures a readonly field and injects a keypad.
    // Run after it and restore a normal numeric input. Keep it unfocused so the
    // keyboard opens only after the player taps the answer field.
    window.setTimeout(() => enableNativeNumericInput({ blur: true }), 0);
    window.setTimeout(() => enableNativeNumericInput({ blur: true }), 80);
  }

  if (dialog) {
    new MutationObserver(syncDialog).observe(dialog, {
      attributes: true,
      attributeFilter: ["hidden"]
    });
  }

  new MutationObserver(removeCustomKeypad).observe(document.body, {
    childList: true,
    subtree: true
  });

  answerInput?.addEventListener("pointerdown", () => {
    enableNativeNumericInput();
  }, { passive: true });

  answerInput?.addEventListener("focus", () => {
    enableNativeNumericInput();
  });

  coarseQuery.addEventListener?.("change", () => enableNativeNumericInput({ blur: true }));
  window.addEventListener("pageshow", () => enableNativeNumericInput({ blur: true }));

  enableNativeNumericInput({ blur: true });
  removeCustomKeypad();
})();
