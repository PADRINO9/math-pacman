(() => {
  "use strict";

  const Context2D = window.CanvasRenderingContext2D;
  if (!Context2D || Context2D.prototype.__nabatickDirectionalInstalled) {
    return;
  }

  const originalDrawImage = Context2D.prototype.drawImage;
  const spritePaths = {
    idleFront: "assets/nabatick-idle-front.webp",
    idleLeft: "assets/nabatick-idle-left.webp",
    idleRight: "assets/nabatick-idle-right.webp",
    eatPrepare: "assets/nabatick-eat-prepare.webp",
    eatOpen: "assets/nabatick-eat-open.webp"
  };
  const sprites = Object.fromEntries(
    Object.entries(spritePaths).map(([name, src]) => {
      const image = new Image();
      image.decoding = "async";
      image.src = src;
      return [name, image];
    })
  );
  const canvasStates = new WeakMap();

  function getCanvasState(context) {
    let value = canvasStates.get(context.canvas);
    if (!value) {
      value = {
        direction: "right",
        lastWorldX: null,
        lastWorldY: null,
        waitingForNewestTrailPoint: true
      };
      canvasStates.set(context.canvas, value);
    }
    return value;
  }

  function sourcePath(image) {
    const source = String(image?.currentSrc || image?.src || "");
    return source.split("?")[0].toLowerCase();
  }

  function sourceKind(image) {
    const source = sourcePath(image);
    if (source.endsWith("/nabatick-idle-v2.svg")) {
      return "idle";
    }
    if (source.endsWith("/nabatick-eat-prepare-v2.svg")) {
      return "eatPrepare";
    }
    if (source.endsWith("/nabatick-eat-v2.svg")) {
      return "eatOpen";
    }
    return null;
  }

  function isReady(image) {
    return Boolean(image && image.complete && image.naturalWidth > 0 && image.naturalHeight > 0);
  }

  function isCenteredPlayerDraw(args) {
    if (args.length !== 4) {
      return false;
    }
    const [x, y, width, height] = args;
    return Number.isFinite(x)
      && Number.isFinite(y)
      && Number.isFinite(width)
      && Number.isFinite(height)
      && width > 0
      && height > 0
      && x < 0
      && y < 0
      && Math.abs(x + width / 2) < 1.5
      && Math.abs(y + height / 2) < 1.5;
  }

  function updateDirectionFromTrail(state, args) {
    if (!state.waitingForNewestTrailPoint || args.length !== 4) {
      return;
    }

    const [x, y, width, height] = args;
    if (![x, y, width, height].every(Number.isFinite) || width <= 0 || height <= 0 || x < 0 || y < 0) {
      return;
    }

    const worldX = x + width / 2;
    const worldY = y + height / 2;
    if (state.lastWorldX !== null && state.lastWorldY !== null) {
      const dx = worldX - state.lastWorldX;
      const dy = worldY - state.lastWorldY;
      if (Math.abs(dx) > 0.08 || Math.abs(dy) > 0.08) {
        if (Math.abs(dx) >= Math.abs(dy)) {
          state.direction = dx < 0 ? "left" : "right";
        } else {
          state.direction = dy < 0 ? "up" : "down";
        }
      }
    }

    state.lastWorldX = worldX;
    state.lastWorldY = worldY;
    state.waitingForNewestTrailPoint = false;
  }

  function idleSpriteForDirection(direction) {
    if (direction === "left") {
      return sprites.idleLeft;
    }
    if (direction === "right") {
      return sprites.idleRight;
    }
    // The supplied character sheet has no rear view. Up and down therefore use
    // the exact front pose rather than inventing a new design.
    return sprites.idleFront;
  }

  Context2D.prototype.drawImage = function patchedDrawImage(image, ...args) {
    const kind = sourceKind(image);
    if (!kind) {
      return originalDrawImage.call(this, image, ...args);
    }

    const state = getCanvasState(this);
    const isMainDraw = isCenteredPlayerDraw(args);

    if (kind === "idle" && !isMainDraw) {
      updateDirectionFromTrail(state, args);
    }

    let replacement;
    if (kind === "idle") {
      replacement = idleSpriteForDirection(state.direction);
    } else if (kind === "eatPrepare") {
      replacement = sprites.eatPrepare;
    } else {
      replacement = sprites.eatOpen;
    }

    if (isMainDraw) {
      state.waitingForNewestTrailPoint = true;
    }

    return originalDrawImage.call(this, isReady(replacement) ? replacement : image, ...args);
  };

  Object.defineProperty(Context2D.prototype, "__nabatickDirectionalInstalled", {
    value: true,
    configurable: false,
    enumerable: false,
    writable: false
  });
})();

