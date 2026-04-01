/**
 * Bug Sprite Procedural Generator
 * Canvas-drawn bug sprites for all 7 bug types with animation frames
 */

export type BugAnimationState = 'idle' | 'walk' | 'attack' | 'death';

interface SpriteFrame {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
}

interface SpriteSheet {
  frames: Map<BugAnimationState, SpriteFrame[]>;
  baseWidth: number;
  baseHeight: number;
}

const BUG_SIZES: Record<string, { w: number; h: number }> = {
  ant: { w: 32, h: 32 },
  beetle: { w: 48, h: 40 },
  spider: { w: 40, h: 40 },
  wasp: { w: 44, h: 28 },
  mantis: { w: 56, h: 48 },
  boss_scarab: { w: 128, h: 112 },
  boss_tarantula: { w: 144, h: 128 },
};

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

// ─── ANT ────────────────────────────────────────────────────────────────────

function drawAnt(frame: number, state: BugAnimationState): SpriteFrame {
  const { w, h } = BUG_SIZES.ant;
  const { canvas, ctx } = createCanvas(w, h);
  const cx = w / 2;
  const cy = h / 2;

  const legPhase = (frame % 2) * 0.4;
  const isDying = state === 'death';
  const isAttacking = state === 'attack';

  ctx.save();
  if (isDying) {
    ctx.translate(cx, cy);
    ctx.rotate(frame * 0.5);
    ctx.translate(-cx, -cy);
    ctx.globalAlpha = Math.max(0, 1 - frame * 0.25);
  }

  // Legs (6)
  ctx.strokeStyle = '#2E1B0E';
  ctx.lineWidth = 1.5;
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 3; i++) {
      const lx = cx + (i - 1) * 6;
      const legAngle = side * (0.8 + (i % 2 === 0 ? legPhase : -legPhase));
      const tipX = lx + Math.cos(legAngle) * 10 * side;
      const tipY = cy + 4 + Math.sin(legAngle + 1) * 8;
      ctx.beginPath();
      ctx.moveTo(lx, cy + 4);
      ctx.lineTo(lx + side * 5, cy + 8);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();
    }
  }

  // Body segments
  // Abdomen (back)
  ctx.fillStyle = '#3E2723';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 6, 7, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Thorax (middle)
  ctx.fillStyle = '#4E342E';
  ctx.beginPath();
  ctx.ellipse(cx, cy - 2, 5, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = '#5D4037';
  ctx.beginPath();
  ctx.ellipse(cx, cy - 12, 6, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Mandibles
  if (isAttacking) {
    ctx.fillStyle = '#FFD54F';
    ctx.beginPath();
    ctx.moveTo(cx - 4, cy - 14);
    ctx.lineTo(cx - 8, cy - 20);
    ctx.lineTo(cx - 2, cy - 16);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 4, cy - 14);
    ctx.lineTo(cx + 8, cy - 20);
    ctx.lineTo(cx + 2, cy - 16);
    ctx.fill();
  }

  // Antennae
  ctx.strokeStyle = '#5D4037';
  ctx.lineWidth = 1;
  const antBend = Math.sin(frame * 0.3) * 2;
  ctx.beginPath();
  ctx.moveTo(cx - 3, cy - 15);
  ctx.quadraticCurveTo(cx - 10, cy - 22 + antBend, cx - 12, cy - 20 + antBend);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 3, cy - 15);
  ctx.quadraticCurveTo(cx + 10, cy - 22 - antBend, cx + 12, cy - 20 - antBend);
  ctx.stroke();

  // Eyes
  glow(ctx, '#FF1744', 4);
  ctx.fillStyle = '#FF1744';
  ctx.beginPath();
  ctx.arc(cx - 3, cy - 13, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 3, cy - 13, 1.5, 0, Math.PI * 2);
  ctx.fill();
  noGlow(ctx);

  ctx.restore();
  return { canvas, width: w, height: h };
}

// ─── BEETLE ─────────────────────────────────────────────────────────────────

