/**
 * Background Generator
 * Procedural game background with layered textures
 */

function createCanvas(w: number, h: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  return { canvas, ctx };
}

// Simple seeded PRNG for deterministic textures
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

// Simple value noise for texture generation
function generateNoise(width: number, height: number, seed: number): Float32Array {
  const rng = seededRandom(seed);
  const noise = new Float32Array(width * height);
  for (let i = 0; i < noise.length; i++) {
    noise[i] = rng();
  }
  return noise;
}

// ─── TILE GENERATOR ─────────────────────────────────────────────────────────

export function generateBackgroundTile(
  tileSize: number = 512,
  seed: number = 42,
): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(tileSize, tileSize);
  const rng = seededRandom(seed);

  // Layer 0: Dark gradient base
  const baseGrad = ctx.createLinearGradient(0, 0, tileSize, tileSize);
  baseGrad.addColorStop(0, '#0d0d1a');
  baseGrad.addColorStop(0.3, '#121225');
  baseGrad.addColorStop(0.7, '#1a1a2e');
  baseGrad.addColorStop(1, '#0f0f20');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, tileSize, tileSize);

  // Layer 1: Subtle grid pattern (tile grout lines)
  ctx.strokeStyle = 'rgba(30, 30, 60, 0.5)';
  ctx.lineWidth = 1;
  const gridSpacing = 64;
  for (let x = 0; x <= tileSize; x += gridSpacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, tileSize);
    ctx.stroke();
  }
  for (let y = 0; y <= tileSize; y += gridSpacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(tileSize, y);
    ctx.stroke();
  }

  // Grid intersections - tiny dots
  ctx.fillStyle = 'rgba(40, 40, 80, 0.6)';
  for (let x = 0; x <= tileSize; x += gridSpacing) {
    for (let y = 0; y <= tileSize; y += gridSpacing) {
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Layer 2: Noise-based texture (dirt/cracks)
  const noise = generateNoise(tileSize, tileSize, seed);
  for (let y = 0; y < tileSize; y += 2) {
    for (let x = 0; x < tileSize; x += 2) {
      const n = noise[y * tileSize + x];
      if (n > 0.85) {
        ctx.fillStyle = `rgba(20, 18, 30, ${(n - 0.85) * 3})`;
        ctx.fillRect(x, y, 2, 2);
      } else if (n < 0.08) {
        ctx.fillStyle = `rgba(35, 35, 55, ${n * 5})`;
        ctx.fillRect(x, y, 2, 2);
      }
    }
  }

  // Layer 3: Random pebbles and debris
  const pebbleCount = 12 + Math.floor(rng() * 8);
  for (let i = 0; i < pebbleCount; i++) {
    const px = rng() * tileSize;
    const py = rng() * tileSize;
    const size = 1 + rng() * 3;
    const brightness = 20 + rng() * 25;

    ctx.fillStyle = `rgba(${brightness + 10}, ${brightness + 5}, ${brightness}, ${0.3 + rng() * 0.3})`;
    ctx.beginPath();
    ctx.ellipse(px, py, size, size * (0.5 + rng() * 0.5), rng() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  // Layer 4: Crack lines
  const crackCount = 3 + Math.floor(rng() * 4);
  ctx.strokeStyle = 'rgba(15, 15, 30, 0.4)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i < crackCount; i++) {
    let cx = rng() * tileSize;
    let cy = rng() * tileSize;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    const segments = 5 + Math.floor(rng() * 10);
    for (let s = 0; s < segments; s++) {
      cx += (rng() - 0.5) * 40;
      cy += (rng() - 0.5) * 40;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  }

  // Layer 5: Subtle vignette (darker edges)
  const vigGrad = ctx.createRadialGradient(
    tileSize / 2, tileSize / 2, tileSize * 0.2,
    tileSize / 2, tileSize / 2, tileSize * 0.7,
  );
  vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vigGrad.addColorStop(1, 'rgba(0, 0, 0, 0.15)');
  ctx.fillStyle = vigGrad;
  ctx.fillRect(0, 0, tileSize, tileSize);

  return canvas;
}

// ─── FULL BACKGROUND (non-tiled) ────────────────────────────────────────────

export function generateFullBackground(
  width: number = 1920,
  height: number = 1080,
  seed: number = 42,
): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(width, height);
  const tile = generateBackgroundTile(512, seed);

  // Tile the background
  for (let y = 0; y < height; y += 512) {
    for (let x = 0; x < width; x += 512) {
      ctx.drawImage(tile, x, y);
    }
  }

  // Additional atmospheric fog layer
  const fogGrad = ctx.createLinearGradient(0, 0, 0, height);
  fogGrad.addColorStop(0, 'rgba(10, 10, 20, 0.3)');
  fogGrad.addColorStop(0.5, 'rgba(10, 10, 20, 0)');
  fogGrad.addColorStop(1, 'rgba(10, 10, 20, 0.2)');
  ctx.fillStyle = fogGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle cyan ambient glow spots (light sources)
  const rng = seededRandom(seed + 1);
  const spotCount = 4 + Math.floor(rng() * 3);
  for (let i = 0; i < spotCount; i++) {
    const sx = rng() * width;
    const sy = rng() * height;
    const sr = 100 + rng() * 200;
    const spotGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
    spotGrad.addColorStop(0, `rgba(0, 255, 255, ${0.02 + rng() * 0.03})`);
    spotGrad.addColorStop(1, 'rgba(0, 255, 255, 0)');
    ctx.fillStyle = spotGrad;
    ctx.fillRect(sx - sr, sy - sr, sr * 2, sr * 2);
  }

  return canvas;
}

// ─── MENU BACKGROUND ───────────────────────────────────────────────────────

export function generateMenuBackground(
  width: number = 1920,
  height: number = 1080,
): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(width, height);

  // Dark gradient
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, '#1a1a2e');
  grad.addColorStop(0.5, '#16213e');
  grad.addColorStop(1, '#0f3460');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Floating bug silhouettes
  const rng = seededRandom(123);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
  for (let i = 0; i < 20; i++) {
    const bx = rng() * width;
    const by = rng() * height;
    const bsize = 10 + rng() * 30;
    const rotation = rng() * Math.PI * 2;

    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(rotation);

    // Simple bug silhouette (oval body + legs)
    ctx.beginPath();
    ctx.ellipse(0, 0, bsize, bsize * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 1;
    for (let l = 0; l < 3; l++) {
      ctx.beginPath();
      ctx.moveTo(-bsize * 0.5, l * 4 - 4);
      ctx.lineTo(-bsize * 1.2, l * 8 - 8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(bsize * 0.5, l * 4 - 4);
      ctx.lineTo(bsize * 1.2, l * 8 - 8);
      ctx.stroke();
    }

    ctx.restore();
  }

  // Central glow
  const centerGlow = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, 400,
  );
  centerGlow.addColorStop(0, 'rgba(0, 255, 255, 0.08)');
  centerGlow.addColorStop(0.5, 'rgba(255, 0, 255, 0.04)');
  centerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = centerGlow;
  ctx.fillRect(0, 0, width, height);

  return canvas;
}
