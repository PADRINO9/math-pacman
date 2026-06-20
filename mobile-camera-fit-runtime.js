(() => {
  "use strict";

  const originalTranslate = CanvasRenderingContext2D.prototype.translate;
  const originalScale = CanvasRenderingContext2D.prototype.scale;

  CanvasRenderingContext2D.prototype.translate = function patchedTranslate(x, y) {
    const isGameCanvas = this.canvas?.id === "game-canvas";

    if (isGameCanvas && x === 480 && y === 360) {
      this.__mathMazePendingCameraCenter = true;
      return;
    }

    if (isGameCanvas && this.__mathMazeSkipCameraTail) {
      this.__mathMazeSkipCameraTail = false;
      return;
    }

    if (isGameCanvas && this.__mathMazePendingCameraCenter) {
      this.__mathMazePendingCameraCenter = false;
      originalTranslate.call(this, 480, 360);
    }

    return originalTranslate.call(this, x, y);
  };

  CanvasRenderingContext2D.prototype.scale = function patchedScale(x, y) {
    const isGameCanvas = this.canvas?.id === "game-canvas";
    const isCameraZoom = isGameCanvas
      && this.__mathMazePendingCameraCenter
      && x === y
      && x > 1.001
      && x < 3;

    if (isCameraZoom) {
      this.__mathMazePendingCameraCenter = false;
      this.__mathMazeSkipCameraTail = true;
      return;
    }

    if (isGameCanvas && this.__mathMazePendingCameraCenter) {
      this.__mathMazePendingCameraCenter = false;
      originalTranslate.call(this, 480, 360);
    }

    return originalScale.call(this, x, y);
  };
})();
