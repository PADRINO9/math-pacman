(() => {
  "use strict";

  const poster = document.getElementById("start-poster-image");
  if (!poster) {
    return;
  }

  // Block the obsolete loader that used to live in nabatick-directional.js.
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
      const response = await fetch(`${path}?v=20260623-2`, { cache: "reload" });
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
