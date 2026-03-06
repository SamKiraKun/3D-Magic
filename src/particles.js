import * as THREE from 'three';
import vertexShader from './shaders/vertex.glsl?raw';
import fragmentShader from './shaders/fragment.glsl?raw';
import { getTemplateLabel, getTemplateMode, getTemplatePositions } from './templates.js';

export class ParticleSystem {
  constructor(scene, count) {
    this.scene = scene;
    this.count = count;
    this.currentTemplateName = 'heart';
    this.morphDuration = 1.65;
    this.morphing = false;
    this.morphStartTime = 0;

    this.positions = getTemplatePositions(this.currentTemplateName, this.count);
    this.targetPositions = getTemplatePositions(this.currentTemplateName, this.count);
    this.sizes = new Float32Array(this.count);
    this.speeds = new Float32Array(this.count);
    this.randoms = new Float32Array(this.count * 3);

    for (let i = 0; i < this.count; i += 1) {
      this.sizes[i] = 0.18 + Math.random() * 0.75;
      this.speeds[i] = 0.55 + Math.random() * 1.2;
      this.randoms[i * 3] = Math.random();
      this.randoms[i * 3 + 1] = Math.random();
      this.randoms[i * 3 + 2] = Math.random();
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('aTargetPosition', new THREE.BufferAttribute(this.targetPositions, 3));
    this.geometry.setAttribute('aSize', new THREE.BufferAttribute(this.sizes, 1));
    this.geometry.setAttribute('aSpeed', new THREE.BufferAttribute(this.speeds, 1));
    this.geometry.setAttribute('aRandomVec', new THREE.BufferAttribute(this.randoms, 3));

    const currentMode = getTemplateMode(this.currentTemplateName);
    this.uniforms = {
      uTime: { value: 0 },
      uHandPos: { value: new THREE.Vector3() },
      uOpenIntensity: { value: 0 },
      uFistIntensity: { value: 0 },
      uEnergy: { value: 0.16 },
      uHandHeight: { value: 0.5 },
      uMorphProgress: { value: 1 },
      uTemplateFrom: { value: currentMode },
      uTemplateTo: { value: currentMode },
      uSizeScale: { value: window.innerHeight * 0.22 }
    };

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.points);

    window.addEventListener('resize', () => {
      this.uniforms.uSizeScale.value = window.innerHeight * 0.22;
    });
  }

  morphTo(templateName) {
    if (this.morphing || templateName === this.currentTemplateName) {
      return;
    }

    const progress = this.uniforms.uMorphProgress.value;
    const positions = this.geometry.attributes.position.array;
    const targets = this.geometry.attributes.aTargetPosition.array;

    for (let i = 0; i < this.count * 3; i += 1) {
      positions[i] = THREE.MathUtils.lerp(positions[i], targets[i], progress);
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.aTargetPosition.array.set(getTemplatePositions(templateName, this.count));
    this.geometry.attributes.aTargetPosition.needsUpdate = true;

    this.uniforms.uTemplateFrom.value = this.uniforms.uTemplateTo.value;
    this.uniforms.uTemplateTo.value = getTemplateMode(templateName);
    this.uniforms.uMorphProgress.value = 0;

    this.currentTemplateName = templateName;
    this.morphing = true;
    this.morphStartTime = performance.now() * 0.001;
  }

  update(time, handData) {
    this.uniforms.uTime.value = time;
    this.uniforms.uHandPos.value.copy(handData.handPosition);
    this.uniforms.uOpenIntensity.value = THREE.MathUtils.lerp(
      this.uniforms.uOpenIntensity.value,
      handData.isTracked ? handData.openIntensity : 0,
      0.16
    );
    this.uniforms.uFistIntensity.value = THREE.MathUtils.lerp(
      this.uniforms.uFistIntensity.value,
      handData.isTracked ? handData.fistIntensity : 0,
      0.18
    );
    this.uniforms.uEnergy.value = THREE.MathUtils.lerp(this.uniforms.uEnergy.value, handData.energy, 0.1);
    this.uniforms.uHandHeight.value = THREE.MathUtils.lerp(
      this.uniforms.uHandHeight.value,
      handData.handHeight,
      0.08
    );

    if (this.morphing) {
      const elapsed = time - this.morphStartTime;
      let progress = THREE.MathUtils.clamp(elapsed / this.morphDuration, 0, 1);
      progress =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      this.uniforms.uMorphProgress.value = progress;

      if (progress >= 1) {
        this.morphing = false;
        this.uniforms.uTemplateFrom.value = this.uniforms.uTemplateTo.value;
      }
    }

    this.points.rotation.y = time * 0.055;
    this.points.rotation.x = Math.sin(time * 0.18) * 0.1;
  }

  getCurrentTemplateLabel() {
    return getTemplateLabel(this.currentTemplateName);
  }
}
