export const TEMPLATE_DEFS = [
  { name: 'heart', label: 'Heart Bloom', mode: 0 },
  { name: 'flower', label: 'Flower Orbit', mode: 1 },
  { name: 'saturn', label: 'Saturn Rings', mode: 2 },
  { name: 'fireworks', label: 'Fireworks Burst', mode: 3 },
  { name: 'spiral', label: 'Spiral Galaxy', mode: 4 },
  { name: 'wave', label: 'Wave Field', mode: 5 }
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

export function getTemplatePositions(templateName, count) {
  const positions = new Float32Array(count * 3);

  if (templateName === 'heart') {
    for (let i = 0; i < count; i += 1) {
      const t = Math.random() * Math.PI * 2;
      const shell = 0.72 + Math.random() * 0.36;
      const x = 16 * Math.pow(Math.sin(t), 3) * shell;
      const y =
        13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t);

      positions[i * 3] = x * 0.38;
      positions[i * 3 + 1] = y * 0.38 + 1.8 + (Math.random() - 0.5) * 0.8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3.4;
    }
  } else if (templateName === 'flower') {
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const petals = 7;
      const radius = 1.2 + Math.sin(angle * petals) * 1.15 + Math.random() * 0.85;

      positions[i * 3] = Math.cos(angle) * radius * 3.2;
      positions[i * 3 + 1] = Math.sin(angle) * radius * 3.2;
      positions[i * 3 + 2] = Math.sin(angle * petals) * 0.9 + (Math.random() - 0.5) * 1.6;
    }
  } else if (templateName === 'saturn') {
    for (let i = 0; i < count; i += 1) {
      if (Math.random() < 0.28) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const radius = 2.2 + Math.random() * 1.6;

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.cos(phi);
        positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
      } else {
        const angle = Math.random() * Math.PI * 2;
        const radius = 5.4 + Math.random() * 4.2;

        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 0.8;
        positions[i * 3 + 2] = Math.sin(angle) * radius;
      }
    }
  } else if (templateName === 'fireworks') {
    for (let i = 0; i < count; i += 1) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = Math.pow(Math.random(), 0.55) * 10.5;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
  } else if (templateName === 'spiral') {
    for (let i = 0; i < count; i += 1) {
      const arms = 4;
      const arm = Math.floor(Math.random() * arms);
      const radius = Math.pow(Math.random(), 0.7) * 10;
      const angle = radius * 0.9 + (arm / arms) * Math.PI * 2;
      const spread = (Math.random() - 0.5) * 1.2;

      positions[i * 3] = Math.cos(angle) * radius + spread;
      positions[i * 3 + 1] = Math.sin(angle) * radius + spread;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.8;
    }
  } else if (templateName === 'wave') {
    for (let i = 0; i < count; i += 1) {
      const x = (Math.random() - 0.5) * 24;
      const z = (Math.random() - 0.5) * 24;
      const y = Math.sin(x * 0.42) * 1.8 + Math.cos(z * 0.38) * 1.8;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
  } else {
    for (let i = 0; i < count; i += 1) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = Math.cbrt(Math.random()) * 6.5;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
  }

  return positions;
}
