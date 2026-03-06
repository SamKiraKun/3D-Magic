
## Role

You are a **senior WebGL graphics engineer and creative interaction developer** with deep expertise in:

* **Three.js**
* **WebGL rendering**
* **Computer vision**
* **Real-time particle systems**
* **MediaPipe / hand tracking**
* **Performance optimization for browser graphics**

Your task is to design and implement a **real-time interactive 3D particle system** that reacts to **hand gestures captured from the user's camera**.

The system must be visually impressive, performant, and structured using **clean, maintainable code suitable for production environments**.

---

# Objective

Create a **browser-based interactive visual experience** where users control a **dynamic particle system using hand gestures** detected through the camera.

The particles should:

* React to **hand position**
* React to **hand gestures**
* Dynamically **change shape, color, movement patterns, and behavior**

The system should allow particles to **morph between different templates**, including:

* Hearts ❤️
* Flowers 🌸
* Saturn-like rings 🪐
* Fireworks bursts 🎆
* Spiral galaxies 🌌
* Particle waves

The experience should feel **fluid, responsive, and visually engaging**.

---

# Technical Stack Requirements

Use the following technologies:

### Rendering

* **Three.js (latest stable version)**
* WebGLRenderer

### Hand Tracking

Use one of the following:

Preferred:

* **MediaPipe Hands**

Alternative:

* **TensorFlow.js Handpose**

Camera input must be used to **detect hand landmarks in real time**.

---

# Core Features

## 1. Real-Time Camera Hand Tracking

The application must:

* Access the **user’s webcam**
* Detect **hand landmarks**
* Track:

  * Hand position
  * Finger positions
  * Basic gestures

Hand tracking must run **smoothly at real-time frame rates**.

---

# 2. Gesture Recognition

Implement gesture detection logic for at least the following gestures:

### Open Palm

Effect:

* Particle system **expands outward**
* Radius increases
* Particle spread widens

### Closed Fist

Effect:

* Particles **collapse inward**
* Cluster tightly around center

### Pinch Gesture

Effect:

* **Switch particle template**

Example transitions:

```
Heart → Flower → Saturn → Fireworks → Spiral
```

### Hand Movement

Effect:

* Particle system **follows hand position**
* Adds slight inertia or smoothing

---

# 3. Particle System Design

Implement a **GPU-friendly particle system**.

Particles should be rendered using:

* `BufferGeometry`
* `ShaderMaterial` (preferred)
* Or optimized `PointsMaterial`

Each particle must support:

* Position
* Velocity
* Size
* Color
* Lifetime
* Template mapping

Particle count target:

```
3,000 – 10,000 particles
```

System must maintain **stable performance at 60 FPS**.

---

# 4. Particle Templates

The system must support **switchable particle formations**.

Each template should be generated algorithmically.

### Heart Shape

Particles arranged along a **mathematical heart curve**.

### Flower

Radial petal structure with animated rotation.

### Saturn

Central sphere with rotating particle rings.

### Fireworks

Burst animation triggered by gesture.

### Spiral Galaxy

Particles rotating around center in spiral arms.

### Wave Field

Particles forming animated sine-wave patterns.

Switching templates must include **smooth transitions / morphing animations**.

---

# 5. Color Behavior

Particle colors should react dynamically:

Examples:

* **Hand height** controls hue
* **Gesture intensity** controls brightness
* **Particle speed** affects color shift

Recommended color techniques:

* HSL color mapping
* Gradient interpolation
* Shader-based color modulation

---

# 6. Physics & Motion

Particles should include simple physics:

* Velocity
* Acceleration
* Drag
* Noise-based movement

Optional enhancements:

* Perlin noise motion
* Orbit effects
* Gravity wells around hand position

---

# 7. Visual Effects

Add visual polish:

* Glow / bloom effect
* Smooth particle fading
* Motion trails
* Additive blending
* Depth-based scaling

Use **post-processing if necessary**.

---

# 8. Performance Optimization

The system must be optimized for **browser performance**.

Requirements:

* Use **BufferGeometry**
* Avoid frequent object creation
* Minimize CPU calculations
* Prefer **GPU shaders**
* Use requestAnimationFrame loop

Target performance:

```
60 FPS on modern laptop GPU
```

---

# 9. Project Structure

Organize the code clearly:

Example structure:

```
/src
  main.js
  scene.js
  particles.js
  gestures.js
  handTracking.js
  templates.js
  shaders/
      vertex.glsl
      fragment.glsl
```

Code must be **modular and readable**.

---

# 10. User Interaction UX

User experience must include:

* Camera permission request
* Clear instructions on gestures
* Smooth onboarding animation
* Responsive resizing

---

# 11. Deliverables

Generate:

1. Complete **working Three.js application**
2. Modular, well-commented code
3. Gesture recognition logic
4. Particle templates
5. Smooth morphing transitions
6. Real-time camera interaction

The final output should run **directly in a browser** with minimal setup.

---

# Additional Enhancements (Optional but Recommended)

Add extra creative features such as:

* Background environment effects
* Audio-reactive particles
* Multi-hand interaction
* Gesture-based particle explosions
* Mobile support

---

# Quality Expectations

The output must be:

* Clean
* Efficient
* Well structured
* Production ready
* Visually impressive
* Easy to extend

Avoid placeholder logic. Implement **fully functional behavior wherever possible**.

