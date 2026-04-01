/**
 * Game Title Art Generator
 * Animated neon "BUG SMASHER" title with cyberpunk effects
 */

function createCanvas(w: number, h: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  return { canvas, ctx };
}

// ─── STATIC TITLE FRAME ─────────────────────────────────────────────────────

export function generateTitleFrame(
  frame: number,
  width: number = 800,
  height: number = 200,
): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(width, height);
  const cx = width / 2;
  const cy = height / 2;

  const time = frame * 0.05;
  const glitchOffset = Math.sin(time * 3) * 2;

  // Title text
  const text = 'BUG SMASHER';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Glitch layers (red/cyan offset)
  if (Math.random() > 0.95) {
    ctx.font = `bold 72px 'Segoe UI', sans-serif`;
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.fillText(text, cx + glitchOffset + 3, cy);
    ctx.fillStyle = 'rgba(0, 255, 255, 0.5)';
    ctx.fillText(text, cx - glitchOffset - 3, cy);
  }

  // Main text with gradient
  ctx.font = `bold 72px 'Segoe UI', sans-serif`;
  const textGrad = ctx.createLinearGradient(cx - 200, cy, cx + 200, cy);
  textGrad.addColorStop(0, '#00FFFF');
  textGrad.addColorStop(0.3, '#40E0D0');
  textGrad.addColorStop(0.5, '#FFFFFF');
  textGrad.addColorStop(0.7, '#FF00FF');
  textGrad.addColorStop(1, '#00FFFF');

  // Glow layers
  ctx.shadowColor = '#00FFFF';
  ctx.shadowBlur = 20;
  ctx.fillStyle = textGrad;
  ctx.fillText(text, cx, cy);

  // Bright core
  ctx.shadowBlur = 5;
  ctx.shadowColor = '#FFFFFF';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.fillText(text, cx, cy);

  ctx.shadowBlur = 0;

  // Subtitle
  ctx.font = `600 18px 'Segoe UI', sans-serif`;
  ctx.fillStyle = `rgba(0, 255, 255, ${0.6 + Math.sin(time * 2) * 0.2})`;
  ctx.shadowColor = '#00FFFF';
  ctx.shadowBlur = 10;
  ctx.fillText('ENTERPRISE-GRADE HTML5 GAME', cx, cy + 50);
  ctx.shadowBlur = 0;

  // Spark particles around title
  const sparkCount = 8;
  for (let i = 0; i < sparkCount; i++) {
    const angle = (i / sparkCount) * Math.PI * 2 + time;
    const dist = 160 + Math.sin(time * 2 + i) * 20;
    const sx = cx + Math.cos(angle) * dist;
    const sy = cy + Math.sin(angle) * dist * 0.4;
    const sparkSize = 1.5 + Math.sin(time * 3 + i * 2) * 1;

    ctx.fillStyle = i % 2 === 0 ? '#00FFFF' : '#FF00FF';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(sx, sy, sparkSize, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  // Horizontal line accents
  const lineAlpha = 0.3 + Math.sin(time) * 0.15;
  ctx.strokeStyle = `rgba(0, 255, 255, ${lineAlpha})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - 280, cy + 30);
  ctx.lineTo(cx - 100, cy + 30);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 100, cy + 30);
  ctx.lineTo(cx + 280, cy + 30);
  ctx.stroke();

  // Corner decorations
  const cornerSize = 20;
  ctx.strokeStyle = `rgba(255, 0, 255, ${lineAlpha})`;
  ctx.lineWidth = 1.5;
  // Top-left
  ctx.beginPath();
  ctx.moveTo(cx - 300, cy - 60);
  ctx.lineTo(cx - 300, cy - 60 + cornerSize);
  ctx.moveTo(cx - 300, cy - 60);
  ctx.lineTo(cx - 300 + cornerSize, cy - 60);
  ctx.stroke();
  // Top-right
  ctx.beginPath();
  ctx.moveTo(cx + 300, cy - 60);
  ctx.lineTo(cx + 300, cy - 60 + cornerSize);
  ctx.moveTo(cx + 300, cy - 60);
  ctx.lineTo(cx + 300 - cornerSize, cy - 60);
  ctx.stroke();
  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(cx - 300, cy + 70);
  ctx.lineTo(cx - 300, cy + 70 - cornerSize);
  ctx.moveTo(cx - 300, cy + 70);
  ctx.lineTo(cx - 300 + cornerSize, cy + 70);
  ctx.stroke();
  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(cx + 300, cy + 70);
  ctx.lineTo(cx + 300, cy + 70 - cornerSize);
  ctx.moveTo(cx + 300, cy + 70);
  ctx.lineTo(cx + 300 - cornerSize, cy + 70);
  ctx.stroke();

  return canvas;
}

// ─── TITLE RENDERER (for real-time animation) ──────────────────────────────

export class TitleRenderer {
  private frame: number = 0;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(width: number = 800, height: number = 200) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d')!;
  }

  update(): void {
    this.frame++;
  }

  render(): HTMLCanvasElement {
    const frame = generateTitleFrame(this.frame, this.canvas.width, this.canvas.height);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(frame, 0, 0);
    return this.canvas;
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }
}

// ─── GAME OVER TITLE ────────────────────────────────────────────────────────

export function generateGameOverTitle(
  width: number = 600,
  height: number = 150,
): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(width, height);
  const cx = width / 2;
  const cy = height / 2;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 80px "Segoe UI", sans-serif';

  // Red glow
  ctx.shadowColor = '#FF0000';
  ctx.shadowBlur = 30;
  ctx.fillStyle = '#FF0000';
  ctx.fillText('GAME OVER', cx, cy);

  // Core
  ctx.shadowBlur = 8;
  ctx.fillStyle = '#FF6666';
  ctx.fillText('GAME OVER', cx, cy);

  ctx.shadowBlur = 0;

  // Cracked effect lines
  ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    const sx = cx + (Math.random() - 0.5) * 300;
    const sy = cy + (Math.random() - 0.5) * 60;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + (Math.random() - 0.5) * 40, sy + (Math.random() - 0.5) * 40);
    ctx.stroke();
  }

  return canvas;
}

// ─── VICTORY TITLE ──────────────────────────────────────────────────────────

export function generateVictoryTitle(
  width: number = 600,
  height: number = 150,
): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(width, height);
  const cx = width / 2;
  const cy = height / 2;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 80px "Segoe UI", sans-serif';

  // Gold glow
  ctx.shadowColor = '#FFD700';
  ctx.shadowBlur = 30;
  ctx.fillStyle = '#FFD700';
  ctx.fillText('VICTORY!', cx, cy);

  // Core
  ctx.shadowBlur = 8;
  ctx.fillStyle = '#FFF8DC';
  ctx.fillText('VICTORY!', cx, cy);

  ctx.shadowBlur = 0;

  // Star sparkles
  ctx.fillStyle = '#FFD700';
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const dist = 120 + Math.sin(i * 3) * 30;
    const sx = cx + Math.cos(angle) * dist;
    const sy = cy + Math.sin(angle) * dist * 0.5;
    ctx.beginPath();
    ctx.arc(sx, sy, 2 + Math.random() * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas;
}