function drawBeetle(frame: number, state: BugAnimationState): SpriteFrame {
  const { w, h } = BUG_SIZES.beetle;
  const { canvas, ctx } = createCanvas(w, h);
  const cx = w / 2;
  const cy = h / 2;

  const wobble = Math.sin(frame * 0.4) * 0.03;
  const isDying = state === 'death';
  const isAttacking = state === 'attack';

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(wobble);
  ctx.translate(-cx, -cy);
  if (isDying) {
    ctx.rotate(frame * 0.4);
    ctx.globalAlpha = Math.max(0, 1 - frame * 0.25);
  }

  // Legs
  ctx.strokeStyle = '#1B3A1B';
  ctx.lineWidth = 2;
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 3; i++) {
      const lx = cx + (i - 1) * 10;
      const legPhase = Math.sin(frame * 0.5 + i * 1.2) * 4;
      ctx.beginPath();
      ctx.moveTo(lx, cy + 8);
      ctx.quadraticCurveTo(lx + side * 8, cy + 12 + legPhase, lx + side * 12, cy + 16 + legPhase);
      ctx.stroke();
    }
  }

  // Elytra (wing cases) — iridescent green
  const grad = ctx.createLinearGradient(cx - 18, cy - 8, cx + 18, cy + 14);
  grad.addColorStop(0, '#2E7D32');
  grad.addColorStop(0.3, '#43A047');
  grad.addColorStop(0.5, '#66BB6A');
  grad.addColorStop(0.7, '#43A047');
  grad.addColorStop(1, '#1B5E20');
  ctx.fillStyle = grad;

  // Left elytra
  ctx.beginPath();
  ctx.ellipse(cx - 6, cy + 4, 14, 16, -0.15, 0, Math.PI * 2);
  ctx.fill();
  // Right elytra
  ctx.beginPath();
  ctx.ellipse(cx + 6, cy + 4, 14, 16, 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Elytra line (center split)
  ctx.strokeStyle = '#1B5E20';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 10);
  ctx.lineTo(cx, cy + 18);
  ctx.stroke();

  // Shell pattern dots
  ctx.fillStyle = 'rgba(27, 94, 32, 0.6)';
  for (let row = 0; row < 3; row++) {
    for (let col = -1; col <= 1; col++) {
      ctx.beginPath();
      ctx.arc(cx + col * 7 + (row % 2) * 3, cy - 4 + row * 7, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Thorax
  ctx.fillStyle = '#33691E';
  ctx.beginPath();
  ctx.ellipse(cx, cy - 10, 10, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = '#2E7D32';
  ctx.beginPath();
  ctx.ellipse(cx, cy - 18, 8, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Mandibles
  ctx.fillStyle = '#FFD54F';
  if (isAttacking) {
    ctx.beginPath();
    ctx.moveTo(cx - 5, cy - 20);
    ctx.lineTo(cx - 12, cy - 28);
    ctx.lineTo(cx - 3, cy - 22);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 5, cy - 20);
    ctx.lineTo(cx + 12, cy - 28);
    ctx.lineTo(cx + 3, cy - 22);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(cx - 4, cy - 22);
    ctx.lineTo(cx - 7, cy - 26);
    ctx.lineTo(cx - 2, cy - 23);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 4, cy - 22);
    ctx.lineTo(cx + 7, cy - 26);
    ctx.lineTo(cx + 2, cy - 23);
    ctx.fill();
  }

  // Eyes
  glow(ctx, '#76FF03', 5);
  ctx.fillStyle = '#76FF03';
  ctx.beginPath();
  ctx.arc(cx - 5, cy - 19, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 5, cy - 19, 2.5, 0, Math.PI * 2);
  ctx.fill();
  noGlow(ctx);

  ctx.restore();
  return { canvas, width: w, height: h };
}

// ─── SPIDER ─────────────────────────────────────────────────────────────────

function drawSpider(frame: number, state: BugAnimationState): SpriteFrame {
  const { w, h } = BUG_SIZES.spider;
  const { canvas, ctx } = createCanvas(w, h);
  const cx = w / 2;
  const cy = h / 2;

  const isDying = state === 'death';
  const isAttacking = state === 'attack';
  const walkBob = Math.sin(frame * 0.6) * 1.5;

  ctx.save();
  if (isDying) {
    ctx.translate(cx, cy);
    ctx.rotate(frame * 0.6);
    ctx.translate(-cx, -cy);
    ctx.globalAlpha = Math.max(0, 1 - frame * 0.25);
  }

  // 8 legs
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 2;
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 4; i++) {
      const angle = (i - 1.5) * 0.45;
      const legPhase = Math.sin(frame * 0.7 + i * 0.8) * 3;
      const startAngle = side > 0 ? -Math.PI * 0.15 : Math.PI + Math.PI * 0.15;
      const baseX = cx + Math.cos(startAngle + angle) * 8;
      const baseY = cy + walkBob + Math.sin(startAngle + angle) * 4;

      ctx.beginPath();
      ctx.moveTo(baseX, baseY);
      const kneeX = baseX + side * (12 + i * 2);
      const kneeY = baseY - 6 + legPhase;
      ctx.quadraticCurveTo(kneeX, kneeY, kneeX + side * 6, baseY + 10 + legPhase);
      ctx.stroke();

      // Leg joints
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.arc(kneeX, kneeY, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Abdomen
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 8 + walkBob, 12, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Abdomen pattern (red hourmark)
  ctx.fillStyle = '#D32F2F';
  ctx.beginPath();
  ctx.moveTo(cx, cy + 2 + walkBob);
  ctx.lineTo(cx - 3, cy + 6 + walkBob);
  ctx.lineTo(cx, cy + 10 + walkBob);
  ctx.lineTo(cx + 3, cy + 6 + walkBob);
  ctx.closePath();
  ctx.fill();

  // Cephalothorax
  ctx.fillStyle = '#212121';
  ctx.beginPath();
  ctx.ellipse(cx, cy - 6 + walkBob, 9, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Fangs (chelicerae)
  ctx.fillStyle = isAttacking ? '#FF1744' : '#555';
  if (isAttacking) {
    glow(ctx, '#FF1744', 6);
  }
  // Left fang
  ctx.beginPath();
  ctx.moveTo(cx - 4, cy - 10 + walkBob);
  ctx.lineTo(cx - 7, cy - 18 + walkBob);
  ctx.lineTo(cx - 2, cy - 12 + walkBob);
  ctx.fill();
  // Right fang
  ctx.beginPath();
  ctx.moveTo(cx + 4, cy - 10 + walkBob);
  ctx.lineTo(cx + 7, cy - 18 + walkBob);
  ctx.lineTo(cx + 2, cy - 12 + walkBob);
  ctx.fill();
  noGlow(ctx);

  // Eyes (8 eyes arranged in 2 rows)
  const eyePositions = [
    { x: -5, y: -11 }, { x: -3, y: -13 }, { x: 3, y: -13 }, { x: 5, y: -11 },
    { x: -6, y: -8 }, { x: -4, y: -9 }, { x: 4, y: -9 }, { x: 6, y: -8 },
  ];
  glow(ctx, '#F44336', 3);
  for (const eye of eyePositions) {
    ctx.fillStyle = '#F44336';
    ctx.beginPath();
    ctx.arc(cx + eye.x, cy + eye.y + walkBob, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
  noGlow(ctx);

  ctx.restore();
  return { canvas, width: w, height: h };
}

// ─── WASP ───────────────────────────────────────────────────────────────────

function drawWasp(frame: number, state: BugAnimationState): SpriteFrame {
  const { w, h } = BUG_SIZES.wasp;
  const { canvas, ctx } = createCanvas(w, h);
  const cx = w / 2;
  const cy = h / 2;

  const isDying = state === 'death';
  const isAttacking = state === 'attack';
  const wingFlap = Math.sin(frame * 1.2) * 0.6;

  ctx.save();
  if (isDying) {
    ctx.translate(cx, cy);
    ctx.rotate(frame * 0.7);
    ctx.translate(-cx, -cy);
    ctx.globalAlpha = Math.max(0, 1 - frame * 0.25);
  }

  // Wings (animated flap)
  ctx.save();
  ctx.translate(cx, cy - 4);
  // Left wing
  ctx.save();
  ctx.rotate(-0.3 - wingFlap);
  ctx.fillStyle = 'rgba(200, 220, 255, 0.45)';
  ctx.strokeStyle = 'rgba(200, 220, 255, 0.7)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.ellipse(-8, -4, 14, 6, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Wing veins
  ctx.strokeStyle = 'rgba(180, 200, 240, 0.5)';
  ctx.lineWidth = 0.3;
  ctx.beginPath();
  ctx.moveTo(-2, -4);
  ctx.lineTo(-18, -6);
  ctx.stroke();
  ctx.restore();
  // Right wing
  ctx.save();
  ctx.rotate(0.3 + wingFlap);
  ctx.fillStyle = 'rgba(200, 220, 255, 0.45)';
  ctx.strokeStyle = 'rgba(200, 220, 255, 0.7)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.ellipse(8, -4, 14, 6, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = 'rgba(180, 200, 240, 0.5)';
  ctx.lineWidth = 0.3;
  ctx.beginPath();
  ctx.moveTo(2, -4);
  ctx.lineTo(18, -6);
  ctx.stroke();
  ctx.restore();
  ctx.restore();

  // Abdomen (striped)
  ctx.fillStyle = '#FFC107';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 6, 6, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  // Black stripes
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 2, 6.5, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx, cy + 8, 5.5, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Stinger
  ctx.fillStyle = '#333';
  ctx.beginPath();
  const stingerLength = isAttacking ? 22 : 19;
  ctx.moveTo(cx - 1, cy + 15);
  ctx.lineTo(cx, cy + stingerLength);
  ctx.lineTo(cx + 1, cy + 15);
  ctx.fill();

  // Petiole (thin waist)
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.ellipse(cx, cy - 1, 3, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Thorax
  ctx.fillStyle = '#FFC107';
  ctx.beginPath();
  ctx.ellipse(cx, cy - 5, 7, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  // Black stripe on thorax
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.ellipse(cx, cy - 5, 3, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = '#FFC107';
  ctx.beginPath();
  ctx.ellipse(cx, cy - 12, 5, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Antennae
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 1;
  const antWaggle = Math.sin(frame * 0.5) * 2;
  ctx.beginPath();
  ctx.moveTo(cx - 2, cy - 14);
  ctx.quadraticCurveTo(cx - 8, cy - 20 + antWaggle, cx - 10, cy - 18 + antWaggle);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 2, cy - 14);
  ctx.quadraticCurveTo(cx + 8, cy - 20 - antWaggle, cx + 10, cy - 18 - antWaggle);
  ctx.stroke();

  // Eyes
  glow(ctx, '#1a1a1a', 2);
  ctx.fillStyle = '#F44336';
  ctx.beginPath();
  ctx.arc(cx - 3, cy - 13, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 3, cy - 13, 1.8, 0, Math.PI * 2);
  ctx.fill();
  noGlow(ctx);

  ctx.restore();
  return { canvas, width: w, height: h };
}

// ─── MANTIS ─────────────────────────────────────────────────────────────────

function drawMantis(frame: number, state: BugAnimationState): SpriteFrame {
  const { w, h } = BUG_SIZES.mantis;
  const { canvas, ctx } = createCanvas(w, h);
  const cx = w / 2;
  const cy = h / 2;

  const isDying = state === 'death';
  const isAttacking = state === 'attack';
  const sway = Math.sin(frame * 0.3) * 0.05;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(sway);
  ctx.translate(-cx, -cy);
  if (isDying) {
    ctx.rotate(frame * 0.3);
    ctx.globalAlpha = Math.max(0, 1 - frame * 0.25);
  }

  // Wings (folded on back)
  ctx.fillStyle = 'rgba(76, 175, 80, 0.3)';
  ctx.beginPath();
  ctx.ellipse(cx - 8, cy - 2, 6, 18, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 8, cy - 2, 6, 18, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Abdomen
  ctx.fillStyle = '#4CAF50';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 10, 7, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Abdomen segments
  ctx.strokeStyle = '#388E3C';
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(cx - 7, cy - 2 + i * 5);
    ctx.lineTo(cx + 7, cy - 2 + i * 5);
    ctx.stroke();
  }

  // Thorax (elongated)
  ctx.fillStyle = '#66BB6A';
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy - 6);
  ctx.lineTo(cx - 8, cy - 18);
  ctx.lineTo(cx + 8, cy - 18);
  ctx.lineTo(cx + 6, cy - 6);
  ctx.closePath();
  ctx.fill();

  // Raptorial arms (prayer position or attack)
  ctx.fillStyle = '#4CAF50';
  ctx.strokeStyle = '#388E3C';
  ctx.lineWidth = 1;

  if (isAttacking) {
    // Arms extended forward
    // Left arm
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy - 14);
    ctx.lineTo(cx - 18, cy - 28);
    ctx.lineTo(cx - 14, cy - 24);
    ctx.lineTo(cx - 22, cy - 32);
    ctx.stroke();
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.ellipse(cx - 18, cy - 28, 3, 5, -0.8, 0, Math.PI * 2);
    ctx.fill();
    // Right arm
    ctx.beginPath();
    ctx.moveTo(cx + 6, cy - 14);
    ctx.lineTo(cx + 18, cy - 28);
    ctx.lineTo(cx + 14, cy - 24);
    ctx.lineTo(cx + 22, cy - 32);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx + 18, cy - 28, 3, 5, 0.8, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Arms folded (praying)
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy - 14);
    ctx.lineTo(cx - 10, cy - 24);
    ctx.lineTo(cx - 4, cy - 20);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 6, cy - 14);
    ctx.lineTo(cx + 10, cy - 24);
    ctx.lineTo(cx + 4, cy - 20);
    ctx.stroke();
  }

  // Walking legs
  ctx.strokeStyle = '#388E3C';
  ctx.lineWidth = 1.5;
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 2; i++) {
      const legPhase = Math.sin(frame * 0.4 + i * 1.5) * 3;
      const baseY = cy + 2 + i * 8;
      ctx.beginPath();
      ctx.moveTo(cx + side * 6, baseY);
      ctx.quadraticCurveTo(cx + side * 14, baseY + 4 + legPhase, cx + side * 18, baseY + 10 + legPhase);
      ctx.stroke();
    }
  }

  // Head (triangular)
  ctx.fillStyle = '#66BB6A';
  ctx.beginPath();
  ctx.moveTo(cx, cy - 28);
  ctx.lineTo(cx - 10, cy - 18);
  ctx.lineTo(cx + 10, cy - 18);
  ctx.closePath();
  ctx.fill();

  // Large compound eyes
  glow(ctx, '#1a1a1a', 4);
  ctx.fillStyle = '#1B5E20';
  ctx.beginPath();
  ctx.ellipse(cx - 6, cy - 22, 4, 5, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 6, cy - 22, 4, 5, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Eye highlights
  ctx.fillStyle = '#76FF03';
  ctx.beginPath();
  ctx.arc(cx - 7, cy - 23, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 5, cy - 23, 1.5, 0, Math.PI * 2);
  ctx.fill();
  noGlow(ctx);

  // Antennae
  ctx.strokeStyle = '#388E3C';
  ctx.lineWidth = 1;
  const antSway = Math.sin(frame * 0.25) * 3;
  ctx.beginPath();
  ctx.moveTo(cx - 3, cy - 26);
  ctx.quadraticCurveTo(cx - 12, cy - 36 + antSway, cx - 16, cy - 34 + antSway);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 3, cy - 26);
  ctx.quadraticCurveTo(cx + 12, cy - 36 - antSway, cx + 16, cy - 34 - antSway);
  ctx.stroke();

  ctx.restore();
  return { canvas, width: w, height: h };
}

// ─── BOSS SCARAB ────────────────────────────────────────────────────────────

function drawBossScarab(frame: number, state: BugAnimationState): SpriteFrame {
  const { w, h } = BUG_SIZES.boss_scarab;
  const { canvas, ctx } = createCanvas(w, h);
  const cx = w / 2;
  const cy = h / 2;

  const isDying = state === 'death';
  const isAttacking = state === 'attack';
  const pulse = 1 + Math.sin(frame * 0.2) * 0.02;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(pulse, pulse);
  ctx.translate(-cx, -cy);
  if (isDying) {
    ctx.globalAlpha = Math.max(0, 1 - frame * 0.15);
  }

  // Legs (thick, armored)
  ctx.strokeStyle = '#8D6E63';
  ctx.lineWidth = 5;
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 3; i++) {
      const legPhase = Math.sin(frame * 0.3 + i * 1.2) * 6;
      const baseX = cx + side * 20;
      const baseY = cy + 10 + i * 16;
      ctx.beginPath();
      ctx.moveTo(baseX, baseY);
      ctx.quadraticCurveTo(baseX + side * 24, baseY + 6 + legPhase, baseX + side * 36, baseY + 18 + legPhase);
      ctx.stroke();
      // Joint armor
      ctx.fillStyle = '#A1887F';
      ctx.beginPath();
      ctx.arc(baseX + side * 18, baseY + 3 + legPhase * 0.5, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Massive shell (elytra)
  const shellGrad = ctx.createRadialGradient(cx - 10, cy - 10, 10, cx, cy + 5, 55);
  shellGrad.addColorStop(0, '#FFD700');
  shellGrad.addColorStop(0.3, '#FFC107');
  shellGrad.addColorStop(0.6, '#FFB300');
  shellGrad.addColorStop(0.8, '#FF8F00');
  shellGrad.addColorStop(1, '#E65100');
  ctx.fillStyle = shellGrad;

  ctx.beginPath();
  ctx.ellipse(cx, cy + 5, 42, 48, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shell ornate patterns
  ctx.strokeStyle = '#BF360C';
  ctx.lineWidth = 2;
  // Center ridge
  ctx.beginPath();
  ctx.moveTo(cx, cy - 40);
  ctx.lineTo(cx, cy + 50);
  ctx.stroke();
  // Horizontal bands
  for (let i = 0; i < 6; i++) {
    const y = cy - 30 + i * 14;
    ctx.beginPath();
    ctx.moveTo(cx - 35 + i * 2, y);
    ctx.lineTo(cx + 35 - i * 2, y);
    ctx.stroke();
  }
  // Diamond patterns
  ctx.fillStyle = 'rgba(191, 54, 12, 0.4)';
  for (let i = 0; i < 3; i++) {
    const y = cy - 20 + i * 25;
    ctx.beginPath();
    ctx.moveTo(cx, y - 8);
    ctx.lineTo(cx + 12, y);
    ctx.lineTo(cx, y + 8);
    ctx.lineTo(cx - 12, y);
    ctx.closePath();
    ctx.fill();
  }

  // Shell glow
  glow(ctx, '#FFD700', 15);
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 5, 44, 50, 0, 0, Math.PI * 2);
  ctx.stroke();
  noGlow(ctx);

  // Thorax
  ctx.fillStyle = '#8D6E63';
  ctx.beginPath();
  ctx.ellipse(cx, cy - 40, 22, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = '#795548';
  ctx.beginPath();
  ctx.ellipse(cx, cy - 58, 20, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Horns
  ctx.fillStyle = '#5D4037';
  // Left horn
  ctx.beginPath();
  ctx.moveTo(cx - 14, cy - 62);
  ctx.quadraticCurveTo(cx - 28, cy - 82, cx - 22, cy - 88);
  ctx.quadraticCurveTo(cx - 18, cy - 78, cx - 10, cy - 64);
  ctx.fill();
  // Right horn
  ctx.beginPath();
  ctx.moveTo(cx + 14, cy - 62);
  ctx.quadraticCurveTo(cx + 28, cy - 82, cx + 22, cy - 88);
  ctx.quadraticCurveTo(cx + 18, cy - 78, cx + 10, cy - 64);
  ctx.fill();

  // Mandibles
  if (isAttacking) {
    glow(ctx, '#FF1744', 8);
    ctx.fillStyle = '#FFD54F';
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy - 66);
    ctx.lineTo(cx - 22, cy - 82);
    ctx.lineTo(cx - 8, cy - 68);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 10, cy - 66);
    ctx.lineTo(cx + 22, cy - 82);
    ctx.lineTo(cx + 8, cy - 68);
    ctx.fill();
  } else {
    ctx.fillStyle = '#FFD54F';
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy - 68);
    ctx.lineTo(cx - 16, cy - 76);
    ctx.lineTo(cx - 6, cy - 70);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 8, cy - 68);
    ctx.lineTo(cx + 16, cy - 76);
    ctx.lineTo(cx + 6, cy - 70);
    ctx.fill();
  }

  // Eyes (glowing red)
  glow(ctx, '#FF1744', 12);
  ctx.fillStyle = '#FF1744';
  ctx.beginPath();
  ctx.arc(cx - 12, cy - 60, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 12, cy - 60, 5, 0, Math.PI * 2);
  ctx.fill();

  // Eye inner glow
  ctx.fillStyle = '#FF8A80';
  ctx.beginPath();
  ctx.arc(cx - 12, cy - 61, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 12, cy - 61, 2, 0, Math.PI * 2);
  ctx.fill();
  noGlow(ctx);

  ctx.restore();
  return { canvas, width: w, height: h };
}

// ─── BOSS TARANTULA ─────────────────────────────────────────────────────────

function drawBossTarantula(frame: number, state: BugAnimationState): SpriteFrame {
  const { w, h } = BUG_SIZES.boss_tarantula;
  const { canvas, ctx } = createCanvas(w, h);
  const cx = w / 2;
  const cy = h / 2;

  const isDying = state === 'death';
  const isAttacking = state === 'attack';
  const breathe = 1 + Math.sin(frame * 0.15) * 0.015;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(breathe, breathe);
  ctx.translate(-cx, -cy);
  if (isDying) {
    ctx.globalAlpha = Math.max(0, 1 - frame * 0.12);
  }

  // 8 hairy legs
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 4; i++) {
      const legPhase = Math.sin(frame * 0.4 + i * 0.9) * 5;
      const angle = (i - 1.5) * 0.35;
      const baseX = cx + side * 22;
      const baseY = cy + 10 + Math.sin(angle) * 15;

      // Main leg segment
      ctx.strokeStyle = '#4A148C';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(baseX, baseY);
      const kneeX = baseX + side * (28 + i * 4);
      const kneeY = baseY - 8 + legPhase;
      ctx.quadraticCurveTo(kneeX, kneeY, kneeX + side * 16, baseY + 20 + legPhase);
      ctx.stroke();

      // Hair tufts
      ctx.strokeStyle = '#6A1B9A';
      ctx.lineWidth = 1;
      for (let h = 0; h < 5; h++) {
        const t = h / 4;
        const hx = baseX + (kneeX - baseX) * t;
        const hy = baseY + (kneeY - baseY) * t;
        ctx.beginPath();
        ctx.moveTo(hx, hy);
        ctx.lineTo(hx + side * (Math.random() * 6 + 2), hy - Math.random() * 8 - 2);
        ctx.stroke();
      }

      // Joint bulb
      ctx.fillStyle = '#7B1FA2';
      ctx.beginPath();
      ctx.arc(kneeX, kneeY, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Abdomen (large, hairy)
  const abdGrad = ctx.createRadialGradient(cx, cy + 25, 5, cx, cy + 25, 45);
  abdGrad.addColorStop(0, '#7B1FA2');
  abdGrad.addColorStop(0.5, '#4A148C');
  abdGrad.addColorStop(1, '#311B92');
  ctx.fillStyle = abdGrad;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 25, 38, 42, 0, 0, Math.PI * 2);
  ctx.fill();

  // Abdomen hair
  ctx.strokeStyle = '#9C27B0';
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 30; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 30 + Math.random() * 12;
    const hx = cx + Math.cos(angle) * dist * 0.9;
    const hy = cy + 25 + Math.sin(angle) * dist;
    ctx.beginPath();
    ctx.moveTo(hx, hy);
    ctx.lineTo(hx + Math.cos(angle) * 8, hy + Math.sin(angle) * 8);
    ctx.stroke();
  }

  // Cephalothorax
  ctx.fillStyle = '#6A1B9A';
  ctx.beginPath();
  ctx.ellipse(cx, cy - 20, 28, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Fovea (indentation between cephalothorax and abdomen)
  ctx.strokeStyle = '#4A148C';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy + 2, 22, -0.3, Math.PI + 0.3, true);
  ctx.stroke();

  // Fangs (large, exposed chelicerae)
  if (isAttacking) {
    glow(ctx, '#FF1744', 12);
    ctx.fillStyle = '#D50000';
    ctx.beginPath();
    ctx.moveTo(cx - 12, cy - 36);
    ctx.quadraticCurveTo(cx - 26, cy - 58, cx - 20, cy - 66);
    ctx.quadraticCurveTo(cx - 16, cy - 52, cx - 8, cy - 38);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 12, cy - 36);
    ctx.quadraticCurveTo(cx + 26, cy - 58, cx + 20, cy - 66);
    ctx.quadraticCurveTo(cx + 16, cy - 52, cx + 8, cy - 38);
    ctx.fill();
    // Fang drip
    ctx.fillStyle = '#FF1744';
    ctx.beginPath();
    ctx.arc(cx - 20, cy - 64, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 20, cy - 64, 2.5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = '#9C27B0';
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy - 36);
    ctx.quadraticCurveTo(cx - 18, cy - 48, cx - 14, cy - 52);
    ctx.quadraticCurveTo(cx - 12, cy - 44, cx - 8, cy - 38);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 10, cy - 36);
    ctx.quadraticCurveTo(cx + 18, cy - 48, cx + 14, cy - 52);
    ctx.quadraticCurveTo(cx + 12, cy - 44, cx + 8, cy - 38);
    ctx.fill();
  }

  // Eyes (multiple pairs, glowing)
  const eyeRows = [
    { y: -38, count: 4, spacing: 6, size: 3.5 },
    { y: -34, count: 2, spacing: 10, size: 4 },
    { y: -30, count: 2, spacing: 14, size: 2.5 },
  ];

  glow(ctx, '#E040FB', 10);
  for (const row of eyeRows) {
    const startX = cx - ((row.count - 1) * row.spacing) / 2;
    for (let i = 0; i < row.count; i++) {
      const ex = startX + i * row.spacing;
      const ey = cy + row.y;
      ctx.fillStyle = i < 2 ? '#E040FB' : '#CE93D8';
      ctx.beginPath();
      ctx.arc(ex, ey, row.size, 0, Math.PI * 2);
      ctx.fill();

      // Pupil
      ctx.fillStyle = '#1a0033';
      ctx.beginPath();
      ctx.arc(ex, ey, row.size * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  noGlow(ctx);

  ctx.restore();
  return { canvas, width: w, height: h };
}

// ─── SPRITE SHEET FACTORY ───────────────────────────────────────────────────

const DRAW_FNS: Record<string, (frame: number, state: BugAnimationState) => SpriteFrame> = {
  ant: drawAnt,
  beetle: drawBeetle,
  spider: drawSpider,
  wasp: drawWasp,
  mantis: drawMantis,
  boss_scarab: drawBossScarab,
  boss_tarantula: drawBossTarantula,
};

export function generateBugSpriteSheet(bugKey: string): SpriteSheet | null {
  const drawFn = DRAW_FNS[bugKey];
  if (!drawFn) return null;

  const size = BUG_SIZES[bugKey];
  const frames = new Map<BugAnimationState, SpriteFrame[]>();

  const frameCounts: Record<BugAnimationState, number> = {
    idle: 4,
    walk: 4,
    attack: 4,
    death: 4,
  };

  for (const [state, count] of Object.entries(frameCounts)) {
    const stateFrames: SpriteFrame[] = [];
    for (let i = 0; i < count; i++) {
      stateFrames.push(drawFn(i, state as BugAnimationState));
    }
    frames.set(state as BugAnimationState, stateFrames);
  }

  return {
    frames,
    baseWidth: size.w,
    baseHeight: size.h,
  };
}

export function generateAllBugSprites(): Map<string, SpriteSheet> {
  const sheets = new Map<string, SpriteSheet>();
  for (const key of Object.keys(DRAW_FNS)) {
    const sheet = generateBugSpriteSheet(key);
    if (sheet) sheets.set(key, sheet);
  }
  return sheets;
}

export function getBugSpriteCanvas(
  bugKey: string,
  state: BugAnimationState,
  frameIndex: number,
): HTMLCanvasElement | null {
  const sheet = generateBugSpriteSheet(bugKey);
  if (!sheet) return null;
  const stateFrames = sheet.frames.get(state);
  if (!stateFrames || frameIndex >= stateFrames.length) return stateFrames?.[0]?.canvas ?? null;
  return stateFrames[frameIndex].canvas;
}
