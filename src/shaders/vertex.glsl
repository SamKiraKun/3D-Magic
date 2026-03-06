uniform float uTime;
uniform vec3 uHandPos;
uniform float uOpenIntensity;
uniform float uFistIntensity;
uniform float uEnergy;
uniform float uHandHeight;
uniform float uMorphProgress;
uniform float uTemplateFrom;
uniform float uTemplateTo;
uniform float uSizeScale;

attribute vec3 aTargetPosition;
attribute vec3 aRandomVec;
attribute float aSize;
attribute float aSpeed;

varying vec3 vColor;
varying float vAlpha;

float hash(vec3 value) {
  value = fract(value * 0.3183099 + vec3(0.1));
  value *= 17.0;
  return fract(value.x * value.y * value.z * (value.x + value.y + value.z));
}

float noise(vec3 value) {
  vec3 base = floor(value);
  vec3 fraction = fract(value);
  fraction = fraction * fraction * (3.0 - 2.0 * fraction);

  return mix(
    mix(
      mix(hash(base + vec3(0.0, 0.0, 0.0)), hash(base + vec3(1.0, 0.0, 0.0)), fraction.x),
      mix(hash(base + vec3(0.0, 1.0, 0.0)), hash(base + vec3(1.0, 1.0, 0.0)), fraction.x),
      fraction.y
    ),
    mix(
      mix(hash(base + vec3(0.0, 0.0, 1.0)), hash(base + vec3(1.0, 0.0, 1.0)), fraction.x),
      mix(hash(base + vec3(0.0, 1.0, 1.0)), hash(base + vec3(1.0, 1.0, 1.0)), fraction.x),
      fraction.y
    ),
    fraction.z
  );
}

