varying vec3 vColor;
varying float vAlpha;

void main() {
  vec2 uv = gl_PointCoord - vec2(0.5);
  float dist = length(uv);

  if (dist > 0.5) {
    discard;
  }

  float core = smoothstep(0.22, 0.0, dist);
  float glow = smoothstep(0.5, 0.08, dist);
  float halo = exp(-dist * 7.5);
  float alpha = (glow * 0.7 + core * 0.55 + halo * 0.35) * vAlpha;

  vec3 color = vColor * (1.0 + core * 0.4 + halo * 0.65);
  gl_FragColor = vec4(color, alpha);
}
