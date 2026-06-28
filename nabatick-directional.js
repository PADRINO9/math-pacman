(() => {
  "use strict";

  const Context2D = window.CanvasRenderingContext2D;
  if (!Context2D || Context2D.prototype.__nabatickDirectionalInstalled) {
    return;
  }

  const originalDrawImage = Context2D.prototype.drawImage;
  const spritePaths = {
    idleFront: "assets/nabatick-idle-reference.png",
    idleLeft: "assets/nabatick-idle-reference.png",
    idleRight: "assets/nabatick-idle-reference.png",
    eatPrepare: "assets/nabatick-eat-prepare-reference.png",
    eatOpen: "assets/nabatick-eat-reference.png"
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
    if (source.endsWith("/nabatick-idle-reference.png") || source.endsWith("/nabatick-idle-v2.svg")) {
      return "idle";
    }
    if (source.endsWith("/nabatick-eat-prepare-reference.png") || source.endsWith("/nabatick-eat-prepare-v2.svg")) {
      return "eatPrepare";
    }
    if (source.endsWith("/nabatick-eat-reference.png") || source.endsWith("/nabatick-eat-v2.svg")) {
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
