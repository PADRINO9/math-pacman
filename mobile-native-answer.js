(() => {
  "use strict";

  const dialog = document.getElementById("question-dialog");
  const answerInput = document.getElementById("answer-input");

  function configure() {
    if (!answerInput) return;
    document.querySelectorAll(".mobile-number-pad").forEach((pad) => pad.remove());
    answerInput.readOnly = false;
    answerInput.inputMode = "numeric";
    answerInput.setAttribute("inputmode", "numeric");
    answerInput.setAttribute("pattern", "[0-9]*");
    answerInput.setAttribute("enterkeyhint", "done");
    answerInput.removeAttribute("aria-describedby");
  }

  if (dialog) {
    new MutationObserver(configure).observe(dialog, {
      attributes: true,
      attributeFilter: ["hidden"]
    });
  }

  window.addEventListener("pageshow", configure);
  configure();
})();
