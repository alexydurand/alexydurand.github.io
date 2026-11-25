import { createShader } from './shader';

// Northern lights: three wavy curtains with vertical rays, green at their lower edge and violet higher
// up, whose colours drift between two pairs over a few minutes. Premultiplied alpha: the page's
// black shows through where the sky is empty.
const FRAGMENT = `
precision highp float;
uniform vec2 resolution;
uniform float time;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  float x = uv.x * resolution.x / resolution.y;
  float t = time;

  float drift = 0.5 + 0.5 * sin(t * 0.035);
  vec3 low = mix(vec3(0.2, 1.0, 0.55), vec3(0.15, 0.9, 0.85), drift);
  vec3 high = mix(vec3(0.55, 0.3, 1.0), vec3(1.0, 0.35, 0.75), drift);

  // A faint violet haze high in the sky
  vec3 color = high * 0.07 * uv.y * uv.y;
  for (int i = 0; i < 3; i++) {
    float k = float(i);
    float sx = x + k * 4.7;
    // The curtain's lower edge, folding slowly
    float edge = 0.32 + 0.13 * k
      + 0.8 * (fbm(vec2(sx * 0.8, t * 0.02 + k * 5.0)) - 0.5)
      + 0.07 * sin(sx * 2.3 + t * 0.05 + k);
    float d = uv.y - edge;
    // Brightest at its lower edge, fading slowly above it and quickly below
    float curtain = smoothstep(-0.1, 0.0, d) * exp(-max(d, 0.0) * (4.5 + k));
    // Bright in places, gone in others: curtains, not a band
    curtain *= smoothstep(0.25, 0.6, fbm(vec2(sx * 0.6 - t * 0.015, k * 3.0)));
    // Thin vertical rays, slowly sliding
    float rays = noise(vec2(sx * 80.0 + t * 0.1, d * 1.5 - t * 0.05)) * 0.45
      + noise(vec2(sx * 30.0 - t * 0.05, d * 0.8)) * 0.35
      + fbm(vec2(sx * 6.0 - t * 0.03, d * 0.5)) * 0.4;
    rays = 0.2 + 2.2 * pow(rays, 2.5);
    color += mix(low, high, smoothstep(0.02, 0.3, d)) * curtain * rays * (1.6 - 0.35 * k);
  }
  // Soft ceiling: the name, light, stays readable over the brightest light
  color = 0.62 * (1.0 - exp(-color * 1.6));
  gl_FragColor = vec4(color, max(max(color.r, color.g), color.b));
}`;

/** Renders at the canvas's width and height attributes. Returns null without WebGL. */
export const createAurora = (canvas: HTMLCanvasElement) => createShader(canvas, FRAGMENT);
