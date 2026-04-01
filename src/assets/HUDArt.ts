/**
 * HUD Component Art Generator
 * Canvas-drawn health bars, score displays, wave banners, and other HUD elements
 */

function createCanvas(w: number, h: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
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

// ─── HEALTH BAR ─────────────────────────────────────────────────────────────

export function generateHealthBar(
  width: number = 200,
  height: number = 20,
  healthPercent: number = 1.0,
): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(width + 4, height + 4);

  const barX = 2;
  const barY = 2;
  const barW = width;
  const barH = height;
  const radius = barH / 2;

  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.beginPath();
  ctx.roundRect(barX, barY, barW, barH, radius);
  ctx.fill();

  // Border (neon)
  ctx.strokeStyle = '#00FFFF';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(barX, barY, barW, barH, radius);
  ctx.stroke();

  // Health fill
  const fillW = Math.max(0, barW * healthPercent - 4);
  let fillColor: string;
  if (healthPercent > 0.6) fillColor = '#00FF00';
  else if (healthPercent > 0.3) fillColor = '#FFFF00';
  else fillColor = '#FF0000';

  if (fillW > 0) {
    const fillGrad = ctx.createLinearGradient(barX + 2, barY, barX + 2, barY + barH);
    fillGrad.addColorStop(0, fillColor);
    fillGrad.addColorStop(0.5, fillColor);
    fillGrad.addColorStop(1, shadeColor(fillColor, -30));
    ctx.fillStyle = fillGrad;

    glow(ctx, fillColor, 6);
    ctx.beginPath();
    ctx.roundRect(barX + 2, barY + 2, fillW, barH - 4, radius - 2);
    ctx.fill();
    noGlow(ctx);

    // Highlight stripe
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.roundRect(barX + 4, barY + 3, fillW - 4, (barH - 6) * 0.4, radius - 3);
    ctx.fill();
  }

  // Segments
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.lineWidth = 1;
  const segments = 10;
  for (let i = 1; i < segments; i++) {
    const sx = barX + (barW / segments) * i;
    ctx.beginPath();
    ctx.moveTo(sx, barY + 2);
    ctx.lineTo(sx, barY + barH - 2);
    ctx.stroke();
  }

  return canvas;
}

// ─── BOSS HEALTH BAR ────────────────────────────────────────────────────────

export function generateBossHealthBar(
  width: number = 400,
  height: number = 28,
  healthPercent: number = 1.0,
  bossName: string = 'BOSS',
): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(width + 8, height + 36);

  const barX = 4;
  const barY = 28;
  const barW = width;
  const barH = height;

  // Boss name
  ctx.font = 'bold 16px "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#FF00FF';
  glow(ctx, '#FF00FF', 8);
  ctx.fillText(bossName, width / 2 + 4, 14);
  noGlow(ctx);

  // Ornate border
  ctx.strokeStyle = '#FF00FF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(barX, barY, barW, barH, 4);
  ctx.stroke();

  // Inner border
  ctx.strokeStyle = 'rgba(255, 0, 255, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(barX + 3, barY + 3, barW - 6, barH - 6, 2);
  ctx.stroke();

  // Background
  ctx.fillStyle = 'rgba(30, 0, 30, 0.8)';
  ctx.beginPath();
  ctx.roundRect(barX + 3, barY + 3, barW - 6, barH - 6, 2);
  ctx.fill();

  // Health fill
  const fillW = Math.max(0, (barW - 8) * healthPercent);
  if (fillW > 0) {
    const fillGrad = ctx.createLinearGradient(barX + 4, barY, barX + 4, barY + barH);
    fillGrad.addColorStop(0, '#FF0066');
    fillGrad.addColorStop(0.5, '#CC0052');
    fillGrad.addColorStop(1, '#990040');
    ctx.fillStyle = fillGrad;

    glow(ctx, '#FF0066', 10);
    ctx.fillRect(barX + 4, barY + 4, fillW, barH - 8);
    noGlow(ctx);

    // Animated pulse overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(barX + 4, barY + 4, fillW, (barH - 8) * 0.4);
  }

  // Corner ornaments
  ctx.strokeStyle = '#FF00FF';
  ctx.lineWidth = 1.5;
  const ornSize = 8;
  // Top-left
  ctx.beginPath();
  ctx.moveTo(barX, barY + ornSize);
  ctx.lineTo(barX, barY);
  ctx.lineTo(barX + ornSize, barY);
  ctx.stroke();
  // Top-right
  ctx.beginPath();
  ctx.moveTo(barX + barW - ornSize, barY);
  ctx.lineTo(barX + barW, barY);
  ctx.lineTo(barX + barW, barY + ornSize);
  ctx.stroke();
  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(barX, barY + barH - ornSize);
  ctx.lineTo(barX, barY + barH);
  ctx.lineTo(barX + ornSize, barY + barH);
  ctx.stroke();
  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(barX + barW - ornSize, barY + barH);
  ctx.lineTo(barX + barW, barY + barH);
  ctx.lineTo(barX + barW, barY + barH - ornSize);
  ctx.stroke();

  return canvas;
}

