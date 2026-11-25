const VERTEX = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

/**
 * A canvas painted by one fragment shader, given `resolution` (the canvas's width and height attributes)
 * and `time` in seconds. Returns null without WebGL.
 */
export function createShader(canvas: HTMLCanvasElement, fragment: string) {
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
  attach(gl.FRAGMENT_SHADER, fragment);
  gl.linkProgram(program);
  gl.useProgram(program);

  // One triangle covering the whole canvas
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const resolution = gl.getUniformLocation(program, 'resolution');
  const time = gl.getUniformLocation(program, 'time');

  return {
    gl,
    program,
    draw(seconds: number) {
      // Every time: the canvas may have been resized
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(resolution, canvas.width, canvas.height);
      gl.uniform1f(time, seconds);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    },
  };
}
