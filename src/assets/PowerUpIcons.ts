/**
 * Power-Up Icon Generator
 * Canvas-drawn icons for all 5 power-up types
 */

function createCanvas(size: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  return { canvas, ctx };
}

function glow(ctx: CanvasRenderingContext2D, color: string, blur: number): void {
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
}

function noGlow(ctx: CanvasRenderingContext2D): void {
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
}

// ─── TIME FREEZE ────────────────────────────────────────────────────────────

function drawTimeFreeze(size: number): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(size);
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.4;

  // Background circle
  const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.2);
  bgGrad.addColorStop(0, 'rgba(0, 255, 255, 0.2)');
  bgGrad.addColorStop(1, 'rgba(0, 255, 255, 0)');
  ctx.fillStyle = bgGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Hexagonal crystal shape
  glow(ctx, '#00FFFF', 8);
  ctx.strokeStyle = '#00FFFF';
  ctx.lineWidth = 2;
  ctx.fillStyle = 'rgba(0, 255, 255, 0.15)';
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 6;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inner hexagon
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 6;
    const x = cx + Math.cos(angle) * r * 0.6;
    const y = cy + Math.sin(angle) * r * 0.6;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();

  // Clock hands in center
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  // Hour hand
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx, cy - r * 0.35);
  ctx.stroke();
  // Minute hand
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + r * 0.25, cy + r * 0.1);
  ctx.stroke();
  // Center dot
  ctx.fillStyle = '#00FFFF';
  ctx.beginPath();
  ctx.arc(cx, cy, 2, 0, Math.PI * 2);
  ctx.fill();

  // Snowflake arms
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const x1 = cx + Math.cos(angle) * r * 0.15;
    const y1 = cy + Math.sin(angle) * r * 0.15;
    const x2 = cx + Math.cos(angle) * r * 0.85;
    const y2 = cy + Math.sin(angle) * r * 0.85;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Branch
    const bx = cx + Math.cos(angle) * r * 0.5;
    const by = cy + Math.sin(angle) * r * 0.5;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + Math.cos(angle + 0.5) * r * 0.15, by + Math.sin(angle + 0.5) * r * 0.15);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + Math.cos(angle - 0.5) * r * 0.15, by + Math.sin(angle - 0.5) * r * 0.15);
    ctx.stroke();
  }

  noGlow(ctx);
  return canvas;
}

// ─── MULTIPLIER ─────────────────────────────────────────────────────────────

