/**
 * Particle System
 * High-performance object-pooled particle system with various emitter types
 */

import type { Vec2, Color, Particle } from '@typedefs/index';
import { GAME_CONFIG } from '@config/GameConfig';

interface EmitterConfig {
  position: Vec2;
  count: number;
  minLife: number;
  maxLife: number;
  minSpeed: number;
  maxSpeed: number;
  minSize: number;
  maxSize: number;
  colors: Color[];
  gravity: number;
  friction: number;
  spread: number;
  direction?: number;
  sizeDecay: boolean;
  alphaDecay: boolean;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private pool: Particle[] = [];
  private particleCount: number = 0;
  private maxParticles: number;
  private idCounter: number = 0;

  constructor(maxParticles: number = GAME_CONFIG.particleLimit) {
    this.maxParticles = maxParticles;

    // Pre-allocate pool
    for (let i = 0; i < Math.min(maxParticles, 200); i++) {
      this.pool.push(this.createParticle());
    }
  }

  emit(config: Partial<EmitterConfig>): void {
    const defaults: EmitterConfig = {
      position: { x: 0, y: 0 },
      count: 10,
      minLife: 0.5,
      maxLife: 1.5,
      minSpeed: 50,
      maxSpeed: 150,
      minSize: 2,
      maxSize: 6,
      colors: [{ r: 1, g: 1, b: 1, a: 1 }],
      gravity: 0,
      friction: 0.98,
      spread: Math.PI * 2,
      sizeDecay: true,
      alphaDecay: true,
    };

    const emitter = { ...defaults, ...config };

    for (let i = 0; i < emitter.count; i++) {
      if (this.particleCount >= this.maxParticles) break;

      const particle = this.getParticle();
      const angle = (emitter.direction ?? Math.random() * Math.PI * 2) +
        (Math.random() - 0.5) * emitter.spread;
      const speed = emitter.minSpeed + Math.random() * (emitter.maxSpeed - emitter.minSpeed);
      const color = emitter.colors[Math.floor(Math.random() * emitter.colors.length)];

      particle.position.x = emitter.position.x;
      particle.position.y = emitter.position.y;
      particle.velocity.x = Math.cos(angle) * speed;
      particle.velocity.y = Math.sin(angle) * speed;
      particle.acceleration.x = 0;
      particle.acceleration.y = emitter.gravity;
      particle.life = emitter.minLife + Math.random() * (emitter.maxLife - emitter.minLife);
      particle.maxLife = particle.life;
      particle.size = emitter.minSize + Math.random() * (emitter.maxSize - emitter.minSize);
      particle.color = { ...color };
      particle.rotation = Math.random() * Math.PI * 2;
      particle.rotationSpeed = (Math.random() - 0.5) * 5;

      this.particles.push(particle);
      this.particleCount++;
    }
  }

  /**
   * Emit a burst at a position with a preset config
   */
  burst(position: Vec2, preset: 'blood' | 'explosion' | 'spark'): void {
    const presets: Record<string, Partial<EmitterConfig>> = {
      blood: {
        count: 8, minSize: 2, maxSize: 6, minSpeed: 50, maxSpeed: 150,
        colors: [
          { r: 0.55, g: 0, b: 0, a: 1 },
          { r: 1, g: 0, b: 0, a: 1 },
          { r: 0.86, g: 0.08, b: 0.24, a: 1 },
        ],
        gravity: 200, minLife: 0.4, maxLife: 0.8,
      },
      explosion: {
        count: 20, minSize: 3, maxSize: 10, minSpeed: 100, maxSpeed: 300,
        colors: [
          { r: 1, g: 0.65, b: 0, a: 1 },
          { r: 1, g: 0.27, b: 0, a: 1 },
          { r: 1, g: 0.84, b: 0, a: 1 },
          { r: 1, g: 1, b: 1, a: 1 },
        ],
        gravity: 100, minLife: 0.6, maxLife: 1.2,
      },
      spark: {
        count: 5, minSize: 1, maxSize: 3, minSpeed: 80, maxSpeed: 200,
        colors: [
          { r: 1, g: 1, b: 0, a: 1 },
          { r: 1, g: 1, b: 1, a: 1 },
          { r: 0, g: 1, b: 1, a: 1 },
        ],
        gravity: 50, minLife: 0.2, maxLife: 0.5,
      },
    };

    this.emit({ ...presets[preset], position });
  }

  update(deltaTime: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      p.life -= deltaTime;

      if (p.life <= 0) {
        this.recycleParticle(i);
        continue;
      }

      // Physics
      p.velocity.x += p.acceleration.x * deltaTime;
      p.velocity.y += p.acceleration.y * deltaTime;
      p.position.x += p.velocity.x * deltaTime;
      p.position.y += p.velocity.y * deltaTime;
      p.rotation += p.rotationSpeed * deltaTime;

      // Decay
      const lifeRatio = p.life / p.maxLife;
      p.color.a = lifeRatio;
      p.size *= 0.99;
    }
  }

  getParticles(): Particle[] {
    return this.particles;
  }

  getCount(): number {
    return this.particleCount;
  }

  clear(): void {
    for (const p of this.particles) {
      this.pool.push(p);
    }
    this.particles = [];
    this.particleCount = 0;
  }

  private getParticle(): Particle {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.createParticle();
  }

  private createParticle(): Particle {
    return {
      id: `p_${++this.idCounter}`,
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      acceleration: { x: 0, y: 0 },
      life: 1,
      maxLife: 1,
      size: 4,
      color: { r: 1, g: 1, b: 1, a: 1 },
      rotation: 0,
      rotationSpeed: 0,
    };
  }

  private recycleParticle(index: number): void {
    const particle = this.particles[index];
    this.particles[index] = this.particles[this.particles.length - 1];
    this.particles.pop();
    this.pool.push(particle);
    this.particleCount--;
  }
}
