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
    float pulse = sin(time * 1.9 + length(pos.xy) * 1.4 + randomVec.x * 6.2831);
    offset.xy += safeNormalize(vec3(pos.xy, 0.0)).xy * pulse * 0.28;
    offset.z += sin(time * 1.1 + randomVec.z * 8.0) * 0.32;
  } else if (mode < 1.5) {
    float angle = atan(pos.y, pos.x) + time * 0.35;
    float petal = sin(angle * 7.0 - time * 1.4 + randomVec.x * 6.2831);
    offset.xy += vec2(cos(angle), sin(angle)) * petal * 0.42;
    offset.z += sin(angle * 2.0 + time) * 0.24;
  } else if (mode < 2.5) {
    float ring = smoothstep(3.2, 9.4, length(pos.xz));
    float swirl = time * 0.7 + randomVec.y * 6.2831;
    offset.x += sin(swirl + pos.z * 0.18) * 0.46 * ring;
    offset.z += cos(swirl + pos.x * 0.18) * 0.46 * ring;
    offset.y += sin(swirl * 1.7 + randomVec.x * 4.0) * 0.12;
  } else if (mode < 3.5) {
    vec3 direction = safeNormalize(pos + (randomVec - 0.5) * 2.0);
    float burst = sin((time * 1.3 + randomVec.x * 4.0) * 1.2) * 0.5 + 0.5;
    offset += direction * burst * 1.4;
  } else if (mode < 4.5) {
    float spiralAngle = atan(pos.y, pos.x) + time * 0.5;
    float spiralRadius = length(pos.xy);
    offset.xy += vec2(cos(spiralAngle), sin(spiralAngle)) * spiralRadius * 0.055;
    offset.z += sin(spiralAngle * 2.0 + time) * 0.22;
  } else {
    offset.y += sin(pos.x * 0.4 + time * 1.3 + randomVec.x * 6.2831) * 0.55;
    offset.y += cos(pos.z * 0.3 + time + randomVec.y * 6.2831) * 0.4;
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
