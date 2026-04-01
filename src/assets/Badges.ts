/**
 * Achievement Badge Generator
 * Canvas-drawn badge icons for game achievements
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

// ─── BADGE SHAPES ───────────────────────────────────────────────────────────

function drawBadgeBase(
  ctx: CanvasRenderingContext2D,
  size: number,
  borderColor: string,
  bgColor: string,
): void {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.42;

  // Outer ring
  glow(ctx, borderColor, 8);
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  // Inner ring
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.85, 0, Math.PI * 2);
  ctx.stroke();

  // Background fill
  noGlow(ctx);
  const bgGrad = ctx.createRadialGradient(cx, cy - r * 0.2, 0, cx, cy, r);
  bgGrad.addColorStop(0, bgColor);
  bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
  ctx.fillStyle = bgGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.83, 0, Math.PI * 2);
  ctx.fill();
}

// ─── FIRST BLOOD ────────────────────────────────────────────────────────────

function drawFirstBlood(size: number): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(size);
  const cx = size / 2;
  const cy = size / 2;

  drawBadgeBase(ctx, size, '#FF1744', 'rgba(139, 0, 0, 0.4)');

  // Blood drop
  const dropH = size * 0.35;
  const dropW = size * 0.18;
  glow(ctx, '#FF1744', 10);
  ctx.fillStyle = '#FF1744';
  ctx.beginPath();
  ctx.moveTo(cx, cy - dropH * 0.6);
  ctx.quadraticCurveTo(cx + dropW, cy - dropH * 0.1, cx + dropW * 0.7, cy + dropH * 0.3);
  ctx.quadraticCurveTo(cx, cy + dropH * 0.5, cx - dropW * 0.7, cy + dropH * 0.3);
  ctx.quadraticCurveTo(cx - dropW, cy - dropH * 0.1, cx, cy - dropH * 0.6);
  ctx.fill();

  // Highlight
  noGlow(ctx);
  ctx.fillStyle = 'rgba(255, 100, 100, 0.5)';
  ctx.beginPath();
  ctx.arc(cx - dropW * 0.2, cy - dropH * 0.1, dropW * 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Drip
  ctx.fillStyle = '#FF1744';
  ctx.beginPath();
  ctx.ellipse(cx, cy + dropH * 0.45, dropW * 0.15, dropW * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();

  return canvas;
}

// ─── COMBO KING ─────────────────────────────────────────────────────────────

function drawComboKing(size: number): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(size);
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.32;

  drawBadgeBase(ctx, size, '#FFD700', 'rgba(255, 215, 0, 0.2)');

  // Chain links (3 interlocking)
  glow(ctx, '#FFD700', 6);
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 3;
  ctx.fillStyle = 'rgba(255, 215, 0, 0.15)';

  for (let i = 0; i < 3; i++) {
    const lx = cx + (i - 1) * r * 0.55;
    const ly = cy;
    const lw = r * 0.4;
    const lh = r * 0.6;

    ctx.beginPath();
    ctx.ellipse(lx, ly, lw, lh, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // "x3" text
  noGlow(ctx);
  glow(ctx, '#FFFFFF', 4);
  ctx.font = `bold ${size * 0.2}px 'Segoe UI', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('×3', cx, cy + r * 0.7);
  noGlow(ctx);

  return canvas;
}

// ─── BOSS SLAYER ────────────────────────────────────────────────────────────

function drawBossSlayer(size: number): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(size);
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.3;

  drawBadgeBase(ctx, size, '#E040FB', 'rgba(156, 39, 176, 0.3)');

  // Skull
  glow(ctx, '#E040FB', 8);
  ctx.fillStyle = '#FFFFFF';

  // Skull shape
  ctx.beginPath();
  ctx.ellipse(cx, cy - r * 0.15, r * 0.65, r * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Jaw
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.5, cy + r * 0.1);
  ctx.lineTo(cx - r * 0.4, cy + r * 0.55);
  ctx.lineTo(cx + r * 0.4, cy + r * 0.55);
  ctx.lineTo(cx + r * 0.5, cy + r * 0.1);
  ctx.closePath();
  ctx.fill();

  // Eye sockets
  noGlow(ctx);
  ctx.fillStyle = '#1a0033';
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.25, cy - r * 0.15, r * 0.18, r * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + r * 0.25, cy - r * 0.15, r * 0.18, r * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Glowing eyes
  glow(ctx, '#E040FB', 6);
  ctx.fillStyle = '#E040FB';
  ctx.beginPath();
  ctx.arc(cx - r * 0.25, cy - r * 0.15, r * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + r * 0.25, cy - r * 0.15, r * 0.08, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  noGlow(ctx);
  ctx.fillStyle = '#1a0033';
  ctx.beginPath();
  ctx.moveTo(cx, cy + r * 0.05);
  ctx.lineTo(cx - r * 0.08, cy + r * 0.18);
  ctx.lineTo(cx + r * 0.08, cy + r * 0.18);
  ctx.closePath();
  ctx.fill();

  // Teeth
  ctx.strokeStyle = '#1a0033';
  ctx.lineWidth = 1;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(cx + i * r * 0.12, cy + r * 0.3);
    ctx.lineTo(cx + i * r * 0.12, cy + r * 0.5);
    ctx.stroke();
  }

  // Crown
  glow(ctx, '#FFD700', 8);
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.5, cy - r * 0.7);
  ctx.lineTo(cx - r * 0.45, cy - r * 1.0);
  ctx.lineTo(cx - r * 0.25, cy - r * 0.82);
  ctx.lineTo(cx, cy - r * 1.05);
  ctx.lineTo(cx + r * 0.25, cy - r * 0.82);
  ctx.lineTo(cx + r * 0.45, cy - r * 1.0);
  ctx.lineTo(cx + r * 0.5, cy - r * 0.7);
  ctx.closePath();
  ctx.fill();

  noGlow(ctx);
  return canvas;
}

// ─── SPEED DEMON ────────────────────────────────────────────────────────────

function drawSpeedDemon(size: number): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(size);
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.3;

  drawBadgeBase(ctx, size, '#FFFF00', 'rgba(255, 255, 0, 0.15)');

  // Speed lines behind bolt
  glow(ctx, '#FFFF00', 4);
  ctx.strokeStyle = 'rgba(255, 255, 0, 0.4)';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  for (let i = 0; i < 5; i++) {
    const y = cy - r * 0.8 + i * r * 0.4;
    const xStart = cx - r * 1.0;
    const xEnd = cx + r * 0.3 + i * r * 0.1;
    ctx.beginPath();
    ctx.moveTo(xStart, y);
    ctx.lineTo(xEnd, y);
    ctx.stroke();
  }

  // Lightning bolt
  glow(ctx, '#FFFF00', 10);
  ctx.fillStyle = '#FFFF00';
  ctx.beginPath();
  ctx.moveTo(cx + r * 0.15, cy - r * 0.9);
  ctx.lineTo(cx - r * 0.35, cy + r * 0.05);
  ctx.lineTo(cx + r * 0.05, cy + r * 0.05);
  ctx.lineTo(cx - r * 0.2, cy + r * 0.9);
  ctx.lineTo(cx + r * 0.35, cy - r * 0.05);
  ctx.lineTo(cx - r * 0.05, cy - r * 0.05);
  ctx.closePath();
  ctx.fill();

  // White core
  noGlow(ctx);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.moveTo(cx + r * 0.05, cy - r * 0.6);
  ctx.lineTo(cx - r * 0.15, cy + r * 0.02);
  ctx.lineTo(cx + r * 0.05, cy + r * 0.02);
  ctx.lineTo(cx - r * 0.05, cy + r * 0.6);
  ctx.lineTo(cx + r * 0.15, cy - r * 0.02);
  ctx.lineTo(cx - r * 0.05, cy - r * 0.02);
  ctx.closePath();
  ctx.fill();

  return canvas;
}

// ─── SURVIVOR ───────────────────────────────────────────────────────────────

function drawSurvivor(size: number): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(size);
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.3;

  drawBadgeBase(ctx, size, '#00FF00', 'rgba(0, 255, 0, 0.15)');

  // Shield shape
  glow(ctx, '#00FF00', 8);
  ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
  ctx.strokeStyle = '#00FF00';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.7, cy - r * 0.7);
  ctx.lineTo(cx + r * 0.7, cy - r * 0.7);
  ctx.lineTo(cx + r * 0.7, cy + r * 0.1);
  ctx.quadraticCurveTo(cx + r * 0.7, cy + r * 0.9, cx, cy + r * 1.0);
  ctx.quadraticCurveTo(cx - r * 0.7, cy + r * 0.9, cx - r * 0.7, cy + r * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Heart inside shield
  noGlow(ctx);
  glow(ctx, '#FF1744', 6);
  ctx.fillStyle = '#FF1744';
  const heartSize = r * 0.45;
  ctx.beginPath();
  ctx.moveTo(cx, cy + heartSize * 0.6);
  ctx.bezierCurveTo(
    cx - heartSize * 1.5, cy - heartSize * 0.2,
    cx - heartSize * 0.8, cy - heartSize * 1.2,
    cx, cy - heartSize * 0.4,
  );
  ctx.bezierCurveTo(
    cx + heartSize * 0.8, cy - heartSize * 1.2,
    cx + heartSize * 1.5, cy - heartSize * 0.2,
    cx, cy + heartSize * 0.6,
  );
  ctx.fill();

  // Heart highlight
  noGlow(ctx);
  ctx.fillStyle = 'rgba(255, 100, 100, 0.5)';
  ctx.beginPath();
  ctx.arc(cx - heartSize * 0.3, cy - heartSize * 0.4, heartSize * 0.2, 0, Math.PI * 2);
  ctx.fill();

  return canvas;
}

// ─── PERFECTIONIST ──────────────────────────────────────────────────────────

function drawPerfectionist(size: number): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(size);
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.32;

  drawBadgeBase(ctx, size, '#FFD700', 'rgba(255, 215, 0, 0.2)');

  // 5-pointed gold star
  glow(ctx, '#FFD700', 12);
  ctx.fillStyle = '#FFD700';
  ctx.strokeStyle = '#FFA000';
  ctx.lineWidth = 1.5;

  const points = 5;
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const radius = i % 2 === 0 ? r : r * 0.45;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inner star (lighter)
  noGlow(ctx);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const radius = i % 2 === 0 ? r * 0.6 : r * 0.3;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  // Sparkle points
  ctx.fillStyle = '#FFFFFF';
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2 - Math.PI / 2;
    const sx = cx + Math.cos(angle) * r * 0.55;
    const sy = cy + Math.sin(angle) * r * 0.55;
    ctx.beginPath();
    ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas;
}

// ─── EXPORT ─────────────────────────────────────────────────────────────────

export type BadgeType =
  | 'first_blood'
  | 'combo_king'
  | 'boss_slayer'
  | 'speed_demon'
  | 'survivor'
  | 'perfectionist';

const DRAW_FNS: Record<BadgeType, (size: number) => HTMLCanvasElement> = {
  first_blood: drawFirstBlood,
  combo_king: drawComboKing,
  boss_slayer: drawBossSlayer,
  speed_demon: drawSpeedDemon,
  survivor: drawSurvivor,
  perfectionist: drawPerfectionist,
};

export function generateBadge(type: BadgeType, size: number = 48): HTMLCanvasElement {
  return DRAW_FNS[type](size);
}

export function generateAllBadges(size: number = 48): Map<BadgeType, HTMLCanvasElement> {
  const badges = new Map<BadgeType, HTMLCanvasElement>();
  for (const [type, drawFn] of Object.entries(DRAW_FNS)) {
    badges.set(type as BadgeType, drawFn(size));
  }
  return badges;
}
