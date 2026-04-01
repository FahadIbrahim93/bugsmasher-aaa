/**
 * Particle Texture Generator
 * Canvas-drawn particle textures for WebGL particle system
 */

function createCanvas(size: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  return { canvas, ctx };
}

// ─── BLOOD SPLATTER ─────────────────────────────────────────────────────────

function generateBloodSplatter(size: number, variant: number): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(size);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 1;

  const colors = ['#8B0000', '#FF0000', '#DC143C', '#B71C1C'];
  const color = colors[variant % colors.length];

  // Irregular blob shape
  ctx.fillStyle = color;
  ctx.beginPath();
  const points = 8 + Math.floor(Math.random() * 4);
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const radiusVar = r * (0.6 + Math.random() * 0.4);
    const x = cx + Math.cos(angle) * radiusVar;
    const y = cy + Math.sin(angle) * radiusVar;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  // Highlight
  ctx.fillStyle = 'rgba(255, 100, 100, 0.5)';
  ctx.beginPath();
  ctx.arc(cx - r * 0.2, cy - r * 0.2, r * 0.25, 0, Math.PI * 2);
  ctx.fill();

  return canvas;
}

// ─── EXPLOSION ──────────────────────────────────────────────────────────────

function generateExplosion(size: number, variant: number): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(size);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 1;

  const colors = [
    ['#FFA500', '#FF4500'],
    ['#FFD700', '#FF8C00'],
    ['#FFFFFF', '#FFD700'],
    ['#FF6347', '#FF0000'],
  ];
  const [inner, outer] = colors[variant % colors.length];

  // Radial gradient burst
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  grad.addColorStop(0, '#FFFFFF');
  grad.addColorStop(0.2, inner);
  grad.addColorStop(0.6, outer);
  grad.addColorStop(1, 'rgba(255, 69, 0, 0)');

  // Star burst shape
  ctx.fillStyle = grad;
  ctx.beginPath();
  const spikes = 8 + variant * 2;
  for (let i = 0; i <= spikes * 2; i++) {
    const angle = (i / (spikes * 2)) * Math.PI * 2;
    const radius = i % 2 === 0 ? r : r * 0.5;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  // Core glow
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.15, 0, Math.PI * 2);
  ctx.fill();

  return canvas;
}

// ─── SPARK ──────────────────────────────────────────────────────────────────

function generateSpark(size: number, variant: number): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(size);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 1;

  const colors = ['#FFFF00', '#FFFFFF', '#00FFFF', '#FFD700'];
  const color = colors[variant % colors.length];

  // Diamond shape
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx + r * 0.5, cy);
  ctx.lineTo(cx, cy + r);
  ctx.lineTo(cx - r * 0.5, cy);
  ctx.closePath();
  ctx.fill();

  // Center glow
  ctx.shadowColor = color;
  ctx.shadowBlur = size * 0.3;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  return canvas;
}

// ─── DUST PUFF ──────────────────────────────────────────────────────────────

