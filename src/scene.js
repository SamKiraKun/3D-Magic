import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export class SceneManager {
  constructor(profile) {
    this.profile = profile;
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x03060d, 0.018);

    this.camera = new THREE.PerspectiveCamera(
      46,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );
    this.camera.position.set(0, 0, this.profile.isMobile && this.profile.portrait ? 30 : 26);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.profile.pixelRatioCap));
    this.renderer.setClearColor(0x03060d, 1);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.style.touchAction = 'none';

    if (this.profile.enableBloom) {
      this.composer = new EffectComposer(this.renderer);
      this.composer.addPass(new RenderPass(this.scene, this.camera));
      this.composer.addPass(
        new UnrealBloomPass(
          new THREE.Vector2(window.innerWidth, window.innerHeight),
          this.profile.bloomStrength,
          this.profile.bloomRadius,
          this.profile.bloomThreshold
        )
      );
    } else {
      this.composer = null;
    }

    this.starfield = this.createStarfield();
    this.scene.add(this.starfield);

    document.body.appendChild(this.renderer.domElement);
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  createStarfield() {
    const count = this.profile.starfieldCount;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i += 1) {
      const radius = 50 + Math.random() * 70;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      sizes[i] = 0.5 + Math.random() * 1.4;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 }
      },
      vertexShader: `
        attribute float size;
        uniform float uTime;

        void main() {
          vec3 transformed = position;
          transformed.y += sin(uTime * 0.18 + position.x * 0.03) * 0.45;
          vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = size * (120.0 / -mvPosition.z);
        }
      `,
      fragmentShader: `
        void main() {
          vec2 uv = gl_PointCoord - vec2(0.5);
          float dist = length(uv);
          if (dist > 0.5) {
            discard;
          }

          float alpha = smoothstep(0.5, 0.0, dist);
          gl_FragColor = vec4(vec3(0.7, 0.82, 1.0) * alpha, alpha * 0.45);
        }
      `
    });

    return new THREE.Points(geometry, material);
  }

  onWindowResize() {
    this.profile.portrait = window.innerHeight >= window.innerWidth;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.camera.position.z = this.profile.isMobile && this.profile.portrait ? 30 : 26;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.profile.pixelRatioCap));
    if (this.composer) {
      this.composer.setSize(window.innerWidth, window.innerHeight);
    }
  }

  update(time) {
    this.starfield.material.uniforms.uTime.value = time;
    this.starfield.rotation.y = time * 0.01;
    this.starfield.rotation.x = Math.sin(time * 0.08) * 0.04;
  }

  render() {
    if (this.composer) {
      this.composer.render();
      return;
    }

    this.renderer.render(this.scene, this.camera);
  }
}