(() => {
  "use strict";

  const poster = document.querySelector(".start-poster");
  const posterFrame = document.querySelector(".start-poster-frame");
  if (!poster || !posterFrame || window.__keflulPosterLoaderInstalled) {
    return;
  }
  window.__keflulPosterLoaderInstalled = true;

  const fallbackSource = poster.getAttribute("src") || "assets/math-maze-poster.png";
  const cacheKey = "keflul-start-poster-webp-v3";
  const partNames = Array.from(
    { length: 12 },
    (_, index) => `v3-${String(index).padStart(2, "0")}.txt`
  );

  const responsiveStyle = document.createElement("style");
  responsiveStyle.id = "keflul-poster-responsive-style";
  responsiveStyle.textContent = `
    #start-screen .start-poster-frame {
      width: 100%;
      min-height: 0;
      height: auto;
      max-height: none;
      aspect-ratio: 9 / 16;
      align-self: center;
      justify-self: center;
      background: #03051a;
    }

    #start-screen .start-poster {
      width: 100%;
      height: 100%;
      object-fit: contain;
      object-position: center;
      transition: opacity 160ms ease;
    }

    @media (hover: none) and (max-width: 600px) and (orientation: portrait),
           (pointer: coarse) and (max-width: 600px) and (orientation: portrait) {
      html.start-screen-open #start-screen .start-layout {
        overflow: visible;
      }

      html.start-screen-open #start-screen .start-poster-frame {
        width: 100%;
        height: auto;
        min-height: 0;
        max-height: none;
        aspect-ratio: 9 / 16;
        flex: 0 0 auto;
        border-radius: 17px 17px 0 0;
      }

      html.start-screen-open #start-screen .start-poster {
        object-fit: contain;
        object-position: center;
      }
    }

    @media (hover: none) and (orientation: landscape) and (max-height: 600px),
           (pointer: coarse) and (orientation: landscape) and (max-height: 600px) {
      html.start-screen-open #start-screen .start-poster-frame {
        width: auto;
        height: min(84dvh, 520px);
        min-height: 0;
        max-height: min(84dvh, 520px);
        aspect-ratio: 9 / 16;
      }

      html.start-screen-open #start-screen .start-poster {
        object-fit: contain;
        object-position: center;
      }
    }
  `;
  document.head.appendChild(responsiveStyle);

  function readCachedPoster() {
    try {
      return sessionStorage.getItem(cacheKey);
    } catch {
      return null;
    }
  }

  function cachePoster(dataUrl) {
    try {
      sessionStorage.setItem(cacheKey, dataUrl);
    } catch {
      // The poster remains usable when session storage is unavailable or full.
    }
  }

  function showPoster(source) {
    const verificationImage = new Image();
    verificationImage.decoding = "async";
    verificationImage.onload = () => {
      poster.width = 320;
      poster.height = 569;
      poster.src = source;
      poster.style.opacity = "1";
    };
    verificationImage.onerror = () => {
      poster.src = fallbackSource;
      poster.style.opacity = "1";
    };
    verificationImage.src = source;
  }

  async function assemblePoster() {
    poster.style.opacity = "0";

    const cachedPoster = readCachedPoster();
    if (cachedPoster?.startsWith("data:image/webp;base64,UklG")) {
      showPoster(cachedPoster);
      return;
    }

    try {
      const chunks = await Promise.all(partNames.map(async (partName) => {
        const response = await fetch(`assets/poster-parts/${partName}`, { cache: "force-cache" });
        if (!response.ok) {
          throw new Error(`Poster part failed: ${partName}`);
        }
        return (await response.text()).trim();
      }));
      const base64 = chunks.join("").replace(/\s+/g, "");
      const header = atob(base64.slice(0, 20));
      if (base64.length !== 51392 || !header.startsWith("RIFF") || header.slice(8, 12) !== "WEBP") {
        throw new Error("Poster data validation failed");
      }

      const dataUrl = `data:image/webp;base64,${base64}`;
      cachePoster(dataUrl);
      showPoster(dataUrl);
    } catch (error) {
      console.warn("The optimized poster could not be loaded; using the original poster.", error);
      poster.src = fallbackSource;
      poster.style.opacity = "1";
    }
  }

  assemblePoster();
})();
