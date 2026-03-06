import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

const MEDIAPIPE_VERSION = '0.10.9';
const WASM_ROOT = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`;
const MODEL_ASSET =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

export class HandTracker {
  constructor(videoElement) {
    this.video = videoElement;
    this.handLandmarker = null;
    this.onResults = null;
    this.lastVideoTime = -1;
    this.stream = null;
    this.isRunning = false;
  }

  async start() {
    const vision = await FilesetResolver.forVisionTasks(WASM_ROOT);

    this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: MODEL_ASSET,
        delegate: 'GPU'
      },
      runningMode: 'VIDEO',
      numHands: 1
    });

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: 'user',
          width: { ideal: 960 },
          height: { ideal: 720 }
        }
      });
    } catch (error) {
      throw new Error('Camera permission denied or no webcam is available.');
    }

    this.video.srcObject = this.stream;

    try {
      await this.video.play();
    } catch (error) {
      throw new Error('The webcam stream could not start in this browser context.');
    }

    this.isRunning = true;
    this.predictWebcam();
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
      if (this.video.currentTime !== this.lastVideoTime) {
        this.lastVideoTime = this.video.currentTime;
        const results = this.handLandmarker.detectForVideo(this.video, nowInMs);

        if (this.onResults) {
          this.onResults(results);
        }
      }
    }

    requestAnimationFrame(this.predictWebcam);
  };
}