vec3 hsl2rgb(vec3 color) {
  vec3 rgb = clamp(abs(mod(color.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return color.z + color.y * (rgb - 0.5) * (1.0 - abs(2.0 * color.z - 1.0));
}

vec3 safeNormalize(vec3 value) {
  float magnitude = length(value);
  if (magnitude < 0.0001) {
    return vec3(0.0, 1.0, 0.0);
  }

  return value / magnitude;
}

vec3 templateMotion(vec3 pos, float mode, vec3 randomVec, float time, float energy) {
  vec3 offset = vec3(0.0);

  if (mode < 0.5) {
    float spiralAngle = atan(pos.y, pos.x) + time * 0.5;
    float spiralRadius = length(pos.xy);
    offset.xy += vec2(cos(spiralAngle), sin(spiralAngle)) * spiralRadius * 0.055;
    offset.z += sin(spiralAngle * 2.0 + time) * 0.22;
  } else if (mode < 1.5) {
    float coil = atan(pos.z, pos.x) + time * 1.05;
    offset.x += cos(coil) * 0.55;
    offset.z += sin(coil) * 0.55;
    offset.y += sin(time * 1.8 + pos.y * 0.55 + randomVec.y * 6.2831) * 0.16;
  } else if (mode < 2.5) {
    float vortex = atan(pos.z, pos.x) + time * 0.9;
    float radius = length(pos.xz);
    offset.x += cos(vortex) * radius * 0.065;
    offset.z += sin(vortex) * radius * 0.065;
    offset.y += sin(time * 1.4 + radius * 0.4 + randomVec.x * 6.2831) * 0.32;
  } else if (mode < 3.5) {
    offset.x += sin(time * 1.1 + pos.y * 0.4 + randomVec.x * 6.2831) * 0.26;
    offset.y += cos(time * 1.3 + pos.x * 0.35 + randomVec.y * 6.2831) * 0.24;
    offset.z += sin(time * 1.4 + pos.z * 0.35 + randomVec.z * 6.2831) * 0.26;
  } else if (mode < 4.5) {
    offset += sign(pos) * (sin(time * 1.1 + randomVec.x * 6.2831) * 0.35);
  } else if (mode < 5.5) {
    float flap = sin(time * 2.2 + pos.y * 0.45 + randomVec.x * 6.2831);
    offset.x += flap * sign(pos.x) * 0.62;
    offset.y += cos(time * 1.4 + abs(pos.x) * 0.22) * 0.28;
    offset.z += sin(time + pos.y * 0.15) * 0.22;
  } else if (mode < 6.5) {
    offset.y += sin(pos.x * 0.45 + time * 1.7 + randomVec.x * 6.2831) * 0.5;
    offset.z += cos(pos.x * 0.25 + time * 1.2 + randomVec.z * 6.2831) * 0.18;
  } else if (mode < 7.5) {
    float tunnel = atan(pos.y, pos.x) + time * 1.2;
    float radius = length(pos.xy);
    offset.x += cos(tunnel) * radius * 0.08;
    offset.y += sin(tunnel) * radius * 0.08;
    offset.z += sin(time * 1.5 + radius * 0.4) * 0.3;
  } else if (mode < 8.5) {
    offset.x += sin(time * 1.1 + pos.y * 0.35 + randomVec.x * 6.2831) * 0.48;
    offset.y += cos(time * 1.25 + pos.z * 0.28 + randomVec.y * 6.2831) * 0.36;
    offset.z += sin(time * 1.55 + pos.x * 0.22 + randomVec.z * 6.2831) * 0.48;
  } else if (mode < 9.5) {
    offset.x += sin(time * 0.9 + pos.y * 0.3 + randomVec.x * 6.2831) * 0.28;
    offset.y += cos(time * 1.1 + pos.z * 0.25 + randomVec.y * 6.2831) * 0.24;
    offset.z += sin(time * 0.8 + pos.x * 0.28 + randomVec.z * 6.2831) * 0.28;
  } else if (mode < 10.5) {
    float swirl = time * 0.8 + randomVec.y * 6.2831;
    float ring = smoothstep(2.4, 10.0, length(pos.xz));
    offset.x += sin(swirl + pos.z * 0.18) * 0.4 * ring;
    offset.z += cos(swirl + pos.x * 0.18) * 0.4 * ring;
    offset.y += sin(swirl * 1.9 + randomVec.x * 4.0) * 0.1;
  } else if (mode < 11.5) {
    float flame = sin(time * 2.0 + abs(pos.x) * 0.3 + randomVec.x * 6.2831);
    offset.y += abs(flame) * 0.72;
    offset.x += sign(pos.x) * flame * 0.35;
    offset.z += cos(time * 1.6 + pos.y * 0.2) * 0.16;
  } else if (mode < 12.5) {
    float sway = sin(time * 0.9 + pos.y * 0.3 + randomVec.x * 6.2831);
    offset.x += sway * (0.12 + max(pos.y, 0.0) * 0.03);
    offset.z += cos(time * 0.8 + pos.y * 0.28 + randomVec.y * 6.2831) * (0.1 + max(pos.y, 0.0) * 0.025);
  } else if (mode < 13.5) {
    offset += vec3(
      sin(time * 1.3 + pos.y * 0.32 + randomVec.x * 6.2831),
      cos(time * 1.1 + pos.x * 0.28 + randomVec.y * 6.2831),
      sin(time * 1.5 + pos.z * 0.36 + randomVec.z * 6.2831)
    ) * 0.34;
  } else if (mode < 14.5) {
    float flicker = step(0.55, fract(sin(dot(pos.xy + randomVec.xy, vec2(12.9898, 78.233)) + time * 18.0) * 43758.5453));
    offset.x += (randomVec.x - 0.5) * flicker * 0.9;
    offset.z += (randomVec.z - 0.5) * flicker * 0.9;
  } else if (mode < 15.5) {
    offset.y += sin(pos.x * 0.38 + time * 1.2 + randomVec.x * 6.2831) * 0.5;
    offset.y += cos(pos.z * 0.3 + time * 1.05 + randomVec.y * 6.2831) * 0.4;
  } else if (mode < 16.5) {
    offset.y -= fract(time * 0.28 + randomVec.x) * 1.2;
    offset.x += sin(time * 0.7 + randomVec.y * 6.2831) * 0.18;
    offset.z += cos(time * 0.6 + randomVec.z * 6.2831) * 0.18;
  } else if (mode < 17.5) {
    float orbit = atan(pos.z, pos.x) + time * (0.35 + fract(length(pos.xz) * 0.15) * 0.55);
    float radius = length(pos.xz);
    offset.x += cos(orbit) * radius * 0.04;
    offset.z += sin(orbit) * radius * 0.04;
  } else if (mode < 18.5) {
    float ringAngle = atan(pos.z, pos.x) + time * 0.95;
    float ringRadius = length(pos.xz);
    offset.x += cos(ringAngle) * ringRadius * 0.08;
    offset.z += sin(ringAngle) * ringRadius * 0.08;
    offset.y += sin(ringAngle * 4.0 + time * 2.0) * 0.22;
  } else {
    offset += safeNormalize(pos) * (sin(time * 1.4 + randomVec.x * 6.2831) * 0.26);
    offset.y += cos(time * 1.2 + abs(pos.y) * 0.25) * 0.12;
  }

  return offset * (0.45 + energy * 0.8);
}

void main() {
  vec3 basePosition = mix(position, aTargetPosition, uMorphProgress);
  vec3 motionFrom = templateMotion(position, uTemplateFrom, aRandomVec, uTime, uEnergy);
  vec3 motionTo = templateMotion(aTargetPosition, uTemplateTo, aRandomVec, uTime, uEnergy);
  vec3 templateOffset = mix(motionFrom, motionTo, uMorphProgress);

  float fieldNoise = noise(vec3(basePosition.xy * 0.16, uTime * 0.18 + aRandomVec.z * 8.0));
  vec3 drift = (aRandomVec - 0.5) * (fieldNoise - 0.45) * 1.15;
  vec3 animatedPosition = basePosition + templateOffset + drift;

  vec3 handDelta = uHandPos - animatedPosition;
  float handDistance = length(handDelta);
  vec3 handDirection = safeNormalize(handDelta);

  float repel = uOpenIntensity * smoothstep(18.0, 0.6, handDistance) * (1.0 + aRandomVec.x * 0.8);
  float attract = uFistIntensity * smoothstep(22.0, 0.5, handDistance) * (1.1 + aRandomVec.y * 0.5);

  animatedPosition -= handDirection * repel * 1.9;
  animatedPosition += handDirection * attract * (0.3 + handDistance * 0.14);
  animatedPosition += safeNormalize(animatedPosition) * uOpenIntensity * 0.45;

  vec4 mvPosition = modelViewMatrix * vec4(animatedPosition, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  float sizeBoost = 1.0 + uOpenIntensity * 0.5 + uFistIntensity * 0.35 + uEnergy * 0.45;
  gl_PointSize = uSizeScale * aSize * sizeBoost / max(1.0, -mvPosition.z);

  float hue = fract(
    0.55 +
    uHandHeight * 0.34 +
    uTemplateTo * 0.07 +
    fieldNoise * 0.16 +
    aRandomVec.x * 0.18 -
    uTime * 0.018
  );
  float saturation = 0.7 + uOpenIntensity * 0.18 + fieldNoise * 0.12;
  float lightness = 0.44 + aSize * 0.13 + uEnergy * 0.18 + uFistIntensity * 0.12;

  vColor = hsl2rgb(vec3(hue, saturation, lightness));
  vAlpha = 0.48 + uEnergy * 0.28 + aRandomVec.z * 0.18;
}