function generateDustPuff(size: number, variant: number): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(size);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 1;

  const alphas = [0.3, 0.4, 0.5, 0.35];
  const alpha = alphas[variant % alphas.length];

  // Soft circle with feathered edge
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  grad.addColorStop(0, `rgba(180, 160, 140, ${alpha})`);
  grad.addColorStop(0.5, `rgba(160, 140, 120, ${alpha * 0.6})`);
  grad.addColorStop(1, 'rgba(140, 120, 100, 0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Tiny particles inside
  ctx.fillStyle = `rgba(200, 180, 160, ${alpha * 0.5})`;
  for (let i = 0; i < 3; i++) {
    const px = cx + (Math.random() - 0.5) * r;
    const py = cy + (Math.random() - 0.5) * r;
    ctx.beginPath();
    ctx.arc(px, py, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas;
}

// ─── SCORE POPUP DIGITS ─────────────────────────────────────────────────────

function generateScoreDigit(digit: string, size: number, color: string): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(size);

  ctx.font = `bold ${size * 0.8}px 'Segoe UI', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Glow
  ctx.shadowColor = color;
  ctx.shadowBlur = size * 0.15;
  ctx.fillStyle = color;
  ctx.fillText(digit, size / 2, size / 2);

  // White core
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#FFFFFF';
  ctx.globalAlpha = 0.7;
  ctx.fillText(digit, size / 2, size / 2);
  ctx.globalAlpha = 1;

  return canvas;
}

// ─── SMOKE ──────────────────────────────────────────────────────────────────

function generateSmoke(size: number, variant: number): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(size);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 1;

  const alphas = [0.15, 0.2, 0.12, 0.18];
  const alpha = alphas[variant % alphas.length];

  // Multiple overlapping circles for puffy look
  const offsets = [
    { x: 0, y: 0, s: 1 },
    { x: -r * 0.3, y: -r * 0.2, s: 0.7 },
    { x: r * 0.3, y: -r * 0.15, s: 0.6 },
    { x: 0, y: r * 0.3, s: 0.5 },
  ];

  for (const o of offsets) {
    const grad = ctx.createRadialGradient(
      cx + o.x, cy + o.y, 0,
      cx + o.x, cy + o.y, r * o.s,
    );
    grad.addColorStop(0, `rgba(100, 100, 100, ${alpha})`);
    grad.addColorStop(1, 'rgba(80, 80, 80, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx + o.x, cy + o.y, r * o.s, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas;
}

// ─── TEXTURE ATLAS ──────────────────────────────────────────────────────────

export interface ParticleAtlas {
  canvas: HTMLCanvasElement;
  regions: Map<string, { x: number; y: number; w: number; h: number }>;
}

export function generateParticleAtlas(): ParticleAtlas {
  const padding = 2;
  const particleSize = 32;
  const cols = 8;
  const types = [
    { name: 'blood', generator: generateBloodSplatter, count: 4 },
    { name: 'explosion', generator: generateExplosion, count: 4 },
    { name: 'spark', generator: generateSpark, count: 4 },
    { name: 'dust', generator: generateDustPuff, count: 4 },
    { name: 'smoke', generator: generateSmoke, count: 4 },
  ];

  const totalParticles = types.reduce((sum, t) => sum + t.count, 0);
  const rows = Math.ceil(totalParticles / cols);
  const atlasW = cols * (particleSize + padding);
  const atlasH = rows * (particleSize + padding);

  const { canvas, ctx } = createCanvas(atlasW);
  canvas.height = atlasH;

  const regions = new Map<string, { x: number; y: number; w: number; h: number }>();
  let col = 0;
  let row = 0;

  for (const type of types) {
    for (let v = 0; v < type.count; v++) {
      const x = col * (particleSize + padding);
      const y = row * (particleSize + padding);

      const particleCanvas = type.generator(particleSize, v);
      ctx.drawImage(particleCanvas, x, y);

      regions.set(`${type.name}_${v}`, { x, y, w: particleSize, h: particleSize });

      col++;
      if (col >= cols) {
        col = 0;
        row++;
      }
    }
  }

  return { canvas, regions };
}

// ─── INDIVIDUAL GENERATORS (for direct use) ─────────────────────────────────

export function generateBloodTextures(): HTMLCanvasElement[] {
  return Array.from({ length: 4 }, (_, i) => generateBloodSplatter(32, i));
}

export function generateExplosionTextures(): HTMLCanvasElement[] {
  return Array.from({ length: 4 }, (_, i) => generateExplosion(32, i));
}

export function generateSparkTextures(): HTMLCanvasElement[] {
  return Array.from({ length: 4 }, (_, i) => generateSpark(32, i));
}

export function generateDustTextures(): HTMLCanvasElement[] {
  return Array.from({ length: 4 }, (_, i) => generateDustPuff(32, i));
}

export function generateSmokeTextures(): HTMLCanvasElement[] {
  return Array.from({ length: 4 }, (_, i) => generateSmoke(32, i));
}

export function generateScoreTextures(
  size: number = 24,
  color: string = '#FFD700',
): Map<string, HTMLCanvasElement> {
  const textures = new Map<string, HTMLCanvasElement>();
  for (let i = 0; i <= 9; i++) {
    textures.set(`digit_${i}`, generateScoreDigit(String(i), size, color));
  }
  textures.set('plus', generateScoreDigit('+', size, color));
  return textures;
}
