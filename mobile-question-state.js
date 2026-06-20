(() => {
  "use strict";

  const root = document.documentElement;
  const dialog = document.getElementById("question-dialog");

  function syncQuestionState() {
    root.classList.toggle("question-open", Boolean(dialog && !dialog.hidden));
  }

  if (dialog) {
    new MutationObserver(syncQuestionState).observe(dialog, {
      attributes: true,
      attributeFilter: ["hidden"]
    });
  }

  window.addEventListener("pageshow", syncQuestionState);
  syncQuestionState();
})();
