import { SceneManager } from './scene.js';
import { ParticleSystem } from './particles.js';
import { GestureRecognizer } from './gestures.js';

const NUM_PARTICLES = 9000;

const ui = {
  status: document.getElementById('status'),
  gesture: document.getElementById('gesture-label'),
  template: document.getElementById('template-label'),
  tracking: document.getElementById('tracking-label'),
  energy: document.getElementById('energy-label'),
  webcam: document.getElementById('webcam')
};

let sceneManager;
let particleSystem;
let handTracker;
let gestureRecognizer;

function setStatus(message, tone = 'loading') {
  ui.status.textContent = message;
  ui.status.dataset.tone = tone;
}

function updateHud(frameState) {
  ui.gesture.textContent = frameState.gestureLabel;
  ui.template.textContent = particleSystem.getCurrentTemplateLabel();
  ui.tracking.textContent = frameState.isTracked ? 'Tracking' : 'Ambient';
  ui.energy.textContent = `${Math.round(frameState.energy * 100)}%`;
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

async function init() {
  sceneManager = new SceneManager();
  particleSystem = new ParticleSystem(sceneManager.scene, NUM_PARTICLES);
  gestureRecognizer = new GestureRecognizer(particleSystem);

  animate();
  setStatus('Loading hand tracking model...', 'loading');

  try {
    const { HandTracker } = await import('./handTracking.js');
    handTracker = new HandTracker(ui.webcam);
    handTracker.onResults = (results) => {
      if (results.landmarks?.length) {
        gestureRecognizer.update(results.landmarks[0]);
        return;
      }

      gestureRecognizer.noHand();
    };

    await handTracker.start();
    setStatus('Camera live. Use an open palm, a fist, or a pinch to play.', 'ready');
  } catch (error) {
    const message = error?.message || 'Hand tracking unavailable. Running ambient particle mode.';
    setStatus(message, 'warning');
    console.error(error);
  }
}

window.addEventListener('DOMContentLoaded', init);
