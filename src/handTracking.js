import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

const MEDIAPIPE_VERSION = '0.10.9';
const WASM_ROOT = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`;
const MODEL_ASSET =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

export class HandTracker {
  constructor(videoElement, profile) {
    this.video = videoElement;
    this.profile = profile;
    this.handLandmarker = null;
    this.onResults = null;
    this.lastVideoTime = -1;
    this.stream = null;
    this.isRunning = false;
    this.lastDetectionTime = 0;
  }

  async start() {
    if (!window.isSecureContext && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
      throw new Error('Camera access on mobile requires HTTPS or localhost.');
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('This browser does not expose camera access.');
    }

    const vision = await FilesetResolver.forVisionTasks(WASM_ROOT);
    this.handLandmarker = await this.createHandLandmarker(vision);

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: 'user',
          width: { ideal: this.profile.camera.width },
          height: { ideal: this.profile.camera.height },
          frameRate: { ideal: this.profile.camera.frameRate, max: this.profile.camera.frameRate }
        }
      });
    } catch (error) {
      throw new Error('Camera permission denied or no webcam is available.');
    }

    this.video.srcObject = this.stream;
    this.video.setAttribute('playsinline', '');
    this.video.muted = true;

    try {
      await this.video.play();
    } catch (error) {
      this.stop();
      throw new Error('The webcam stream could not start in this browser context.');
    }

    this.isRunning = true;
    this.predictWebcam();
  }

  async createHandLandmarker(vision) {
    let lastError;

    for (const delegate of this.profile.preferredDelegates) {
      try {
        return await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MODEL_ASSET,
            delegate
          },
          runningMode: 'VIDEO',
          numHands: 1
        });
      } catch (error) {
        lastError = error;
      }
    }

    throw new Error(lastError?.message || 'The hand tracking model could not start on this device.');
  }

  stop() {
    this.isRunning = false;

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }

  predictWebcam = () => {
    if (!this.isRunning || !this.handLandmarker) {
      return;
    }

    const nowInMs = performance.now();
    if (this.video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      if (nowInMs - this.lastDetectionTime < this.profile.handDetectionIntervalMs) {
        requestAnimationFrame(this.predictWebcam);
        return;
      }

      if (this.video.currentTime !== this.lastVideoTime) {
        this.lastVideoTime = this.video.currentTime;
        this.lastDetectionTime = nowInMs;
        const results = this.handLandmarker.detectForVideo(this.video, nowInMs);

        if (this.onResults) {
          this.onResults(results);
        }
      }
    }

    requestAnimationFrame(this.predictWebcam);
  };
}
