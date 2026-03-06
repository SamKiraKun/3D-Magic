export const TEMPLATE_DEFS = [
  { name: 'spiralGalaxy', label: 'Spiral Galaxy', mode: 0 },
  { name: 'dnaHelix', label: 'DNA Double Helix', mode: 1 },
  { name: 'tornadoVortex', label: 'Tornado Vortex', mode: 2 },
  { name: 'neuralGrid', label: 'Neural Network Grid', mode: 3 },
  { name: 'particleCube', label: 'Particle Cube', mode: 4 },
  { name: 'butterflyWings', label: 'Butterfly Wings', mode: 5 },
  { name: 'audioWaveform', label: 'Audio Waveform', mode: 6 },
  { name: 'wormholePortal', label: 'Wormhole Portal', mode: 7 },
  { name: 'liquidBlob', label: 'Liquid Blob', mode: 8 },
  { name: 'constellationMap', label: 'Star Constellation Map', mode: 9 },
  { name: 'blackHoleDisk', label: 'Black Hole Accretion Disk', mode: 10 },
  { name: 'phoenixFlame', label: 'Phoenix Flame Shape', mode: 11 },
  { name: 'treeGrowth', label: 'Tree Growth', mode: 12 },
  { name: 'mandelbrotCloud', label: 'Fractal Mandelbrot Cloud', mode: 13 },
  { name: 'lightningField', label: 'Electric Lightning Field', mode: 14 },
  { name: 'oceanWaves', label: 'Particle Ocean Waves', mode: 15 },
  { name: 'snowfallBlizzard', label: 'Snowfall Blizzard', mode: 16 },
  { name: 'solarSystem', label: 'Solar System Orbit', mode: 17 },
  { name: 'energyRing', label: 'Particle Tornado Ring', mode: 18 },
  { name: 'crystalDiamond', label: 'Crystal Diamond Geometry', mode: 19 }
];

export const TEMPLATE_NAMES = TEMPLATE_DEFS.map((template) => template.name);

export function getTemplateIndex(templateName) {
  return Math.max(
    0,
    TEMPLATE_DEFS.findIndex((template) => template.name === templateName)
  );
}

export function getTemplateLabel(templateName) {
  return TEMPLATE_DEFS[getTemplateIndex(templateName)].label;
}

export function getTemplateMode(templateName) {
  return TEMPLATE_DEFS[getTemplateIndex(templateName)].mode;
}

function setPosition(positions, index, x, y, z) {
  positions[index * 3] = x;
  positions[index * 3 + 1] = y;
  positions[index * 3 + 2] = z;
}

function randomSpherePoint(radius = 6) {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  const r = Math.cbrt(Math.random()) * radius;

  return {
    x: r * Math.sin(phi) * Math.cos(theta),
    y: r * Math.sin(phi) * Math.sin(theta),
    z: r * Math.cos(phi)
  };
}

function fillDefaultSphere(positions, count) {
  for (let i = 0; i < count; i += 1) {
    const point = randomSpherePoint(6.5);
    setPosition(positions, i, point.x, point.y, point.z);
  }
}

function mandelbrotPoint() {
  let accepted = null;

  for (let attempt = 0; attempt < 18; attempt += 1) {
    const cx = -2.2 + Math.random() * 3.0;
    const cy = -1.6 + Math.random() * 3.2;
    let x = 0;
    let y = 0;
    let iteration = 0;
    const maxIterations = 28;

    while (x * x + y * y <= 4 && iteration < maxIterations) {
      const xt = x * x - y * y + cx;
      y = 2 * x * y + cy;
      x = xt;
      iteration += 1;
    }

    if (iteration > 10 && iteration < maxIterations) {
      accepted = { x: cx, y: cy, depth: iteration / maxIterations };
      break;
    }
  }

  if (!accepted) {
    accepted = { x: -0.75 + (Math.random() - 0.5) * 1.6, y: (Math.random() - 0.5) * 1.8, depth: Math.random() };
  }

  return accepted;
}

