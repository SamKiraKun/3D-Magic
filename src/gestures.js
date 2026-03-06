import * as THREE from 'three';
import { TEMPLATE_NAMES } from './templates.js';

const FINGER_TIPS = [8, 12, 16, 20];
const FINGER_PIPS = [6, 10, 14, 18];

export class GestureRecognizer {
  constructor(particleSystem) {
    this.particleSystem = particleSystem;

    this.targetPos = new THREE.Vector3();
    this.currentPos = new THREE.Vector3();

    this.openIntensity = 0;
    this.fistIntensity = 0;
    this.energy = 0.12;
    this.handHeight = 0.5;

    this.isTracked = false;
    this.gestureLabel = 'Searching';
    this.currentTemplateIdx = 0;

    this.wasPinching = false;
    this.lastPinchTime = 0;
    this.pinchCooldown = 0.75;
  }

  update(landmarks) {
    this.isTracked = true;

    const wrist = landmarks[0];
    const palmCenter = this.averagePoints([
      landmarks[0],
      landmarks[5],
      landmarks[9],
      landmarks[13],
      landmarks[17]
    ]);

    const x = (palmCenter.x - 0.5) * -24;
    const y = -(palmCenter.y - 0.5) * 16;
    const z = THREE.MathUtils.clamp((palmCenter.z + 0.08) * -45, -18, 16);

    const previousTarget = this.targetPos.clone();
    this.targetPos.set(x, y, z);

    const palmSpan = this.dist(landmarks[5], landmarks[17]) || 0.1;
    const tipDistances = FINGER_TIPS.map((tipIndex) => this.dist(landmarks[tipIndex], wrist) / palmSpan);
    const pipDistances = FINGER_PIPS.map((pipIndex) => this.dist(landmarks[pipIndex], wrist) / palmSpan);

    let extendedFingers = 0;
    for (let i = 0; i < tipDistances.length; i += 1) {
      if (tipDistances[i] > pipDistances[i] + 0.22) {
        extendedFingers += 1;
      }
    }

    const thumbSpread =
      this.dist(landmarks[4], landmarks[5]) / (this.dist(landmarks[3], landmarks[5]) || 0.1);
    if (thumbSpread > 1.16) {
      extendedFingers += 1;
    }

    const averageTipDistance =
      tipDistances.reduce((sum, value) => sum + value, 0) / tipDistances.length;
    const pinchDistance = this.dist(landmarks[4], landmarks[8]) / palmSpan;
    const pinchStrength = THREE.MathUtils.clamp((0.55 - pinchDistance) / 0.55, 0, 1);
    const isPinching = pinchStrength > 0.82;

    const now = performance.now() * 0.001;
    const openTarget = extendedFingers >= 4 ? THREE.MathUtils.clamp((averageTipDistance - 1.45) / 1.3, 0, 1) : 0;
    const fistTarget = extendedFingers <= 1 ? THREE.MathUtils.clamp((1.9 - averageTipDistance) / 1.1, 0, 1) : 0;
    const motion = THREE.MathUtils.clamp(previousTarget.distanceTo(this.targetPos) * 0.12, 0, 1);

    this.openIntensity = THREE.MathUtils.lerp(this.openIntensity, openTarget, 0.14);
    this.fistIntensity = THREE.MathUtils.lerp(this.fistIntensity, fistTarget, 0.16);
    this.energy = THREE.MathUtils.lerp(
      this.energy,
      Math.max(this.openIntensity, this.fistIntensity, pinchStrength * 0.8, motion, 0.18),
      0.12
    );
    this.handHeight = THREE.MathUtils.clamp(1 - palmCenter.y, 0, 1);

    if (isPinching && !this.wasPinching && now - this.lastPinchTime > this.pinchCooldown) {
      this.currentTemplateIdx = (this.currentTemplateIdx + 1) % TEMPLATE_NAMES.length;
      this.particleSystem.morphTo(TEMPLATE_NAMES[this.currentTemplateIdx]);
      this.lastPinchTime = now;
    }

    this.wasPinching = isPinching;
    this.gestureLabel = this.resolveGestureLabel({
      pinchStrength,
      extendedFingers,
      openTarget,
      fistTarget,
      motion
    });
  }

  noHand() {
    this.isTracked = false;
    this.gestureLabel = 'Searching';
    this.targetPos.lerp(new THREE.Vector3(0, 0, 0), 0.04);
    this.openIntensity = THREE.MathUtils.lerp(this.openIntensity, 0, 0.05);
    this.fistIntensity = THREE.MathUtils.lerp(this.fistIntensity, 0, 0.05);
    this.energy = THREE.MathUtils.lerp(this.energy, 0.14, 0.04);
    this.wasPinching = false;
  }

  resolveGestureLabel({ pinchStrength, extendedFingers, openTarget, fistTarget, motion }) {
    if (pinchStrength > 0.82) {
      return 'Pinch';
    }

    if (openTarget > 0.45 && extendedFingers >= 4) {
      return 'Open Palm';
    }

    if (fistTarget > 0.45 && extendedFingers <= 1) {
      return 'Closed Fist';
    }

    if (motion > 0.24) {
      return 'Guiding';
    }

    return 'Tracking';
  }

  averagePoints(points) {
    const average = { x: 0, y: 0, z: 0 };

    points.forEach((point) => {
      average.x += point.x;
      average.y += point.y;
      average.z += point.z;
    });

    average.x /= points.length;
    average.y /= points.length;
    average.z /= points.length;

    return average;
  }

  dist(pointA, pointB) {
    const dx = pointA.x - pointB.x;
    const dy = pointA.y - pointB.y;
    const dz = pointA.z - pointB.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  getFrameState() {
    this.currentPos.lerp(this.targetPos, 0.12);

    return {
      handPosition: this.currentPos,
      openIntensity: this.openIntensity,
      fistIntensity: this.fistIntensity,
      energy: this.energy,
      handHeight: this.handHeight,
      gestureLabel: this.gestureLabel,
      isTracked: this.isTracked
    };
  }
}
