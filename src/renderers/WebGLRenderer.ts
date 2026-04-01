/**
 * WebGL Renderer
 * High-performance WebGL 2.0 rendering with batching and shader management
 */

import type { Rect, Color } from '@typedefs/index';
import { EventManager } from '@core/EventManager';

const VERTEX_SHADER_SOURCE = `#version 300 es
precision highp float;
in vec2 a_position;
in vec2 a_texCoord;
in vec4 a_color;
uniform mat3 u_projection;
uniform mat3 u_transform;
out vec2 v_texCoord;
out vec4 v_color;
void main() {
    vec3 pos = u_projection * u_transform * vec3(a_position, 1.0);
    gl_Position = vec4(pos.xy, 0.0, 1.0);
    v_texCoord = a_texCoord;
    v_color = a_color;
}`;

const FRAGMENT_SHADER_SOURCE = `#version 300 es
precision highp float;
in vec2 v_texCoord;
in vec4 v_color;
uniform sampler2D u_texture;
uniform float u_useTexture;
out vec4 fragColor;
void main() {
    if (u_useTexture > 0.5) { fragColor = texture(u_texture, v_texCoord) * v_color; }
    else { fragColor = v_color; }
    if (fragColor.a < 0.01) discard;
}`;

const PARTICLE_VERTEX_SHADER = `#version 300 es
precision highp float;
in vec2 a_position;
in vec2 a_texCoord;
in vec4 a_color;
in float a_size;
uniform mat3 u_projection;
uniform mat3 u_view;
out vec2 v_texCoord;
out vec4 v_color;
void main() {
    vec3 pos = u_projection * u_view * vec3(a_position * a_size, 1.0);
    gl_Position = vec4(pos.xy, 0.0, 1.0);
    gl_PointSize = a_size;
    v_texCoord = a_texCoord;
    v_color = a_color;
}`;

const PARTICLE_FRAGMENT_SHADER = `#version 300 es
precision highp float;
in vec2 v_texCoord;
in vec4 v_color;
uniform sampler2D u_texture;
out vec4 fragColor;
void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;
    float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
    fragColor = vec4(v_color.rgb, v_color.a * alpha);
}`;

interface Batch {
  vertices: Float32Array; texCoords: Float32Array; colors: Float32Array;
  indices: Uint16Array; vertexCount: number; indexCount: number; texture: WebGLTexture | null;
}

interface ShaderProgram {
  program: WebGLProgram;
  attribs: { [key: string]: number };
  uniforms: { [key: string]: WebGLUniformLocation };
}