export function getTemplatePositions(templateName, count) {
  const positions = new Float32Array(count * 3);

  if (templateName === 'spiralGalaxy') {
    for (let i = 0; i < count; i += 1) {
      const arms = 4;
      const arm = Math.floor(Math.random() * arms);
      const radius = Math.pow(Math.random(), 0.72) * 10.5;
      const angle = radius * 0.95 + (arm / arms) * Math.PI * 2;
      const spread = (Math.random() - 0.5) * 1.4;

      setPosition(
        positions,
        i,
        Math.cos(angle) * radius + spread,
        Math.sin(angle) * radius + spread,
        (Math.random() - 0.5) * 2.1
      );
    }
  } else if (templateName === 'dnaHelix') {
    for (let i = 0; i < count; i += 1) {
      const strand = i % 2;
      const progress = i / count;
      const angle = progress * Math.PI * 2 * 9 + strand * Math.PI;
      const radius = 3.2 + Math.sin(progress * Math.PI * 20) * 0.35;

      setPosition(positions, i, Math.cos(angle) * radius, (progress - 0.5) * 20, Math.sin(angle) * radius);
    }
  } else if (templateName === 'tornadoVortex') {
    for (let i = 0; i < count; i += 1) {
      const height = Math.random() * 18 - 9;
      const t = Math.random() * Math.PI * 2;
      const radius = 0.8 + ((height + 9) / 18) * 5.8 + Math.random() * 1.5;

      setPosition(positions, i, Math.cos(t) * radius, height, Math.sin(t) * radius);
    }
  } else if (templateName === 'neuralGrid') {
    for (let i = 0; i < count; i += 1) {
      const gx = Math.floor(Math.random() * 8) - 3.5;
      const gy = Math.floor(Math.random() * 6) - 2.5;
      const gz = Math.floor(Math.random() * 8) - 3.5;
      const jitter = 0.55;

      setPosition(
        positions,
        i,
        gx * 2.4 + (Math.random() - 0.5) * jitter,
        gy * 2.4 + (Math.random() - 0.5) * jitter,
        gz * 2.4 + (Math.random() - 0.5) * jitter
      );
    }
  } else if (templateName === 'particleCube') {
    for (let i = 0; i < count; i += 1) {
      const face = Math.floor(Math.random() * 6);
      const u = (Math.random() - 0.5) * 10;
      const v = (Math.random() - 0.5) * 10;
      const half = 5.2;

      if (face === 0) setPosition(positions, i, half, u, v);
      else if (face === 1) setPosition(positions, i, -half, u, v);
      else if (face === 2) setPosition(positions, i, u, half, v);
      else if (face === 3) setPosition(positions, i, u, -half, v);
      else if (face === 4) setPosition(positions, i, u, v, half);
      else setPosition(positions, i, u, v, -half);
    }
  } else if (templateName === 'butterflyWings') {
    for (let i = 0; i < count; i += 1) {
      const t = Math.random() * Math.PI * 12;
      const wing =
        Math.exp(Math.cos(t)) -
        2 * Math.cos(4 * t) -
        Math.pow(Math.sin(t / 12), 5);
      const scale = 1.15 + Math.random() * 0.45;

      setPosition(
        positions,
        i,
        Math.sin(t) * wing * scale * 1.4,
        Math.cos(t) * wing * scale * 1.1,
        Math.sin(t * 0.5) * 1.2 + (Math.random() - 0.5) * 1.2
      );
    }
  } else if (templateName === 'audioWaveform') {
    for (let i = 0; i < count; i += 1) {
      const x = (i / count - 0.5) * 26;
      const y =
        Math.sin(x * 0.7) * 2.2 +
        Math.sin(x * 1.4 + 1.2) * 1.2 +
        Math.sin(x * 2.4 + 0.5) * 0.75;

      setPosition(positions, i, x, y, (Math.random() - 0.5) * 2.4);
    }
  } else if (templateName === 'wormholePortal') {
    for (let i = 0; i < count; i += 1) {
      const turns = Math.random() * Math.PI * 8;
      const radius = 7.8 + Math.sin(turns * 1.6) * 1.1 + (Math.random() - 0.5) * 0.7;
      const depth = (Math.random() - 0.5) * 18;

      setPosition(
        positions,
        i,
        Math.cos(turns) * radius,
        Math.sin(turns) * radius,
        depth
      );
    }
  } else if (templateName === 'liquidBlob') {
    for (let i = 0; i < count; i += 1) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius =
        5.2 +
        Math.sin(theta * 3.0) * 0.9 +
        Math.sin(phi * 4.0) * 0.8 +
        (Math.random() - 0.5) * 0.4;

      setPosition(
        positions,
        i,
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    }
  } else if (templateName === 'constellationMap') {
    for (let i = 0; i < count; i += 1) {
      const cluster = Math.floor(Math.random() * 7);
      const clusterAngle = (cluster / 7) * Math.PI * 2;
      const radius = 4 + Math.random() * 7;
      const x = Math.cos(clusterAngle) * radius + (Math.random() - 0.5) * 2.2;
      const y = (Math.random() - 0.5) * 7.2 + Math.sin(clusterAngle * 2.0) * 2.2;
      const z = (Math.random() - 0.5) * 5.4;

      setPosition(positions, i, x, y, z);
    }
  } else if (templateName === 'blackHoleDisk') {
    for (let i = 0; i < count; i += 1) {
      if (Math.random() < 0.12) {
        const point = randomSpherePoint(1.4 + Math.random() * 0.8);
        setPosition(positions, i, point.x, point.y, point.z);
      } else {
        const angle = Math.random() * Math.PI * 2;
        const radius = 3.2 + Math.random() * 6.8;
        const tilt = (Math.random() - 0.5) * 1.1;

        setPosition(positions, i, Math.cos(angle) * radius, tilt, Math.sin(angle) * radius);
      }
    }
  } else if (templateName === 'phoenixFlame') {
    for (let i = 0; i < count; i += 1) {
      const t = Math.random() * Math.PI * 2;
      const wing = Math.sin(t) * Math.cos(t * 0.5);
      const radius = 2.2 + Math.random() * 5.4;
      const flare = Math.abs(Math.sin(t * 3.0));

      setPosition(
        positions,
        i,
        wing * radius * 1.9,
        flare * 8.5 - 5 + Math.random() * 5.2,
        Math.cos(t) * radius * 0.9
      );
    }
  } else if (templateName === 'treeGrowth') {
    for (let i = 0; i < count; i += 1) {
      const depth = Math.floor(Math.random() * 5);
      const trunkHeight = -8 + Math.random() * 16;
      let angle = -Math.PI / 2;
      let length = 5.8;
      let x = 0;
      let y = -8;

      for (let branch = 0; branch <= depth; branch += 1) {
        angle += (Math.random() - 0.5) * (0.8 + branch * 0.22);
        x += Math.cos(angle) * length;
        y += Math.sin(angle) * length;
        length *= 0.62;
      }

      setPosition(
        positions,
        i,
        x + (Math.random() - 0.5) * 0.9,
        y + trunkHeight * 0.12 + (Math.random() - 0.5) * 0.8,
        (Math.random() - 0.5) * (1.2 + depth)
      );
    }
  } else if (templateName === 'mandelbrotCloud') {
    for (let i = 0; i < count; i += 1) {
      const point = mandelbrotPoint();
      setPosition(
        positions,
        i,
        point.x * 7.5,
        point.y * 7.5,
        (point.depth - 0.5) * 8 + (Math.random() - 0.5) * 1.2
      );
    }
  } else if (templateName === 'lightningField') {
    for (let i = 0; i < count; i += 1) {
      const bolt = Math.floor(Math.random() * 6);
      const progress = Math.random();
      const height = 9 - progress * 18;
      const sway = Math.sin(progress * 18 + bolt) * 1.1;
      const jitter = (Math.random() - 0.5) * 1.2;

      setPosition(
        positions,
        i,
        (bolt - 2.5) * 1.8 + sway + jitter,
        height,
        Math.cos(progress * 12 + bolt) * 1.6 + jitter * 0.6
      );
    }
  } else if (templateName === 'oceanWaves') {
    for (let i = 0; i < count; i += 1) {
      const x = (Math.random() - 0.5) * 26;
      const z = (Math.random() - 0.5) * 26;
      const y =
        Math.sin(x * 0.38) * 2.1 +
        Math.cos(z * 0.32) * 1.9 +
        Math.sin((x + z) * 0.18) * 1.1;

      setPosition(positions, i, x, y, z);
    }
  } else if (templateName === 'snowfallBlizzard') {
    for (let i = 0; i < count; i += 1) {
      setPosition(
        positions,
        i,
        (Math.random() - 0.5) * 22,
        Math.random() * 20 - 10,
        (Math.random() - 0.5) * 22
      );
    }
  } else if (templateName === 'solarSystem') {
    for (let i = 0; i < count; i += 1) {
      if (Math.random() < 0.16) {
        const point = randomSpherePoint(2.4);
        setPosition(positions, i, point.x, point.y, point.z);
      } else {
        const orbit = Math.floor(Math.random() * 7);
        const angle = Math.random() * Math.PI * 2;
        const radius = 3.8 + orbit * 1.5 + Math.random() * 0.4;

        setPosition(
          positions,
          i,
          Math.cos(angle) * radius,
          (Math.random() - 0.5) * 0.55,
          Math.sin(angle) * radius
        );
      }
    }
  } else if (templateName === 'energyRing') {
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 6.4 + Math.sin(angle * 6.0) * 1.4 + (Math.random() - 0.5) * 0.7;
      const y = (Math.random() - 0.5) * 1.4;

      setPosition(positions, i, Math.cos(angle) * radius, y, Math.sin(angle) * radius);
    }
  } else if (templateName === 'crystalDiamond') {
    for (let i = 0; i < count; i += 1) {
      const face = Math.floor(Math.random() * 8);
      const u = Math.random();
      const v = Math.random() * (1 - u);
      const w = 1 - u - v;
      const signY = face < 4 ? 1 : -1;
      const signX = face % 2 === 0 ? 1 : -1;
      const signZ = Math.floor(face / 2) % 2 === 0 ? 1 : -1;

      setPosition(
        positions,
        i,
        (u * signX + v * signX + w * 0) * 6.5,
        signY * (u + v + w) * 7.4,
        (u * signZ + v * 0 + w * signZ) * 6.5
      );
    }
  } else {
    fillDefaultSphere(positions, count);
  }

  return positions;
}
