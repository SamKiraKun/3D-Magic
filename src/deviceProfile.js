export function detectDeviceProfile() {
  const userAgent = navigator.userAgent || '';
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const isTouch = coarsePointer || navigator.maxTouchPoints > 0;
  const isMobileUa = /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);
  const isMobile = isMobileUa || (isTouch && Math.min(window.innerWidth, window.innerHeight) < 900);
  const hardwareThreads = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 4;
  const portrait = window.innerHeight >= window.innerWidth;
  const isLowPower = isMobile || hardwareThreads <= 6 || memory <= 4;
  const isVeryConstrained = isMobile && (hardwareThreads <= 4 || memory <= 4);

  return {
    isTouch,
    isMobile,
    portrait,
    isLowPower,
    isVeryConstrained,
    requiresTapToStart: isTouch || isMobile,
    pixelRatioCap: isVeryConstrained ? 1.1 : isLowPower ? 1.25 : 1.75,
    particleCount: isVeryConstrained ? 2600 : isLowPower ? 4200 : 9000,
    starfieldCount: isVeryConstrained ? 380 : isLowPower ? 700 : 1400,
    enableBloom: !isVeryConstrained,
    bloomStrength: isLowPower ? 0.48 : 0.85,
    bloomRadius: isLowPower ? 0.62 : 0.9,
    bloomThreshold: isLowPower ? 0.28 : 0.18,
    camera: {
      width: isLowPower ? 640 : 960,
      height: isLowPower ? 480 : 720,
      frameRate: isVeryConstrained ? 18 : isLowPower ? 24 : 30
    },
    handDetectionIntervalMs: isVeryConstrained ? 72 : isLowPower ? 48 : 28,
    preferredDelegates: isLowPower ? ['CPU', 'GPU'] : ['GPU', 'CPU']
  };
}
