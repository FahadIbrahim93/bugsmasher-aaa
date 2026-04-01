import type { System, Vec2 } from '@typedefs/index';
import { ECSWorld } from '@core/ECS';
import { EventManager } from '@core/EventManager';
import { BugState, SoundType } from '@typedefs/index';
import { ParticleSystem } from '@systems/ParticleSystem';
import { AudioManager } from '@audio/AudioManager';

export class CollisionSystem implements System {
  name = 'CollisionSystem';
  priority: 'high' = 'high';
  enabled = true;

  private events: EventManager;
  // Queue to track clicks for this frame
  private clicks: Vec2[] = [];

  constructor(private world: ECSWorld, private particles: ParticleSystem, private audio: AudioManager) {
    this.events = EventManager.getInstance();
    this.events.on('input:click', this.onInputClick.bind(this));
  }

  private onInputClick(data: unknown): void {
    const payload = data as { position: Vec2 };
    this.clicks.push(payload.position);
  }

  update(deltaTime: number): void {
    if (this.clicks.length === 0) return;

    const bugs = this.world.query('collider', 'transform', 'health', 'bug_behavior');

    for (const click of this.clicks) {
      for (const entity of bugs) {
        if (!entity.active) continue;

        const collider = entity.components.get('collider') as any;
        const transform = entity.components.get('transform') as any;
        const health = entity.components.get('health') as any;
        const behavior = entity.components.get('bug_behavior') as any;

        // Ignore dead bugs
        if (behavior.state === BugState.DEAD || behavior.state === BugState.DYING) {
          continue;
        }

        // Check distance
        const dx = click.x - transform.position.x;
        const dy = click.y - transform.position.y;
        const distSq = dx * dx + dy * dy;
        const radiusSq = collider.radius * collider.radius;

        if (distSq <= radiusSq) {
          // Hit!
          this.applyDamage(entity, 10);
          break; // One click hits one bug (highest Z or first array)
        }
      }
    }
    
    // Clear clicks
    this.clicks = [];
  }

  private applyDamage(entity: any, amount: number): void {
    const health = entity.components.get('health') as any;
    const transform = entity.components.get('transform') as any;
    const behavior = entity.components.get('bug_behavior') as any;

    health.health -= amount;

    if (health.health <= 0) {
      behavior.state = BugState.DEAD;
      
      // Death effects
      this.particles.burst(transform.position, 'blood');
      this.audio.playAt(SoundType.SQUISH, transform.position);
      
      this.events.emit('score_update', { value: behavior.scoreValue });
      
      // Remove entity
      this.world.removeEntity(entity.id);
    } else {
      // Just hit
      health.flashTimer = 0.1; // Visual feedback
    }
  }
}
