import { detectDeviceProfile } from './deviceProfile.js';
import { SceneManager } from './scene.js';
import { ParticleSystem } from './particles.js';
import { GestureRecognizer } from './gestures.js';
import { TouchController } from './touchControls.js';

const ui = {
  status: document.getElementById('status'),
  gesture: document.getElementById('gesture-label'),
  template: document.getElementById('template-label'),
  tracking: document.getElementById('tracking-label'),
  energy: document.getElementById('energy-label'),
  webcam: document.getElementById('webcam'),
  launchPanel: document.getElementById('launch-panel'),
  launchCopy: document.getElementById('launch-copy'),
  startButton: document.getElementById('start-button'),
  touchButton: document.getElementById('touch-button')
};

let deviceProfile;
let sceneManager;
let particleSystem;
let handTracker;
let gestureRecognizer;
let touchController;
let startInFlight = false;
let cameraEnabled = false;

function setStatus(message, tone = 'loading') {
  ui.status.textContent = message;
  ui.status.dataset.tone = tone;
}

function setLaunchVisible(visible) {
  ui.launchPanel.classList.toggle('is-hidden', !visible);
}

function setButtonsDisabled(disabled) {
  ui.startButton.disabled = disabled;
  ui.touchButton.disabled = disabled;
}

function updateHud(frameState) {
  ui.gesture.textContent = frameState.gestureLabel;
  ui.template.textContent = particleSystem.getCurrentTemplateLabel();
  ui.energy.textContent = `${Math.round(frameState.energy * 100)}%`;

  if (frameState.inputMode === 'camera') {
    ui.tracking.textContent = 'Camera';
  } else if (frameState.inputMode === 'touch') {
    ui.tracking.textContent = 'Touch';
  } else {
    ui.tracking.textContent = cameraEnabled ? 'Searching' : 'Ambient';
  }
}

function animate() {
  requestAnimationFrame(animate);

  const time = performance.now() * 0.001;
  const frameState = gestureRecognizer.getFrameState();

  particleSystem.update(time, frameState);
  sceneManager.update(time);
  sceneManager.render();
  updateHud(frameState);
}

async function startCameraMode() {
  if (startInFlight || cameraEnabled) {
    return;
  }

  startInFlight = true;
  setButtonsDisabled(true);
  setStatus('Starting camera and loading hand tracking...', 'loading');

  try {
    handTracker?.stop?.();
    const { HandTracker } = await import('./handTracking.js');
    handTracker = new HandTracker(ui.webcam, deviceProfile);
    handTracker.onResults = (results) => {
      if (results.landmarks?.length) {
        gestureRecognizer.update(results.landmarks[0]);
        return;
      }

      gestureRecognizer.noHand();
    };

    await handTracker.start();
    cameraEnabled = true;
    setLaunchVisible(false);
    setStatus('Camera live. You can also use touch controls on the screen.', 'ready');
  } catch (error) {
    handTracker?.stop?.();
    handTracker = null;
    const message = error?.message || 'Camera mode failed. Touch mode is still available.';
    setStatus(message, 'warning');
    ui.launchCopy.textContent = 'Camera startup failed on this device. You can retry or continue with touch controls.';
    setLaunchVisible(true);
    setButtonsDisabled(false);
    console.error(error);
  } finally {
    startInFlight = false;
  }
}

function startTouchMode() {
  setLaunchVisible(false);
  setStatus('Touch mode active. Drag, hold, or use two fingers to switch shapes.', 'ready');
}

function applyLaunchCopy() {
  if (deviceProfile.requiresTapToStart) {
    ui.launchCopy.textContent =
      'Mobile browsers usually need a tap before camera access and heavy graphics can begin.';
    setLaunchVisible(true);
    setStatus('Tap Start Camera or use Touch Only.', 'loading');
    return;
  }

  setLaunchVisible(false);
}

async function init() {
  deviceProfile = detectDeviceProfile();
  sceneManager = new SceneManager(deviceProfile);
  particleSystem = new ParticleSystem(sceneManager.scene, deviceProfile.particleCount, deviceProfile);
  gestureRecognizer = new GestureRecognizer(particleSystem);
  touchController = new TouchController(sceneManager.renderer.domElement, gestureRecognizer);

  ui.startButton.addEventListener('click', startCameraMode);
  ui.touchButton.addEventListener('click', startTouchMode);

  animate();
  applyLaunchCopy();

  if (!deviceProfile.requiresTapToStart) {
    await startCameraMode();
  }
}

window.addEventListener('DOMContentLoaded', init);
