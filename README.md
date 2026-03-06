# 3D Magic

Browser-based Three.js particle experience driven by hand tracking and touch input.

The app renders a realtime particle field that morphs across procedural templates and reacts to:

- webcam hand tracking via MediaPipe Hands
- open palm, closed fist, and pinch gestures
- touch fallback controls for phones and tablets
- adaptive rendering/performance settings for mobile browsers

## Features

- Three.js particle renderer with shader-driven motion and morphing
- 20 procedural particle templates
- mobile-safe startup flow with tap-to-start camera access
- touch-only mode for devices where camera tracking is unavailable or unreliable
- adaptive quality profile for particle count, bloom, pixel ratio, and hand-tracking cadence
- live HUD for gesture, template, input mode, and energy state

## Templates

The current template set includes:

1. Spiral Galaxy
2. DNA Double Helix
3. Tornado Vortex
4. Neural Network Grid
5. Particle Cube
6. Butterfly Wings
7. Audio Waveform
8. Wormhole Portal
9. Liquid Blob
10. Star Constellation Map
11. Black Hole Accretion Disk
12. Phoenix Flame Shape
13. Tree Growth
14. Fractal Mandelbrot Cloud
15. Electric Lightning Field
16. Particle Ocean Waves
17. Snowfall Blizzard
18. Solar System Orbit
19. Particle Tornado Ring
20. Crystal Diamond Geometry

## Controls

### Camera / desktop

- Open palm: expand the particle field
- Closed fist: collapse particles inward
- Pinch: switch to the next template
- Hand movement: steer the system center

### Touch / mobile fallback

- Drag one finger: guide the particle field
- Hold one finger: compress the particles
- Use two fingers: switch to the next template

## Mobile Notes

- Mobile browsers often require a user tap before camera access can start.
- Camera mode works best over `https://` or `localhost`.
- If MediaPipe GPU startup fails on a phone, the app falls back to CPU delegate attempts.
- If camera tracking is blocked or too unreliable, `Touch Only` still gives a usable interaction path.

## Tech Stack

- `three`
- `@mediapipe/tasks-vision`
- `vite`

## Local Development

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

```text
src/
  deviceProfile.js
  gestures.js
  handTracking.js
  main.js
  particles.js
  scene.js
  templates.js
  touchControls.js
  shaders/
    fragment.glsl
    vertex.glsl
```

## Current Status

The current implementation has been updated for:

- reduced HUD footprint
- improved phone/browser compatibility
- adaptive mobile performance
- expanded procedural template coverage

Production build verification:

```bash
npm run build
```