// ─── WAVE BANNER ────────────────────────────────────────────────────────────

export function generateWaveBanner(
  waveNumber: number,
  isBoss: boolean = false,
  width: number = 500,
  height: number = 100,
): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(width, height);
  const cx = width / 2;
  const cy = height / 2;

  // Background panel
  ctx.fillStyle = isBoss ? 'rgba(80, 0, 0, 0.85)' : 'rgba(0, 20, 40, 0.85)';
  ctx.beginPath();
  ctx.roundRect(10, 10, width - 20, height - 20, 8);
  ctx.fill();

  // Border
  const borderColor = isBoss ? '#FF0000' : '#00FFFF';
  glow(ctx, borderColor, 12);
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(10, 10, width - 20, height - 20, 8);
  ctx.stroke();
  noGlow(ctx);

  // Text
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (isBoss) {
    // BOSS INCOMING
    ctx.font = 'bold 36px "Segoe UI", sans-serif';
    glow(ctx, '#FF0000', 15);
    ctx.fillStyle = '#FF0000';
    ctx.fillText('⚠ BOSS INCOMING ⚠', cx, cy);
    noGlow(ctx);
  } else {
    // WAVE N
    ctx.font = 'bold 16px "Segoe UI", sans-serif';
    ctx.fillStyle = 'rgba(0, 255, 255, 0.7)';
    ctx.fillText('WAVE', cx, cy - 18);

    ctx.font = 'bold 42px "Segoe UI", sans-serif';
    glow(ctx, '#00FFFF', 12);
    ctx.fillStyle = '#00FFFF';
    ctx.fillText(String(waveNumber), cx, cy + 14);
    noGlow(ctx);
  }

  // Side accents
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(20, cy);
  ctx.lineTo(60, cy);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(width - 60, cy);
  ctx.lineTo(width - 20, cy);
  ctx.stroke();
  ctx.globalAlpha = 1;

  return canvas;
}

// ─── SCORE DISPLAY FRAME ────────────────────────────────────────────────────

export function generateScoreFrame(
  width: number = 200,
  height: number = 50,
): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(width, height);

  // Glass panel
  ctx.fillStyle = 'rgba(0, 20, 40, 0.6)';
  ctx.beginPath();
  ctx.roundRect(0, 0, width, height, 8);
  ctx.fill();

  // Border
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(0, 0, width, height, 8);
  ctx.stroke();

  // Label
  ctx.font = '11px "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = 'rgba(0, 255, 255, 0.6)';
  ctx.fillText('SCORE', 12, 8);

  // Score value placeholder
  ctx.font = 'bold 24px "Segoe UI", sans-serif';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('0', 12, height - 8);

  return canvas;
}

// ─── KILL COUNTER ───────────────────────────────────────────────────────────

export function generateKillCounter(
  width: number = 160,
  height: number = 40,
): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(width, height);

  // Glass panel
  ctx.fillStyle = 'rgba(0, 20, 40, 0.5)';
  ctx.beginPath();
  ctx.roundRect(0, 0, width, height, 6);
  ctx.fill();

  // Bug icon (simplified)
  ctx.fillStyle = '#FF4444';
  ctx.beginPath();
  ctx.ellipse(20, height / 2, 8, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  // Legs
  ctx.strokeStyle = '#FF4444';
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(14, height / 2 - 4 + i * 4);
    ctx.lineTo(8, height / 2 - 6 + i * 4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(26, height / 2 - 4 + i * 4);
    ctx.lineTo(32, height / 2 - 6 + i * 4);
    ctx.stroke();
  }

  // Label
  ctx.font = '10px "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.fillText('KILLS', 38, 6);

  // Count placeholder
  ctx.font = 'bold 18px "Segoe UI", sans-serif';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('0', 38, height - 4);

  return canvas;
}

// ─── COMBO DISPLAY ──────────────────────────────────────────────────────────

export function generateComboDisplay(
  comboLevel: number = 1,
  width: number = 120,
  height: number = 60,
): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(width, height);
  const cx = width / 2;
  const cy = height / 2;

  const colors = ['#FFFFFF', '#00FFFF', '#FFD700', '#FF00FF', '#FF0000'];
  const color = colors[Math.min(comboLevel, colors.length - 1)];

  // Combo multiplier text
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${28 + comboLevel * 4}px "Segoe UI", sans-serif`;

  glow(ctx, color, 12);
  ctx.fillStyle = color;
  ctx.fillText(`${comboLevel}×`, cx, cy - 5);
  noGlow(ctx);

  // "COMBO" label
  ctx.font = '12px "Segoe UI", sans-serif';
  ctx.fillStyle = `rgba(255, 255, 255, 0.7)`;
  ctx.fillText('COMBO', cx, cy + 20);

  return canvas;
}

// ─── HELPER ─────────────────────────────────────────────────────────────────

function shadeColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + percent));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + percent));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + percent));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}
