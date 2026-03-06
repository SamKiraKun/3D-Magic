import * as THREE from 'three';

export class TouchController {
  constructor(target, gestureRecognizer) {
    this.target = target;
    this.gestureRecognizer = gestureRecognizer;
    this.activePointers = new Map();
    this.multiTouchActive = false;
    this.lastMidpoint = null;
    this.lastTime = performance.now();

    this.pointerDown = this.onPointerDown.bind(this);
    this.pointerMove = this.onPointerMove.bind(this);
    this.pointerUp = this.onPointerUp.bind(this);

    this.target.addEventListener('pointerdown', this.pointerDown, { passive: false });
    this.target.addEventListener('pointermove', this.pointerMove, { passive: false });
    this.target.addEventListener('pointerup', this.pointerUp, { passive: false });
    this.target.addEventListener('pointercancel', this.pointerUp, { passive: false });
  }

  onPointerDown(event) {
    if (event.pointerType !== 'touch') {
      return;
    }

    this.activePointers.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
      startX: event.clientX,
      startY: event.clientY,
      startTime: performance.now()
    });
    this.syncManualState(event);
  }

  onPointerMove(event) {
    if (!this.activePointers.has(event.pointerId)) {
      return;
    }

    const pointer = this.activePointers.get(event.pointerId);
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    this.syncManualState(event);
  }

  onPointerUp(event) {
    if (!this.activePointers.has(event.pointerId)) {
      return;
    }

    this.activePointers.delete(event.pointerId);
    if (this.activePointers.size === 0) {
      this.multiTouchActive = false;
      this.lastMidpoint = null;
      this.gestureRecognizer.clearManualControl();
      return;
    }

    this.syncManualState(event);
  }

  syncManualState(event) {
    if (event.cancelable) {
      event.preventDefault();
    }

    const points = [...this.activePointers.values()];
    if (!points.length) {
      this.gestureRecognizer.clearManualControl();
      return;
    }

    const now = performance.now();
    const midpoint = points.reduce(
      (accumulator, point) => {
        accumulator.x += point.x;
        accumulator.y += point.y;
        return accumulator;
      },
      { x: 0, y: 0 }
    );

    midpoint.x /= points.length;
    midpoint.y /= points.length;

    const width = window.innerWidth || 1;
    const height = window.innerHeight || 1;
    const xRatio = midpoint.x / width;
    const yRatio = midpoint.y / height;
    const x = (xRatio - 0.5) * 24;
    const y = (0.5 - yRatio) * 16;
    const z = THREE.MathUtils.clamp((0.5 - yRatio) * 8, -6, 6);

    let velocity = 0;
    if (this.lastMidpoint) {
      const dx = midpoint.x - this.lastMidpoint.x;
      const dy = midpoint.y - this.lastMidpoint.y;
      const dt = Math.max(16, now - this.lastTime);
      velocity = Math.sqrt(dx * dx + dy * dy) / dt;
    }

    const primary = points[0];
    const holdTime = now - primary.startTime;
    const dragDistance = Math.hypot(primary.x - primary.startX, primary.y - primary.startY);

    if (points.length >= 2 && !this.multiTouchActive) {
      this.gestureRecognizer.cycleTemplate();
      this.multiTouchActive = true;
    } else if (points.length < 2) {
      this.multiTouchActive = false;
    }

    const holdStrength =
      points.length === 1 && dragDistance < 16 && holdTime > 260
        ? THREE.MathUtils.clamp((holdTime - 260) / 320, 0, 1)
        : 0;

    const openIntensity = points.length >= 2 ? 0.82 : THREE.MathUtils.clamp(0.35 + velocity * 1.6, 0.28, 0.88);
    const fistIntensity = points.length >= 2 ? 0 : holdStrength * 0.92;
    const energy = THREE.MathUtils.clamp(
      Math.max(openIntensity * 0.65, fistIntensity * 0.9, velocity * 1.4, points.length >= 2 ? 0.78 : 0.24),
      0.18,
      1
    );
    const gestureLabel =
      points.length >= 2 ? 'Touch Pinch' : fistIntensity > 0.45 ? 'Touch Hold' : 'Touch Guide';

    this.gestureRecognizer.setManualControl({
      position: new THREE.Vector3(x, y, z),
      openIntensity,
      fistIntensity,
      energy,
      handHeight: 1 - yRatio,
      gestureLabel
    });

    this.lastMidpoint = midpoint;
    this.lastTime = now;
  }
}