function drawMultiplier(size: number): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(size);
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.4;

  // Star burst background
  glow(ctx, '#FFD700', 10);
  ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
  ctx.beginPath();
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const rad = i % 2 === 0 ? r * 1.3 : r * 0.8;
    const x = cx + Math.cos(angle) * rad;
    const y = cy + Math.sin(angle) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  // Main circle
  const circGrad = ctx.createRadialGradient(cx - 5, cy - 5, 0, cx, cy, r);
  circGrad.addColorStop(0, '#FFD700');
  circGrad.addColorStop(0.7, '#FFA000');
  circGrad.addColorStop(1, '#E65100');
  ctx.fillStyle = circGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Border
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 2;
  ctx.stroke();

  // "x2" text
  noGlow(ctx);
  glow(ctx, '#FFFFFF', 4);
  ctx.font = `bold ${size * 0.3}px 'Segoe UI', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('×2', cx, cy + 1);
  noGlow(ctx);

  return canvas;
}

// ─── NUKE ───────────────────────────────────────────────────────────────────

function drawNuke(size: number): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(size);
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.4;

  // Explosion background glow
  const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.4);
  bgGrad.addColorStop(0, 'rgba(255, 100, 0, 0.3)');
  bgGrad.addColorStop(0.5, 'rgba(255, 0, 0, 0.15)');
  bgGrad.addColorStop(1, 'rgba(255, 0, 0, 0)');
  ctx.fillStyle = bgGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.4, 0, Math.PI * 2);
  ctx.fill();

  // Mushroom cloud silhouette
  glow(ctx, '#FF4500', 8);
  ctx.fillStyle = '#FF0000';

  // Stem
  ctx.fillRect(cx - r * 0.15, cy + r * 0.1, r * 0.3, r * 0.8);

  // Cap (mushroom top)
  ctx.beginPath();
  ctx.ellipse(cx, cy - r * 0.1, r * 0.6, r * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();

  // Inner glow
  const innerGrad = ctx.createRadialGradient(cx, cy - r * 0.1, 0, cx, cy - r * 0.1, r * 0.5);
  innerGrad.addColorStop(0, '#FFFFFF');
  innerGrad.addColorStop(0.3, '#FFD700');
  innerGrad.addColorStop(1, '#FF0000');
  ctx.fillStyle = innerGrad;
  ctx.beginPath();
  ctx.arc(cx, cy - r * 0.1, r * 0.35, 0, Math.PI * 2);
  ctx.fill();

  // Explosion ring
  ctx.strokeStyle = '#FFA500';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy + r * 0.4, r * 0.7, Math.PI * 0.2, Math.PI * 0.8);
  ctx.stroke();

  noGlow(ctx);
  return canvas;
}

// ─── SHIELD ─────────────────────────────────────────────────────────────────

function drawShield(size: number): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(size);
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;

  // Outer hexagonal force field
  glow(ctx, '#00FF00', 10);
  ctx.strokeStyle = 'rgba(0, 255, 0, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 6;
    const x = cx + Math.cos(angle) * r * 1.2;
    const y = cy + Math.sin(angle) * r * 1.2;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();

  // Inner hexagon fill
  const hexGrad = ctx.createRadialGradient(cx, cy - 5, 0, cx, cy, r);
  hexGrad.addColorStop(0, 'rgba(0, 255, 0, 0.25)');
  hexGrad.addColorStop(1, 'rgba(0, 200, 0, 0.08)');
  ctx.fillStyle = hexGrad;
  ctx.strokeStyle = '#00FF00';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 6;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Shield symbol (downward-pointing triangle)
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.35, cy - r * 0.25);
  ctx.lineTo(cx, cy + r * 0.4);
  ctx.lineTo(cx + r * 0.35, cy - r * 0.25);
  ctx.closePath();
  ctx.stroke();

  // Cross on shield
  ctx.beginPath();
  ctx.moveTo(cx, cy - r * 0.15);
  ctx.lineTo(cx, cy + r * 0.2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.15, cy + r * 0.02);
  ctx.lineTo(cx + r * 0.15, cy + r * 0.02);
  ctx.stroke();

  noGlow(ctx);
  return canvas;
}

// ─── RAPID FIRE ─────────────────────────────────────────────────────────────

function drawRapidFire(size: number): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(size);
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.4;

  // Background glow
  const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.3);
  bgGrad.addColorStop(0, 'rgba(255, 0, 255, 0.2)');
  bgGrad.addColorStop(1, 'rgba(255, 0, 255, 0)');
  ctx.fillStyle = bgGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.3, 0, Math.PI * 2);
  ctx.fill();

  // Speed lines
  glow(ctx, '#FF00FF', 6);
  ctx.strokeStyle = '#FF00FF';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  for (let i = 0; i < 5; i++) {
    const y = cy - r * 0.6 + i * r * 0.3;
    const xStart = cx - r * 0.9;
    const xEnd = cx + r * 0.3 + i * r * 0.12;
    ctx.globalAlpha = 0.3 + i * 0.15;
    ctx.beginPath();
    ctx.moveTo(xStart, y);
    ctx.lineTo(xEnd, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Lightning bolt
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#FF00FF';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx + r * 0.15, cy - r * 0.8);
  ctx.lineTo(cx - r * 0.2, cy - r * 0.05);
  ctx.lineTo(cx + r * 0.05, cy - r * 0.05);
  ctx.lineTo(cx - r * 0.15, cy + r * 0.8);
  ctx.lineTo(cx + r * 0.2, cy + r * 0.05);
  ctx.lineTo(cx - r * 0.05, cy + r * 0.05);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Bullet circles
  ctx.fillStyle = '#FF00FF';
  const bulletPositions = [
    { x: cx - r * 0.6, y: cy - r * 0.5 },
    { x: cx - r * 0.7, y: cy },
    { x: cx - r * 0.55, y: cy + r * 0.5 },
  ];
  for (const b of bulletPositions) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  noGlow(ctx);
  return canvas;
}

// ─── EXPORT ─────────────────────────────────────────────────────────────────

export type PowerUpType = 'time_freeze' | 'multiplier' | 'nuke' | 'shield' | 'rapid_fire';

const DRAW_FNS: Record<PowerUpType, (size: number) => HTMLCanvasElement> = {
  time_freeze: drawTimeFreeze,
  multiplier: drawMultiplier,
  nuke: drawNuke,
  shield: drawShield,
  rapid_fire: drawRapidFire,
};

export function generatePowerUpIcon(type: PowerUpType, size: number = 64): HTMLCanvasElement {
  return DRAW_FNS[type](size);
}

export function generateAllPowerUpIcons(size: number = 64): Map<PowerUpType, HTMLCanvasElement> {
  const icons = new Map<PowerUpType, HTMLCanvasElement>();
  for (const [type, drawFn] of Object.entries(DRAW_FNS)) {
    icons.set(type as PowerUpType, drawFn(size));
  }
  return icons;
}
