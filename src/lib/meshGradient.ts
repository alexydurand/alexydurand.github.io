// Moving mesh gradient after MeshGradient from Paper Shaders (Apache-2.0, github.com/paper-design/shaders),
// ported to plain WebGL: the home page must not load a shader library for one small ghost.
const VERTEX = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const FRAGMENT = `
precision highp float;
uniform vec2 resolution;
uniform float time;
uniform vec3 colors[5];

const float DISTORTION = 0.8;
const float SWIRL = 0.1;

vec2 orbit(float i, float t) {
  float a = i * 0.37;
  float b = 0.6 + mod(i, 3.0) * 0.3;
  float c = 0.8 + mod(i + 1.0, 4.0) * 0.25;
  return 0.5 + 0.5 * vec2(sin(t * b + a), cos(t * c + a * 1.5));
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  float t = 0.5 * time;

  float radius = smoothstep(0.0, 1.0, length(uv - 0.5));
  float center = 1.0 - radius;
  for (int n = 1; n <= 2; n++) {
    float i = float(n);
    uv.x += DISTORTION * center / i * sin(t + i * 0.4 * smoothstep(0.0, 1.0, uv.y)) * cos(0.2 * t + i * 2.4 * smoothstep(0.0, 1.0, uv.y));
    uv.y += DISTORTION * center / i * cos(t + i * 2.0 * smoothstep(0.0, 1.0, uv.x));
  }

  float angle = -3.0 * SWIRL * radius;
  uv = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * (uv - 0.5) + 0.5;

  vec3 color = vec3(0.0);
  float total = 0.0;
  for (int i = 0; i < 5; i++) {
    float weight = 1.0 / (pow(length(uv - orbit(float(i), t)), 3.5) + 0.001);
    color += colors[i] * weight;
    total += weight;
  }
  gl_FragColor = vec4(color / total, 1.0);
}`;

const rgb = (hex: number) => [
  ((hex >> 16) & 255) / 255,
  ((hex >> 8) & 255) / 255,
  (hex & 255) / 255,
];
// The demo's colours, its two darkest lifted: on the black square they would swallow the outline and the eyes
const COLORS = [0xffb3d9, 0x87ceeb, 0x4a90e2, 0x5b7a9d, 0x5f55a0].flatMap(rgb);

/** Renders at the canvas's width and height attributes. Returns null without WebGL. */
export function createMeshGradient(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext('webgl');
  if (!gl) return null;

  const program = gl.createProgram();
  const attach = (type: GLenum, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    gl.attachShader(program, shader);
    gl.deleteShader(shader);
  };
  attach(gl.VERTEX_SHADER, VERTEX);
  attach(gl.FRAGMENT_SHADER, FRAGMENT);
  gl.linkProgram(program);
  gl.useProgram(program);

  // One triangle covering the whole canvas
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  gl.uniform2f(gl.getUniformLocation(program, 'resolution'), canvas.width, canvas.height);
  gl.uniform3fv(gl.getUniformLocation(program, 'colors'), COLORS);
  const time = gl.getUniformLocation(program, 'time');

  return {
    draw(seconds: number) {
      gl.uniform1f(time, seconds);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    },
  };
}