export class WebGLRenderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext;
  private events: EventManager;
  private defaultShader: ShaderProgram | null = null;
  private particleShader: ShaderProgram | null = null;
  private currentShader: ShaderProgram | null = null;
  private currentBatch: Batch | null = null;
  private maxBatchSize: number = 1000;
  private vao: WebGLVertexArrayObject | null = null;
  private vertexBuffer: WebGLBuffer | null = null;
  private texCoordBuffer: WebGLBuffer | null = null;
  private colorBuffer: WebGLBuffer | null = null;
  private indexBuffer: WebGLBuffer | null = null;
  private viewport: Rect = { x: 0, y: 0, width: 0, height: 0 };
  private projectionMatrix: Float32Array = new Float32Array(9);
  private clearColor: Color = { r: 0.1, g: 0.1, b: 0.15, a: 1 };
  private textures: Map<string, WebGLTexture> = new Map();
  private drawCalls: number = 0;
  private triangleCount: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.events = EventManager.getInstance();
    const gl = canvas.getContext('webgl2', {
      alpha: false, antialias: true, depth: false, stencil: false,
      premultipliedAlpha: false, preserveDrawingBuffer: false,
    });
    if (!gl) throw new Error('WebGL 2.0 not supported');
    this.gl = gl;
    this.init();
  }

  private init(): void { this.setupWebGL(); this.createShaders(); this.createBuffers(); this.setupMatrices(); }

  private setupWebGL(): void {
    const gl = this.gl;
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.disable(gl.DEPTH_TEST); this.resize(this.canvas.width, this.canvas.height);
  }

  private createShader(type: number, source: string): WebGLShader | null {
    const gl = this.gl; const shader = gl.createShader(type); if (!shader) return null;
    gl.shaderSource(shader, source); gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader)); gl.deleteShader(shader); return null;
    }
    return shader;
  }

  private createProgram(vsSource: string, fsSource: string): ShaderProgram | null {
    const gl = this.gl;
    const vs = this.createShader(gl.VERTEX_SHADER, vsSource);
    const fs = this.createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return null;
    const program = gl.createProgram(); if (!program) return null;
    gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { console.error('Program link error:', gl.getProgramInfoLog(program)); return null; }
    const attribs: { [key: string]: number } = {};
    const uniforms: { [key: string]: WebGLUniformLocation } = {};
    const numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    for (let i = 0; i < numAttribs; i++) { const info = gl.getActiveAttrib(program, i); if (info) { attribs[info.name] = gl.getAttribLocation(program, info.name); } }
    const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < numUniforms; i++) { const info = gl.getActiveUniform(program, i); if (info) { const loc = gl.getUniformLocation(program, info.name); if (loc) uniforms[info.name] = loc; } }
    return { program, attribs, uniforms };
  }

  private createShaders(): void {
    this.defaultShader = this.createProgram(VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
    this.particleShader = this.createProgram(PARTICLE_VERTEX_SHADER, PARTICLE_FRAGMENT_SHADER);
    if (!this.defaultShader || !this.particleShader) throw new Error('Failed to create shaders');
  }

  private createBuffers(): void {
    const gl = this.gl;
    this.vao = gl.createVertexArray(); gl.bindVertexArray(this.vao);
    this.vertexBuffer = gl.createBuffer(); this.texCoordBuffer = gl.createBuffer();
    this.colorBuffer = gl.createBuffer(); this.indexBuffer = gl.createBuffer();
    gl.enableVertexAttribArray(0); gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(1); gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer); gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(2); gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer); gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
  }

  private setupMatrices(): void {
    const w = this.canvas.width; const h = this.canvas.height;
    this.projectionMatrix[0] = 2 / w; this.projectionMatrix[1] = 0; this.projectionMatrix[2] = 0;
    this.projectionMatrix[3] = 0; this.projectionMatrix[4] = -2 / h; this.projectionMatrix[5] = 0;
    this.projectionMatrix[6] = -1; this.projectionMatrix[7] = 1; this.projectionMatrix[8] = 1;
  }

  resize(width: number, height: number): void {
    this.canvas.width = width; this.canvas.height = height;
    this.gl.viewport(0, 0, width, height); this.setupMatrices();
    this.viewport = { x: 0, y: 0, width, height };
  }

  createTexture(key: string, image: HTMLImageElement | HTMLCanvasElement): WebGLTexture {
    const gl = this.gl;
    let texture = this.textures.get(key); if (texture) return texture;
    texture = gl.createTexture(); if (!texture) throw new Error('Failed to create texture');
    gl.bindTexture(gl.TEXTURE_2D, texture); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this.textures.set(key, texture); return texture;
  }

  beginFrame(): void {
    const gl = this.gl;
    gl.clearColor(this.clearColor.r, this.clearColor.g, this.clearColor.b, this.clearColor.a);
    gl.clear(gl.COLOR_BUFFER_BIT);
    this.drawCalls = 0; this.triangleCount = 0; this.currentBatch = null;
  }

  useShader(shader: ShaderProgram): void {
    if (this.currentShader === shader) return;
    this.flush(); this.gl.useProgram(shader.program); this.currentShader = shader;
    if (shader.uniforms['u_projection']) { this.gl.uniformMatrix3fv(shader.uniforms['u_projection'], false, this.projectionMatrix); }
  }

  flush(): void {
    if (!this.currentBatch || this.currentBatch.vertexCount === 0) return;
    const gl = this.gl; const batch = this.currentBatch;
    if (batch.texture) {
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, batch.texture);
      if (this.currentShader?.uniforms['u_texture']) { gl.uniform1i(this.currentShader.uniforms['u_texture'], 0); }
      if (this.currentShader?.uniforms['u_useTexture']) { gl.uniform1f(this.currentShader.uniforms['u_useTexture'], 1); }
    } else {
      if (this.currentShader?.uniforms['u_useTexture']) { gl.uniform1f(this.currentShader.uniforms['u_useTexture'], 0); }
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer); gl.bufferData(gl.ARRAY_BUFFER, batch.vertices.subarray(0, batch.vertexCount * 2), gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer); gl.bufferData(gl.ARRAY_BUFFER, batch.texCoords.subarray(0, batch.vertexCount * 2), gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer); gl.bufferData(gl.ARRAY_BUFFER, batch.colors.subarray(0, batch.vertexCount * 4), gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, batch.indices.subarray(0, batch.indexCount), gl.DYNAMIC_DRAW);
    gl.bindVertexArray(this.vao); gl.drawElements(gl.TRIANGLES, batch.indexCount, gl.UNSIGNED_SHORT, 0);
    this.drawCalls++; this.triangleCount += batch.indexCount / 3;
    batch.vertexCount = 0; batch.indexCount = 0;
  }

  drawRect(rect: Rect, color: Color, rotation: number = 0): void {
    this.useShader(this.defaultShader!);
    if (!this.currentBatch || this.currentBatch.vertexCount >= this.maxBatchSize * 4) { this.flush(); this.currentBatch = this.createBatch(); }
    const batch = this.currentBatch;
    const cx = rect.x + rect.width / 2; const cy = rect.y + rect.height / 2;
    const cos = Math.cos(rotation); const sin = Math.sin(rotation);
    const verts = [-rect.width / 2, -rect.height / 2, rect.width / 2, -rect.height / 2, rect.width / 2, rect.height / 2, -rect.width / 2, rect.height / 2];
    for (let i = 0; i < 4; i++) {
      const x = verts[i * 2]; const y = verts[i * 2 + 1];
      batch.vertices[batch.vertexCount * 2] = cx + x * cos - y * sin;
      batch.vertices[batch.vertexCount * 2 + 1] = cy + x * sin + y * cos;
      batch.texCoords[batch.vertexCount * 2] = i === 0 || i === 3 ? 0 : 1;
      batch.texCoords[batch.vertexCount * 2 + 1] = i < 2 ? 0 : 1;
      batch.colors[batch.vertexCount * 4] = color.r; batch.colors[batch.vertexCount * 4 + 1] = color.g;
      batch.colors[batch.vertexCount * 4 + 2] = color.b; batch.colors[batch.vertexCount * 4 + 3] = color.a;
      batch.vertexCount++;
    }
    const base = batch.vertexCount - 4;
    batch.indices[batch.indexCount++] = base; batch.indices[batch.indexCount++] = base + 1; batch.indices[batch.indexCount++] = base + 2;
    batch.indices[batch.indexCount++] = base; batch.indices[batch.indexCount++] = base + 2; batch.indices[batch.indexCount++] = base + 3;
  }

  drawSprite(x: number, y: number, width: number, height: number, textureKey: string, color: Color = { r: 1, g: 1, b: 1, a: 1 }, rotation: number = 0): void {
    const texture = this.textures.get(textureKey); if (!texture) return;
    this.useShader(this.defaultShader!);
    if (this.currentBatch?.texture !== texture) { this.flush(); this.currentBatch = this.createBatch(texture); }
    if (!this.currentBatch || this.currentBatch.vertexCount >= this.maxBatchSize * 4) { this.flush(); this.currentBatch = this.createBatch(texture); }
    const batch = this.currentBatch; const hw = width / 2; const hh = height / 2;
    const cos = Math.cos(rotation); const sin = Math.sin(rotation);
    const localVerts = [-hw, -hh, hw, -hh, hw, hh, -hw, hh];
    for (let i = 0; i < 4; i++) {
      const lx = localVerts[i * 2]; const ly = localVerts[i * 2 + 1];
      batch.vertices[batch.vertexCount * 2] = x + lx * cos - ly * sin;
      batch.vertices[batch.vertexCount * 2 + 1] = y + lx * sin + ly * cos;
      batch.texCoords[batch.vertexCount * 2] = i === 0 || i === 3 ? 0 : 1; batch.texCoords[batch.vertexCount * 2 + 1] = i < 2 ? 0 : 1;
      batch.colors[batch.vertexCount * 4] = color.r; batch.colors[batch.vertexCount * 4 + 1] = color.g;
      batch.colors[batch.vertexCount * 4 + 2] = color.b; batch.colors[batch.vertexCount * 4 + 3] = color.a;
      batch.vertexCount++;
    }
    const base = batch.vertexCount - 4;
    batch.indices[batch.indexCount++] = base; batch.indices[batch.indexCount++] = base + 1; batch.indices[batch.indexCount++] = base + 2;
    batch.indices[batch.indexCount++] = base; batch.indices[batch.indexCount++] = base + 2; batch.indices[batch.indexCount++] = base + 3;
  }

  private createBatch(texture: WebGLTexture | null = null): Batch {
    return {
      vertices: new Float32Array(this.maxBatchSize * 4 * 2), texCoords: new Float32Array(this.maxBatchSize * 4 * 2),
      colors: new Float32Array(this.maxBatchSize * 4 * 4), indices: new Uint16Array(this.maxBatchSize * 6),
      vertexCount: 0, indexCount: 0, texture,
    };
  }

  endFrame(): void {
    this.flush();
    this.events.emit('render:stats', { drawCalls: this.drawCalls, triangles: this.triangleCount });
  }

  getStats(): { drawCalls: number; triangles: number } { return { drawCalls: this.drawCalls, triangles: this.triangleCount }; }

  destroy(): void {
    const gl = this.gl;
    for (const texture of this.textures.values()) { gl.deleteTexture(texture); } this.textures.clear();
    if (this.vao) gl.deleteVertexArray(this.vao);
    if (this.vertexBuffer) gl.deleteBuffer(this.vertexBuffer);
    if (this.texCoordBuffer) gl.deleteBuffer(this.texCoordBuffer);
    if (this.colorBuffer) gl.deleteBuffer(this.colorBuffer);
    if (this.indexBuffer) gl.deleteBuffer(this.indexBuffer);
    if (this.defaultShader) gl.deleteProgram(this.defaultShader.program);
    if (this.particleShader) gl.deleteProgram(this.particleShader.program);
  }
}
